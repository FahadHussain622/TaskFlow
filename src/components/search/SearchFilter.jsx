import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, LayoutDashboard, ChevronRight, SlidersHorizontal } from 'lucide-react';

const ALL_LABELS = ['High Priority', 'Feature', 'Design', 'Bug'];

const LABEL_STYLES = {
  'High Priority': 'bg-rose-100 text-rose-700 ring-rose-200',
  'Feature':       'bg-indigo-100 text-indigo-700 ring-indigo-200',
  'Design':        'bg-emerald-100 text-emerald-700 ring-emerald-200',
  'Bug':           'bg-amber-100 text-amber-700 ring-amber-200',
  '':              'bg-slate-100 text-slate-700 ring-slate-200',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function parseCardDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(' ');
  if (parts.length < 2) return null;
  const month = MONTHS.indexOf(parts[0]);
  const day   = parseInt(parts[1], 10);
  if (month === -1 || isNaN(day)) return null;
  const now = new Date();
  return new Date(now.getFullYear(), month, day);
}

function isToday(dateStr) {
  const d = parseCardDate(dateStr);
  if (!d) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth()    === now.getMonth()    &&
         d.getDate()     === now.getDate();
}

function isThisWeek(dateStr) {
  const d = parseCardDate(dateStr);
  if (!d) return false;
  const now         = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return d >= startOfWeek && d <= endOfWeek;
}

function highlightText(text, query) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts  = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-indigo-100 text-indigo-700 rounded px-0.5 not-italic font-black">{part}</mark>
      : part
  );
}

