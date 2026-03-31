import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ArrowLeft, Plus, MessageSquare, Paperclip, Calendar, Search } from 'lucide-react';

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export default function BoardWorkspace({
  board, goBack, lists, setLists, onOpenSearch, onOpenProfile, user,
}) {
  const [selectedCard, setSelectedCard] = useState(null);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    const srcIdx  = lists.findIndex(l => l.id === source.droppableId);
    const dstIdx  = lists.findIndex(l => l.id === destination.droppableId);
    const newLists = [...lists];
    const srcCards = [...newLists[srcIdx].cards];
    const dstCards = source.droppableId === destination.droppableId
      ? srcCards
      : [...newLists[dstIdx].cards];
    const [moved] = srcCards.splice(source.index, 1);
    dstCards.splice(destination.index, 0, moved);
    newLists[srcIdx].cards = srcCards;
    newLists[dstIdx].cards = dstCards;
    setLists(newLists);
  };

  const handleAddCard = (listId) => {
    const content = window.prompt('Task Title:');
    if (!content) return;
    setLists(lists.map(list =>
      list.id === listId
        ? { ...list, cards: [...list.cards, { id: `c-${Date.now()}`, content, label: '', dueDate: '', comments: 0, attachments: 0, description: '' }] }
        : list
    ));
  };

  const handleAddList = () => {
    const title = window.prompt('List Title:');
    if (!title) return;
    setLists([...lists, { id: `list-${Date.now()}`, title, cards: [] }]);
  };

  const getLabelColor = (label) => {
    switch (label) {
      case 'High Priority': return 'bg-rose-100 text-rose-700 ring-rose-200';
      case 'Feature':       return 'bg-indigo-100 text-indigo-700 ring-indigo-200';
      case 'Design':        return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
      default:              return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  };

  return (
    <div className="h-screen bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000')] bg-cover bg-center flex flex-col relative font-sans overflow-hidden">
      <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[2px] -z-10" />

      <header className="bg-white/80 backdrop-blur-xl border-b border-white p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            className="p-2.5 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all text-slate-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-800">{board.title}</h1>
            <p className="text-[10px] font-black text-black uppercase tracking-widest">Active Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-slate-100 hover:bg-indigo-600 hover:text-white
                       text-slate-500 px-4 py-2.5 rounded-xl transition-all text-[10px] font-black
                       uppercase tracking-widest"
            title="Search & Filter tasks"
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
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              : <span>{initials(user?.name)}</span>
            }
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-8 scrollbar-hide">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-8 items-start h-full">
            {lists.map((list) => (
              <div
                key={list.id}
                className="bg-white/70 backdrop-blur-xl border border-white w-[320px] rounded-[32px]
                           flex flex-col flex-shrink-0 shadow-xl overflow-hidden"
              >
                <div className="p-6 flex justify-between items-center bg-white/40">
                  <h2 className="font-black text-slate-700 text-xs tracking-[0.15em] uppercase">{list.title}</h2>
                  <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
                    {list.cards.length}
                  </span>
                </div>

                <Droppable droppableId={list.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="p-4 overflow-y-auto space-y-4 min-h-[150px]"
                    >
                      {list.cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedCard(card)}
                              className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100
                                          hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group
                                          ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-indigo-500' : ''}`}
                            >
                              {card.label && (
                                <span className={`text-[9px] px-2 py-1 rounded-md font-black tracking-widest uppercase ring-1 mb-3 inline-block ${getLabelColor(card.label)}`}>
                                  {card.label}
                                </span>
                              )}
                              <p className="text-sm font-bold text-slate-700 leading-relaxed mb-4">{card.content}</p>
                              <div className="flex items-center gap-3 text-slate-400">
                                {card.dueDate     && <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg"><Calendar size={12} /> {card.dueDate}</div>}
                                {card.comments    > 0 && <div className="flex items-center gap-1 text-[10px] font-bold"><MessageSquare size={12} /> {card.comments}</div>}
                                {card.attachments > 0 && <div className="flex items-center gap-1 text-[10px] font-bold"><Paperclip size={12} /> {card.attachments}</div>}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <button
                  onClick={() => handleAddCard(list.id)}
                  className="m-4 p-4 bg-slate-50/50 text-black text-[10px] font-black uppercase tracking-widest
                             hover:bg-indigo-600 hover:text-white rounded-2xl border border-dashed border-slate-200
                             transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Add Task
                </button>
              </div>
            ))}

            <button
              onClick={handleAddList}
              className="w-[320px] bg-white/40 border-2 border-dashed border-white text-black rounded-[32px]
                         p-8 font-black text-xs uppercase tracking-widest hover:bg-white/80 transition-all
                         flex items-center justify-center gap-3"
            >
              <Plus size={20} /> New List
            </button>
          </div>
        </DragDropContext>
      </div>

      {selectedCard && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative">
            <div className="p-10 border-b border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedCard.content}</h2>
                <button onClick={() => setSelectedCard(null)} className="text-slate-300 hover:text-rose-500 transition-colors text-2xl">✕</button>
              </div>
              {selectedCard.label && (
                <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${getLabelColor(selectedCard.label)}`}>
                  {selectedCard.label}
                </span>
              )}
            </div>

            <div className="p-10 grid grid-cols-3 gap-10">
              <div className="col-span-2 space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4">Description</h3>
                  <textarea
                    defaultValue={selectedCard.description}
                    className="w-full border border-slate-100 rounded-2xl p-6 text-sm text-slate-600
                               bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white
                               transition-all resize-none"
                    rows="4"
                    placeholder="Add a detailed description..."
                  />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4">Attachments</h3>
                  <div className="border-2 border-dashed border-slate-100 rounded-3xl p-10 text-center text-[10px]
                                  font-black text-slate-400 uppercase tracking-widest hover:bg-indigo-50
                                  hover:border-indigo-200 hover:text-indigo-600 cursor-pointer transition-all">
                    <Plus size={24} className="mx-auto mb-2 opacity-30" />
                    Upload Files
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-slate-50 text-black text-[10px] font-black py-3 px-4 rounded-xl hover:bg-slate-100 transition-all text-left uppercase tracking-widest">🏷️ Labels</button>
                    <button className="w-full bg-slate-50 text-black text-[10px] font-black py-3 px-4 rounded-xl hover:bg-slate-100 transition-all text-left uppercase tracking-widest">📅 Due Date</button>
                  </div>
                </div>
                <div className="pt-8 border-t border-slate-100">
                  <button className="w-full bg-rose-50 text-rose-600 text-[10px] font-black py-3 px-4 rounded-xl hover:bg-rose-100 transition-all text-left uppercase tracking-widest">🗑️ Delete Card</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
