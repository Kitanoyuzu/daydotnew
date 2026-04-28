import { renderAppShell } from "./components/appShell.js";
import { renderBottomNav } from "./components/bottomNav.js";
import { routes, resolveRoute } from "./router.js";
import { initComboSearchAll } from "./components/comboSearch.js";
import { initCalendarPopoverAll } from "./components/calendarPopover.js";
import { initModalAll } from "./components/modal.js";
import { initRecordListAll } from "./components/recordList.js";
import { initPresetTagsAll } from "./components/presetTags.js";
import { initTagsManagerAll } from "./components/tagsManager.js";
import { initBackupPanelAll } from "./components/backupPanel.js";
import { ensureStore } from "./store.js";

async function registerPWA() {
  if (!("serviceWorker" in navigator)) return;
  // 开发态（localhost/局域网）禁用 SW，避免缓存导致“改了看不到”
  const host = String(location.hostname || "");
  const isPrivateIp =
    /^localhost$/i.test(host) ||
    /^127(?:\.\d{1,3}){3}$/.test(host) ||
    /^10(?:\.\d{1,3}){3}$/.test(host) ||
    /^192\.168(?:\.\d{1,3}){2}$/.test(host) ||
    /^172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}$/.test(host);
  if (isPrivateIp) return;
  try {
    // 关键：避免浏览器用 HTTP cache 缓存 sw.js，导致更新检测不触发
    const reg = await navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" });
    // 主动检查更新（尤其是 GitHub Pages 这种静态托管）
    reg.update?.();
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

    // 兜底：在后台周期性检查一次更新（不打扰用户）
    setInterval(() => reg.update?.(), 60 * 1000);
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
  initPresetTagsAll();
  initTagsManagerAll();
  initBackupPanelAll();
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

