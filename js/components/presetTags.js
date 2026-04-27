import { listTags } from "../store.js";

export function initPresetTagsAll() {
  if (document.documentElement.dataset.ddPresetTagsDelegated === "1") return;
  document.documentElement.dataset.ddPresetTagsDelegated = "1";

  document.addEventListener("click", (e) => {
    const btn = e.target.closest?.("[data-dd-preset-tag]");
    if (!btn) return;

    const label = btn.getAttribute("data-dd-preset-tag") || "";
    const target = btn.getAttribute("data-dd-preset-target") || "";
    const value = btn.getAttribute("data-dd-preset-value") || "";
    if (!label || !target) return;

    const input = document.querySelector(`[data-dd-combo-input="${target}"]`);
    const root = document.querySelector(`[data-dd-combo-root="${target}"]`);
    if (input) {
      input.value = label;
      if (root) {
        const v = value || String(listTags().find((t) => t.parentId != null && t.name === label)?.id ?? "");
        if (v) root.dataset.ddValue = v;
      }
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.blur();
    }
  });
}

