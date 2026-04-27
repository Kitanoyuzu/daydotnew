export const mockTags = [
  { id: 1, name: "健康", parentId: null, color: "#B48AA8" },
  { id: 2, name: "清洁", parentId: null, color: "#7FA7B8" },
  { id: 11, name: "月经", parentId: 1, color: null },
  { id: 12, name: "换洗睡衣", parentId: 2, color: null },
];

export const mockRecords = [
  { id: 1001, tagId: 12, eventDate: "2026-04-25", note: "米白长袖长裤" },
  { id: 1002, tagId: 12, eventDate: "2026-04-25", note: "米白长袖长裤" },
  { id: 1003, tagId: 11, eventDate: "2026-04-23", note: "" },
  { id: 1004, tagId: null, eventDate: "2026-04-26", note: "" },
];

export function getTag(tagId) {
  return mockTags.find((t) => t.id === Number(tagId)) ?? null;
}

export function getParentTag(tag) {
  if (!tag) return null;
  if (tag.parentId == null) return tag;
  return mockTags.find((t) => t.id === tag.parentId) ?? null;
}

export function daysSince(iso) {
  const d = new Date(iso + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((today.getTime() - d.getTime()) / (24 * 3600 * 1000));
  return Math.max(0, diff);
}

