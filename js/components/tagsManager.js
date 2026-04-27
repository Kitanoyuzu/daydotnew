import { renderComboSearch } from "./comboSearch.js";
import { toast } from "./modal.js";

export function renderTagsManager() {
  return `
    <section class="flex flex-col gap-[14px]">
      <div class="dd-card" style="padding: 16px;">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <div class="flex-1">
              ${renderTagParentCombo()}
            </div>
            <button class="dd-icon-btn" type="button" aria-label="选择颜色" data-dd-tags-color-toggle>
              <span data-dd-tags-color-indicator style="width: 16px; height: 16px; border-radius: 999px; border: 2px solid var(--accent); display:block;"></span>
            </button>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex-1">
              ${renderTagChildCombo()}
            </div>
            <button class="dd-icon-btn" type="button" aria-label="保存标签" data-dd-tags-save>
              <i data-lucide="check" class="w-[18px] h-[18px]"></i>
            </button>
          </div>
          <div class="hidden" data-dd-tags-color-panel style="padding: 10px 6px 0;">
            ${renderColorPalette()}
          </div>
        </div>
      </div>

      <div class="dd-card" style="padding: 14px;">
        <div class="dd-card px-[14px]" style="height: var(--control-h); border-radius: var(--r-pill); box-shadow:none; border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); background: color-mix(in srgb, var(--bg) 66%, var(--card)); display:flex; align-items:center; gap:10px;">
          <i data-lucide="search" class="w-[18px] h-[18px]" style="color: var(--text-sub)"></i>
          <input class="w-full h-full bg-transparent outline-none" placeholder="搜索标签…" />
        </div>

        <div class="pt-4 flex flex-col gap-3">
          ${tagRow({ id: 11, parentId: 1, name: "月经", parent: "健康", count: 1, tint: "#B48AA8" })}
          ${tagRow({ id: 12, parentId: 2, name: "换洗睡衣", parent: "清洁", count: 2, tint: "#7FA7B8" })}
        </div>
      </div>
    </section>
  `;
}

function tagRow({ id, parentId, name, parent, count, tint }) {
  const bg = `color-mix(in srgb, ${tint} 18%, var(--card))`;
  const pText = `color-mix(in srgb, ${tint} 68%, var(--text))`;
  return `
    <button
      type="button"
      class="dd-card flex items-center justify-between px-4 py-3 w-full text-left"
      style="border-radius: var(--r-card); box-shadow:none; background:${bg}; border: 1px solid color-mix(in srgb, var(--border) 55%, transparent);"
      aria-label="选择标签"
      data-dd-tag-pick="1"
      data-dd-tag-id="${id}"
      data-dd-tag-name="${name}"
      data-dd-parent-id="${parentId}"
      data-dd-parent-name="${parent}"
    >
      <div class="text-[14px]" style="color: var(--text); font-weight: 600;">${name}</div>
      <div class="flex items-center gap-3">
        <span class="dd-pill" style="height: 28px; font-size: 14px; background: color-mix(in srgb, ${tint} 22%, var(--card)); color:${pText};">${parent}</span>
        <span class="text-[12px]" style="color: var(--text-sub);">${count}</span>
      </div>
    </button>
  `;
}

export function initTagsManagerAll() {
  if (document.documentElement.dataset.ddTagsManagerDelegated === "1") return;
  document.documentElement.dataset.ddTagsManagerDelegated = "1";

  document.addEventListener("click", (e) => {
    const pick = e.target.closest?.("[data-dd-tag-pick]");
    if (pick) {
      const parentName = pick.getAttribute("data-dd-parent-name") || "";
      const parentId = pick.getAttribute("data-dd-parent-id") || "";
      const tagName = pick.getAttribute("data-dd-tag-name") || "";
      const tagId = pick.getAttribute("data-dd-tag-id") || "";

      const parentInput = document.querySelector('[data-dd-combo-input="tags-parent"]');
      const parentRoot = document.querySelector('[data-dd-combo-root="tags-parent"]');
      const childInput = document.querySelector('[data-dd-combo-input="tags-child"]');
      const childRoot = document.querySelector('[data-dd-combo-root="tags-child"]');

      if (parentInput) parentInput.value = parentName;
      if (parentRoot) parentRoot.dataset.ddValue = parentId;
      if (childInput) childInput.value = tagName;
      if (childRoot) childRoot.dataset.ddValue = tagId;

      toast("已载入到上方（原型）");
      return;
    }

    const toggle = e.target.closest?.("[data-dd-tags-color-toggle]");
    if (toggle) {
      const panel = document.querySelector("[data-dd-tags-color-panel]");
      if (panel) panel.classList.toggle("hidden");
      return;
    }

    const swatch = e.target.closest?.("[data-dd-tags-color]");
    if (swatch) {
      const c = swatch.getAttribute("data-dd-tags-color");
      const indicator = document.querySelector("[data-dd-tags-color-indicator]");
      const panel = document.querySelector("[data-dd-tags-color-panel]");
      if (indicator && c) indicator.style.borderColor = c;
      if (panel) panel.classList.add("hidden");
      toast("父级颜色已选择（原型）");
      return;
    }

    const save = e.target.closest?.("[data-dd-tags-save]");
    if (save) {
      toast("标签已保存（原型）");
    }
  });
}

function renderTagParentCombo() {
  return `
    ${renderComboSearch({
      id: "tags-parent",
      placeholder: "父级",
      mode: "tagParent",
      variant: "bar",
    })}
  `;
}

function renderTagChildCombo() {
  return `
    ${renderComboSearch({
      id: "tags-child",
      placeholder: "子级",
      mode: "tagChild",
      variant: "bar",
    })}
  `;
}

function renderColorPalette() {
  // 色谱顺序：相近色相邻（暖中性 → 玫粉/紫 → 蓝/青 → 绿）
  const colors = [
    "#C4A882",
    "#C2B280",
    "#A68F7C",
    "#D0A38F",
    "#B48AA8",
    "#B7A9C6",
    "#8E9AAF",
    "#7FA7B8",
    "#8FA7A6",
    "#A3B18A",
  ];

  return `
    <div class="grid grid-cols-5 gap-3">
      ${colors
        .map(
          (c) => `
          <button
            type="button"
            aria-label="选择颜色"
            data-dd-tags-color="${c}"
            class="dd-icon-btn"
            style="background: color-mix(in srgb, ${c} 14%, var(--card)); border: 1px solid color-mix(in srgb, var(--border) 65%, transparent);"
          >
            <span style="width: 16px; height: 16px; border-radius: 999px; display:block; border: 2px solid ${c};"></span>
          </button>
        `,
        )
        .join("")}
    </div>
  `;
}

