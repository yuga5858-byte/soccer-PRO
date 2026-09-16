"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { VideoAnalysisType } from "@/lib/types";

export function VideoUploader({ type }: { type: VideoAnalysisType }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = async (file: File) => {
    setStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const res = await fetch("/api/video-analysis", { method: "POST", body: formData });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
      router.refresh();
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      className="glass-panel flex flex-col items-center justify-center gap-2 border border-dashed border-[var(--border-subtle)] px-6 py-10 text-center"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      role="button"
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {status === "uploading" ? (
        <>
          <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--foreground-muted)]">分析中...</p>
        </>
      ) : (
        <>
          <UploadCloud size={28} className="text-[var(--accent)]" />
          <p className="text-sm font-medium">動画をタップまたはドロップしてアップロード</p>
          <p className="text-xs text-[var(--foreground-muted)]">MP4 / MOV 対応</p>
        </>
      )}
      {status === "error" && <p className="text-xs text-[var(--danger)]">分析に失敗しました。再度お試しください。</p>}
    </div>
  );
}
