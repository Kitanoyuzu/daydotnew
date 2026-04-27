import { renderCalendarField } from "./calendarPopover.js";
import { renderComboSearch } from "./comboSearch.js";

function rowLabel(text) {
  return `<div class="text-[15px]" style="font-weight: 800; color: var(--text);">${text}</div>`;
}

function inputRow({ placeholder }) {
  return `
    <div
      class="dd-card dd-combo-input flex items-center gap-3 px-[14px]"
    >
      <i data-lucide="pencil" class="w-[18px] h-[18px]" style="color: var(--text-sub)"></i>
      <input class="w-full bg-transparent outline-none" placeholder="${placeholder}" style="color: var(--text);" />
    </div>
  `;
}

export function renderNewForm() {
  return `
    <div class="dd-card" style="padding: 18px;">
      <div class="flex flex-col gap-[16px]">
        ${rowLabel("标签")}
        ${renderComboSearch({
          id: "new-tag",
          placeholder: "添加标签…",
          rightIcon: "settings",
          rightHref: "#/tags",
          mode: "tag",
        })}

        ${rowLabel("日期")}
        ${renderCalendarField({ id: "new-date", value: "2026-04-27", placeholder: "选择日期" })}

        ${rowLabel("备注")}
        ${inputRow({ placeholder: "写点什么…" })}
      </div>
    </div>

    <div class="pt-1">
      <div class="pb-3 text-[13px]" style="color: var(--text-sub); font-weight: 700;">常用标签</div>
      <div class="grid grid-cols-3 gap-3">
        ${presetBtn({ tagId: 12, label: "换洗睡衣", parent: "清洁", tint: "#7FA7B8" })}
        ${presetBtn({ tagId: 11, label: "月经", parent: "健康", tint: "#B48AA8" })}
        ${presetBtn({ tagId: 12, label: "换洗睡衣", parent: "清洁", tint: "#7FA7B8" })}
        ${presetBtn({ tagId: 11, label: "月经", parent: "健康", tint: "#B48AA8" })}
        ${presetBtn({ tagId: 12, label: "换洗睡衣", parent: "清洁", tint: "#7FA7B8" })}
        ${presetBtn({ tagId: 11, label: "月经", parent: "健康", tint: "#B48AA8" })}
        ${presetBtn({ tagId: 12, label: "换洗睡衣", parent: "清洁", tint: "#7FA7B8" })}
        ${presetBtn({ tagId: 11, label: "月经", parent: "健康", tint: "#B48AA8" })}
        ${presetBtn({ tagId: 12, label: "换洗睡衣", parent: "清洁", tint: "#7FA7B8" })}
      </div>
    </div>

    <button
      class="w-full dd-card"
      style="height: 54px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 92%, #3b332e); color: var(--card); font-size: 18px; font-weight: 700; box-shadow: var(--shadow-card);"
      type="button"
    >
      记录
    </button>
  `;
}

function presetBtn({ tagId, label, parent, tint }) {
  const pBg = `color-mix(in srgb, ${tint} 18%, var(--card))`;
  const pText = `color-mix(in srgb, ${tint} 68%, var(--text))`;
  return `
    <button
      type="button"
      class="dd-card flex flex-col items-center justify-center text-center"
      style="padding: 12px 10px 10px; min-height: 74px; border-radius: var(--r-card); background: color-mix(in srgb, var(--bg) 70%, var(--card)); border: 1px solid color-mix(in srgb, var(--border) 55%, transparent); box-shadow: var(--shadow-card);"
      data-dd-preset-tag="${label}"
      data-dd-preset-target="new-tag"
    >
      <div class="text-[14px]" style="color: var(--text); font-weight: 800; line-height: 1.1;">${label}</div>
      <div class="pt-2">
        <span class="dd-pill" style="background:${pBg}; color:${pText};">${parent}</span>
      </div>
    </button>
  `;
}

