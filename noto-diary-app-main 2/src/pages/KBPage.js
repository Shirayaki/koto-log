
import React, { useState } from 'react';
import { store } from '../data/store';
import { CATEGORIES } from '../data/constants';
import './KBPage.css';

export default function KBPage({
  kb,
  entries,
  showToast,
  goPage,
  openEntry
}) {
  // 新規登録
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState(CATEGORIES[0] || '日常');
  const [linkedEntryId, setLinkedEntryId] = useState('');

  // 編集
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editTag, setEditTag] = useState(CATEGORIES[0] || '日常');
  const [editLinkedEntryId, setEditLinkedEntryId] = useState('');

  const resetForm = () => {
    setTitle('');
    setBody('');
    setTag(CATEGORIES[0] || '日常');
    setLinkedEntryId('');
    setFormOpen(false);
  };

  const save = () => {
    if (!title.trim() || !body.trim()) {
      showToast('タイトルと内容を入力してください');
      return;
    }

    store.addKB({
      title: title.trim(),
      body: body.trim(),
      tag,
      linkedEntryId:
        linkedEntryId === '' ? null : Number(linkedEntryId),
    });

    resetForm();
    showToast('知識を登録しました ✓');
  };

  // 編集開始
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title || '');
    setEditBody(item.body || '');
    setEditTag(item.tag || CATEGORIES[0] || '日常');
    setEditLinkedEntryId(
      item.linkedEntryId == null
        ? ''
        : String(item.linkedEntryId)
    );
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditBody('');
    setEditLinkedEntryId('');
  };

  // 編集保存
  const saveEdit = (id) => {
    if (!editTitle.trim() || !editBody.trim()) {
      showToast('タイトルと内容を入力してください');
      return;
    }

    if (typeof store.updateKB !== 'function') {
      showToast('知識の更新機能が未実装です');
      return;
    }

    const updated = store.updateKB(id, {
      title: editTitle.trim(),
      body: editBody.trim(),
      tag: editTag,
      linkedEntryId:
        editLinkedEntryId === ''
          ? null
          : Number(editLinkedEntryId),
    });

    if (!updated) {
      showToast('知識の更新に失敗しました');
      return;
    }

    cancelEdit();
    showToast('知識を更新しました ✓');
  };

  // 関連日記の変更
  const changeLink = (item, newEntryId) => {
    if (typeof store.updateKB !== 'function') {
      showToast('関連付けの更新機能が未実装です');
      return;
    }

    store.updateKB(item.id, {
      linkedEntryId:
        newEntryId === '' ? null : Number(newEntryId),
    });

    showToast('関連付けを更新しました ✓');
  };

  // 削除
  const del = (id) => {
    if (!window.confirm('この知識を削除しますか？')) return;

    store.deleteKB(id);

    if (editingId === id) {
      cancelEdit();
    }

    showToast('知識を削除しました');
  };

  return (
    <div className="kb-page">

      <div className="kb-topbar">
        <h1 className="page-title">知識データベース</h1>

        <div className="kb-top-actions">
          <button
            className="btn-ghost"
            onClick={() => goPage('write')}
          >
            日記から追加
          </button>

          <button
            className="btn-primary"
            onClick={() => {
              if (formOpen) {
                resetForm();
              } else {
                cancelEdit();
                setFormOpen(true);
              }
            }}
          >
            {formOpen ? '閉じる' : '＋ 知識を追加'}
          </button>
        </div>
      </div>

      {/* 新規登録フォーム */}
      {formOpen && (
        <div className="kb-new-form">
          <h2>新しい知識を登録</h2>

          <label htmlFor="new-kb-title">タイトル</label>
          <input
            id="new-kb-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="知識のタイトル"
          />

          <label htmlFor="new-kb-body">内容</label>
          <textarea
            id="new-kb-body"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
            placeholder="学んだことや定義など"
          />

          <label htmlFor="new-kb-category">カテゴリ</label>
          <select
            id="new-kb-category"
            value={tag}
            onChange={e => setTag(e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <label htmlFor="new-kb-link">関連する日記（任意）</label>
          <select
            id="new-kb-link"
            value={linkedEntryId}
            onChange={e => setLinkedEntryId(e.target.value)}
          >
            <option value="">関連付けなし</option>
            {entries.map(entry => (
              <option key={entry.id} value={entry.id}>
                {entry.date} — {entry.title}
              </option>
            ))}
          </select>

          <div className="form-actions">
            <button className="btn-primary" onClick={save}>
              登録する
            </button>
            <button className="btn-ghost" onClick={resetForm}>
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* 知識一覧 */}
      <div className="kb-list">
        <p className="kb-meta">
          {kb.length}件の知識が登録されています
        </p>

        {kb.map(item => {
          const linkedEntry = entries.find(
            entry =>
              String(entry.id) === String(item.linkedEntryId)
          ) || null;

          const isEditing = editingId === item.id;

          return (
            <div key={item.id} className="kb-item">

              {isEditing ? (
                // 編集フォーム
                <div className="kb-edit-form">
                  <h3>知識を編集</h3>

                  <label>タイトル</label>
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                  />

                  <label>内容</label>
                  <textarea
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    rows={5}
                  />

                  <label>カテゴリ</label>
                  <select
                    value={editTag}
                    onChange={e => setEditTag(e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <label>関連する日記（任意）</label>
                  <select
                    value={editLinkedEntryId}
                    onChange={e => setEditLinkedEntryId(e.target.value)}
                  >
                    <option value="">関連付けなし</option>
                    {entries.map(entry => (
                      <option key={entry.id} value={entry.id}>
                        {entry.date} — {entry.title}
                      </option>
                    ))}
                  </select>

                  <div className="form-actions">
                    <button
                      className="btn-primary"
                      onClick={() => saveEdit(item.id)}
                    >
                      変更を保存
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={cancelEdit}
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                // 通常表示
                <>
                  <div className="kb-item-title">
                    {item.title}
                  </div>

                  <div className="kb-item-body">
                    {item.body}
                  </div>

                  <div className="kb-item-footer">
                    <span
                      className="tag"
                      style={{
                        background: '#E1F5EE',
                        color: '#085041',
                        border: '1px solid #9FE1CB'
                      }}
                    >
                      {item.tag}
                    </span>

                    {linkedEntry && (
                      <button
                        className="kb-item-link"
                        onClick={() => openEntry(linkedEntry.id)}
                        title="関連する日記を開く"
                      >
                        <i className="ti ti-link" />
                        {linkedEntry.title}
                      </button>
                    )}

                    <select
                      className="kb-link-select"
                      value={
                        linkedEntry
                          ? String(linkedEntry.id)
                          : ''
                      }
                      onChange={e =>
                        changeLink(item, e.target.value)
                      }
                      aria-label={`${item.title}の関連日記`}
                    >
                      <option value="">関連日記なし</option>
                      {entries.map(entry => (
                        <option key={entry.id} value={entry.id}>
                          {entry.date} — {entry.title}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="kb-edit-btn"
                      onClick={() => {
                        resetForm();
                        startEdit(item);
                      }}
                      title="編集"
                      aria-label={`${item.title}を編集`}
                    >
                      <i className="ti ti-edit" />
                    </button>

                    <button
                      className="del-btn"
                      onClick={() => del(item.id)}
                      title="削除"
                      aria-label="削除"
                    >
                      <i className="ti ti-trash" />
                    </button>
                  </div>
                </>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
