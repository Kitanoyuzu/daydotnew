import { daysSince, getParentTag, getTagById, listRecords } from "../store.js";

function card({ title, days, tag, parent, date, parentColor }) {
  const pBg = `color-mix(in srgb, ${parentColor} 22%, var(--card))`;
  const pText = `color-mix(in srgb, ${parentColor} 68%, var(--text))`;
  return `
    <a href="#/vault/tag/${tag}" class="dd-card block" style="padding: 16px 16px 14px;">
      <div class="flex items-baseline justify-between gap-3">
        <div
          class="text-[20px] truncate"
          style="font-weight: 800; letter-spacing: -0.02em; line-height: 1.05; max-width: 10.5ch;"
          title="${title}"
        >${title}</div>
        <div class="flex items-baseline gap-1" style="color: color-mix(in srgb, var(--accent) 88%, var(--text));">
          <div class="text-[34px]" style="font-weight: 300; letter-spacing: -0.03em;">${days}</div>
          <div class="text-[14px]" style="color: var(--text-sub); line-height: 1;">天</div>
        </div>
      </div>
      <div class="flex items-center justify-between pt-3">
        <div class="flex items-center gap-10">
          <span class="dd-pill" style="background: color-mix(in srgb, ${parentColor} 16%, var(--card)); color: ${pText};">${parent}</span>
        </div>
        <div class="text-[12px]" style="color: var(--text-sub);">${date}</div>
      </div>
    </a>
  `;
}

export function renderRecordWall() {
  const formatMd = (iso) => {
    const [y, m, d] = String(iso || "").split("-");
    if (!m || !d) return iso || "";
    return `${Number(m)}月${Number(d)}日`;
  };

  const records = listRecords()
    .filter((r) => r.tagId != null && r.eventDate)
    .slice()
    .sort((a, b) => {
      if (b.eventDate !== a.eventDate) return b.eventDate > a.eventDate ? 1 : -1;
      const ua = a.updatedAt || a.createdAt || "";
      const ub = b.updatedAt || b.createdAt || "";
      if (ub !== ua) return ub > ua ? 1 : -1;
      return b.id - a.id;
    });

  const lastByTag = new Map();
  for (const r of records) {
    if (r.tagId == null) continue;
    if (!lastByTag.has(r.tagId)) lastByTag.set(r.tagId, r);
  }

  const cards = Array.from(lastByTag.entries())
    .map(([tagId, r]) => {
      const tag = getTagById(tagId);
      if (!tag) return null;
      const parent = getParentTag(tag);
      const parentColor = parent?.color || "#C4A882";
      return card({
        title: tag.name,
        days: daysSince(r.eventDate),
        tag: tag.id,
        parent: parent?.name || "",
        date: formatMd(r.eventDate),
        parentColor,
      });
    })
    .filter(Boolean)
    .join("");

  return `
    <div class="grid grid-cols-2 gap-[14px]">
      ${cards}
    </div>
  `;
}

