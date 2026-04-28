import { renderAppShell } from "./components/appShell.js";
import { renderBottomNav } from "./components/bottomNav.js";
import { routes, resolveRoute } from "./router.js";
import { initComboSearchAll } from "./components/comboSearch.js";
import { initCalendarPopoverAll } from "./components/calendarPopover.js";
import { initModalAll } from "./components/modal.js";
import { initRecordListAll } from "./components/recordList.js";
import { initClickFallback } from "./components/clickFallback.js";
import { initPresetTagsAll } from "./components/presetTags.js";
import { initTagsManagerAll } from "./components/tagsManager.js";
import { ensureStore } from "./store.js";

async function registerPWA() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register("./sw.js");
    if (reg.waiting) {
      const ok = window.confirm("发现新版本，是否立即刷新？");
      if (ok) reg.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    reg.addEventListener("updatefound", () => {
      const sw = reg.installing;
      if (!sw) return;
      sw.addEventListener("statechange", () => {
        if (sw.state === "installed" && navigator.serviceWorker.controller) {
          const ok = window.confirm("新版本已就绪，是否刷新生效？");
          if (ok) reg.waiting?.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });
    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload());
  } catch {}
}

function mount() {
  ensureStore();
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
  initRecordListAll();
  initClickFallback();
  initPresetTagsAll();
  initTagsManagerAll();
}

window.addEventListener("hashchange", mount);
window.addEventListener("DOMContentLoaded", () => {
  if (!location.hash) location.hash = "#/vault";
  mount();
  registerPWA();
});

let storeRerenderScheduled = false;
document.addEventListener("dd:storeChanged", () => {
  if (storeRerenderScheduled) return;
  storeRerenderScheduled = true;
  requestAnimationFrame(() => {
    storeRerenderScheduled = false;
    mount();
  });
});

document.addEventListener("dd:modalOpened", () => {
  // 弹窗内容是动态插入的，需要补一次绑定
  initComboSearchAll();
  initCalendarPopoverAll();
  initRecordListAll();
  initPresetTagsAll();
  initTagsManagerAll();
  lucide?.createIcons?.();
});

