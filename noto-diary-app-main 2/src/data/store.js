const DIARY_KEY = 'noto_entries';
const KB_KEY = 'noto_kb';

const SEED_ENTRIES = [
  
];

const SEED_KB = [
  
];

function load(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : seed;
  } catch {
    return seed;
  }
}

function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { }
}

function createId(items) {
  const maxId = items.reduce((max, item) => {
    const id = Number(item.id);
    return Number.isFinite(id) ? Math.max(max, id) : max;
  }, 0);
  return Math.max(Date.now(), maxId + 1);
}

let _entries = load(DIARY_KEY, SEED_ENTRIES);
let _kb = load(KB_KEY, SEED_KB);

// 旧データ linked: "日記タイトル" → linkedEntryId: 日記ID へ自動移行
const migratedKB = _kb.map(item => {
  if (item.linkedEntryId != null || !item.linked) return item;
  const linkedEntry = _entries.find(entry => entry.title === item.linked);
  const { linked, ...rest } = item;
  return { ...rest, linkedEntryId: linkedEntry ? linkedEntry.id : null };
});

if (JSON.stringify(migratedKB) !== JSON.stringify(_kb)) {
  _kb = migratedKB;
  save(KB_KEY, _kb);
}

let _listeners = [];
function notify() { _listeners.forEach(fn => fn()); }

export const store = {
  subscribe(fn) {
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(listener => listener !== fn); };
  },

  getEntries() { return _entries; },
  getKB() { return _kb; },
  getEntryById(id) { return _entries.find(entry => entry.id === id) || null; },
  getKBByEntryId(entryId) { return _kb.filter(item => item.linkedEntryId === entryId); },

  addEntry(entry) {
    const newEntry = { ...entry, id: createId(_entries) };
    _entries = [newEntry, ..._entries];
    save(DIARY_KEY, _entries);
    notify();
    return newEntry;
  },

  updateEntry(id, updates) {
    const current = _entries.find(entry => entry.id === id);
    if (!current) return null;

    const updated = {
      ...current,
      ...updates,
      id: current.id,
      date: current.date,
    };

    _entries = _entries.map(entry => entry.id === id ? updated : entry);
    save(DIARY_KEY, _entries);
    notify();
    return updated;
  },

  deleteEntry(id) {
    _entries = _entries.filter(entry => entry.id !== id);
    // 日記を削除しても知識は残し、リンクだけ解除する
    _kb = _kb.map(item => item.linkedEntryId === id ? { ...item, linkedEntryId: null } : item);
    save(DIARY_KEY, _entries);
    save(KB_KEY, _kb);
    notify();
  },

  addKB(item) {
    const newItem = { ...item, id: createId(_kb) };
    _kb = [newItem, ..._kb];
    save(KB_KEY, _kb);
    notify();
    return newItem;
  },


  updateKB(id, updates) {
    const current = _kb.find(item => item.id === id);
    if (!current) return null;

    const updated = {
      ...current,
      ...updates,
      id: current.id,
    };

    _kb = _kb.map(item =>
      item.id === id ? updated : item
    );

    save(KB_KEY, _kb);
    notify();
    return updated;
  },


  deleteKB(id) {
    _kb = _kb.filter(item => item.id !== id);
    save(KB_KEY, _kb);
    notify();
  },
};
