import { renderCalendarField } from "./calendarPopover.js";
import { renderComboSearch } from "./comboSearch.js";
import { computeTagStats, getParentTag, listTags } from "../store.js";
import { formatISO } from "./calendarCore.js";

function rowLabel(text) {
  return `<div class="text-[15px]" style="font-weight: 800; color: var(--text);">${text}</div>`;
}

function inputRow({ placeholder, inputId }) {
  return `
    <div
      class="dd-card dd-combo-input flex items-center gap-3 px-[14px]"
    >
      <i data-lucide="pencil" class="w-[18px] h-[18px]" style="color: var(--text-sub)"></i>
      <input class="w-full bg-transparent outline-none" placeholder="${placeholder}" style="color: var(--text);" ${inputId ? `data-dd-input="${inputId}"` : ""} />
    </div>
  `;
}

export function renderNewForm() {
  const todayISO = formatISO(new Date());
  const tags = listTags();
  const leaf = tags.filter((t) => t.parentId != null);
  const { counts, lastUsedAt } = computeTagStats();
  const top9 = leaf
    .slice()
    .sort((a, b) => {
      const ca = counts.get(a.id) || 0;
      const cb = counts.get(b.id) || 0;
      if (cb !== ca) return cb - ca;
      const la = lastUsedAt.get(a.id) || "";
      const lb = lastUsedAt.get(b.id) || "";
      if (lb !== la) return lb > la ? 1 : -1;
      return b.id - a.id;
    })
    .slice(0, 9);

  return `
    <div class="dd-card" style="padding: 18px;">
      <div class="flex flex-col gap-[16px]">
        ${rowLabel("标签")}
        ${renderComboSearch({
          id: "new-tag",
          placeholder: "添加标签…",
          rightIcon: "plus",
          rightHref: "#/tags",
          mode: "tag",
        })}

        ${rowLabel("日期")}
        ${renderCalendarField({ id: "new-date", value: todayISO, placeholder: "选择日期" })}

        ${rowLabel("备注")}
        ${inputRow({ placeholder: "写点什么…", inputId: "new-note" })}
      </div>
    </div>

    <div class="pt-1">
      <div class="pb-3 text-[13px]" style="color: var(--text-sub); font-weight: 700;">常用标签</div>
      <div class="grid grid-cols-3 gap-3">
        ${top9
          .map((t) => {
            const p = getParentTag(t);
            const parent = p?.name || "";
            const tint = p?.color || "#C4A882";
            return presetBtn({ tagId: t.id, label: t.name, parent, tint });
          })
          .join("")}
      </div>
    </div>

    <button
      class="w-full dd-card"
      style="height: 54px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 92%, #3b332e); color: var(--card); font-size: 18px; font-weight: 700; box-shadow: var(--shadow-card);"
      type="button"
      data-dd-action="page-new-save"
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
      data-dd-preset-value="${tagId}"
    >
      <div class="text-[14px]" style="color: var(--text); font-weight: 800; line-height: 1.1;">${label}</div>
      <div class="pt-2">
        <span class="dd-pill" style="background:${pBg}; color:${pText};">${parent}</span>
      </div>
    </button>
  `;
}

