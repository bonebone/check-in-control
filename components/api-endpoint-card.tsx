"use client";

import { useState, useTransition } from "react";
import { rotateApiKeyAction } from "@/app/actions";

export function ApiEndpointCard(props: { apiUrl: string }) {
  const [isPending, startTransition] = useTransition();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(props.apiUrl);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  }

  function handleRotate() {
    const confirmed = window.confirm("更新 API 地址后，现有手机端快捷指令中的旧地址会立即失效。确认继续吗？");

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      await rotateApiKeyAction();
    });
  }

  return (
    <article className="card stack compact-card">
      <div className="eyebrow">API Endpoint</div>
      <div className="endpoint-row">
        <input className="endpoint-input mono" value={props.apiUrl} readOnly aria-label="API Endpoint" />
        <button className="ghost-button" type="button" onClick={handleCopy}>
          {copyState === "copied" ? "已复制" : copyState === "failed" ? "复制失败" : "复制"}
        </button>
        <button className="ghost-button" type="button" onClick={handleRotate} disabled={isPending}>
          {isPending ? "更新中..." : "更新"}
        </button>
      </div>
    </article>
  );
}
