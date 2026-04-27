import { mockTags, getParentTag } from "../mockData.js";

export function renderComboSearch({ id, placeholder, rightIcon, mode }) {
  const right = rightIcon
    ? `<button class="dd-icon-btn" type="button" data-dd-combo-right="${id}"><i data-lucide="${rightIcon}" class="w-[18px] h-[18px]"></i></button>`
    : "";

  return `
    <div class="relative" data-dd-combo-root="${id}" data-dd-combo-mode="${mode}">
      <div class="dd-card flex items-center gap-3 px-[14px] h-[52px] rounded-[999px] shadow-[var(--shadow-card)]" style="border-radius: var(--r-pill);">
        <i data-lucide="search" class="w-[18px] h-[18px]" style="color: var(--text-sub)"></i>
        <input
          class="flex-1 bg-transparent outline-none placeholder:opacity-100"
          style="color: var(--text); font-size: 14px;"
          data-dd-combo-input="${id}"
          placeholder="${placeholder}"
          autocomplete="off"
        />
        ${right}
      </div>

      <div
        class="dd-float hidden"
        data-dd-combo-menu="${id}"
        style="top: calc(52px + var(--combo-menu-gap)); padding: 10px; max-height: var(--combo-menu-max-h); overflow: auto;"
      ></div>
    </div>
  `;
}

function buildOptions({ q }) {
  const query = (q || "").trim();
  const leafTags = mockTags.filter((t) => t.parentId != null);
  const items = query
    ? leafTags.filter((t) => t.name.includes(query) || (getParentTag(t)?.name ?? "").includes(query))
    : leafTags;

  if (items.length === 0) {
    return `<div class="px-3 py-3 text-[12px]" style="color: var(--text-sub);">没有匹配项</div>`;
  }

  return items
    .map((t) => {
      const p = getParentTag(t);
      const pName = p?.name ?? "";
      const pColor = p?.color ?? "#C4A882";
      const pBg = `color-mix(in srgb, ${pColor} 22%, var(--card))`;
      return `
        <button
          class="w-full flex items-center justify-between px-3 py-2 rounded-[999px]"
          style="border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); background: color-mix(in srgb, var(--bg) 70%, var(--card));"
          type="button"
          data-dd-combo-option="${t.id}"
          data-dd-combo-label="${t.name}"
          data-dd-combo-parent="${pName}"
          data-dd-combo-parent-color="${pColor}"
        >
          <span class="text-[14px]" style="color: var(--text);">${t.name}</span>
          <span class="dd-pill" style="background: ${pBg}; color: color-mix(in srgb, ${pColor} 65%, var(--text));">${pName}</span>
        </button>
      `;
    })
    .join("");
}

function openMenu(root, menu) {
  menu.classList.remove("hidden");
  root.dataset.ddComboOpen = "1";
}

function closeMenu(root, menu) {
  menu.classList.add("hidden");
  delete root.dataset.ddComboOpen;
}

export function initComboSearchAll() {
  const roots = Array.from(document.querySelectorAll("[data-dd-combo-root]"));
  for (const root of roots) {
    const id = root.getAttribute("data-dd-combo-root");
    const input = root.querySelector(`[data-dd-combo-input="${id}"]`);
    const menu = root.querySelector(`[data-dd-combo-menu="${id}"]`);
    if (!id || !input || !menu) continue;

    const render = () => {
      menu.innerHTML = buildOptions({ q: input.value });
      lucide?.createIcons?.();
    };

    input.addEventListener("focus", () => {
      render();
      openMenu(root, menu);
    });

    input.addEventListener("input", () => {
      render();
      openMenu(root, menu);
    });

    root.addEventListener("click", (e) => {
      const option = e.target.closest("[data-dd-combo-option]");
      if (!option) return;

      const label = option.getAttribute("data-dd-combo-label") || "";
      input.value = label;
      closeMenu(root, menu);
      input.blur();
    });

    document.addEventListener("pointerdown", (e) => {
      if (!root.dataset.ddComboOpen) return;
      if (root.contains(e.target)) return;
      closeMenu(root, menu);
    });

    const right = root.querySelector(`[data-dd-combo-right="${id}"]`);
    right?.addEventListener("click", (e) => {
      e.preventDefault();
      // 原型：右侧按钮不做跳转，仅表现态
    });
  }
}

