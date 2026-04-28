import { renderComboSearch } from "./comboSearch.js";
import { openModal, toast } from "./modal.js";
import { computeTagStats, deleteTag, getParentTag, listTags, upsertTag } from "../store.js";

export function renderTagsManager() {
  const tags = listTags();
  const leaf = tags.filter((t) => t.parentId != null);
  const { counts } = computeTagStats();
  const rows = leaf
    .slice()
    .sort((a, b) => {
      const ca = counts.get(a.id) || 0;
      const cb = counts.get(b.id) || 0;
      if (cb !== ca) return cb - ca;
      return b.id - a.id;
    })
    .map((t) => {
      const p = getParentTag(t);
      const tint = p?.color || "#C4A882";
      return tagRow({
        id: t.id,
        parentId: t.parentId,
        name: t.name,
        parent: p?.name || "",
        count: counts.get(t.id) || 0,
        tint,
      });
    })
    .join("");

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
            <button class="dd-icon-btn" type="button" aria-label="删除标签" data-dd-tags-delete>
              <i data-lucide="trash-2" class="w-[18px] h-[18px]"></i>
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
          <input class="flex-1 h-full bg-transparent outline-none" placeholder="搜索标签…" data-dd-tags-search />
          <button class="dd-icon-btn" type="button" aria-label="标签树" data-dd-modal-open="vaultall-filter">
            <i data-lucide="sliders-horizontal" class="w-[18px] h-[18px]"></i>
          </button>
        </div>

        <div class="pt-4 flex flex-col gap-3">
          <div data-dd-tags-list class="flex flex-col" style="gap: calc(var(--control-h) / 4);">
            ${rows}
          </div>
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

  const refreshList = () => {
    const wrap = document.querySelector("[data-dd-tags-list]");
    if (!wrap) return;
    const q = (document.querySelector("[data-dd-tags-search]")?.value || "").trim();
    const tags = listTags();
    const leaf = tags.filter((t) => t.parentId != null);
    const { counts } = computeTagStats();
    const filtered = q
      ? leaf.filter((t) => t.name.includes(q) || (getParentTag(t)?.name ?? "").includes(q))
      : leaf;

    wrap.innerHTML = filtered
      .slice()
      .sort((a, b) => {
        const ca = counts.get(a.id) || 0;
        const cb = counts.get(b.id) || 0;
        if (cb !== ca) return cb - ca;
        return b.id - a.id;
      })
      .map((t) => {
        const p = getParentTag(t);
        const tint = p?.color || "#C4A882";
        return tagRow({
          id: t.id,
          parentId: t.parentId,
          name: t.name,
          parent: p?.name || "",
          count: counts.get(t.id) || 0,
          tint,
        });
      })
      .join("");
    lucide?.createIcons?.();
  };

  document.addEventListener("input", (e) => {
    const input = e.target?.closest?.("[data-dd-tags-search]");
    if (!input) return;
    refreshList();
  });

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

      toast("已载入到上方");
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
      toast("父级颜色已选择");
      return;
    }

    const save = e.target.closest?.("[data-dd-tags-save]");
    if (save) {
      const parentInput = document.querySelector('[data-dd-combo-input="tags-parent"]');
      const parentRoot = document.querySelector('[data-dd-combo-root="tags-parent"]');
      const childInput = document.querySelector('[data-dd-combo-input="tags-child"]');
      const childRoot = document.querySelector('[data-dd-combo-root="tags-child"]');
      const indicator = document.querySelector("[data-dd-tags-color-indicator]");

      const parentName = String(parentInput?.value || "").trim();
      const parentValue = String(parentRoot?.dataset?.ddValue || "").trim();
      const childName = String(childInput?.value || "").trim();
      const childValue = String(childRoot?.dataset?.ddValue || "").trim();
      const color = indicator ? getComputedStyle(indicator).borderColor : "";

      let parentId = null;
      if (parentValue.startsWith("create:")) {
        const r = upsertTag({ name: parentName || parentValue.slice("create:".length), parentId: null, color });
        if (!r.ok) return toast(r.error || "父级保存失败");
        parentId = r.tag.id;
        if (parentRoot) parentRoot.dataset.ddValue = String(parentId);
        if (parentInput) parentInput.value = r.tag.name;
      } else {
        const pid = Number(parentValue);
        if (!Number.isFinite(pid)) return toast("请选择父级");
        parentId = pid;
      }

      if (!childName) return toast("请输入子级");

      let childId = null;
      if (childValue && !childValue.startsWith("create:")) {
        const cid = Number(childValue);
        if (Number.isFinite(cid)) childId = cid;
      }
      const rr = upsertTag({ id: childId, name: childName, parentId });
      if (!rr.ok) return toast(rr.error || "子级保存失败");

      if (childRoot) childRoot.dataset.ddValue = String(rr.tag.id);
      if (childInput) childInput.value = rr.tag.name;
      toast("标签已保存");
      refreshList();
    }

    const del = e.target.closest?.("[data-dd-tags-delete]");
    if (del) {
      const childRoot = document.querySelector('[data-dd-combo-root="tags-child"]');
      const childValue = String(childRoot?.dataset?.ddValue || "").trim();
      const tagId = childValue && !childValue.startsWith("create:") ? Number(childValue) : NaN;
      if (!Number.isFinite(tagId)) return toast("请选择要删除的子级");

      const portal = document.getElementById("portal");
      if (portal) {
        portal.dataset.ddDeletingTagId = String(tagId);
        portal.dataset.ddDeletingTagName = String(document.querySelector('[data-dd-combo-input="tags-child"]')?.value || "").trim();
      }
      const nodes = Array.from(document.querySelectorAll('[data-dd-template="tags-delete-choice"]'));
      const template = nodes.length ? nodes[nodes.length - 1] : null;
      if (!template) return;
      openModal(template.innerHTML, { ariaLabel: "删除标签", variant: "float" });
      const nameEl = document.querySelector("[data-dd-tags-delete-name]");
      if (nameEl && portal?.dataset?.ddDeletingTagName) nameEl.textContent = `（${portal.dataset.ddDeletingTagName}）`;
      lucide?.createIcons?.();
      return;
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

