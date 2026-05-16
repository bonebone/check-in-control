import { clearDailyOverrideAction, rotateApiKeyAction, setDailyOverrideAction, updateWeeklyRuleAction } from "@/app/actions";
import { AccountMenu } from "@/components/account-menu";
import { WEEKDAY_KEYS, WEEKDAY_LABELS, type WeeklyRule } from "@/lib/constants";
import type { CalendarDay } from "@/lib/calendar";

function formatSource(day: CalendarDay) {
  if (day.overrideAction === "FORCE_ON") {
    return { label: "日指令: 打卡", className: "pill on" };
  }

  if (day.overrideAction === "FORCE_OFF") {
    return { label: "日指令: 不打卡", className: "pill off" };
  }

  if (day.effectiveCheckin) {
    return { label: "周规则: 打卡", className: "pill inherit" };
  }

  return { label: "周规则: 不打卡", className: "pill inherit" };
}

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
            <p>单用户、东八区固定、日指令覆盖周规则。</p>
          </div>
          <AccountMenu />
        </header>

        <div className="dashboard">
          <section className="overview">
            <article className="card stack">
              <div className="eyebrow">Today</div>
              <h2 className="section-title">{props.today}</h2>
              <p className="meta">系统全部按 `Asia/Shanghai` 判定，不读取服务器本地时区。</p>
            </article>

            <article className="card stack">
              <div className="eyebrow">API Endpoint</div>
              <div className="mono">{props.apiUrl}</div>
              <p className="meta">快捷指令先请求这个地址；失败时仍按本地周四到周日兜底。</p>
              <form action={rotateApiKeyAction}>
                <button className="ghost-button" type="submit">
                  轮换 API Key
                </button>
              </form>
            </article>

            <article className="card stack">
              <div className="eyebrow">Policy</div>
              <p className="meta">优先级：日指令 &gt; 周规则 &gt; 默认不打卡。</p>
              <p className="meta">过去日期只读，今天与未来日期允许操作。</p>
            </article>
          </section>

          <section className="card stack">
            <div>
              <div className="eyebrow">Weekly Rule</div>
              <h2 className="section-title">周重复指令</h2>
            </div>
            <form action={updateWeeklyRuleAction} className="stack">
              <div className="rule-grid">
                {WEEKDAY_KEYS.map((key) => (
                  <div key={key} className={`rule-tile ${props.weeklyRule[key] ? "active" : ""}`}>
                    <label>
                      <span>{WEEKDAY_LABELS[key]}</span>
                      <input type="checkbox" name={key} defaultChecked={props.weeklyRule[key]} />
                    </label>
                    <div className="meta">{props.weeklyRule[key] ? "默认打卡" : "默认不打卡"}</div>
                  </div>
                ))}
              </div>
              <div className="button-row">
                <button className="button" type="submit">
                  保存周规则
                </button>
              </div>
            </form>
          </section>

          <section className="card calendar-frame">
            <div className="calendar-toolbar">
              <div>
                <div className="eyebrow">Calendar</div>
                <h2 className="section-title">{props.monthCursor}</h2>
              </div>
              <div className="button-row">
                <a className="ghost-button" href={`/?month=${props.prevMonth}`}>
                  上个月
                </a>
                <a className="ghost-button" href={`/?month=${props.nextMonth}`}>
                  下个月
                </a>
              </div>
            </div>

            <div className="calendar-grid">
              {WEEKDAY_KEYS.map((weekday) => (
                <div key={weekday} className="weekday">
                  {WEEKDAY_LABELS[weekday]}
                </div>
              ))}

              {props.calendarDays.map((day, index) =>
                day ? (
                  <article key={day.date} className={dayCardClass(day)}>
                    <div className="day-header">
                      <div className="day-number">{day.day}</div>
                      <span className={formatSource(day).className}>{formatSource(day).label}</span>
                    </div>
                    <div className="day-meta">
                      <div>{day.effectiveCheckin ? "结果：打卡" : "结果：不打卡"}</div>
                      <div>{WEEKDAY_LABELS[day.weekday]}</div>
                    </div>
                    {!day.isPast ? (
                      <div className="day-actions">
                        <form action={setDailyOverrideAction}>
                          <input type="hidden" name="date" value={day.date} />
                          <input type="hidden" name="action" value="FORCE_ON" />
                          <button className="mini-button on" type="submit">
                            强制打卡
                          </button>
                        </form>
                        <form action={setDailyOverrideAction}>
                          <input type="hidden" name="date" value={day.date} />
                          <input type="hidden" name="action" value="FORCE_OFF" />
                          <button className="mini-button off" type="submit">
                            强制不打卡
                          </button>
                        </form>
                        <form action={clearDailyOverrideAction}>
                          <input type="hidden" name="date" value={day.date} />
                          <button className="mini-button" type="submit">
                            清除覆盖
                          </button>
                        </form>
                      </div>
                    ) : null}
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
