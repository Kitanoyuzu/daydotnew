import { initTagsManagerAll, renderTagsManager } from "../components/tagsManager.js";

export function pageTags() {
  return { html: renderTagsManager(), afterMount() { initTagsManagerAll(); } };
}

