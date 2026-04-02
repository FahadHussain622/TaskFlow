import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, LayoutDashboard, Search, Star, 
  Trash2, Archive, RotateCcw, Edit2, X, MoreVertical 
} from 'lucide-react';

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export default function BoardDashboard({
  user, boards, setBoards, pinnedBoards, onTogglePin, onCreateBoard,
  onLogout, onSelectBoard, onOpenSearch, onOpenProfile, goHome,
}) {
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);

  // Filter logic for Active vs Archived
  const visibleBoards = boards.filter(b => !!b.isArchived === showArchived);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    onCreateBoard(newBoardTitle.trim());
    setNewBoardTitle('');
  };

  const handleDeleteBoard = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this board permanently? This cannot be undone.")) {
      setBoards(boards.filter(b => b.id !== id));
    }
  };

  const handleArchiveToggle = (e, id) => {
    e.stopPropagation();
    setBoards(boards.map(b => b.id === id ? { ...b, isArchived: !b.isArchived } : b));
  };

  const handleUpdateBoard = (e) => {
    e.preventDefault();
    setBoards(boards.map(b => b.id === editingBoard.id ? editingBoard : b));
    setEditingBoard(null);
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000')] bg-cover bg-center bg-fixed p-8 font-sans relative">
      <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[2px] -z-10" />

      <div className="max-w-6xl mx-auto z-10 relative">
        
        {/* Updated: Header is now frosted glass with white text */}
        <header className="flex justify-between items-center mb-10 bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 shadow-lg">
          <div className="flex items-center gap-4">
            <button onClick={goHome} className="p-2.5 bg-white/20 hover:bg-indigo-600 text-white rounded-2xl transition-all border border-white/10">
              <ArrowLeft size={18} />
            </button>
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg border border-indigo-400/30">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight drop-shadow-md">
                {showArchived ? 'Archived Boards' : 'All Boards'}
              </h1>
              <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em] drop-shadow-sm">
                {user.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${showArchived ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/20 text-white border-white/10 hover:bg-white/30'}`}
            >
              {showArchived ? 'View Active' : 'View Archived'}
            </button>
            
            <button onClick={onOpenSearch} className="flex items-center gap-2 bg-white/20 hover:bg-indigo-600 text-white border border-white/10 px-4 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest">
              <Search size={14} />
              <span className="hidden sm:inline">Search</span>
            </button>

            <button onClick={onOpenProfile} className="w-10 h-10 rounded-2xl bg-indigo-600 border-2 border-white/50 flex items-center justify-center text-xs font-black text-white hover:ring-2 hover:ring-indigo-400 transition-all overflow-hidden shadow-md">
              {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <span>{initials(user.name)}</span>}
            </button>

            <button onClick={onLogout} className="text-xs font-black text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 px-5 py-2.5 rounded-xl transition-all uppercase tracking-widest">
              Logout
            </button>
          </div>
        </header>

        {!showArchived && (
          <form onSubmit={handleSubmit} className="mb-10 flex gap-4 max-w-xl">
            {/* Updated: Input field is now glass with white text */}
            <input
              type="text"
              placeholder="New board name…"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg transition-all font-bold text-white placeholder:text-slate-300"
            />
            <button type="submit" className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all border border-indigo-400/30">
              <Plus size={22} />
            </button>
          </form>
        )}

        {visibleBoards.length === 0 ? (
          // Updated: Empty state matches the glassmorphism of HomeDashboard
          <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-[32px] text-center py-20">
            <div className="text-5xl mb-4 drop-shadow-md">🗂️</div>
            <p className="font-black text-white text-xl mb-1 drop-shadow-md">Nothing to show here</p>
            <p className="text-sm font-medium text-slate-200">
              {showArchived ? "You don't have any archived boards." : "Create your first board to get started!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-7">
            {/* Board Cards remain light so the dark text on them is easy to read */}
            {visibleBoards.map(board => {
              const pinned = pinnedBoards.has(board.id);
              return (
                <div
                  key={board.id}
                  onClick={() => onSelectBoard(board)}
                  className="relative bg-white/80 backdrop-blur-xl p-7 rounded-3xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-white hover:border-indigo-300 group hover:-translate-y-1"
                >
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={(e) => { e.stopPropagation(); setEditingBoard(board); }} className="p-1.5 bg-white shadow-sm rounded-lg text-indigo-600 hover:bg-indigo-50"><Edit2 size={12}/></button>
                    <button onClick={(e) => handleArchiveToggle(e, board.id)} className="p-1.5 bg-white shadow-sm rounded-lg text-amber-600 hover:bg-amber-50">
                      {showArchived ? <RotateCcw size={12}/> : <Archive size={12}/>}
                    </button>
                    <button onClick={(e) => handleDeleteBoard(e, board.id)} className="p-1.5 bg-white shadow-sm rounded-lg text-rose-600 hover:bg-rose-50"><Trash2 size={12}/></button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onTogglePin(board.id); }}
                      className={`p-1.5 rounded-lg transition-all ${pinned ? 'text-amber-400 bg-amber-50' : 'text-slate-300 bg-white shadow-sm'}`}
                    >
                      <Star size={12} fill={pinned ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div className="w-8 h-1 bg-indigo-400 rounded-full mb-5 group-hover:w-full transition-all duration-500 opacity-30" />
                  <h3 className="text-lg font-black text-slate-800 mb-1.5 group-hover:text-indigo-600 leading-tight">
                    {board.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">{board.desc || 'No description provided.'}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Board Modal remains the same */}
      {editingBoard && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Edit Board</h2>
              <button onClick={() => setEditingBoard(null)} className="text-slate-400 hover:text-black"><X size={24}/></button>
            </div>
            <form onSubmit={handleUpdateBoard} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-2">Title</label>
                <input type="text" value={editingBoard.title} onChange={(e) => setEditingBoard({...editingBoard, title: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-800" />
              </div>
              <div>
                <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-2">Description</label>
                <textarea value={editingBoard.desc} onChange={(e) => setEditingBoard({...editingBoard, desc: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl font-medium text-slate-800" rows="3" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] shadow-lg">Update Board</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}