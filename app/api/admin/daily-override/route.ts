import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/session";
import { deleteDailyOverride, upsertDailyOverride } from "@/lib/db";
import { compareDateStrings, getShanghaiDateString } from "@/lib/time";

function isAllowedDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && compareDateStrings(date, getShanghaiDateString()) >= 0;
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { date?: string; action?: "FORCE_ON" | "FORCE_OFF" };

  if (!body.date || !isAllowedDate(body.date) || (body.action !== "FORCE_ON" && body.action !== "FORCE_OFF")) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  await upsertDailyOverride(body.date, body.action);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date || !isAllowedDate(date)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  await deleteDailyOverride(date);
  return NextResponse.json({ ok: true });
}