export default function SearchFilter({ boards, boardData, onClose, onSelectBoard }) {
  const [query,          setQuery]          = useState('');
  const [activeTab,      setActiveTab]      = useState('all');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [showFilters,    setShowFilters]    = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggleLabel = (label) =>
    setSelectedLabels(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );

  const allCards = [];
  boards.forEach(board => {
    const lists = boardData[board.id] || [];
    lists.forEach(list => {
      list.cards.forEach(card => {
        allCards.push({
          ...card,
          boardId:    board.id,
          boardTitle: board.title,
          listTitle:  list.title,
        });
      });
    });
  });

  const hasActiveFilter = query.trim() || selectedLabels.length > 0 || activeTab !== 'all';

  const filteredBoards = query.trim()
    ? boards.filter(b => b.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredCards = allCards.filter(card => {
    const q = query.trim().toLowerCase();
    const matchesQuery = q
      ? card.content.toLowerCase().includes(q) ||
        (card.description || '').toLowerCase().includes(q)
      : true;

    const matchesLabel = selectedLabels.length > 0
      ? selectedLabels.includes(card.label)
      : true;

    const matchesTab =
      activeTab === 'today' ? isToday(card.dueDate) :
      activeTab === 'week'  ? isThisWeek(card.dueDate) :
      true;

    return matchesQuery && matchesLabel && matchesTab;
  });

  const totalResults = filteredBoards.length + filteredCards.length;
  const showEmpty    = hasActiveFilter && totalResults === 0;

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-start justify-center pt-12 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-2xl rounded-[36px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
           style={{ maxHeight: 'calc(100vh - 96px)' }}>

        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <Search size={20} className="text-indigo-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search boards, tasks, descriptions…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 text-slate-800 font-bold text-base outline-none bg-transparent placeholder:text-slate-300 placeholder:font-medium"
          />
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`p-2 rounded-xl transition-all ${showFilters ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
            title="Toggle filters"
          >
            <SlidersHorizontal size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {showFilters && (
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 space-y-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Due Date</p>
              <div className="flex gap-2">
                {[
                  { id: 'all',   label: 'All Time' },
                  { id: 'today', label: '📅 Today'    },
                  { id: 'week',  label: '🗓️ This Week' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Labels</p>
              <div className="flex gap-2 flex-wrap">
                {ALL_LABELS.map(label => (
                  <button
                    key={label}
                    onClick={() => toggleLabel(label)}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ring-1 transition-all ${
                      selectedLabels.includes(label)
                        ? (LABEL_STYLES[label] || LABEL_STYLES['']) + ' ring-2 scale-105'
                        : 'bg-white text-slate-400 ring-slate-200 hover:ring-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {selectedLabels.length > 0 && (
                  <button
                    onClick={() => setSelectedLabels([])}
                    className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-rose-50 text-rose-500 ring-1 ring-rose-200 hover:bg-rose-100 transition-all"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!showFilters && (activeTab !== 'all' || selectedLabels.length > 0) && (
          <div className="flex gap-2 px-6 py-3 flex-wrap border-b border-slate-100 bg-slate-50/50">
            {activeTab !== 'all' && (
              <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-700 flex items-center gap-1">
                <Calendar size={10} /> {activeTab === 'today' ? 'Due Today' : 'This Week'}
                <button onClick={() => setActiveTab('all')} className="ml-1 hover:text-indigo-900">✕</button>
              </span>
            )}
            {selectedLabels.map(l => (
              <span key={l} className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ring-1 flex items-center gap-1 ${LABEL_STYLES[l] || LABEL_STYLES['']}`}>
                {l}
                <button onClick={() => toggleLabel(l)} className="ml-1 opacity-60 hover:opacity-100">✕</button>
              </span>
            ))}
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-4 space-y-5">

          {filteredBoards.length > 0 && (
            <section>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">
                Boards <span className="text-indigo-400">({filteredBoards.length})</span>
              </p>
              <div className="space-y-2">
                {filteredBoards.map(board => (
                  <button
                    key={board.id}
                    onClick={() => { onSelectBoard(board); onClose(); }}
                    className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition-all group text-left"
                  >
                    <div className="bg-indigo-600 text-white p-2 rounded-xl flex-shrink-0">
                      <LayoutDashboard size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-sm group-hover:text-indigo-600 truncate">{board.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">{board.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {filteredCards.length > 0 && (
            <section>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">
                Tasks <span className="text-indigo-400">({filteredCards.length})</span>
              </p>
              <div className="space-y-2">
                {filteredCards.map(card => (
                  <button
                    key={`${card.boardId}-${card.id}`}
                    onClick={() => {
                      onSelectBoard(boards.find(b => b.id === card.boardId));
                      onClose();
                    }}
                    className="w-full flex items-start gap-4 p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition-all group text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-sm group-hover:text-indigo-600 leading-snug mb-2">
                        {highlightText(card.content, query)}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold text-slate-400">
                          {card.boardTitle} → {card.listTitle}
                        </span>
                        {card.label && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-black tracking-widest uppercase ring-1 ${LABEL_STYLES[card.label] || LABEL_STYLES['']}`}>
                            {card.label}
                          </span>
                        )}
                        {card.dueDate && (
                          <span className={`text-[9px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-md ${isToday(card.dueDate) ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                            <Calendar size={9} /> {card.dueDate}
                            {isToday(card.dueDate) && <span className="ml-0.5">• Due today</span>}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 flex-shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {showEmpty && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-black text-slate-700 text-lg mb-1">No results found</p>
              <p className="text-sm text-slate-400 font-medium">
                {activeTab === 'today' ? 'No tasks are due today' :
                 activeTab === 'week'  ? 'No tasks are due this week' :
                 'Try a different search term or adjust your filters'}
              </p>
            </div>
          )}

          {!hasActiveFilter && (
            <div className="text-center py-10">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-5">Quick Filters</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() => { setShowFilters(true); setActiveTab('today'); }}
                  className="bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl hover:bg-rose-100 transition-all shadow-sm"
                >
                  📅 Due Today
                </button>
                <button
                  onClick={() => { setShowFilters(true); setActiveTab('week'); }}
                  className="bg-indigo-50 text-indigo-500 text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl hover:bg-indigo-100 transition-all shadow-sm"
                >
                  🗓️ This Week
                </button>
                <button
                  onClick={() => { setShowFilters(true); toggleLabel('High Priority'); }}
                  className="bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl hover:bg-rose-100 transition-all shadow-sm"
                >
                  🔴 High Priority
                </button>
                <button
                  onClick={() => { setShowFilters(true); toggleLabel('Feature'); }}
                  className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl hover:bg-indigo-100 transition-all shadow-sm"
                >
                  ⚡ Features
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-3.5 flex items-center justify-between bg-slate-50/50">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Press Esc to close</p>
          {hasActiveFilter && (
            <p className="text-[9px] font-bold text-slate-400">
              {totalResults} result{totalResults !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}