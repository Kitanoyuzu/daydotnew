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

export function openModal(html, { ariaLabel = "弹窗" } = {}) {
  const portal = ensurePortal();
  if (!portal) return;

  const overlay = portal.querySelector("[data-dd-overlay]");
  const slot = portal.querySelector("[data-dd-modal-slot]");
  if (!overlay || !slot) return;

  slot.innerHTML = `
    <div class="dd-float" role="dialog" aria-label="${ariaLabel}" style="top: 18svh; padding: 18px;">
      ${html}
    </div>
  `;

  requestAnimationFrame(() => {
    overlay.classList.add("is-open");
  });

  const close = () => closeModal();
  overlay.addEventListener("click", close, { once: true });
}

export function closeModal() {
  const portal = ensurePortal();
  if (!portal) return;
  const overlay = portal.querySelector("[data-dd-overlay]");
  const slot = portal.querySelector("[data-dd-modal-slot]");
  if (!overlay || !slot) return;

  overlay.classList.remove("is-open");
  slot.innerHTML = "";
}

export function initModalAll() {
  ensurePortal();

  document.querySelectorAll("[data-dd-modal-open]").forEach((btn) => {
    if (btn.dataset.ddModalBound === "1") return;
    btn.dataset.ddModalBound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const target = btn.getAttribute("data-dd-modal-open");
      const template = target ? document.querySelector(`[data-dd-template="${target}"]`) : null;
      if (!template) return;
      openModal(template.innerHTML, { ariaLabel: btn.getAttribute("aria-label") || "弹窗" });
      lucide?.createIcons?.();
    });
  });

  document.querySelectorAll("[data-dd-modal-close]").forEach((btn) => {
    if (btn.dataset.ddModalBound === "1") return;
    btn.dataset.ddModalBound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  });
}

