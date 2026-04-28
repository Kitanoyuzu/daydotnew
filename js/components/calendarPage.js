import { formatISO, renderCalendarMonthCard } from "./calendarCore.js";
import { daysSince, getParentTag, getTagById, listRecords } from "../store.js";
import { renderComboSearch } from "./comboSearch.js";
import { renderRecordList } from "./recordList.js";

export function renderCalendarPage() {
  const todayISO = formatISO(new Date());
  const init = new Date(todayISO + "T00:00:00");
  const year = init.getFullYear();
  const monthIndex = init.getMonth();
  const dots = Array.from(new Set(listRecords().map((r) => r.eventDate).filter(Boolean)));
  const id = "calendar-page";

  return `
    <section class="flex flex-col gap-[14px]">
      ${renderComboSearch({
        id: "calendar-tag-filter",
        placeholder: "全部",
        mode: "tagFilter",
        variant: "bar",
      })}

      <div data-dd-cal-metric class="hidden"></div>

      <div data-dd-cal-inline-root="${id}" data-dd-cal-selected="${todayISO}" data-dd-cal-year="${year}" data-dd-cal-month="${monthIndex}" data-dd-cal-tag="">
        ${renderCalendarMonthCard({ id, year, monthIndex, selectedISO: todayISO, dots, dotColor: "", showFooter: false })}

        <div class="flex items-center justify-between pt-4">
          <div class="text-[13px]" style="color: var(--text-sub);" data-dd-cal-date-label>${todayISO}</div>
          <button class="dd-icon-btn" type="button" aria-label="新增记录" data-dd-modal-open="new-record" data-dd-cal-add-btn><i data-lucide="plus" class="w-[18px] h-[18px]"></i></button>
        </div>

        <div class="pt-8 pb-2 text-center text-[14px]" style="color: var(--text-sub);" data-dd-cal-empty>这一天没有记录</div>
        <div class="pt-4" data-dd-cal-timeline></div>
      </div>
    </section>
  `;
}

export function initCalendarPageAll() {
  const metric = document.querySelector("[data-dd-cal-metric]");
  const filterRoot = document.querySelector('[data-dd-combo-root="calendar-tag-filter"]');

  const renderMetric = (tagId) => {
    if (!metric) return;
    if (!tagId) {
      metric.classList.add("hidden");
      metric.innerHTML = "";
      return;
    }

    const tag = getTagById(tagId);
    const parent = getParentTag(tag);
    const title = tag?.name ?? "";

    const records = listRecords()
      .filter((r) => String(r.tagId) === String(tagId) && r.eventDate)
      .sort((a, b) => (a.eventDate < b.eventDate ? 1 : -1));
    const last = records[0]?.eventDate ?? formatISO(new Date());
    const ds = daysSince(last);

    const tint = parent?.color || "#C4A882";
    const pillBg = `color-mix(in srgb, ${tint} 18%, var(--card))`;
    const pillText = `color-mix(in srgb, ${tint} 68%, var(--text))`;

    metric.classList.remove("hidden");
    metric.innerHTML = `
      <div class="dd-card" style="padding: 18px; background: color-mix(in srgb, var(--bg) 70%, var(--card));">
        <div class="flex items-center justify-between pb-2">
          <div class="text-[14px]" style="color: var(--text); font-weight: 800;">${title}</div>
          <span class="dd-pill" style="background: ${pillBg}; color: ${pillText};">${parent?.name ?? ""}</span>
        </div>
        <div class="text-center" style="color: color-mix(in srgb, var(--accent) 88%, var(--text));">
          <span class="text-[44px]" style="font-weight: 300; letter-spacing: -0.04em;">${ds}</span>
          <span class="text-[16px]" style="color: var(--text-sub); margin-left: 6px;">天</span>
        </div>
        <div class="pt-1 text-center text-[13px]" style="color: var(--text-sub);">距上次 · ${title}</div>
      </div>
    `;
    lucide?.createIcons?.();
  };

  // Inline calendar interactions + timeline
  document.querySelectorAll("[data-dd-cal-inline-root]").forEach((wrap) => {
    if (wrap.dataset.ddBound === "1") return;
    wrap.dataset.ddBound = "1";
    const id = wrap.querySelector("[data-dd-cal-card]")?.getAttribute("data-dd-cal-card");
    if (!id) return;

    const rerenderTimeline = () => {
      const selected = wrap.getAttribute("data-dd-cal-selected") || "";
      const tagId = wrap.getAttribute("data-dd-cal-tag") || "";
      const list = wrap.querySelector("[data-dd-cal-timeline]");
      const empty = wrap.querySelector("[data-dd-cal-empty]");
      const label = wrap.querySelector("[data-dd-cal-date-label]");
      const addBtn = wrap.querySelector("[data-dd-cal-add-btn]");
      if (label) label.textContent = selected || "";
      if (!list || !empty) return;

      // 新增记录入口：预填选中日期 / 当前筛选 tag
      if (addBtn) {
        addBtn.dataset.ddNewDateIso = selected || "";
        if (tagId) addBtn.dataset.ddNewTagId = tagId;
        else delete addBtn.dataset.ddNewTagId;
      }

      const items = listRecords()
        .filter((r) => r.eventDate === selected && (!tagId || String(r.tagId) === String(tagId)))
        .sort((a, b) => {
          const ua = a.updatedAt || a.createdAt || "";
          const ub = b.updatedAt || b.createdAt || "";
          if (ub !== ua) return ub > ua ? 1 : -1;
          return b.id - a.id;
        });
      if (items.length === 0) {
        empty.classList.remove("hidden");
        list.innerHTML = "";
        return;
      }
      empty.classList.add("hidden");
      list.innerHTML = renderRecordList({ id: "calendar-day-records", records: items });
      lucide?.createIcons?.();
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
      const dots = Array.from(new Set(listRecords().map((r) => r.eventDate).filter(Boolean)));
      const tagId = wrap.getAttribute("data-dd-cal-tag") || "";
      const tag = tagId ? getTagById(tagId) : null;
      const parent = getParentTag(tag);
      const dotColor = tagId ? (parent?.color || "#C4A882") : "";
      const card = wrap.querySelector(`[data-dd-cal-card="${id}"]`);
      if (!card) return;
      card.outerHTML = renderCalendarMonthCard({ id, year, monthIndex, selectedISO, dots, dotColor, showFooter: false });
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

    filterRoot?.addEventListener("dd:comboSelect", (e) => {
      const { value } = e.detail || {};
      wrap.setAttribute("data-dd-cal-tag", value || "");
      renderMetric(value || "");
      // 选 Tag 后立刻重画月历，保证圆点颜色即时更新
      rerenderCalendar();
      rerenderTimeline();
    });
  });
}

