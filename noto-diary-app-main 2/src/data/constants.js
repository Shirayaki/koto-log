export const CAT_STYLES = {
  仕事: { dot: '#378ADD', bg: '#E6F1FB', tx: '#0C447C' },
  学習: { dot: '#BA7517', bg: '#FAEEDA', tx: '#633806' },
  日常: { dot: '#1D9E75', bg: '#E1F5EE', tx: '#085041' },
  健康: { dot: '#D4537E', bg: '#FBEAF0', tx: '#72243E' },
};

export const CATEGORIES = ['仕事', '学習', '日常', '健康'];

export const MOOD_ICONS = {
  最高: 'ti-mood-happy',
  良い:  'ti-mood-smile',
  普通: 'ti-mood-empty',
  悪い: 'ti-mood-sad',
};

export const MOODS = ['最高', '良い', '普通', '悪い'];

export function pad(n) { return String(n).padStart(2, '0'); }
export function dateKey(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
export function today() {
  const t = new Date();
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
}
