import { NextRequest, NextResponse } from "next/server";
import * as repo from "@/lib/db/repo";
import { analyzeMatchVideo, analyzeSquatVideo } from "@/lib/ai/videoAnalysisSim";
import { todayIso } from "@/lib/utils";
import type { VideoAnalysisType } from "@/lib/types";

export const runtime = "nodejs";

// When VIDEO_ANALYSIS_SERVICE_URL is set, this route forwards the video to a real
// MediaPipe/OpenCV pipeline (see scripts/pose_analysis/) instead of the local heuristic.
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const type = formData.get("type") as VideoAnalysisType | null;

  if (!(file instanceof File) || !type || (type !== "squat" && type !== "match")) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const serviceUrl = process.env.VIDEO_ANALYSIS_SERVICE_URL;
  let squatResult = null;
  let matchResult = null;

  if (serviceUrl) {
    try {
      const proxyForm = new FormData();
      proxyForm.append("file", file);
      proxyForm.append("type", type);
      const res = await fetch(`${serviceUrl}/analyze`, { method: "POST", body: proxyForm });
      if (!res.ok) throw new Error(`service returned ${res.status}`);
      const data = await res.json();
      if (type === "squat") squatResult = data;
      else matchResult = data;
    } catch (err) {
      console.error("External video analysis service failed, falling back to simulation", err);
    }
  }

  if (!squatResult && !matchResult) {
    if (type === "squat") {
      squatResult = analyzeSquatVideo(file.name, file.size);
    } else {
      matchResult = analyzeMatchVideo(file.name, file.size);
    }
  }

  const analysis = repo.addVideoAnalysis({
    date: todayIso(),
    type,
    fileName: file.name,
    status: "completed",
    squatResult,
    matchResult,
  });

  return NextResponse.json(analysis);
}

export async function GET() {
  return NextResponse.json(repo.listVideoAnalyses());
}
