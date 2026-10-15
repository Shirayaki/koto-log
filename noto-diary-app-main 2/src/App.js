import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import WritePage from './pages/WritePage';
import ListPage from './pages/ListPage';
import SearchPage from './pages/SearchPage';
// import CalendarPage from './pages/CalendarPage';
import KBPage from './pages/KBPage';
import DashPage from './pages/DashPage';
import Toast from './components/Toast';
import { useStore } from './hooks/useStore';
import './App.css';

export default function App() {
  const [page, setPage] = useState('dash');
  const [searchCat, setSearchCat] = useState(null);
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editEntryId, setEditEntryId] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const { entries, kb } = useStore();

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }, []);

  const goSearch = useCallback((cat) => {
    setSearchCat(cat);
    setEditEntryId(null);
    setPage('search');
  }, []);

  const goPage = useCallback((nextPage) => {
    setEditEntryId(null);
    if (nextPage !== 'list') setSelectedEntryId(null);
    setPage(nextPage);
  }, []);

  const editEntry = useCallback((id) => {
    setEditEntryId(id);
    setSelectedEntryId(id);
    setPage('write');
  }, []);

  const openEntry = useCallback((id) => {
    setEditEntryId(null);
    setSelectedEntryId(id);
    setPage('list');
  }, []);

  const pageProps = { entries, kb, showToast, goPage, editEntry, openEntry };

  return (
    <div className="app-shell">
      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <Sidebar
        page={page}
        setPage={(nextPage) => {
          setEditEntryId(null);
          setSelectedEntryId(null);
          setPage(nextPage);
        }}
        goSearch={goSearch}
        entries={entries}
        kb={kb}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        {page === 'write' && <WritePage {...pageProps} editEntryId={editEntryId} />}
        {page === 'list' && <ListPage {...pageProps} selectedEntryId={selectedEntryId} />}
        {page === 'search' && <SearchPage {...pageProps} initialCat={searchCat} />}
        {page === 'kb' && <KBPage {...pageProps} />}
        {page === 'dash' && <DashPage entries={entries} kb={kb} />}
      </div>

      {toast && <Toast msg={toast} />}



      {page !== 'write' && (
        <div className="fab-button" onClick={() => goPage('write')}>
          <img
            src="/SVG/日記を書く.svg"
            alt="日記を書く"
            className="fab-icon"
          />
        </div>
      )}

    </div>
  );
}
