import { NextResponse } from "next/server";
import { buildCalendarDays } from "@/lib/calendar";
import { getDailyOverridesForRange, getWeeklyRule } from "@/lib/db";
import { isAuthenticated } from "@/lib/session";
import { getMonthCursor, getShanghaiDateString, isMonthCursor, parseMonthCursor } from "@/lib/time";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const requestedMonth = url.searchParams.get("month");
  const month = requestedMonth && isMonthCursor(requestedMonth) ? requestedMonth : getMonthCursor();
  const { year, month: monthNumber } = parseMonthCursor(month);
  const endDate = `${month}-${String(new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()).padStart(2, "0")}`;
  const [weeklyRule, overrides] = await Promise.all([
    getWeeklyRule(),
    getDailyOverridesForRange(`${month}-01`, endDate),
  ]);

  return NextResponse.json({
    month,
    today: getShanghaiDateString(),
    days: buildCalendarDays({
      monthCursor: month,
      weeklyRule,
      overrides,
    }),
  });
}
