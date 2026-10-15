import React, { useEffect, useState } from 'react';
import { store } from '../data/store';
import { CAT_STYLES, MOOD_ICONS } from '../data/constants';
import './ListPage.css';

function EntryDetail({ entry, kb, editEntry }) {
  if (!entry) {
    return <div className="detail-empty"><i className="ti ti-notebook" /><p>日記を選択してください</p></div>;
  }

  const c = CAT_STYLES[entry.cat] || {};
  const relatedKB = kb.filter(item => item.linkedEntryId === entry.id);

  return (
    <div className="detail-pane">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button className="btn-ghost" onClick={() => editEntry(entry.id)}>
          <i className="ti ti-pencil" /> 編集
        </button>
      </div>

      <div className="detail-meta">
        <span className="cat-badge" style={{ background: c.bg, color: c.tx }}>{entry.cat}</span>
        <span className="detail-date">{entry.date}</span>
        <span className="detail-mood"><i className={`ti ${MOOD_ICONS[entry.mood] || 'ti-mood-empty'}`} />{entry.mood}</span>
      </div>

      <h2 className="detail-title">{entry.title}</h2>
      <hr className="detail-sep" />
      <div className="detail-body">{entry.body.split('\n').map((line, i) => <p key={i}>{line}</p>)}</div>
      <div className="detail-tags">{(entry.tags || []).map(tag => <span key={tag} className="tag">{tag}</span>)}</div>

      <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid #e8e8e5' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 10 }}>
          <i className="ti ti-database" /> この日記から生まれた知識
        </div>
        {relatedKB.length === 0 ? (
          <p style={{ fontSize: 12, color: '#aaa' }}>まだ関連する知識がありません。</p>
        ) : relatedKB.map(item => (
          <div key={item.id} style={{ background: '#f9f9f8', border: '1px solid #e8e8e5', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{item.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ListPage({ entries, kb, showToast, goPage, editEntry, selectedEntryId }) {
  const [sel, setSel] = useState(selectedEntryId ?? entries[0]?.id ?? null);
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const selEntry = entries.find(entry => entry.id === sel) || null;

  useEffect(() => {
    if (selectedEntryId != null && entries.some(entry => entry.id === selectedEntryId)) {
      setSel(selectedEntryId);
    } else if (sel == null && entries.length > 0) {
      setSel(entries[0].id);
    }
  }, [selectedEntryId, entries, sel]);

  const del = (id) => {
    if (!window.confirm('この日記を削除しますか？\n関連する知識は残り、日記とのリンクだけ解除されます。')) return;
    const next = sorted.find(entry => entry.id !== id)?.id ?? null;
    store.deleteEntry(id);
    setSel(next);
    showToast('日記を削除しました');
  };

  return (
    <div className="list-layout">
      <div className="list-topbar">
        <h1 className="page-title">日記一覧</h1>
        <button className="btn-primary" onClick={() => goPage('write')}><i className="ti ti-plus" /> 新しい日記</button>
      </div>

      <div className="list-body">
        <div className="entry-list">
          {sorted.map(entry => {
            const c = CAT_STYLES[entry.cat] || {};
            return (
              <div key={entry.id} className={`entry-card ${entry.id === sel ? 'selected' : ''}`} onClick={() => setSel(entry.id)}>
                <div className="entry-card-date">{entry.date}</div>
                <div className="entry-card-title">{entry.title}</div>
                <div className="entry-card-preview">{entry.body}</div>
                <div className="entry-card-footer">
                  <span className="cat-badge" style={{ background: c.bg, color: c.tx }}>{entry.cat}</span>
                  {(entry.tags || []).map(tag => <span key={tag} className="tag">{tag}</span>)}
                  <button
                    className="del-btn"
                    style={{ marginLeft: 'auto', color: '#999' }}
                    onClick={ev => { ev.stopPropagation(); editEntry(entry.id); }}
                    title="編集"
                    aria-label="編集"
                  >
                    <i className="ti ti-pencil" />
                  </button>
                  <button
                    className="del-btn"
                    style={{ marginLeft: 0 }}
                    onClick={ev => { ev.stopPropagation(); del(entry.id); }}
                    title="削除"
                    aria-label="削除"
                  >
                    <i className="ti ti-trash" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <EntryDetail entry={selEntry} kb={kb} editEntry={editEntry} />
      </div>
    </div>
  );
}
