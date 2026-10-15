import React, { useState, useMemo } from 'react';
import { CAT_STYLES, CATEGORIES, MOOD_ICONS, MOODS } from '../data/constants';
import './SearchPage.css';

function hl(text, q) {
  if (!q) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(re);
  return parts.map((p, i) => re.test(p) ? <mark key={i}>{p}</mark> : p);
}

export default function SearchPage({ entries, initialCat }) {
  const [q, setQ]       = useState('');
  const [cat, setCat]   = useState(initialCat || null);
  const [tag, setTag]   = useState(null);
  const [mood, setMood] = useState(null);
  const [sort, setSort] = useState('newest');

  const allTags = useMemo(() => [...new Set(entries.flatMap(e => e.tags))], [entries]);

  const results = useMemo(() => {
    let r = entries.filter(e => {
      const lq = q.toLowerCase();
      if (lq && !e.title.toLowerCase().includes(lq) && !e.body.toLowerCase().includes(lq) && !e.tags.some(t => t.toLowerCase().includes(lq))) return false;
      if (cat && e.cat !== cat) return false;
      if (tag && !e.tags.includes(tag)) return false;
      if (mood && e.mood !== mood) return false;
      return true;
    });
    if (sort === 'oldest') r.sort((a, b) => a.date.localeCompare(b.date));
    else if (sort === 'title') r.sort((a, b) => a.title.localeCompare(b.title, 'ja'));
    else r.sort((a, b) => b.date.localeCompare(a.date));
    return r;
  }, [entries, q, cat, tag, mood, sort]);

  return (
    <div className="search-layout">
      <div className="search-sidebar">
        <div className="sf-section">
          <div className="sf-label">カテゴリ</div>
          <button className={`sf-item ${!cat ? 'active' : ''}`} onClick={() => setCat(null)}>
            <i className="ti ti-layout-grid" />すべて<span className="sf-badge">{entries.length}</span>
          </button>
          {CATEGORIES.map(c => (
            <button key={c} className={`sf-item ${cat === c ? 'active' : ''}`} onClick={() => setCat(cat === c ? null : c)}>
              <span className="sf-dot" style={{ background: CAT_STYLES[c].dot }} />{c}
              <span className="sf-badge">{entries.filter(e => e.cat === c).length}</span>
            </button>
          ))}
        </div>
        <div className="sf-section">
          <div className="sf-label">タグ</div>
          <div className="sf-tags">
            {allTags.map(t => (
              <span key={t} className={`sf-tag ${tag === t ? 'active' : ''}`} onClick={() => setTag(tag === t ? null : t)}>{t}</span>
            ))}
          </div>
        </div>
        <div className="sf-section">
          <div className="sf-label">気分</div>
          {MOODS.map(m => (
            <button key={m} className={`sf-item ${mood === m ? 'active' : ''}`} onClick={() => setMood(mood === m ? null : m)}>
              <i className={`ti ${MOOD_ICONS[m]}`} />{m}
            </button>
          ))}
        </div>
        <div className="sf-section">
          <div className="sf-label">並び替え</div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="sf-select">
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="title">タイトル順</option>
          </select>
        </div>
        <button className="sf-reset" onClick={() => { setQ(''); setCat(null); setTag(null); setMood(null); setSort('newest'); }}>
          <i className="ti ti-refresh" /> リセット
        </button>
      </div>

      <div className="search-main">
        <div className="search-bar">
          <i className="ti ti-search" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="タイトル・本文・タグを検索…" />
          {q && <button onClick={() => setQ('')}><i className="ti ti-x" /></button>}
        </div>
        <div className="search-info">
          <span>{results.length}件</span>
          <div className="active-pills">
            {cat  && <span className="pill" onClick={() => setCat(null)}>{cat} <i className="ti ti-x" /></span>}
            {tag  && <span className="pill" onClick={() => setTag(null)}>#{tag} <i className="ti ti-x" /></span>}
            {mood && <span className="pill" onClick={() => setMood(null)}>{mood} <i className="ti ti-x" /></span>}
          </div>
        </div>
        <div className="search-results">
          {results.length === 0 ? (
            <div className="no-results"><i className="ti ti-search" /><p>条件に一致する日記がありません</p></div>
          ) : results.map(e => {
            const c = CAT_STYLES[e.cat] || {};
            return (
              <div key={e.id} className="result-card">
                <div className="result-head">
                  <div className="result-title">{hl(e.title, q)}</div>
                  <div className="result-date">{e.date}</div>
                </div>
                <div className="result-preview">{hl(e.body, q)}</div>
                <div className="result-footer">
                  <span className="cat-badge" style={{ background: c.bg, color: c.tx }}>{e.cat}</span>
                  {e.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  <span className="result-mood"><i className={`ti ${MOOD_ICONS[e.mood] || 'ti-mood-empty'}`} />{e.mood}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
