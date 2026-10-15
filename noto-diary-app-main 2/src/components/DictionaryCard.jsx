import React, { useMemo } from 'react';

const ITEMS_PER_PAGE = 50;
const ITEMS_PER_BOOK = 50000;

export default function DictionaryCard({ kb = [] }) {
  const stats = useMemo(() => {
    const knowledgeCount = kb.length;

    // 1ページ = 50個の知識
    const pages = knowledgeCount / ITEMS_PER_PAGE;

    // 1冊 = 50,000個の知識
    const books = knowledgeCount / ITEMS_PER_BOOK;

    return {
      knowledgeCount,
      pages,
      books,
    };
  }, [kb]);

  // ページ数は、小数1桁まで表示
  const pageText = stats.pages.toLocaleString('ja-JP', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return (
    <div className="dict-card">

      {/* 左：本のアイコン */}
      <div className="dict-book-icon">
        <i className="ti ti-book" />
      </div>

      {/* 中央：ページ換算 */}
      <div className="dict-page-section">
        <div className="dict-label">
          辞書にすると
        </div>

        <div className="dict-page-value">
          {pageText}<span>ページ</span>
        </div>

        <div className="dict-sub-text">
          1ページ = 50個の知識
        </div>
      </div>

      {/* 右：これまでの知識数 */}
      <div className="dict-knowledge-section">
        <div className="dict-label">
          今までで
        </div>

        <div className="dict-knowledge-value">
          {stats.knowledgeCount.toLocaleString('ja-JP')}
          <span>個</span>
        </div>

        <div className="dict-knowledge-message">
          の知識を身につけました
        </div>
      </div>

    </div>
  );
}
