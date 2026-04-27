function pad2(n) {
  return String(n).padStart(2, "0");
}

export function formatISO(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfMonth(year, monthIndex) {
  return new Date(year, monthIndex, 1);
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function cnWeekday(w) {
  return ["一", "二", "三", "四", "五", "六", "日"][w];
}

export function buildMonthGrid({ year, monthIndex, selectedISO, dots = [] }) {
  const first = startOfMonth(year, monthIndex);
  const firstDay = (first.getDay() + 6) % 7; // Mon=0
  const total = daysInMonth(year, monthIndex);

  const dotSet = new Set(dots);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let day = 1; day <= total; day++) {
    const d = new Date(year, monthIndex, day);
    const iso = formatISO(d);
    cells.push({ day, iso, hasDot: dotSet.has(iso) });
  }

  return `
    <div class="grid grid-cols-7 gap-y-[10px] justify-items-center pt-[8px] pb-[10px]">
      ${Array.from({ length: 7 })
        .map((_, i) => `<div class="text-[12px]" style="color: var(--text-sub);">${cnWeekday(i)}</div>`)
        .join("")}

      ${cells
        .map((c) => {
          if (!c) return `<div style="width: var(--calendar-cell-size); height: var(--calendar-cell-size);"></div>`;
          const isSelected = c.iso === selectedISO;
          const bg = isSelected
            ? `background: var(--calendar-selected-bg); color: var(--card);`
            : `background: transparent; color: var(--text);`;
          const dot = c.hasDot
            ? `<span style="width: var(--calendar-dot-size); height: var(--calendar-dot-size); border-radius: 999px; background: color-mix(in srgb, var(--accent) 72%, var(--text)); display:block; margin-top: 4px; opacity: ${isSelected ? 0.85 : 0.55};"></span>`
            : `<span style="width: var(--calendar-dot-size); height: var(--calendar-dot-size); display:block; margin-top: 4px; opacity: 0;"></span>`;
          return `
            <button
              type="button"
              data-dd-cal-day="${c.iso}"
              class="flex flex-col items-center justify-center"
              style="width: var(--calendar-cell-size); height: var(--calendar-cell-size); border-radius: 999px; ${bg}"
            >
              <span class="text-[14px]" style="line-height: 1;">${c.day}</span>
              ${dot}
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

export function renderCalendarMonthCard({
  id,
  year,
  monthIndex,
  selectedISO,
  dots = [],
  showFooter = true,
}) {
  return `
    <div class="dd-card" data-dd-cal-card="${id}" style="padding: 14px 14px 0; background: color-mix(in srgb, var(--bg) 70%, var(--card));">
      <div class="flex items-center justify-between px-[2px]">
        <button type="button" class="dd-icon-btn" data-dd-cal-prev="${id}"><i data-lucide="chevron-left" class="w-[18px] h-[18px]"></i></button>
        <div class="text-[16px]" style="color: var(--text); font-weight: 600;">${year} 年 ${pad2(monthIndex + 1)} 月</div>
        <button type="button" class="dd-icon-btn" data-dd-cal-next="${id}"><i data-lucide="chevron-right" class="w-[18px] h-[18px]"></i></button>
      </div>

      ${buildMonthGrid({ year, monthIndex, selectedISO, dots })}

      ${
        showFooter
          ? `<div class="flex items-center justify-between px-[10px]" style="height: var(--calendar-footer-h); border-top: 1px solid color-mix(in srgb, var(--border) 65%, transparent);">
              <button type="button" class="text-[13px]" style="color: var(--text-sub);" data-dd-cal-clear="${id}">清除</button>
              <button type="button" class="text-[13px]" style="color: color-mix(in srgb, var(--accent) 75%, var(--text)); font-weight: 600;" data-dd-cal-today="${id}">今天</button>
            </div>`
          : ``
      }
    </div>
  `;
}

