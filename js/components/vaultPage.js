import { getParentTag, getTagById, listRecords } from "../store.js";
import { renderRecordWall } from "./recordWall.js";

export function initVaultPageAll() {
  if (document.documentElement.dataset.ddVaultPageDelegated === "1") return;
  document.documentElement.dataset.ddVaultPageDelegated = "1";

  const latest = (selector) => {
    const nodes = Array.from(document.querySelectorAll(selector));
    return nodes.length ? nodes[nodes.length - 1] : null;
  };

  const computeFiltered = (q) => {
    const query = String(q || "").trim().toLowerCase();
    if (!query) return null;

    // 过滤逻辑与全部记录一致：tag/父级/note 任一命中即保留
    const ids = new Set();
    for (const r of listRecords()) {
      const t = r.tagId != null ? getTagById(r.tagId) : null;
      const p = getParentTag(t);
      const hay = `${t?.name || ""} ${p?.name || ""} ${r.note || ""}`.toLowerCase();
      if (hay.includes(query) && r.tagId != null) ids.add(r.tagId);
    }
    return ids;
  };

  const rerenderWall = () => {
    const input = latest('[data-dd-combo-input="vault-search"]');
    const wall = latest("[data-dd-vault-wall]");
    if (!wall || !input) return;

    const ids = computeFiltered(input.value);
    if (!ids) {
      wall.innerHTML = renderRecordWall();
      lucide?.createIcons?.();
      return;
    }

    // 复用原本的卡片墙渲染：先渲染完整，再在 DOM 层剔除不匹配卡片（避免复制 UI 逻辑）
    wall.innerHTML = renderRecordWall();
    const cards = Array.from(wall.querySelectorAll('a[href^="#/vault/tag/"]'));
    for (const a of cards) {
      const m = a.getAttribute("href")?.match(/#\/vault\/tag\/(\d+)/);
      const tagId = m ? Number(m[1]) : NaN;
      if (!Number.isFinite(tagId) || !ids.has(tagId)) a.remove();
    }
    lucide?.createIcons?.();
  };

  document.addEventListener("input", (e) => {
    if (e.target?.closest?.('[data-dd-combo-input="vault-search"]')) rerenderWall();
  });
}

