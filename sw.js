const VERSION = "daydot-v2";
const CACHE_NAME = `${VERSION}-cache`;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./js/app.js",
  "./js/router.js",
  "./js/store.js",
  "./js/components/appShell.js",
  "./js/components/bottomNav.js",
  "./js/components/comboSearch.js",
  "./js/components/calendarCore.js",
  "./js/components/calendarPage.js",
  "./js/components/calendarPopover.js",
  "./js/components/modal.js",
  "./js/components/newForm.js",
  "./js/components/presetTags.js",
  "./js/components/recordList.js",
  "./js/components/recordWall.js",
  "./js/components/tagTree.js",
  "./js/components/templates.js",
  "./js/components/vaultAll.js",
  "./js/components/vaultPage.js",
  "./js/components/vaultTag.js",
  "./js/components/tagsManager.js",
  "./js/components/backupPanel.js",
  "./js/pages/new.js",
  "./js/pages/vault.js",
  "./js/pages/vaultAll.js",
  "./js/pages/vaultTag.js",
  "./js/pages/calendar.js",
  "./js/pages/tags.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 只缓存同源 GET
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;

      try {
        const fresh = await fetch(req);
        if (fresh && fresh.status === 200) cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        // 离线兜底：回退 index.html（单页应用）
        const fallback = await cache.match("./index.html");
        return fallback || new Response("offline", { status: 503, headers: { "Content-Type": "text/plain" } });
      }
    })(),
  );
});

