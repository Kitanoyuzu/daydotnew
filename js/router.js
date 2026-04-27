import { pageVault } from "./pages/vault.js";
import { pageNew } from "./pages/new.js";
import { pageCalendar } from "./pages/calendar.js";
import { pageTags } from "./pages/tags.js";
import { pageVaultAll } from "./pages/vaultAll.js";
import { pageVaultTag } from "./pages/vaultTag.js";

export const routes = {
  "/vault": () => pageVault(),
  "/new": () => pageNew(),
  "/calendar": () => pageCalendar(),
  "/tags": () => pageTags(),
  "/vault/all": () => pageVaultAll(),
  "/vault/tag/:id": (params) => pageVaultTag(params),
};

export function resolveRoute(hash) {
  const path = (hash || "").replace(/^#/, "") || "/vault";

  if (path === "/new") return { key: "/new", params: {}, navActive: "new" };
  if (path === "/calendar") return { key: "/calendar", params: {}, navActive: "calendar" };
  if (path === "/tags") return { key: "/tags", params: {}, navActive: "tags" };
  if (path === "/vault/all") return { key: "/vault/all", params: {}, navActive: "vault" };

  const tagMatch = path.match(/^\/vault\/tag\/(\d+)$/);
  if (tagMatch) return { key: "/vault/tag/:id", params: { id: tagMatch[1] }, navActive: "vault" };

  return { key: "/vault", params: {}, navActive: "vault" };
}

