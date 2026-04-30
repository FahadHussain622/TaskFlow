import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// Added Trash2 to the imports
import { ArrowLeft, Plus, MessageSquare, Paperclip, Calendar, Settings, AlertTriangle, Trash2 } from 'lucide-react';

export default function BoardWorkspace({ boards, boardData, setBoardData, user, addActivity }) {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);

  const board = useMemo(() => {
    return boards.find(b => b.id === boardId || b._id === boardId);
  }, [boards, boardId]);

  const lists = useMemo(() => {
    // Check every possible key format in the boardData object
    return boardData[boardId] || boardData[board?._id] || boardData[board?.id] || [];
  }, [boardData, boardId, board]);

  const setLists = (newLists) => {
    // Update using the specific ID found in the URL
    setBoardData(prev => ({ ...prev, [boardId]: newLists }));
  };

  // 1. Loading State
  if (!board) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <h1 className="text-white font-black tracking-widest uppercase text-xs">Syncing Workspace...</h1>
      </div>
    );
  }

  // --- 1. DRAG AND DROP API ---
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceListIndex = lists.findIndex(l => l.id === source.droppableId || l._id === source.droppableId);
    const destListIndex = lists.findIndex(l => l.id === destination.droppableId || l._id === destination.droppableId);
    
    if (source.droppableId !== destination.droppableId) {
      const destList = lists[destListIndex];
      if (destList.wipLimit && destList.cards.length >= destList.wipLimit) {
        alert(`WIP Limit Reached! The "${destList.title}" list cannot hold more than ${destList.wipLimit} tasks.`);
        return; 
      }
    }

    const newLists = [...lists];
    const sourceCards = [...newLists[sourceListIndex].cards];
    const destCards = source.droppableId === destination.droppableId ? sourceCards : [...newLists[destListIndex].cards];
    
    const [movedCard] = sourceCards.splice(source.index, 1);
    destCards.splice(destination.index, 0, movedCard);
    
    newLists[sourceListIndex].cards = sourceCards;
    newLists[destListIndex].cards = destCards;
    setLists(newLists);

    if (source.droppableId !== destination.droppableId) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/cards/${movedCard.id || movedCard._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ listId: destination.droppableId })
        });
        if (addActivity) addActivity({ text: `Moved "${movedCard.content}" to ${newLists[destListIndex].title}`, type: 'card' });
      } catch (error) {
        console.error("Failed to update database after drag.");
      }
    }
  };

  // --- 2. ADD CARD API ---
  const handleAddCard = async (listId) => {
    const list = lists.find(l => l.id === listId || l._id === listId);
    if (list.wipLimit && list.cards.length >= list.wipLimit) {
      alert(`WIP Limit Reached! Please complete a task in "${list.title}" before adding a new one.`);
      return;
    }

    const content = window.prompt("Task Title:");
    if (!content) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ listId: listId, content: content, label: '', dueDate: '', description: '' })
      });
      
      if (response.ok) {
        const newCard = await response.json();
        newCard.id = newCard._id; 
        setLists(lists.map(l => (l.id === listId || l._id === listId) ? { ...l, cards: [...l.cards, newCard] } : l));
        if (addActivity) addActivity({ text: `Added card "${content}"`, type: 'card' });
      }
    } catch (error) {
      alert("Failed to create task card.");
    }
  };

  // --- 3. ADD LIST API ---
  const handleAddList = async () => {
    const title = window.prompt("List Title:");
    if (!title) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ boardId: board.id || board._id, title: title, wipLimit: null })
      });
      
      if (response.ok) {
        const newList = await response.json();
        newList.id = newList._id;
        newList.cards = []; 
        setLists([...lists, newList]);
        if (addActivity) addActivity({ text: `Created list "${title}"`, type: 'list' });
      }
    } catch (error) {
      alert("Failed to create list.");
    }
  };

  // --- DELETE LIST API ---
  const handleDeleteList = async (listId) => {
    const list = lists.find(l => l.id === listId || l._id === listId);
    
    // Project Requirement: Only delete empty lists
    if (list.cards && list.cards.length > 0) {
      alert("According to your project requirements, you can only delete empty lists. Please move or delete the tasks first.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the empty list "${list.title}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/lists/${listId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setLists(lists.filter(l => l.id !== listId && l._id !== listId));
        if (addActivity) addActivity({ text: `Deleted list "${list.title}"`, type: 'list' });
      }
    } catch (error) {
      alert("Failed to delete list.");
    }
  };

  // --- 4. WIP LIMIT API ---
  const handleSetWipLimit = async (listId) => {
    const list = lists.find(l => l.id === listId || l._id === listId);
    const input = window.prompt(`Set maximum tasks for "${list.title}" (Leave blank to remove limit):`, list.wipLimit || '');
    if (input === null) return; 
    const finalLimit = isNaN(parseInt(input, 10)) ? null : parseInt(input, 10);

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ wipLimit: finalLimit })
      });
      setLists(lists.map(l => (l.id === listId || l._id === listId) ? { ...l, wipLimit: finalLimit } : l));
    } catch (error) {
      alert("Failed to update WIP limit.");
    }
  };

  // --- 5. UPDATE FIELD API ---
  const handleUpdateCardField = async (field, value) => {
    const cardId = selectedCard.id || selectedCard._id;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ [field]: value })
      });
      if (res.ok) {
        const updatedCard = await res.json();
        updatedCard.id = updatedCard._id;
        setLists(lists.map(l => ({ ...l, cards: l.cards.map(c => (c.id === cardId || c._id === cardId) ? updatedCard : c) })));
        setSelectedCard(updatedCard);
      }
    } catch (error) {
      alert("Failed to update card details.");
    }
  };

  // --- 6. DELETE API ---
  const handleDeleteCard = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    const cardId = selectedCard.id || selectedCard._id;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLists(lists.map(l => ({ ...l, cards: l.cards.filter(c => c.id !== cardId && c._id !== cardId) })));
      setSelectedCard(null); 
    } catch (error) {
      alert("Failed to delete card.");
    }
  };

  // --- 7. DUPLICATE API ---
  const handleDuplicateCard = async () => {
    const cardId = selectedCard.id || selectedCard._id;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/cards/${cardId}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const copiedCard = await res.json();
        copiedCard.id = copiedCard._id; 
        
        setLists(lists.map(l => {
          const holdsOriginalCard = l.cards.some(c => c.id === cardId || c._id === cardId);
          if (holdsOriginalCard) {
            return { ...l, cards: [...l.cards, copiedCard] };
          }
          return l;
        }));
        
        alert("Card duplicated!");
        setSelectedCard(null); 
      }
    } catch (error) {
      alert("Failed to duplicate card.");
    }
  };

  // --- 8. UPLOAD ATTACHMENTS API ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const cardId = selectedCard.id || selectedCard._id;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/cards/${cardId}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const updatedCard = await res.json();
        updatedCard.id = updatedCard._id;
        setLists(lists.map(l => ({ ...l, cards: l.cards.map(c => (c.id === cardId || c._id === cardId) ? updatedCard : c) })));
        setSelectedCard(updatedCard);
        alert("File attached successfully!");
      }
    } catch (error) {
      alert("Failed to upload attachment.");
    }
  };

  const getLabelColor = (label) => {
    switch(label) {
      case 'High Priority': return 'bg-rose-100 text-rose-700 ring-rose-200';
      case 'Feature': return 'bg-indigo-100 text-indigo-700 ring-indigo-200';
      case 'Design': return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
      case 'Bug': return 'bg-amber-100 text-amber-700 ring-amber-200';
      default: return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  };

  return (
    <div className="h-screen bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000')] bg-cover bg-center flex flex-col relative font-sans overflow-hidden">
      <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[2px] -z-10"></div>
      
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/boards')} className="p-2.5 bg-white/20 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all text-white border border-white/10"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-lg font-black text-white drop-shadow-md">{board.title}</h1>
            <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest drop-shadow-sm">Active Workspace</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 border-2 border-white/50 flex items-center justify-center text-xs font-black text-white shadow-md">
            {user?.name?.[0] || 'U'}
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-8 scrollbar-hide">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-8 items-start h-full">
            {lists.map((list) => {
              const listId = list.id || list._id;
              const isAtLimit = list.wipLimit && list.cards.length >= list.wipLimit;
              return (
                <div key={listId} className={`bg-white/80 backdrop-blur-xl border-2 w-[320px] rounded-[32px] flex flex-col flex-shrink-0 shadow-xl overflow-hidden transition-all ${isAtLimit ? 'border-rose-400/50' : 'border-white'}`}>
                  <div className={`p-6 flex justify-between items-center ${isAtLimit ? 'bg-rose-50/50' : 'bg-white/40'}`}>
                    <div className="flex items-center gap-2">
                      <h2 className="font-black text-slate-800 text-xs tracking-[0.15em] uppercase">{list.title}</h2>
                      {isAtLimit && <AlertTriangle size={14} className="text-rose-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${isAtLimit ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>{list.cards.length} {list.wipLimit ? `/ ${list.wipLimit}` : ''}</span>
                      <button onClick={() => handleSetWipLimit(listId)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Set WIP Limit"><Settings size={14} /></button>
                      <button onClick={() => handleDeleteList(listId)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete List"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <Droppable droppableId={String(listId)}>
                    {(provided, snapshot) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className={`p-4 overflow-y-auto space-y-4 min-h-[150px] ${snapshot.isDraggingOver && isAtLimit ? 'bg-rose-50/30' : ''}`}>
                        {list.cards.map((card, index) => {
                          const cardId = String(card.id || card._id);
                          return (
                            <Draggable key={cardId} draggableId={cardId} index={index}>
                                {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => setSelectedCard(card)}
                                    className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-indigo-500 z-50' : ''}`}
                                >
                                    {card.label && <span className={`text-[9px] px-2 py-1 rounded-md font-black tracking-widest uppercase ring-1 mb-3 inline-block ${getLabelColor(card.label)}`}>{card.label}</span>}
                                    <p className="text-sm font-bold text-slate-800 leading-relaxed mb-4">{card.content}</p>
                                    <div className="flex items-center justify-between text-slate-400">
                                    <div className="flex items-center gap-3">
                                        {card.dueDate && <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg"><Calendar size={12} /> {card.dueDate}</div>}
                                        {card.attachments?.length > 0 && <div className="flex items-center gap-1 text-[10px] font-bold"><Paperclip size={12} /> {card.attachments.length}</div>}
                                    </div>
                                    </div>
                                </div>
                                )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <button onClick={() => handleAddCard(listId)} disabled={isAtLimit} className={`m-4 p-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all flex items-center justify-center gap-2 ${isAtLimit ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-50/50 text-slate-700 border-dashed border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-transparent'}`}><Plus size={14} /> {isAtLimit ? 'Limit Reached' : 'Add Task'}</button>
                </div>
              );
            })}
            <button onClick={handleAddList} className="w-[320px] bg-white/10 backdrop-blur-md border-2 border-dashed border-white/40 text-white shadow-lg rounded-[32px] p-8 font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-3"><Plus size={20} /> New List</button>
          </div>
        </DragDropContext>
      </div>

      {selectedCard && (
         <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative">
             <div className="p-10 border-b border-slate-100">
               <div className="flex justify-between items-start mb-4">
                 <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedCard.content}</h2>
                 <button onClick={() => setSelectedCard(null)} className="text-slate-300 hover:text-rose-500 transition-colors text-2xl">✕</button>
               </div>
               {selectedCard.label && <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${getLabelColor(selectedCard.label)}`}>{selectedCard.label}</span>}
             </div>
             
             <div className="p-10 grid grid-cols-3 gap-10">
               <div className="col-span-2 space-y-8">
                 <div>
                   <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4">Description</h3>
                   <textarea defaultValue={selectedCard.description} onBlur={(e) => handleUpdateCardField('description', e.target.value)} className="w-full border border-slate-100 rounded-2xl p-6 text-sm text-slate-800 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none font-medium" rows="4" placeholder="Add a detailed description..."></textarea>
                 </div>
                 
                 <div>
                   <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4">Attachments</h3>
                   <div className="space-y-2 mb-4">
                     {selectedCard.attachments?.map((file, idx) => (
                       <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                         <div className="flex items-center gap-2 overflow-hidden"><Paperclip size={14} className="text-indigo-500" /><span className="text-xs font-bold text-slate-700 truncate">{file.fileName}</span></div>
                         <a href={`http://localhost:5000/${file.filePath}`} target="_blank" rel="noreferrer" className="text-[10px] font-black text-indigo-600 hover:underline uppercase">View</a>
                       </div>
                     ))}
                   </div>
                   <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                   <label htmlFor="file-upload" className="block border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 cursor-pointer transition-all"><Plus size={24} className="mx-auto mb-2 opacity-30" /> Upload Files</label>
                 </div>
               </div>

               <div className="space-y-6">
                 <div>
                   <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4">Actions</h3>
                   <div className="space-y-5">
                     <div>
                       <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Set Label:</p>
                       <div className="flex flex-wrap gap-2">
                         <button onClick={() => handleUpdateCardField('label', 'High Priority')} className="text-[9px] px-2 py-1.5 rounded-md font-black tracking-widest uppercase bg-rose-100 text-rose-700 hover:ring-2 hover:ring-rose-300 transition-all">High Priority</button>
                         <button onClick={() => handleUpdateCardField('label', 'Feature')} className="text-[9px] px-2 py-1.5 rounded-md font-black tracking-widest uppercase bg-indigo-100 text-indigo-700 hover:ring-2 hover:ring-indigo-300 transition-all">Feature</button>
                         <button onClick={() => handleUpdateCardField('label', 'Design')} className="text-[9px] px-2 py-1.5 rounded-md font-black tracking-widest uppercase bg-emerald-100 text-emerald-700 hover:ring-2 hover:ring-emerald-300 transition-all">Design</button>
                         <button onClick={() => handleUpdateCardField('label', 'Bug')} className="text-[9px] px-2 py-1.5 rounded-md font-black tracking-widest uppercase bg-amber-100 text-amber-700 hover:ring-2 hover:ring-amber-300 transition-all">Bug</button>
                         <button onClick={() => handleUpdateCardField('label', '')} className="text-[9px] px-2 py-1.5 rounded-md font-black tracking-widest uppercase bg-slate-100 text-slate-500 hover:ring-2 hover:ring-slate-300 transition-all">Clear</button>
                       </div>
                     </div>

                     <div>
                       <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Set Due Date:</p>
                       <input 
                         type="date" 
                         onChange={(e) => {
                           if (!e.target.value) return;
                           const [y, m, d] = e.target.value.split('-');
                           const dateObj = new Date(Date.UTC(y, m - 1, d));
                           const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
                           handleUpdateCardField('dueDate', formatted);
                         }}
                         className="w-full bg-slate-50 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400 transition-all cursor-pointer"
                       />
                     </div>

                     <div className="pt-2">
                       <button onClick={handleDuplicateCard} className="w-full bg-slate-50 text-slate-700 text-[10px] font-black py-3 px-4 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left uppercase tracking-widest border border-slate-100">
                         📋 Duplicate Task
                       </button>
                     </div>
                   </div>
                 </div>

                 <div className="pt-6 border-t border-slate-100">
                   <button onClick={handleDeleteCard} className="w-full bg-rose-50 text-rose-600 text-[10px] font-black py-3 px-4 rounded-xl hover:bg-rose-100 transition-all text-left uppercase tracking-widest">
                     🗑️ Delete Task
                   </button>
                 </div>
               </div>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}