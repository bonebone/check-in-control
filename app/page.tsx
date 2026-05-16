import { Dashboard } from "@/components/dashboard";
import { buildCalendarDays } from "@/lib/calendar";
import { getSettings, getWeeklyRule, getDailyOverridesForRange } from "@/lib/db";
import { requireAuthenticated } from "@/lib/session";
import { addMonths, getMonthCursor, getShanghaiDateString, isMonthCursor, parseMonthCursor } from "@/lib/time";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAuthenticated();

  const params = (await searchParams) ?? {};
  const requestedMonth =
    typeof params.month === "string" && isMonthCursor(params.month) ? params.month : getMonthCursor();
  const { year, month } = parseMonthCursor(requestedMonth);
  const startDate = `${requestedMonth}-01`;
  const endDate = `${requestedMonth}-${String(new Date(Date.UTC(year, month, 0)).getUTCDate()).padStart(2, "0")}`;
  const today = getShanghaiDateString();
  const [settings, weeklyRule, overrides] = await Promise.all([
    getSettings(),
    getWeeklyRule(),
    getDailyOverridesForRange(startDate, endDate),
  ]);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://your-app.vercel.app";
  const apiUrl = `${baseUrl}/api/checkin/today?key=${settings.apiKey}`;
  const calendarDays = buildCalendarDays({
    monthCursor: requestedMonth,
    weeklyRule,
    overrides,
    today,
  });

  return (
    <Dashboard
      monthCursor={requestedMonth}
      prevMonth={addMonths(requestedMonth, -1)}
      nextMonth={addMonths(requestedMonth, 1)}
      today={today}
      apiUrl={apiUrl}
      weeklyRule={weeklyRule}
      calendarDays={calendarDays}
    />
  );
}
