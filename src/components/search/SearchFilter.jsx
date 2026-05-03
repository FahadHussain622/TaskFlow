import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, LayoutDashboard, ChevronRight, Calendar } from 'lucide-react';

export default function SearchFilter({ onClose }) {
  const navigate = useNavigate();
  
  const [searchText, setSearchText] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [dueDateFilter, setDueDateFilter] = useState('all');
  
  const [foundBoards, setFoundBoards] = useState([]);
  const [foundCards, setFoundCards] = useState([]);

  async function searchDatabase() {
    try {
      const token = localStorage.getItem('token');
      let apiLink = `http://localhost:5000/api/search?q=${searchText}`;

      if (selectedLabel !== '') {
        apiLink = apiLink + `&label=${selectedLabel}`;
      }

      if (dueDateFilter !== 'all') {
        apiLink = apiLink + `&due=${dueDateFilter}`;
      }

      const response = await fetch(apiLink, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFoundBoards(data.boards);
        setFoundCards(data.cards);
      }
    } catch (error) {
      console.log("Failed to get search results:", error);
    }
  }

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchDatabase();
    }, 200); 

    return () => clearTimeout(delaySearch);
  }, [searchText, selectedLabel, dueDateFilter]);

  function handleLabelClick(clickedLabel) {
    if (selectedLabel === clickedLabel) {
      setSelectedLabel('');
    } else {
      setSelectedLabel(clickedLabel);
    }
  }

  function handleResultClick(boardId) {
    navigate(`/b/${boardId}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-start justify-center pt-12 px-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
        
        <div className="flex items-center gap-3 p-6 border-b border-slate-100">
          <Search size={20} className="text-indigo-500" />
          <input
            type="text"
            autoFocus
            placeholder="Search for boards or tasks..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 text-slate-800 font-bold text-lg outline-none bg-transparent placeholder:text-slate-300"
          />
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full">
            <X size={18} />
          </button>
        </div>

        <div className="bg-slate-50 p-5 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-slate-400 w-20">Due Date:</span>
            <button 
              onClick={() => setDueDateFilter('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${dueDateFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              All Time
            </button>
            <button 
              onClick={() => setDueDateFilter('today')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1 ${dueDateFilter === 'today' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border-indigo-200'}`}
            >
              <Calendar size={12} /> Today
            </button>
            <button 
              onClick={() => setDueDateFilter('week')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1 ${dueDateFilter === 'week' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border-indigo-200'}`}
            >
              <Calendar size={12} /> This Week
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 w-20">Labels:</span>
            <button 
              onClick={() => handleLabelClick('High Priority')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${selectedLabel === 'High Priority' ? 'bg-rose-500 text-white' : 'bg-white text-rose-500 border-rose-200'}`}
            >
              High Priority
            </button>
            <button 
              onClick={() => handleLabelClick('Feature')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${selectedLabel === 'Feature' ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-500 border-indigo-200'}`}
            >
              Feature
            </button>
            <button 
              onClick={() => handleLabelClick('Bug')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${selectedLabel === 'Bug' ? 'bg-amber-500 text-white' : 'bg-white text-amber-500 border-amber-200'}`}
            >
              Bug
            </button>

            {(selectedLabel !== '' || dueDateFilter !== 'all') && (
              <button 
                onClick={() => { setSelectedLabel(''); setDueDateFilter('all'); }} 
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-200 text-slate-600 ml-auto"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {foundBoards.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Boards</p>
              {foundBoards.map((board) => (
                <div 
                  key={board._id} 
                  onClick={() => handleResultClick(board._id)}
                  className="flex items-center p-4 bg-slate-50 hover:bg-indigo-50 rounded-xl cursor-pointer mb-2"
                >
                  <LayoutDashboard className="text-indigo-500 mr-4" size={20} />
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{board.title}</p>
                  </div>
                  <ChevronRight className="text-slate-300" size={16} />
                </div>
              ))}
            </div>
          )}

          {foundCards.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4">Tasks</p>
              {foundCards.map((card) => (
                <div 
                  key={card._id} 
                  onClick={() => handleResultClick(card.boardId)}
                  className="flex flex-col p-4 bg-slate-50 hover:bg-indigo-50 rounded-xl cursor-pointer mb-2"
                >
                  <p className="font-bold text-slate-800">{card.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="text-xs text-slate-500 font-medium">In: {card.boardTitle} → {card.listTitle}</span>
                     {card.label && (
                       <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border">
                         {card.label}
                       </span>
                     )}
                     {card.dueDate && (
                       <span className="text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                         <Calendar size={10} /> {card.dueDate}
                       </span>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchText !== '' && foundBoards.length === 0 && foundCards.length === 0 && (
             <div className="text-center py-10">
               <p className="font-bold text-slate-500">No results found.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}