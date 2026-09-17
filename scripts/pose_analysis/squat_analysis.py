"""Squat form analysis for 安羅夕雅OS.

Real MediaPipe/OpenCV pipeline referenced by src/lib/ai/videoAnalysisSim.ts's docstring.
Deploy this as a small Python service (Cloud Run / Modal / a FastAPI container) and point
VIDEO_ANALYSIS_SERVICE_URL at it; src/app/api/video-analysis/route.ts will POST the uploaded
video there instead of using the local heuristic simulation.

Usage:
    python squat_analysis.py path/to/video.mp4

Output: JSON matching the SquatAnalysisResult type in src/lib/types.ts.
"""

import json
import math
import sys

import cv2
import mediapipe as mp
import numpy as np

mp_pose = mp.solutions.pose

LEFT_INJURED_KNEE = True  # 安羅夕雅: left ACL history — weight this side in the risk score


def angle_deg(a, b, c) -> float:
    """Angle at point b, formed by points a-b-c, in degrees."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    return math.degrees(math.acos(np.clip(cosine, -1.0, 1.0)))


def analyze(video_path: str) -> dict:
    cap = cv2.VideoCapture(video_path)
    knee_angles_left = []
    knee_angles_right = []
    hip_heights = []
    knee_x_offsets = []  # knee x - ankle x, normalized: proxy for knee valgus (knee-in)

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ok, frame = cap.read()
            if not ok:
                break

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = pose.process(rgb)
            if not result.pose_landmarks:
                continue

            lm = result.pose_landmarks.landmark
            L_HIP, L_KNEE, L_ANKLE = lm[23], lm[25], lm[27]
            R_HIP, R_KNEE, R_ANKLE = lm[24], lm[26], lm[28]

            knee_angles_left.append(
                angle_deg((L_HIP.x, L_HIP.y), (L_KNEE.x, L_KNEE.y), (L_ANKLE.x, L_ANKLE.y))
            )
            knee_angles_right.append(
                angle_deg((R_HIP.x, R_HIP.y), (R_KNEE.x, R_KNEE.y), (R_ANKLE.x, R_ANKLE.y))
            )
            hip_heights.append((L_HIP.y + R_HIP.y) / 2)
            knee_x_offsets.append(abs(L_KNEE.x - L_ANKLE.x) + abs(R_KNEE.x - R_ANKLE.x))

    cap.release()

    if not knee_angles_left:
        raise RuntimeError("No pose landmarks detected in video")

    min_left = min(knee_angles_left)
    min_right = min(knee_angles_right)
    asymmetry_pct = round(abs(min_left - min_right) / ((min_left + min_right) / 2) * 100, 1)

    # Deeper squat -> smaller knee angle at the bottom. Map ~70deg (deep) - 160deg (standing)
    # onto a 0-100 depth score.
    deepest_angle = min(min_left, min_right)
    depth_score = int(np.clip((160 - deepest_angle) / (160 - 70) * 100, 0, 100))

    knee_valgus_score = int(np.clip(np.mean(knee_x_offsets) * 400, 0, 100))

    injured_side_penalty = 10 if LEFT_INJURED_KNEE and min_left < min_right else 0
    acl_risk_score = int(
        np.clip(asymmetry_pct * 2 + knee_valgus_score * 0.8 + (100 - depth_score) * 0.3 + injured_side_penalty, 0, 100)
    )

    improvement_points = []
    if asymmetry_pct > 10:
        improvement_points.append(f"左右差が{asymmetry_pct}%あり、左膝への荷重回避が疑われます。")
    if knee_valgus_score > 40:
        improvement_points.append("しゃがみ込み時の knee-in（内側崩れ）が見られます。")
    if depth_score < 70:
        improvement_points.append("スクワットの深さが不足しています。")
    if not improvement_points:
        improvement_points.append("フォームは安定しています。")

    return {
        "leftRightAsymmetryPct": asymmetry_pct,
        "depthScore": depth_score,
        "kneeValgusScore": knee_valgus_score,
        "aclRiskScore": acl_risk_score,
        "improvementPoints": improvement_points,
    }


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python squat_analysis.py <video_path>", file=sys.stderr)
        sys.exit(1)
    print(json.dumps(analyze(sys.argv[1]), ensure_ascii=False))
