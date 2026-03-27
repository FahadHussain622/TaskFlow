import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ArrowLeft, Plus, MessageSquare, Calendar, MoreHorizontal } from 'lucide-react';

export default function BoardWorkspace({ board, goBack, lists, setLists }) {
  const [selectedCard, setSelectedCard] = useState(null);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    const sourceListIndex = lists.findIndex(l => l.id === source.droppableId);
    const destListIndex = lists.findIndex(l => l.id === destination.droppableId);
    const newLists = [...lists];
    const sourceCards = [...newLists[sourceListIndex].cards];
    const destCards = source.droppableId === destination.droppableId ? sourceCards : [...newLists[destListIndex].cards];
    const [movedCard] = sourceCards.splice(source.index, 1);
    destCards.splice(destination.index, 0, movedCard);
    newLists[sourceListIndex].cards = sourceCards;
    newLists[destListIndex].cards = destCards;
    setLists(newLists);
  };

  const handleAddCard = (listId) => {
    const content = window.prompt("Task Title:");
    if (!content) return;
    setLists(lists.map(list => 
      list.id === listId ? { ...list, cards: [...list.cards, { id: `c-${Date.now()}`, content, label: '', dueDate: '', comments: 0 }] } : list
    ));
  };

  const handleAddList = () => {
    const title = window.prompt("List Title:");
    if (!title) return;
    setLists([...lists, { id: `list-${Date.now()}`, title, cards: [] }]);
  };

  return (
    <div className="h-screen bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000')] bg-cover bg-center flex flex-col relative font-sans overflow-hidden">
      <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[2px] -z-10"></div>
      
      <header className="bg-white/80 backdrop-blur-xl border-b border-white p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="p-2.5 bg-slate-100 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all text-slate-500">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-800">{board.title}</h1>
            <p className="text-[10px] font-black text-black uppercase tracking-widest">Active Workspace</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-indigo-600 border-2 border-white flex items-center justify-center text-xs font-black text-white shadow-xl">F</div>
      </header>

      <div className="flex-1 overflow-x-auto p-8 scrollbar-hide">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-8 items-start h-full">
            {lists.map((list) => (
              <div key={list.id} className="bg-white/70 backdrop-blur-xl border border-white w-[320px] rounded-[32px] flex flex-col flex-shrink-0 shadow-xl overflow-hidden">
                <div className="p-6 flex justify-between items-center bg-white/40">
                  <h2 className="font-black text-slate-700 text-xs tracking-[0.15em] uppercase">{list.title}</h2>
                  <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">{list.cards.length}</span>
                </div>

                <Droppable droppableId={list.id}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="p-4 overflow-y-auto space-y-4 min-h-[150px]">
                      {list.cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedCard(card)}
                              className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-indigo-500' : ''}`}
                            >
                              <p className="text-sm font-bold text-slate-700 leading-relaxed mb-3">{card.content}</p>
                              <div className="flex items-center gap-3 text-slate-300">
                                <Calendar size={12} /> <span className="text-[10px] font-bold uppercase tracking-tighter">Apr 2026</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <button onClick={() => handleAddCard(list.id)} className="m-4 p-4 bg-slate-50/50 text-black text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white rounded-2xl border border-dashed border-slate-200 transition-all flex items-center justify-center gap-2">
                  <Plus size={14} /> Add Task
                </button>
              </div>
            ))}
            
            <button onClick={handleAddList} className="w-[320px] bg-white/40 border-2 border-dashed border-white text-black rounded-[32px] p-8 font-black text-xs uppercase tracking-widest hover:bg-white/80 transition-all flex items-center justify-center gap-3">
              <Plus size={20} /> New List
            </button>
          </div>
        </DragDropContext>
      </div>

      {selectedCard && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-xl rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] p-10 relative">
             <button onClick={() => setSelectedCard(null)} className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors">✕</button>
             <h2 className="text-3xl font-black text-slate-800 mb-4">{selectedCard.content}</h2>
             <div className="h-2 w-20 bg-indigo-600 rounded-full mb-8"></div>
             <p className="text-slate-400 font-medium leading-relaxed">Task details and activity logs will be connected in the next phase.</p>
          </div>
        </div>
      )}
    </div>
  );
}