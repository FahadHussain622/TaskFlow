import React, { useState } from 'react';
import { Plus, LayoutDashboard, Search } from 'lucide-react';

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export default function BoardDashboard({
  user, boards, setBoards, onLogout, onSelectBoard, onOpenSearch, onOpenProfile,
}) {
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    setBoards([...boards, { id: `b${Date.now()}`, title: newBoardTitle, desc: 'Project Workspace' }]);
    setNewBoardTitle('');
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000')] bg-cover bg-center bg-fixed p-8 font-sans relative">
      <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[2px] -z-10" />

      <div className="max-w-6xl mx-auto z-10 relative">

        <header className="flex justify-between items-center mb-12 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">TaskFlow</h1>
              <p className="text-black font-bold text-[10px] uppercase tracking-[0.2em]">
                Dashboard • {user.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 bg-slate-100 hover:bg-indigo-600 hover:text-white
                         text-slate-500 px-4 py-2.5 rounded-xl transition-all text-xs font-black
                         uppercase tracking-widest"
              title="Search & Filter"
            >
              <Search size={15} />
              <span className="hidden sm:inline">Search</span>
            </button>

            <button
              onClick={onOpenProfile}
              className="relative w-10 h-10 rounded-2xl bg-indigo-600 border-2 border-white
                         flex items-center justify-center text-xs font-black text-white
                         hover:ring-2 hover:ring-indigo-400 transition-all overflow-hidden shadow-md"
              title="My Profile"
            >
              {user.avatar
                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                : <span>{initials(user.name)}</span>
              }
            </button>

            <button
              onClick={onLogout}
              className="text-xs font-black text-rose-500 hover:bg-rose-50 px-5 py-2.5 rounded-xl
                         transition-all uppercase tracking-widest"
            >
              Logout
            </button>
          </div>
        </header>

        <form onSubmit={handleCreateBoard} className="mb-12 flex gap-4 max-w-xl">
          <input
            type="text"
            placeholder="Create new board..."
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            className="flex-1 px-6 py-4 bg-white/90 border border-white rounded-2xl
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl
                       transition-all font-bold text-slate-700"
          />
          <button type="submit" className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">
            <Plus size={24} />
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {boards.map(board => (
            <div
              key={board.id}
              onClick={() => onSelectBoard(board)}
              className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg hover:shadow-2xl
                         transition-all cursor-pointer border border-white hover:border-indigo-400
                         group hover:-translate-y-2"
            >
              <div className="w-10 h-1 bg-indigo-500 rounded-full mb-6 group-hover:w-full transition-all duration-500 opacity-30" />
              <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-indigo-600">{board.title}</h3>
              <p className="text-sm font-medium text-black leading-relaxed">{board.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
