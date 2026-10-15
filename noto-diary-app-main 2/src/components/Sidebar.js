import React, { useMemo } from 'react';
import { CAT_STYLES, CATEGORIES, dateKey } from '../data/constants';
import './Sidebar.css';

export default function Sidebar({
  page,
  setPage,
  goSearch,
  entries,
  kb,
  isOpen,    // ← 追加
  onClose    // ← 追加
}) {
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = entries.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const k = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
      if (entries.some(e => e.date === k)) streak++;
      else break;
    }
    return { month: thisMonth.length, kb: kb.length, streak };
  }, [entries, kb]);

  const nav = (id) => () => {
    setPage(id);
    onClose();  // ← メニュー選択後にサイドバーを閉じる
  };

  const handleSearch = (cat) => {
    goSearch(cat);
    onClose();  // ← 検索後にサイドバーを閉じる
  };

  return (
    <>
      {/* オーバーレイ（モバイルで背景をタップで閉じる） */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

        <div className="sb-logo">
          <img
            src="/SVG/koto_log.svg"
            alt="ことログ"
            className="sb-logo-img"
          />
        </div>


        <nav className="sb-nav">
          <div className="sb-label">メニュー</div>

          {[
            { id: 'dash', icon: 'ダッシュボード.svg', label: 'ダッシュボード' },
            { id: 'write', icon: '日記を書く.svg', label: '日記を書く' },
            { id: 'list', icon: '日記一覧.svg', label: '日記一覧' },
            { id: 'search', icon: '検索・フィルター.svg', label: '検索・フィルター' },
            { id: 'kb', icon: '知識DB.svg', label: '知識DB' },
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              className={`sb-item ${page === id ? 'active' : ''}`}
              onClick={nav(id)}
            >
              <img
                src={`/SVG/${icon}`}
                alt=""
                className="sb-icon"
              />
              {label}
            </button>
          ))}

        </nav>

        <div className="sb-nav">
          <div className="sb-label">カテゴリ</div>
          {CATEGORIES.map(cat => (
            <button key={cat} className="sb-item" onClick={() => handleSearch(cat)}>
              <span className="sb-dot" style={{ background: CAT_STYLES[cat].dot }} />
              {cat}
            </button>
          ))}
        </div>

        <div className="sb-footer">
          <div className="sb-label">今月の記録</div>
          <div className="sb-stat"><span><i className="ti ti-notebook" /> 日記</span><strong>{stats.month}件</strong></div>
          <div className="sb-stat"><span><i className="ti ti-database" /> 知識</span><strong>{stats.kb}件</strong></div>
          <div className="sb-stat"><span><i className="ti ti-flame" /> 連続</span><strong>{stats.streak}日</strong></div>
        </div>
      </aside>
    </>
  );
}
