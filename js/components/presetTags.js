export function initPresetTagsAll() {
  if (document.documentElement.dataset.ddPresetTagsDelegated === "1") return;
  document.documentElement.dataset.ddPresetTagsDelegated = "1";

  document.addEventListener("click", (e) => {
    const btn = e.target.closest?.("[data-dd-preset-tag]");
    if (!btn) return;

    const label = btn.getAttribute("data-dd-preset-tag") || "";
    const target = btn.getAttribute("data-dd-preset-target") || "";
    if (!label || !target) return;

    const input = document.querySelector(`[data-dd-combo-input="${target}"]`);
    if (input) {
      input.value = label;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.blur();
    }
  });
}

