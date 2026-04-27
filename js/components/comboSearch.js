import { getParentTag, listTags } from "../store.js";

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
  const allTags = listTags();
  const parentTags = allTags.filter((t) => t.parentId == null);
  const leafTags = allTags.filter((t) => t.parentId != null);

  if (mode === "tagFilter") {
    // 统一：仍然展示“子级在左、父级胶囊在右”的同一行样式
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
    const items = query ? parentTags.filter((p) => p.name.includes(query)) : parentTags;
    const exact = !!query && parentTags.some((p) => p.name === query);
    return `
      <div class="flex flex-col gap-1">
        ${!exact ? buildCreateOption(query) : ""}
        ${buildParentItems(items)}
      </div>
    `;
  }

  if (mode === "tagChild") {
    const parentRoot = document.querySelector?.('[data-dd-combo-root="tags-parent"]');
    const parentIdRaw = parentRoot?.dataset?.ddValue ?? "";
    const parentId = Number(parentIdRaw);
    const scoped = Number.isFinite(parentId) ? leafTags.filter((t) => t.parentId === parentId) : leafTags;

    const items = query ? scoped.filter((t) => t.name.includes(query) || (getParentTag(t)?.name ?? "").includes(query)) : scoped;
    const exact = !!query && scoped.some((t) => t.name === query);
    return `
      <div class="flex flex-col gap-1">
        ${!exact ? buildCreateOption(query) : ""}
        ${buildLeafTagItems(items)}
      </div>
    `;
  }

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
  if (document.documentElement.dataset.ddComboDelegated === "1") return;
  document.documentElement.dataset.ddComboDelegated = "1";

  const latest = (selector) => {
    const nodes = Array.from(document.querySelectorAll(selector));
    return nodes.length ? nodes[nodes.length - 1] : null;
  };

  const getRootFromEventInput = (inputEl) => inputEl?.closest?.("[data-dd-combo-root]") ?? null;
  const getRootLatest = (id) => latest(`[data-dd-combo-root="${id}"]`);
  const getInput = (root, id) => root?.querySelector?.(`[data-dd-combo-input="${id}"]`);
  const getMenu = (root, id) => root?.querySelector?.(`[data-dd-combo-menu="${id}"]`);

  const render = (root, input, menu) => {
    const mode = root.getAttribute("data-dd-combo-mode") || "search";
    menu.innerHTML = buildOptions({ q: input.value, mode });
    lucide?.createIcons?.();
  };

  const open = (root, menu) => openMenu(root, menu);
  const close = (root, menu) => closeMenu(root, menu);

  document.addEventListener(
    "pointerdown",
    (e) => {
      const openRoots = Array.from(document.querySelectorAll('[data-dd-combo-open="1"]'));
      if (openRoots.length === 0) return;
      for (const root of openRoots) {
        if (root.contains(e.target)) continue;
        const id = root.getAttribute("data-dd-combo-root");
        if (!id) continue;
        const menu = getMenu(root, id);
        if (!menu) continue;
        close(root, menu);
      }
    },
    { capture: true },
  );

  // focus / input / click：用捕获阶段做事件委托，避免 mount 后重复绑定
  const maybeOpen = (e) => {
    const input = e.target?.closest?.("[data-dd-combo-input]");
    if (!input) return;
    const id = input.getAttribute("data-dd-combo-input");
    if (!id) return;
    // 优先就近 root（避免落到隐藏模板的同 id root 上）
    const root = getRootFromEventInput(input) || getRootLatest(id);
    const menu = getMenu(root, id);
    if (!root || !menu) return;
    render(root, input, menu);
    open(root, menu);
  };

  document.addEventListener("focusin", maybeOpen);
  document.addEventListener("input", maybeOpen);
  document.addEventListener("click", maybeOpen);

  document.addEventListener("click", (e) => {
    const option = e.target.closest?.("[data-dd-combo-option]");
    if (!option) return;

    const root = option.closest?.("[data-dd-combo-root]");
    if (!root) return;
    const id = root.getAttribute("data-dd-combo-root");
    if (!id) return;

    const input = getInput(root, id);
    const menu = getMenu(root, id);
    if (!input || !menu) return;

    const mode = root.getAttribute("data-dd-combo-mode") || "search";
    const label = option.getAttribute("data-dd-combo-label") || "";
    const value = option.getAttribute("data-dd-combo-value") ?? option.getAttribute("data-dd-combo-option") ?? "";
    input.value = label;
    root.dataset.ddValue = value;
    close(root, menu);
    input.blur();

    root.dispatchEvent(
      new CustomEvent("dd:comboSelect", {
        bubbles: true,
        detail: { id, mode, value, label },
      }),
    );
  });
}

// 兼容旧调用（不再做逐个绑定）
export function initComboSearchAllLegacy() {
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

