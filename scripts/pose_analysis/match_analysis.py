"""Match video analysis for 安羅夕雅OS.

Ball-touch/pass/loss/defensive-action detection from full match footage is a much harder
computer-vision problem than single-subject squat analysis: it needs a trained player+ball
detector (e.g. a YOLO model fine-tuned on match footage) plus tracking (ByteTrack/DeepSORT) to
attribute events to 安羅夕雅 specifically. This script documents that pipeline's shape so a real
model can be dropped in; it is not a from-scratch object detector.

Usage:
    python match_analysis.py path/to/match.mp4 --player-bbox-model path/to/model.pt

Output: JSON matching the MatchVideoAnalysisResult type in src/lib/types.ts.
"""

import argparse
import json

import cv2
import numpy as np


def estimate_ball_possession_events(video_path: str, player_bbox_model_path: str | None) -> dict:
    """Pipeline outline:

    1. Detect the target player (安羅夕雅, jersey #10) per frame — a fine-tuned YOLOv8 model
       trained on his team's jersey colors/number is required for reliable ID across a full
       90-minute match (`player_bbox_model_path`).
    2. Detect the ball per frame (small, fast-moving object — a dedicated ball-detection model
       or motion+color heuristics on cropped pitch regions).
    3. Track both across frames; a "touch" = ball centroid enters the player's control radius.
    4. A touch sequence ending in the ball moving to a teammate = pass; ending in an opponent
       gaining control = loss; classify "through pass" by whether the pass breaks the opponent's
       last defensive line (needs full-frame player detections for both teams).
    5. Defensive actions = tackles/interceptions: ball possession transferring from an opponent
       to 安羅夕雅 within a short time window near his position.

    Without a trained model wired in here, we fall back to frame-count-based heuristics so the
    function still returns a structurally valid result for local testing.
    """
    cap = cv2.VideoCapture(video_path)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    duration_min = frame_count / fps / 60 if fps else 0
    cap.release()

    if player_bbox_model_path:
        raise NotImplementedError(
            "Wire up your fine-tuned detector + tracker here; see module docstring for the pipeline."
        )

    # Heuristic fallback proportional to match duration, for pipeline wiring/testing only.
    ball_touches = int(np.clip(duration_min * 0.9, 20, 120))
    passes = int(ball_touches * 0.6)
    through_passes = int(np.clip(duration_min * 0.08, 1, 10))
    losses = int(np.clip(duration_min * 0.1, 2, 15))
    defensive_actions = int(np.clip(duration_min * 0.12, 3, 18))

    return {
        "ballTouches": ball_touches,
        "passes": passes,
        "throughPasses": through_passes,
        "losses": losses,
        "defensiveActions": defensive_actions,
        "improvementPoints": [
            "この結果はプレースホルダーです。ボール/選手検出モデルを接続すると精度が向上します。"
        ],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("video_path")
    parser.add_argument("--player-bbox-model", dest="player_bbox_model", default=None)
    args = parser.parse_args()
    print(json.dumps(estimate_ball_possession_events(args.video_path, args.player_bbox_model), ensure_ascii=False))
