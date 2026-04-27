import { formatISO, renderCalendarMonthCard } from "./calendarCore.js";
import { mockTags, mockRecords, getParentTag } from "../mockData.js";

export function renderCalendarPage() {
  const todayISO = formatISO(new Date(2026, 3, 27));
  const init = new Date(todayISO + "T00:00:00");
  const year = init.getFullYear();
  const monthIndex = init.getMonth();
  const dots = Array.from(new Set(mockRecords.map((r) => r.eventDate)));
  const id = "calendar-page";

  return `
    <section class="flex flex-col gap-[14px]">
      <div class="flex items-center justify-between">
        ${renderTagFilterPill({ id: "cal-tag", label: "全部" })}
        <span class="dd-pill" style="height: 28px; padding: 0 12px; background: var(--accent); color: var(--card);">all</span>
      </div>

      <div data-dd-cal-inline-root="${id}" data-dd-cal-selected="${todayISO}" data-dd-cal-year="${year}" data-dd-cal-month="${monthIndex}">
        ${renderCalendarMonthCard({ id, year, monthIndex, selectedISO: todayISO, dots, showFooter: false })}

        <div class="flex items-center justify-between pt-4">
          <div class="text-[13px]" style="color: var(--text-sub);" data-dd-cal-date-label>${todayISO}</div>
          <button class="dd-icon-btn" type="button" aria-label="新增"><i data-lucide="plus" class="w-[18px] h-[18px]"></i></button>
        </div>

        <div class="pt-8 pb-2 text-center text-[14px]" style="color: var(--text-sub);" data-dd-cal-empty>这一天没有记录</div>
        <div class="pt-4 flex flex-col gap-3" data-dd-cal-timeline></div>
      </div>
    </section>
  `;
}

function renderTagFilterPill({ id, label }) {
  return `
    <div class="relative" data-dd-tagfilter-root="${id}">
      <button
        type="button"
        class="dd-pill"
        data-dd-tagfilter-btn="${id}"
        style="height: 34px; padding: 0 14px; background: color-mix(in srgb, var(--bg) 70%, var(--card)); border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); color: var(--text);"
      >
        ${label}
      </button>
      <div
        class="dd-float hidden"
        data-dd-tagfilter-menu="${id}"
        style="top: calc(34px + var(--combo-menu-gap)); padding: 10px; max-height: 220px; overflow:auto;"
      >
        ${buildTagFilterMenu()}
      </div>
    </div>
  `;
}

function buildTagFilterMenu() {
  const parents = mockTags.filter((t) => t.parentId == null);
  const parentItems = parents
    .map((p) => {
      const c = p.color || "#C4A882";
      const ring = `border: 2px solid ${c};`;
      return `
        <button type="button" class="w-full flex items-center justify-between px-3 py-2 rounded-[999px]" style="border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); background: color-mix(in srgb, var(--bg) 70%, var(--card));" data-dd-tagfilter-opt="${p.id}">
          <span class="text-[14px]" style="color: var(--text);">${p.name}</span>
          <span style="width: 16px; height: 16px; border-radius: 999px; display:block; ${ring}"></span>
        </button>
      `;
    })
    .join("");

  return `
    <div class="flex flex-col gap-2">
      <button type="button" class="w-full flex items-center justify-between px-3 py-2 rounded-[999px]" style="border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); background: color-mix(in srgb, var(--bg) 70%, var(--card));" data-dd-tagfilter-opt="all">
        <span class="text-[14px]" style="color: var(--text);">全部</span>
        <span style="width: 16px; height: 16px; border-radius: 999px; display:block; border: 2px solid var(--accent);"></span>
      </button>
      ${parentItems}
    </div>
  `;
}

