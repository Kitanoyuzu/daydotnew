import { formatISO, renderCalendarMonthCard } from "./calendarCore.js";

function ensurePortal() {
  const portal = document.getElementById("portal");
  if (!portal) return null;
  portal.className = "dd-portal";
  if (!portal.querySelector("[data-dd-overlay]")) {
    portal.innerHTML = `
      <div class="dd-overlay" data-dd-overlay></div>
      <div data-dd-modal-slot></div>
    `;
  }
  return portal;
}

function openCalendar({ anchorEl, initialISO, dots, onChange }) {
  const portal = ensurePortal();
  if (!portal) return;
  const overlay = portal.querySelector("[data-dd-overlay]");
  const slot = portal.querySelector("[data-dd-modal-slot]");
  if (!overlay || !slot) return;

  const init = initialISO ? new Date(initialISO + "T00:00:00") : new Date();
  let year = init.getFullYear();
  let monthIndex = init.getMonth();
  let selectedISO = initialISO || formatISO(new Date());
  const id = `pop_${Math.random().toString(16).slice(2)}`;

  const render = () => {
    slot.innerHTML = `
      <div class="dd-float" data-dd-cal-pop style="top: 22svh;">
        ${renderCalendarMonthCard({ id, year, monthIndex, selectedISO, dots, showFooter: true })}
      </div>
    `;
    lucide?.createIcons?.();

    slot.querySelector(`[data-dd-cal-prev="${id}"]`)?.addEventListener("click", () => {
      monthIndex -= 1;
      if (monthIndex < 0) {
        monthIndex = 11;
        year -= 1;
      }
      render();
    });

    slot.querySelector(`[data-dd-cal-next="${id}"]`)?.addEventListener("click", () => {
      monthIndex += 1;
      if (monthIndex > 11) {
        monthIndex = 0;
        year += 1;
      }
      render();
    });

    slot.querySelectorAll("[data-dd-cal-day]").forEach((b) => {
      b.addEventListener("click", () => {
        selectedISO = b.getAttribute("data-dd-cal-day") || selectedISO;
        anchorEl.value = selectedISO;
        onChange?.(selectedISO);
        closeCalendar();
      });
    });

    slot.querySelector(`[data-dd-cal-clear="${id}"]`)?.addEventListener("click", () => {
      anchorEl.value = "";
      onChange?.("");
      closeCalendar();
    });

    slot.querySelector(`[data-dd-cal-today="${id}"]`)?.addEventListener("click", () => {
      const v = formatISO(new Date());
      anchorEl.value = v;
      onChange?.(v);
      closeCalendar();
    });
  };

  const closeCalendar = () => {
    overlay.classList.remove("is-open");
    slot.innerHTML = "";
  };

  slot.innerHTML = "";
  requestAnimationFrame(() => overlay.classList.add("is-open"));
  render();

  overlay.addEventListener("click", closeCalendar, { once: true });
}

export function renderCalendarField({ id, value = "", label = "", placeholder = "选择日期" }) {
  const v = value || "";
  const show = v ? v : placeholder;
  const isPlaceholder = !v;
  return `
    <div class="flex flex-col gap-2">
      ${label ? `<div class="text-[15px]" style="font-weight: 700; color: var(--text);">${label}</div>` : ""}
      <button
        type="button"
        class="dd-card dd-combo-input flex items-center gap-3 px-[14px]"
        data-dd-cal-trigger="${id}"
      >
        <i data-lucide="calendar" class="w-[18px] h-[18px]" style="color: var(--text-sub)"></i>
        <input
          readonly
          class="flex-1 bg-transparent outline-none"
          data-dd-cal-input="${id}"
          value="${v}"
          placeholder="${placeholder}"
          style="color: ${isPlaceholder ? "var(--text-sub)" : "var(--text)"};"
        />
        <span class="text-[13px]" style="color: var(--text-sub);"> </span>
      </button>
    </div>
  `;
}

export function initCalendarPopoverAll() {
  ensurePortal();
  if (document.documentElement.dataset.ddCalDelegated === "1") return;
  document.documentElement.dataset.ddCalDelegated = "1";

  const findLatestInput = (id) => {
    const nodes = Array.from(document.querySelectorAll(`[data-dd-cal-input="${id}"]`));
    return nodes.length ? nodes[nodes.length - 1] : null;
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest?.("[data-dd-cal-trigger]");
    if (!btn) return;
    e.preventDefault();

    const id = btn.getAttribute("data-dd-cal-trigger");
    if (!id) return;

    const input =
      btn.querySelector?.(`[data-dd-cal-input="${id}"]`) ||
      findLatestInput(id);
    if (!input) return;

    const display = btn.querySelector?.("[data-dd-cal-display-text]");
    const onChange = (v) => {
      // 同步 UI 文案（如日期筛选 pill）
      if (display) display.textContent = v || "日期";
    };

    openCalendar({ anchorEl: input, initialISO: input.value, dots: [], onChange });
  });
}

