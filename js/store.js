const LS_KEY = "daydot";

function nowISO() {
  return new Date().toISOString();
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function defaultSeed() {
  const createdAt = nowISO();
  return {
    tags: [
      { id: 1, name: "健康", parentId: null, color: "#B48AA8", createdAt },
      { id: 2, name: "清洁", parentId: null, color: "#7FA7B8", createdAt },
      { id: 11, name: "月经", parentId: 1, color: null, createdAt },
      { id: 12, name: "换洗睡衣", parentId: 2, color: null, createdAt },
    ],
    records: [
      { id: 1001, tagId: 12, eventDate: "2026-04-25", note: "米白长袖长裤", createdAt, updatedAt: createdAt },
      { id: 1002, tagId: 12, eventDate: "2026-04-25", note: "米白长袖长裤", createdAt, updatedAt: createdAt },
      { id: 1003, tagId: 11, eventDate: "2026-04-23", note: "", createdAt, updatedAt: createdAt },
      { id: 1004, tagId: null, eventDate: "2026-04-26", note: "", createdAt, updatedAt: createdAt },
    ],
    nextTagId: 13,
    nextRecordId: 1005,
  };
}

function normalizeState(raw) {
  const seed = defaultSeed();
  if (!raw || typeof raw !== "object") return seed;

  const tags = Array.isArray(raw.tags) ? raw.tags : seed.tags;
  const records = Array.isArray(raw.records) ? raw.records : seed.records;

  const nextTagId = Number.isFinite(raw.nextTagId) ? raw.nextTagId : seed.nextTagId;
  const nextRecordId = Number.isFinite(raw.nextRecordId) ? raw.nextRecordId : seed.nextRecordId;

  return {
    tags: tags.map((t) => ({
      id: Number(t.id),
      name: String(t.name || ""),
      parentId: t.parentId == null ? null : Number(t.parentId),
      color: t.color == null ? null : String(t.color),
      createdAt: typeof t.createdAt === "string" ? t.createdAt : nowISO(),
    })),
    records: records.map((r) => ({
      id: Number(r.id),
      tagId: r.tagId == null ? null : Number(r.tagId),
      eventDate: String(r.eventDate || ""),
      note: String(r.note || ""),
      createdAt: typeof r.createdAt === "string" ? r.createdAt : nowISO(),
      updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : (typeof r.createdAt === "string" ? r.createdAt : nowISO()),
    })),
    nextTagId,
    nextRecordId,
  };
}

function readState() {
  const raw = safeParse(localStorage.getItem(LS_KEY) || "");
  return normalizeState(raw);
}

function writeState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function cleanupHierarchy(state) {
  // 约束：只允许“父级-子级”成对存在
  // - 子级必须有有效父级（parentId 指向存在且 parentId=null 的父级）
  // - 父级必须至少有一个子级
  // - records.tagId 若指向不存在的 tag，则置空（记录保留）
  const s = normalizeState(state);

  // 去掉非法/空名称
  s.tags = s.tags.filter((t) => String(t.name || "").trim());

  const parentById = new Map(s.tags.filter((t) => t.parentId == null).map((t) => [t.id, t]));
  const childById = new Map(s.tags.filter((t) => t.parentId != null).map((t) => [t.id, t]));

  // 删除无父级/父级非法的子级
  for (const [id, t] of childById) {
    const pid = t.parentId;
    if (pid == null || !Number.isFinite(pid) || !parentById.has(pid)) childById.delete(id);
  }

  // 计算父级拥有的子级数量
  const childCount = new Map();
  for (const [, t] of childById) {
    childCount.set(t.parentId, (childCount.get(t.parentId) || 0) + 1);
  }

  // 删除没有子级的父级
  for (const [id] of parentById) {
    if (!childCount.get(id)) parentById.delete(id);
  }

  const keptTagIds = new Set([...parentById.keys(), ...childById.keys()]);

  // 记录引用清理：tag 不存在就置空
  s.records = s.records.map((r) => (r.tagId != null && !keptTagIds.has(r.tagId) ? { ...r, tagId: null } : r));

  s.tags = [...parentById.values(), ...childById.values()];

  // 修正 next ids
  const maxTagId = s.tags.reduce((m, t) => Math.max(m, Number(t.id) || 0), 0);
  const maxRecordId = s.records.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
  s.nextTagId = Math.max(Number(s.nextTagId) || 1, maxTagId + 1);
  s.nextRecordId = Math.max(Number(s.nextRecordId) || 1, maxRecordId + 1);

  return s;
}

function emitStoreChanged() {
  document.dispatchEvent(new CustomEvent("dd:storeChanged"));
}

export function ensureStore() {
  const existing = safeParse(localStorage.getItem(LS_KEY) || "");
  if (existing && typeof existing === "object") return;
  writeState(defaultSeed());
  emitStoreChanged();
}

export function getState() {
  ensureStore();
  return readState();
}

export function setState(next) {
  ensureStore();
  // 稳定性策略：导入/外部 setState 若缺 records，不允许把现有 records 覆盖成空
  // （你只关心“记录不丢”，其它字段/结构允许变化或丢失）
  const current = readState();
  const safeNext =
    next && typeof next === "object"
      ? {
          ...next,
          records: Array.isArray(next.records) ? next.records : current.records,
        }
      : current;
  writeState(cleanupHierarchy(safeNext));
  emitStoreChanged();
}

export function listTags() {
  return getState().tags.slice();
}

export function listRecords() {
  return getState().records.slice();
}

export function getTagById(tagId) {
  const id = Number(tagId);
  if (!Number.isFinite(id)) return null;
  return getState().tags.find((t) => t.id === id) ?? null;
}

export function getParentTag(tag) {
  if (!tag) return null;
  if (tag.parentId == null) return tag;
  return getTagById(tag.parentId);
}

export function upsertTag({ id, name, parentId, color }) {
  const s = getState();
  const cleanName = String(name || "").trim();
  if (!cleanName) return { ok: false, error: "标签名不能为空" };

  const pId = parentId == null || parentId === "" ? null : Number(parentId);
  if (pId != null && !Number.isFinite(pId)) return { ok: false, error: "父级标签无效" };

  // 约束：
  // - 子级必须有父级（parentId!=null 且指向有效父级）
  // - 父级允许创建/改名/改色，但父级若最终无子级会在“子级变更后”被自动清理
  const prevTag = id != null && id !== "" ? s.tags.find((t) => t.id === Number(id)) : null;
  const isParentOp = pId == null && (prevTag?.parentId == null || prevTag == null);

  if (!isParentOp) {
    if (pId == null) return { ok: false, error: "每个子级必须选择父级" };
    const parent = s.tags.find((t) => t.id === pId && t.parentId == null);
    if (!parent) return { ok: false, error: "请选择有效父级" };
  }

  // 约束：同父级下 name 唯一（父级本身的 parentId=null 视为同一组）
  const groupKey = pId == null ? null : pId;
  const dup = s.tags.find((t) => (t.parentId == null ? null : t.parentId) === groupKey && t.name === cleanName && Number(t.id) !== Number(id));
  if (dup) return { ok: false, error: "同一父级下标签名重复" };

  const ts = nowISO();
  if (id != null && id !== "" && Number.isFinite(Number(id))) {
    const tid = Number(id);
    const idx = s.tags.findIndex((t) => t.id === tid);
    if (idx >= 0) {
      const prev = s.tags[idx];
      s.tags[idx] = {
        ...prev,
        name: cleanName,
        parentId: pId,
        color: pId == null ? (color ? String(color) : prev.color) : null,
      };
      // 父级改名/改色不触发“删无子级父级”，避免 tagsManager 的“先建父级再建子级”流程被提前清掉
      writeState(isParentOp ? normalizeState(s) : cleanupHierarchy(s));
      emitStoreChanged();
      const next = readState();
      return { ok: true, tag: next.tags.find((t) => t.id === tid) ?? null };
    }
  }

  const newId = s.nextTagId;
  s.nextTagId += 1;
  const tag = {
    id: newId,
    name: cleanName,
    parentId: pId,
    color: pId == null ? (color ? String(color) : "#C4A882") : null,
    createdAt: ts,
  };
  s.tags.push(tag);
  writeState(isParentOp ? normalizeState(s) : cleanupHierarchy(s));
  emitStoreChanged();
  return { ok: true, tag };
}

export function createRecord({ tagId, eventDate, note }) {
  const s = getState();
  const tId = tagId == null || tagId === "" ? null : Number(tagId);
  if (tId != null && !Number.isFinite(tId)) return { ok: false, error: "标签无效" };

  const iso = String(eventDate || "").trim();
  if (!iso) return { ok: false, error: "请选择日期" };

  const ts = nowISO();
  const id = s.nextRecordId;
  s.nextRecordId += 1;
  s.records.push({
    id,
    tagId: tId,
    eventDate: iso,
    note: String(note || ""),
    createdAt: ts,
    updatedAt: ts,
  });
  writeState(s);
  emitStoreChanged();
  return { ok: true, recordId: id };
}

export function getRecordById(recordId) {
  const id = Number(recordId);
  if (!Number.isFinite(id)) return null;
  return getState().records.find((r) => r.id === id) ?? null;
}

export function updateRecord({ id, tagId, eventDate, note }) {
  const s = getState();
  const rid = Number(id);
  if (!Number.isFinite(rid)) return { ok: false, error: "记录无效" };

  const idx = s.records.findIndex((r) => r.id === rid);
  if (idx < 0) return { ok: false, error: "记录不存在" };

  const tId = tagId == null || tagId === "" ? null : Number(tagId);
  if (tId != null && !Number.isFinite(tId)) return { ok: false, error: "标签无效" };

  const iso = String(eventDate || "").trim();
  if (!iso) return { ok: false, error: "请选择日期" };

  const ts = nowISO();
  s.records[idx] = {
    ...s.records[idx],
    tagId: tId,
    eventDate: iso,
    note: String(note || ""),
    updatedAt: ts,
  };
  writeState(s);
  emitStoreChanged();
  return { ok: true };
}

export function deleteRecord(recordId) {
  const s = getState();
  const rid = Number(recordId);
  if (!Number.isFinite(rid)) return { ok: false, error: "记录无效" };
  const before = s.records.length;
  s.records = s.records.filter((r) => r.id !== rid);
  if (s.records.length === before) return { ok: false, error: "记录不存在" };
  writeState(s);
  emitStoreChanged();
  return { ok: true };
}

export function deleteTag({ tagId, deleteRecords = false } = {}) {
  const s = getState();
  const tid = Number(tagId);
  if (!Number.isFinite(tid)) return { ok: false, error: "标签无效" };

  const tag = s.tags.find((t) => t.id === tid);
  if (!tag) return { ok: false, error: "标签不存在" };
  if (tag.parentId == null) return { ok: false, error: "请删除子级标签" };

  if (deleteRecords) s.records = s.records.filter((r) => String(r.tagId) !== String(tid));
  else s.records = s.records.map((r) => (String(r.tagId) === String(tid) ? { ...r, tagId: null } : r));

  s.tags = s.tags.filter((t) => t.id !== tid);
  writeState(cleanupHierarchy(s));
  emitStoreChanged();
  return { ok: true };
}

export function computeTagStats() {
  const s = getState();
  const counts = new Map();
  const lastUsedAt = new Map();

  for (const r of s.records) {
    if (r.tagId == null) continue;
    counts.set(r.tagId, (counts.get(r.tagId) || 0) + 1);
    const prev = lastUsedAt.get(r.tagId);
    const cand = r.updatedAt || r.createdAt;
    if (!prev || cand > prev) lastUsedAt.set(r.tagId, cand);
  }

  // 父级聚合
  for (const t of s.tags) {
    if (t.parentId == null) continue;
    const pId = t.parentId;
    const c = counts.get(t.id) || 0;
    if (c) counts.set(pId, (counts.get(pId) || 0) + c);

    const childLast = lastUsedAt.get(t.id);
    const parentLast = lastUsedAt.get(pId);
    if (childLast && (!parentLast || childLast > parentLast)) lastUsedAt.set(pId, childLast);
  }

  return { counts, lastUsedAt };
}

export function daysSince(iso) {
  const d = new Date(String(iso || "") + "T00:00:00");
  if (Number.isNaN(d.getTime())) return 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((today.getTime() - d.getTime()) / (24 * 3600 * 1000));
  return Math.max(0, diff);
}

