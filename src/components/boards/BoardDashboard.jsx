import React, { useState } from 'react';
import { ArrowLeft, Plus, LayoutDashboard, Search, Star, LogOut } from 'lucide-react';

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function boardTaskCount(boardId, boardData) {
  return null;
}

export default function BoardDashboard({
  user, boards, pinnedBoards, onTogglePin, onCreateBoard,
  onLogout, onSelectBoard, onOpenSearch, onOpenProfile, goHome,
}) {
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    onCreateBoard(newBoardTitle.trim());
    setNewBoardTitle('');
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000')] bg-cover bg-center bg-fixed p-8 font-sans relative">
      <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[2px] -z-10" />

      <div className="max-w-6xl mx-auto z-10 relative">

        <header className="flex justify-between items-center mb-10 bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={goHome}
              className="p-2.5 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all text-slate-500"
              title="Back to Home"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">All Boards</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {user.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 bg-slate-100 hover:bg-indigo-600 hover:text-white
                         text-slate-500 px-4 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search</span>
            </button>

            <button
              onClick={onOpenProfile}
              className="w-10 h-10 rounded-2xl bg-indigo-600 border-2 border-white flex items-center
                         justify-center text-xs font-black text-white hover:ring-2 hover:ring-indigo-400
                         transition-all overflow-hidden shadow-md"
              title="My Profile"
            >
              {user.avatar
                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                : <span>{initials(user.name)}</span>
              }
            </button>

            <button
              onClick={onLogout}
              className="text-xs font-black text-rose-500 hover:bg-rose-50 px-5 py-2.5 rounded-xl transition-all uppercase tracking-widest"
            >
              Logout
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="mb-10 flex gap-4 max-w-xl">
          <input
            type="text"
            placeholder="New board name…"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            className="flex-1 px-6 py-4 bg-white/90 border border-white rounded-2xl
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl
                       transition-all font-bold text-slate-700 placeholder:text-slate-300"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all"
          >
            <Plus size={22} />
          </button>
        </form>

        {boards.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-4xl mb-3">🗂️</div>
            <p className="font-black text-slate-700 mb-1">No boards yet</p>
            <p className="text-sm font-medium">Use the form above to create your first board.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-7">
            {boards.map(board => {
              const pinned = pinnedBoards.has(board.id);
              return (
                <div
                  key={board.id}
                  onClick={() => onSelectBoard(board)}
                  className="relative bg-white/70 backdrop-blur-xl p-7 rounded-3xl shadow-lg
                             hover:shadow-2xl transition-all cursor-pointer border border-white
                             hover:border-indigo-300 group hover:-translate-y-1"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onTogglePin(board.id); }}
                    title={pinned ? 'Unpin' : 'Pin board'}
                    className={`absolute top-4 right-4 p-1.5 rounded-xl transition-all
                      ${pinned
                        ? 'text-amber-400 bg-amber-50'
                        : 'text-slate-200 hover:text-amber-400 hover:bg-amber-50 opacity-0 group-hover:opacity-100'
                      }`}
                  >
                    <Star size={14} fill={pinned ? 'currentColor' : 'none'} />
                  </button>

                  <div className="w-8 h-1 bg-indigo-400 rounded-full mb-5 group-hover:w-full transition-all duration-500 opacity-30" />
                  <h3 className="text-lg font-black text-slate-800 mb-1.5 group-hover:text-indigo-600 pr-6 leading-tight">
                    {board.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed">{board.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
