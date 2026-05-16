"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function parseCursor(cursor: string) {
  const [year, month] = cursor.split("-").map(Number);
  return { year, month };
}

export function CalendarHeader(props: {
  monthCursor: string;
  prevMonth: string;
  nextMonth: string;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { year, month } = parseCursor(props.monthCursor);
  const currentYear = new Date().getFullYear();
  const startYear = Math.min(year, currentYear) - 3;
  const endYear = Math.max(year, currentYear) + 3;
  const yearOptions = [];

  for (let optionYear = startYear; optionYear <= endYear; optionYear += 1) {
    yearOptions.push(optionYear);
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function jumpTo(nextYear: number, nextMonth: number) {
    const nextCursor = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
    setIsPickerOpen(false);
    router.push(`/?month=${nextCursor}`);
  }

  return (
    <div className="calendar-toolbar">
      <div className="eyebrow">Calendar</div>
      <div className="calendar-nav" ref={rootRef}>
        <a className="ghost-button calendar-nav-button" href={`/?month=${props.prevMonth}`}>
          上个月
        </a>

        <div className={`calendar-picker ${isPickerOpen ? "open" : ""}`}>
          <button className="calendar-title-button" type="button" onClick={() => setIsPickerOpen((value) => !value)}>
            <span className="section-title">{year} - {String(month).padStart(2, "0")}</span>
          </button>

          <div className="calendar-picker-panel">
            <label className="field">
              <span className="label">年份</span>
              <select className="select" value={String(year)} onChange={(event) => jumpTo(Number(event.target.value), month)}>
                {yearOptions.map((optionYear) => (
                  <option key={optionYear} value={optionYear}>
                    {optionYear} 年
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">月份</span>
              <select className="select" value={String(month)} onChange={(event) => jumpTo(year, Number(event.target.value))}>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((optionMonth) => (
                  <option key={optionMonth} value={optionMonth}>
                    {String(optionMonth).padStart(2, "0")} 月
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <a className="ghost-button calendar-nav-button" href={`/?month=${props.nextMonth}`}>
          下个月
        </a>
      </div>
    </div>
  );
}
