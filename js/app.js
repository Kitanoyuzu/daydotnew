import { renderAppShell } from "./components/appShell.js";
import { renderBottomNav } from "./components/bottomNav.js";
import { routes, resolveRoute } from "./router.js";
import { initComboSearchAll } from "./components/comboSearch.js";
import { initCalendarPopoverAll } from "./components/calendarPopover.js";
import { initModalAll } from "./components/modal.js";

function mount() {
  const app = document.getElementById("app");
  const portal = document.getElementById("portal");
  if (!app || !portal) return;

  portal.className = "dd-portal";

  const route = resolveRoute(location.hash);
  const page = routes[route.key]?.(route.params) ?? routes["/vault"]({});

  app.innerHTML = renderAppShell({
    contentHtml: page.html,
    bottomNavHtml: renderBottomNav({ active: route.navActive }),
  });

  page.afterMount?.();
  lucide?.createIcons?.();
  initComboSearchAll();
  initCalendarPopoverAll();
  initModalAll();
}

window.addEventListener("hashchange", mount);
window.addEventListener("DOMContentLoaded", () => {
  if (!location.hash) location.hash = "#/vault";
  mount();
});

