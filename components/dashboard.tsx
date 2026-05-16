import { AccountMenu } from "@/components/account-menu";
import { ApiEndpointCard } from "@/components/api-endpoint-card";
import { CalendarHeader } from "@/components/calendar-header";
import { WeeklyRuleStrip } from "@/components/weekly-rule-strip";
import { type WeeklyRule } from "@/lib/constants";
import type { CalendarDay } from "@/lib/calendar";

function dayCardClass(day: CalendarDay) {
  if (day.isPast) {
    return "day-card disabled";
  }

  if (day.overrideAction === "FORCE_ON") {
    return "day-card override-on";
  }

  if (day.overrideAction === "FORCE_OFF") {
    return "day-card override-off";
  }

  if (day.effectiveCheckin) {
    return "day-card weekly-on";
  }

  return "day-card";
}

export function Dashboard(props: {
  monthCursor: string;
  prevMonth: string;
  nextMonth: string;
  today: string;
  apiUrl: string;
  weeklyRule: WeeklyRule;
  calendarDays: Array<CalendarDay | null>;
}) {
  return (
    <main className="shell">
      <section className="panel">
        <header className="topbar">
          <div>
            <div className="eyebrow">Check In Control</div>
            <h1>远程打卡规则台</h1>
            <p>{props.today}</p>
          </div>
          <div className="topbar-actions">
            <AccountMenu />
          </div>
        </header>

        <div className="dashboard">
          <section className="overview">
            <ApiEndpointCard apiUrl={props.apiUrl} />

            <article className="card stack compact-card">
              <div className="eyebrow">Policy</div>
              <p className="meta">优先级：日指令 &gt; 周规则 &gt; 默认不打卡；过去日期只读，今天与未来日期允许操作。</p>
            </article>
          </section>

          <section className="card calendar-frame">
            <CalendarHeader monthCursor={props.monthCursor} prevMonth={props.prevMonth} nextMonth={props.nextMonth} />

            <div className="calendar-grid">
              <WeeklyRuleStrip weeklyRule={props.weeklyRule} />

              {props.calendarDays.map((day, index) =>
                day ? (
                  <article key={day.date} className={dayCardClass(day)}>
                    <div className="day-header">
                      <div className="day-number">{day.day}</div>
                    </div>
                  </article>
                ) : (
                  <div key={`blank-${index}`} className="day-card blank" />
                ),
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
