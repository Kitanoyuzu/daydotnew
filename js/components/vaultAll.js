import { renderRecordList } from "./recordList.js";
import { formatISO } from "./calendarCore.js";
import { getParentTag, getTagById, listRecords } from "../store.js";

export function renderVaultAll() {
  const records = listRecords()
    .slice()
    .sort((a, b) => {
      if (b.eventDate !== a.eventDate) return b.eventDate > a.eventDate ? 1 : -1;
      const ua = a.updatedAt || a.createdAt || "";
      const ub = b.updatedAt || b.createdAt || "";
      if (ub !== ua) return ub > ua ? 1 : -1;
      return b.id - a.id;
    });

  return `
    <section class="flex flex-col gap-[14px]">
      <div class="flex items-center justify-between">
        <a href="#/vault" class="dd-icon-btn" aria-label="返回"><i data-lucide="chevron-left" class="w-[18px] h-[18px]"></i></a>
        <button class="dd-icon-btn" type="button" aria-label="筛选"><i data-lucide="sliders-horizontal" class="w-[18px] h-[18px]"></i></button>
      </div>

      <div class="dd-card flex items-center gap-3 px-[14px]" style="height: var(--control-h); border-radius: var(--r-pill); box-shadow: var(--shadow-card);">
        <i data-lucide="search" class="w-[18px] h-[18px]" style="color: var(--text-sub)"></i>
        <input class="flex-1 bg-transparent outline-none" placeholder="搜索记录…" data-dd-vaultall-q />
        <button
          type="button"
          class="dd-pill"
          style="height: 30px; background: color-mix(in srgb, var(--bg) 70%, var(--card)); border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); color: var(--text);"
          aria-label="日期筛选"
          data-dd-cal-trigger="vaultall-datefilter"
        >
          <i data-lucide="calendar" class="w-[14px] h-[14px]" style="margin-right: 6px;"></i>
          <span data-dd-cal-display-text>日期</span>
          <input type="hidden" data-dd-cal-input="vaultall-datefilter" value="" />
        </button>
        <button type="button" class="dd-pill" data-dd-vaultall-today style="height: 30px; background: color-mix(in srgb, var(--bg) 70%, var(--card)); border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); color: var(--text);">
          <i data-lucide="funnel" class="w-[14px] h-[14px]" style="margin-right: 6px;"></i>今天
        </button>
      </div>

      ${renderRecordList({
        id: "vault-all-records",
        records,
      })}
    </section>
  `;
}

export function initVaultAllAll() {
  if (document.documentElement.dataset.ddVaultAllDelegated === "1") return;
  document.documentElement.dataset.ddVaultAllDelegated = "1";

  const latest = (selector) => {
    const nodes = Array.from(document.querySelectorAll(selector));
    return nodes.length ? nodes[nodes.length - 1] : null;
  };

  const computeFiltered = () => {
    const q = String(latest("[data-dd-vaultall-q]")?.value || "").trim();
    const date = String(latest('[data-dd-cal-input="vaultall-datefilter"]')?.value || "").trim();
    const q2 = q.toLowerCase();
    return listRecords()
      .filter((r) => {
        if (date && r.eventDate !== date) return false;
        if (!q2) return true;
        const t = r.tagId != null ? getTagById(r.tagId) : null;
        const p = getParentTag(t);
        const hay = `${t?.name || ""} ${p?.name || ""} ${r.note || ""}`.toLowerCase();
        return hay.includes(q2);
      })
      .slice()
      .sort((a, b) => {
        if (b.eventDate !== a.eventDate) return b.eventDate > a.eventDate ? 1 : -1;
        const ua = a.updatedAt || a.createdAt || "";
        const ub = b.updatedAt || b.createdAt || "";
        if (ub !== ua) return ub > ua ? 1 : -1;
        return b.id - a.id;
      });
  };

  const rerender = () => {
    const wrap = latest('[data-dd-record-list="vault-all-records"]')?.parentElement;
    if (!wrap) return;
    const listRoot = latest('[data-dd-record-list="vault-all-records"]');
    if (!listRoot) return;
    listRoot.outerHTML = renderRecordList({ id: "vault-all-records", records: computeFiltered() });
    lucide?.createIcons?.();
  };

  document.addEventListener("input", (e) => {
    if (e.target?.closest?.("[data-dd-vaultall-q]")) rerender();
  });

  document.addEventListener("click", (e) => {
    const todayBtn = e.target.closest?.("[data-dd-vaultall-today]");
    if (!todayBtn) return;
    const input = latest('[data-dd-cal-input="vaultall-datefilter"]');
    if (input) input.value = formatISO(new Date());
    const label = latest('[data-dd-cal-trigger="vaultall-datefilter"]')?.querySelector?.("[data-dd-cal-display-text]");
    if (label && input) label.textContent = input.value;
    rerender();
  });

  document.addEventListener("click", (e) => {
    // Calendar popover will set input.value; we rerender after it closes by listening to next tick
    const calTrigger = e.target.closest?.('[data-dd-cal-trigger="vaultall-datefilter"]');
    if (!calTrigger) return;
    setTimeout(rerender, 0);
  });
}

