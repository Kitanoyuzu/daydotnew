import { daysSince } from "../mockData.js";

function card({ title, days, tag, parent, date, parentColor }) {
  const pBg = `color-mix(in srgb, ${parentColor} 22%, var(--card))`;
  const pText = `color-mix(in srgb, ${parentColor} 68%, var(--text))`;
  return `
    <a href="#/vault/tag/${tag === "换洗睡衣" ? 12 : 11}" class="dd-card block" style="padding: 16px 16px 14px;">
      <div class="flex items-baseline justify-between gap-3">
        <div
          class="text-[20px] truncate"
          style="font-weight: 800; letter-spacing: -0.02em; line-height: 1.05; max-width: 10.5ch;"
          title="${title}"
        >${title}</div>
        <div class="flex items-baseline gap-1" style="color: color-mix(in srgb, var(--accent) 88%, var(--text));">
          <div class="text-[34px]" style="font-weight: 300; letter-spacing: -0.03em;">${days}</div>
          <div class="text-[14px]" style="color: var(--text-sub); line-height: 1;">天</div>
        </div>
      </div>
      <div class="flex items-center justify-between pt-3">
        <div class="flex items-center gap-10">
          <span class="dd-pill" style="background: color-mix(in srgb, ${parentColor} 16%, var(--card)); color: ${pText};">${parent}</span>
        </div>
        <div class="text-[12px]" style="color: var(--text-sub);">${date.replaceAll("-", "月").replace("月", "月")}</div>
      </div>
    </a>
  `;
}

export function renderRecordWall() {
  const washDays = daysSince("2026-04-25");
  const periodDays = daysSince("2026-04-23");

  return `
    <div class="grid grid-cols-2 gap-[14px]">
      ${card({
        title: "换洗睡衣",
        days: washDays,
        tag: "换洗睡衣",
        parent: "清洁",
        date: "4月25日",
        parentColor: "#7FA7B8",
      })}
      ${card({
        title: "月经",
        days: periodDays,
        tag: "月经",
        parent: "健康",
        date: "4月23日",
        parentColor: "#B48AA8",
      })}
    </div>
  `;
}

