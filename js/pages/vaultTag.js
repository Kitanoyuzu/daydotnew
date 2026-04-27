import { renderVaultTag } from "../components/vaultTag.js";

export function pageVaultTag(params) {
  return { html: renderVaultTag(params), afterMount() {} };
}

