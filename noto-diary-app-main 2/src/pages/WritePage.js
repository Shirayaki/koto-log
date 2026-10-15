import React, { useEffect, useMemo, useState } from 'react';
import { store } from '../data/store';
import { CATEGORIES, MOODS, today } from '../data/constants';
import TagInput from '../components/TagInput';
import './WritePage.css';

export default function WritePage({ entries, kb, showToast, goPage, editEntry, editEntryId }) {
  const editingEntry = useMemo(
    () => entries.find(entry => entry.id === editEntryId) || null,
    [entries, editEntryId]
  );
  const isEditing = Boolean(editingEntry);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [cat, setCat] = useState('日常');
  const [mood, setMood] = useState('普通');
  const [tags, setTags] = useState([]);
  const [kbForm, setKbForm] = useState(false);
  const [kbPanelOpen, setKbPanelOpen] = useState(false);
  const [kbTitle, setKbTitle] = useState('');
  const [kbBody, setKbBody] = useState('');

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title || '');
      setBody(editingEntry.body || '');
      setCat(editingEntry.cat || '日常');
      setMood(editingEntry.mood || '普通');
      setTags(editingEntry.tags || []);
    } else {
      setTitle('');
      setBody('');
      setCat('日常');
      setMood('普通');
      setTags([]);
    }
    setKbForm(false);
    setKbTitle('');
    setKbBody('');
  }, [editingEntry]);

  const linkedKB = isEditing
    ? kb.filter(item => item.linkedEntryId === editingEntry.id)
    : [];

  const save = () => {
    if (!title.trim() || !body.trim()) {
      showToast('タイトルと内容を入力してください');
      return;
    }

    const data = {
      title: title.trim(),
      body: body.trim(),
      cat,
      mood,
      tags,
    };

    if (isEditing) {
      store.updateEntry(editingEntry.id, data);
      showToast('日記を更新しました ✓');
      setTimeout(() => goPage('list'), 400);
      return;
    }

    const created = store.addEntry({ date: today(), ...data });
    showToast('日記を保存しました ✓');
    // 保存直後に編集状態へ移し、発行済みIDに知識を紐付けられるようにする
    setTimeout(() => editEntry(created.id), 250);
  };

  const saveKB = () => {
    if (!isEditing) {
      showToast('先に日記を保存してください');
      return;
    }
    if (!kbTitle.trim() || !kbBody.trim()) {
      showToast('タイトルと内容を入力してください');
      return;
    }

    store.addKB({
      title: kbTitle.trim(),
      body: kbBody.trim(),
      tag: cat,
      linkedEntryId: editingEntry.id,
    });

    setKbTitle('');
    setKbBody('');
    setKbForm(false);
    showToast('知識DBに登録しました ✓');
  };

  return (
    <div className="write-layout">
      <div className="write-form">
        <div className="write-header">
          <h1 className="page-title">{isEditing ? '日記を編集' : '日記を書く'}</h1>
          {isEditing && (
            <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
              {editingEntry.date} の日記を編集中
            </div>
          )}
        </div>

        <div className="form-group">
          <label>タイトル</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="今日のタイトル" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>カテゴリ</label>
            <select value={cat} onChange={e => setCat(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>気分</label>
            <select value={mood} onChange={e => setMood(e.target.value)}>
              {MOODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>内容</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={9} placeholder="今日はどんな一日でしたか？" />
        </div>

        <div className="form-group">
          <label>タグ</label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        <div className="form-actions">
          <button className="btn-primary" onClick={save}>{isEditing ? '変更を保存' : '保存する'}</button>
          <button className="btn-ghost" onClick={() => goPage('list')}>キャンセル</button>
        </div>
      </div>


      <button
        type="button"
        className="kb-mobile-toggle"
        onClick={() => setKbPanelOpen(!kbPanelOpen)}
        aria-expanded={kbPanelOpen}
      >
        <span>知識DB・知識を追加</span>
        <span>{kbPanelOpen ? '▲' : '▼'}</span>
      </button>


      <aside className={`kb-panel ${kbPanelOpen ? 'open' : ''}`}>
        <div className="kb-panel-header">
          <span><i className="ti ti-database" /> 知識DB <span className="kb-count">{kb.length}</span></span>
          <small>{isEditing ? 'この日記から追加' : '保存後に追加できます'}</small>
        </div>

        <div className="kb-panel-list">
          {(isEditing ? linkedKB : kb.slice(0, 5)).map(k => (
            <div key={k.id} className="kb-card">
              <div className="kb-card-title">{k.title}</div>
              <div className="kb-card-body">{k.body}</div>
              {isEditing && (
                <div className="kb-card-link"><i className="ti ti-link" />{editingEntry.title}</div>
              )}
            </div>
          ))}
          {isEditing && linkedKB.length === 0 && (
            <div style={{ fontSize: 12, color: '#aaa', padding: '8px 2px' }}>
              この日記に関連する知識はまだありません。
            </div>
          )}
        </div>

        <div className="kb-panel-footer">
          {!isEditing ? (
            <button className="btn-kb-add" onClick={() => showToast('先に日記を保存してください')}>
              <i className="ti ti-lock" /> 日記を保存してから知識を追加
            </button>
          ) : !kbForm ? (
            <button className="btn-kb-add" onClick={() => setKbForm(true)}>
              <i className="ti ti-plus" /> 知識を追加する
            </button>
          ) : (
            <div className="kb-form">
              <div className="kb-link-hint"><i className="ti ti-link" />「{editingEntry.title}」とリンクされます</div>
              <input value={kbTitle} onChange={e => setKbTitle(e.target.value)} placeholder="タイトル" />
              <textarea value={kbBody} onChange={e => setKbBody(e.target.value)} rows={3} placeholder="内容・メモ・定義など" />
              <div className="form-actions">
                <button className="btn-primary" style={{ fontSize: 12, padding: '5px 14px' }} onClick={saveKB}>登録</button>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setKbForm(false)}>キャンセル</button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