export function initCalendarPageAll() {
  // Tag filter pill menu
  document.querySelectorAll("[data-dd-tagfilter-root]").forEach((root) => {
    if (root.dataset.ddBound === "1") return;
    root.dataset.ddBound = "1";
    const id = root.querySelector("[data-dd-tagfilter-btn]")?.getAttribute("data-dd-tagfilter-btn");
    const btn = id ? root.querySelector(`[data-dd-tagfilter-btn="${id}"]`) : null;
    const menu = id ? root.querySelector(`[data-dd-tagfilter-menu="${id}"]`) : null;
    if (!id || !btn || !menu) return;

    const open = () => {
      menu.classList.remove("hidden");
      root.dataset.ddOpen = "1";
      lucide?.createIcons?.();
    };
    const close = () => {
      menu.classList.add("hidden");
      delete root.dataset.ddOpen;
    };

    btn.addEventListener("click", () => {
      if (root.dataset.ddOpen) close();
      else open();
    });

    menu.addEventListener("click", (e) => {
      const opt = e.target.closest("[data-dd-tagfilter-opt]");
      if (!opt) return;
      const val = opt.getAttribute("data-dd-tagfilter-opt");
      if (val === "all") btn.textContent = "全部";
      else {
        const p = mockTags.find((t) => String(t.id) === String(val));
        btn.textContent = p?.name ?? "全部";
      }
      close();
    });

    document.addEventListener("pointerdown", (e) => {
      if (!root.dataset.ddOpen) return;
      if (root.contains(e.target)) return;
      close();
    });
  });

  // Inline calendar interactions + timeline
  document.querySelectorAll("[data-dd-cal-inline-root]").forEach((wrap) => {
    if (wrap.dataset.ddBound === "1") return;
    wrap.dataset.ddBound = "1";
    const id = wrap.querySelector("[data-dd-cal-card]")?.getAttribute("data-dd-cal-card");
    if (!id) return;

    const rerenderTimeline = () => {
      const selected = wrap.getAttribute("data-dd-cal-selected") || "";
      const list = wrap.querySelector("[data-dd-cal-timeline]");
      const empty = wrap.querySelector("[data-dd-cal-empty]");
      const label = wrap.querySelector("[data-dd-cal-date-label]");
      if (label) label.textContent = selected || "";
      if (!list || !empty) return;

      const items = mockRecords.filter((r) => r.eventDate === selected);
      if (items.length === 0) {
        empty.classList.remove("hidden");
        list.innerHTML = "";
        return;
      }
      empty.classList.add("hidden");
      list.innerHTML = items
        .map((r) => {
          const tag = mockTags.find((t) => t.id === r.tagId);
          const p = getParentTag(tag);
          const tint = p?.color || "#C4A882";
          const pText = `color-mix(in srgb, ${tint} 68%, var(--text))`;
          return `
            <div class="dd-card flex items-center justify-between px-4 py-3" style="border-radius: var(--r-card); box-shadow: var(--shadow-card); background: color-mix(in srgb, var(--bg) 70%, var(--card));">
              <div class="flex items-center gap-2">
                ${tag ? `<span class="dd-pill" style="background: color-mix(in srgb, ${tint} 16%, var(--card)); color:${pText};">${tag.name}</span>` : `<span class="dd-pill" style="background: var(--secondary); color: var(--text-sub);">未分类</span>`}
              </div>
              <div class="text-[12px]" style="color: var(--text-sub);">${r.eventDate}</div>
            </div>
          `;
        })
        .join("");
    };

    const getYM = () => ({
      year: Number(wrap.getAttribute("data-dd-cal-year")),
      monthIndex: Number(wrap.getAttribute("data-dd-cal-month")),
      selectedISO: wrap.getAttribute("data-dd-cal-selected") || formatISO(new Date()),
    });

    const setYM = ({ year, monthIndex }) => {
      wrap.setAttribute("data-dd-cal-year", String(year));
      wrap.setAttribute("data-dd-cal-month", String(monthIndex));
    };

    const rerenderCalendar = () => {
      const { year, monthIndex, selectedISO } = getYM();
      const dots = Array.from(new Set(mockRecords.map((r) => r.eventDate)));
      const card = wrap.querySelector(`[data-dd-cal-card="${id}"]`);
      if (!card) return;
      card.outerHTML = renderCalendarMonthCard({ id, year, monthIndex, selectedISO, dots, showFooter: false });
      lucide?.createIcons?.();
      bindCalendarButtons();
    };

    const bindCalendarButtons = () => {
      wrap.querySelector(`[data-dd-cal-prev="${id}"]`)?.addEventListener("click", () => {
        let { year, monthIndex } = getYM();
        monthIndex -= 1;
        if (monthIndex < 0) {
          monthIndex = 11;
          year -= 1;
        }
        setYM({ year, monthIndex });
        rerenderCalendar();
      });
      wrap.querySelector(`[data-dd-cal-next="${id}"]`)?.addEventListener("click", () => {
        let { year, monthIndex } = getYM();
        monthIndex += 1;
        if (monthIndex > 11) {
          monthIndex = 0;
          year += 1;
        }
        setYM({ year, monthIndex });
        rerenderCalendar();
      });
      wrap.querySelectorAll("[data-dd-cal-day]").forEach((b) => {
        b.addEventListener("click", () => {
          const iso = b.getAttribute("data-dd-cal-day");
          if (!iso) return;
          wrap.setAttribute("data-dd-cal-selected", iso);
          rerenderCalendar();
          rerenderTimeline();
        });
      });
    };

    bindCalendarButtons();
    rerenderTimeline();
  });
}

