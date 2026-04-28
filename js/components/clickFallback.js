import { toast } from "./modal.js";

export function initClickFallback() {
  if (document.documentElement.dataset.ddClickFallback === "1") return;
  document.documentElement.dataset.ddClickFallback = "1";

  document.addEventListener("click", (e) => {
    const el = e.target.closest?.("button.dd-icon-btn, a.dd-icon-btn, button");
    if (!el) return;

    // 已有交互的跳过
    if (el.closest?.("[data-dd-record-card]")) return;
    if (el.closest?.("[data-dd-combo-root]")) return;
    if (el.closest?.("[data-dd-cal-trigger]")) return;
    if (el.closest?.("[data-dd-action]")) return;
    if (el.hasAttribute("data-dd-modal-open") || el.hasAttribute("data-dd-modal-close")) return;
    if (el.closest?.("[data-dd-tag-pick]")) return;
    if (el.closest?.("[data-dd-backup-export], [data-dd-backup-import]")) return;

    // anchor 有有效 href 的跳过（让路由/跳转生效）
    if (el.tagName === "A") {
      const href = el.getAttribute("href") || "";
      if (href && href !== "#") return;
    }

    // 这些常见按钮目前还没实现逻辑，至少给出反馈
    const label = el.getAttribute("aria-label") || el.textContent?.trim();
    if (!label) return;

    // 避免影响输入控件
    if (el.tagName === "BUTTON" && el.type === "submit") return;

    toast(`原型未接入：${label}`);
  });
}

