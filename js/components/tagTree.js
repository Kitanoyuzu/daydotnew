import { computeTagStats, listTags } from "../store.js";

function esc(s) {
  return String(s || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function renderTagTree({ selectedValue = "" } = {}) {
  const tags = listTags();
  const parents = tags.filter((t) => t.parentId == null);
  const children = tags.filter((t) => t.parentId != null);
  const { counts } = computeTagStats();

  const childrenByParent = new Map();
  for (const c of children) {
    const pid = c.parentId;
    if (!childrenByParent.has(pid)) childrenByParent.set(pid, []);
    childrenByParent.get(pid).push(c);
  }

  const parentRows = parents
    .slice()
    .sort((a, b) => {
      const ca = counts.get(a.id) || 0;
      const cb = counts.get(b.id) || 0;
      if (cb !== ca) return cb - ca;
      return String(a.name).localeCompare(String(b.name), "zh-Hans-CN");
    })
    .map((p) => {
      const tint = p.color || "#C4A882";
      const pCount = counts.get(p.id) || 0;
      const pValue = `p:${p.id}`;
      const activeP = selectedValue === pValue;

      const childRows = (childrenByParent.get(p.id) || [])
        .slice()
        .sort((a, b) => {
          const ca = counts.get(a.id) || 0;
          const cb = counts.get(b.id) || 0;
          if (cb !== ca) return cb - ca;
          return String(a.name).localeCompare(String(b.name), "zh-Hans-CN");
        })
        .map((c) => {
          const cCount = counts.get(c.id) || 0;
          const cValue = `t:${c.id}`;
          const activeC = selectedValue === cValue;
          return `
            <button type="button" class="dd-tree-item ${activeC ? "is-active" : ""}" data-dd-tag-tree-value="${esc(cValue)}" style="padding-left: 26px;">
              <span class="text-[14px]" style="color: var(--text); font-weight: 650;">${esc(c.name)}</span>
              <span class="text-[12px]" style="color: var(--text-sub);">${cCount}</span>
            </button>
          `;
        })
        .join("");

      return `
        <div class="flex flex-col gap-1">
          <button type="button" class="dd-tree-item ${activeP ? "is-active" : ""}" data-dd-tag-tree-value="${esc(pValue)}">
            <span class="flex items-center gap-2 min-w-0">
              <span style="width: 10px; height: 10px; border-radius: 999px; display:block; border: 2px solid ${tint};"></span>
              <span class="text-[14px] truncate" style="color: var(--text); font-weight: 800;">${esc(p.name)}</span>
            </span>
            <span class="text-[12px]" style="color: var(--text-sub);">${pCount}</span>
          </button>
          ${childRows}
        </div>
      `;
    })
    .join("");

  return `
    <div class="flex flex-col gap-2">
      <div class="flex flex-col gap-2" data-dd-tag-tree-list>
        ${parentRows || `<div class="px-3 py-2 text-[12px]" style="color: var(--text-sub);">还没有标签</div>`}
      </div>
    </div>
  `;
}

