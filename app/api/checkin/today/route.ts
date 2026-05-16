import { NextResponse } from "next/server";
import { getTodayCheckinDecision } from "@/lib/checkin";
import { getSettings } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const settings = await getSettings();

  if (!key || key !== settings.apiKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const decision = await getTodayCheckinDecision();
  return new NextResponse(decision.checkin ? "true" : "false", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
