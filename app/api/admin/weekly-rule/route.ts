import { NextResponse } from "next/server";
import { WEEKDAY_KEYS, type WeeklyRule } from "@/lib/constants";
import { isAuthenticated } from "@/lib/session";
import { updateWeeklyRule } from "@/lib/db";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<WeeklyRule>;
  const rule = WEEKDAY_KEYS.reduce((accumulator, key) => {
    accumulator[key] = Boolean(body[key]);
    return accumulator;
  }, {} as WeeklyRule);

  await updateWeeklyRule(rule);
  return NextResponse.json({ ok: true });
}
