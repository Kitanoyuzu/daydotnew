import { mockTags, getParentTag } from "../mockData.js";

export function renderComboSearch({ id, placeholder, rightIcon, rightHref, mode, variant = "bar" }) {
  const right = rightIcon
    ? `<a class="dd-icon-btn" href="${rightHref || "#"}" data-dd-combo-right="${id}" aria-label="快捷入口"><i data-lucide="${rightIcon}" class="w-[18px] h-[18px]"></i></a>`
    : "";

  const icon = `<i data-lucide="search" class="w-[18px] h-[18px]" style="color: var(--text-sub)"></i>`;

  return `
    <div class="dd-combo" data-dd-combo-root="${id}" data-dd-combo-mode="${mode}">
      <div class="dd-card dd-combo-input flex items-center gap-3 px-[14px] shadow-[var(--shadow-card)]" style="border-radius: var(--r-pill);">
        ${icon}
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
        class="dd-combo-menu hidden"
        data-dd-combo-menu="${id}"
      ></div>
    </div>
  `;
}

function buildLeafTagItems(items) {
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
          class="dd-combo-item"
          type="button"
          data-dd-combo-option="${t.id}"
          data-dd-combo-value="${t.id}"
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

function buildCreateOption(query) {
  const q = query.trim();
  if (!q) return "";
  return `
    <button
      class="dd-combo-item"
      type="button"
      data-dd-combo-option="create"
      data-dd-combo-value="create:${q}"
      data-dd-combo-label="${q}"
    >
      <span class="text-[14px]" style="color: var(--text); font-weight: 800;">新建“${q}”</span>
      <span class="dd-pill" style="background: var(--secondary); color: var(--text-sub);">新建</span>
    </button>
  `;
}

function buildParentItems(items) {
  if (items.length === 0) {
    return `<div class="px-3 py-3 text-[12px]" style="color: var(--text-sub);">没有匹配项</div>`;
  }
  return items
    .map((p) => {
      const c = p.color || "#C4A882";
      return `
        <button
          class="dd-combo-item"
          type="button"
          data-dd-combo-option="${p.id}"
          data-dd-combo-value="${p.id}"
          data-dd-combo-label="${p.name}"
        >
          <span class="text-[14px]" style="color: var(--text);">${p.name}</span>
          <span style="width: 16px; height: 16px; border-radius: 999px; display:block; border: 2px solid ${c};"></span>
        </button>
      `;
    })
    .join("");
}

function buildOptions({ q, mode }) {
  const query = (q || "").trim();

  if (mode === "tagFilter") {
    // 统一：仍然展示“子级在左、父级胶囊在右”的同一行样式
    const leafTags = mockTags.filter((t) => t.parentId != null);
    const items = query
      ? leafTags.filter((t) => t.name.includes(query) || (getParentTag(t)?.name ?? "").includes(query))
      : leafTags;

    return `
      <div class="flex flex-col gap-1">
        <button type="button" class="dd-combo-item" data-dd-combo-option="all" data-dd-combo-value="" data-dd-combo-label="全部">
          <span class="text-[14px]" style="color: var(--text);">全部</span>
          <span class="dd-pill" style="background: var(--secondary); color: var(--text-sub);"> </span>
        </button>
        ${buildLeafTagItems(items)}
      </div>
    `;
  }

  if (mode === "tagParent") {
    const parents = mockTags.filter((t) => t.parentId == null);
    const items = query ? parents.filter((p) => p.name.includes(query)) : parents;
    const exact = !!query && parents.some((p) => p.name === query);
    return `
      <div class="flex flex-col gap-1">
        ${!exact ? buildCreateOption(query) : ""}
        ${buildParentItems(items)}
      </div>
    `;
  }

  if (mode === "tagChild") {
    const leafTags = mockTags.filter((t) => t.parentId != null);
    const items = query
      ? leafTags.filter((t) => t.name.includes(query) || (getParentTag(t)?.name ?? "").includes(query))
      : leafTags;
    const exact = !!query && leafTags.some((t) => t.name === query);
    return `
      <div class="flex flex-col gap-1">
        ${!exact ? buildCreateOption(query) : ""}
        ${buildLeafTagItems(items)}
      </div>
    `;
  }

  const leafTags = mockTags.filter((t) => t.parentId != null);
  const items = query
    ? leafTags.filter((t) => t.name.includes(query) || (getParentTag(t)?.name ?? "").includes(query))
    : leafTags;

  return buildLeafTagItems(items);
}

function openMenu(root, menu) {
  menu.classList.remove("hidden");
  root.dataset.ddComboOpen = "1";
  root.dataset.ddOpen = "1";
}

function closeMenu(root, menu) {
  menu.classList.add("hidden");
  delete root.dataset.ddComboOpen;
  delete root.dataset.ddOpen;
}

export function initComboSearchAll() {
  const roots = Array.from(document.querySelectorAll("[data-dd-combo-root]"));
  for (const root of roots) {
    const id = root.getAttribute("data-dd-combo-root");
    const mode = root.getAttribute("data-dd-combo-mode") || "search";
    const input = root.querySelector(`[data-dd-combo-input="${id}"]`);
    const menu = root.querySelector(`[data-dd-combo-menu="${id}"]`);
    if (!id || !input || !menu) continue;

    const render = () => {
      menu.innerHTML = buildOptions({ q: input.value, mode });
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

    input.addEventListener("click", () => {
      render();
      openMenu(root, menu);
    });

    root.addEventListener("click", (e) => {
      const option = e.target.closest("[data-dd-combo-option]");
      if (!option) return;

      const label = option.getAttribute("data-dd-combo-label") || "";
      const value = option.getAttribute("data-dd-combo-value") ?? option.getAttribute("data-dd-combo-option") ?? "";
      input.value = label;
      root.dataset.ddValue = value;
      closeMenu(root, menu);
      input.blur();

      root.dispatchEvent(
        new CustomEvent("dd:comboSelect", {
          bubbles: true,
          detail: { id, mode, value, label },
        }),
      );
    });

    document.addEventListener("pointerdown", (e) => {
      if (!root.dataset.ddComboOpen) return;
      if (root.contains(e.target)) return;
      closeMenu(root, menu);
    });

    // 右侧按钮：若传了 href 走跳转；否则保持默认
  }
}

