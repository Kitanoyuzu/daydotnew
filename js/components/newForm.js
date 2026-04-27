import { renderCalendarField } from "./calendarPopover.js";
import { renderComboSearch } from "./comboSearch.js";

function rowLabel(text) {
  return `<div class="text-[15px]" style="font-weight: 800; color: var(--text);">${text}</div>`;
}

function inputRow({ placeholder }) {
  return `
    <div
      class="dd-card flex items-center px-[14px]"
      style="height: var(--control-h); border-radius: var(--r-pill); box-shadow: none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); background: color-mix(in srgb, var(--bg) 66%, var(--card));"
    >
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

    <button
      class="w-full dd-card"
      style="height: 54px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 92%, #3b332e); color: var(--card); font-size: 18px; font-weight: 700; box-shadow: var(--shadow-card);"
      type="button"
    >
      记录
    </button>
  `;
}

