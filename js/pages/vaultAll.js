import { initVaultAllAll, renderVaultAll } from "../components/vaultAll.js";

export function pageVaultAll() {
  return { html: renderVaultAll(), afterMount() { initVaultAllAll(); } };
}

