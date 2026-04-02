import React, { useMemo } from 'react';
import {
  Search, Star, LayoutDashboard, Plus, Calendar,
  ArrowRight, ListTodo, AlertCircle, CheckCircle2,
  Clock, LogOut, User, Layers,
} from 'lucide-react';


const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function parseCardDate(str) {
  if (!str) return null;
  const [mon, day] = str.trim().split(' ');
  const month = MONTHS.indexOf(mon);
  const d = parseInt(day, 10);
  if (month === -1 || isNaN(d)) return null;
  return new Date(new Date().getFullYear(), month, d);
}

function isThisWeek(dateStr) {
  const d = parseCardDate(dateStr);
  if (!d) return false;
  const now = new Date();
  const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0);
  const end   = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
  return d >= start && d <= end;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getToday() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function boardTaskCount(boardId, boardData) {
  return (boardData[boardId] || []).reduce((sum, list) => sum + list.cards.length, 0);
}

function boardDoneCount(boardId, boardData) {
  return (boardData[boardId] || [])
    .filter(l => ['done','completed','finished'].some(k => l.title.toLowerCase().includes(k)))
    .reduce((sum, list) => sum + list.cards.length, 0);
}


const ACTIVITY_DOT = {
  board:  'bg-indigo-500',
  card:   'bg-emerald-500',
  list:   'bg-amber-400',
  pin:    'bg-rose-400',
  delete: 'bg-rose-500',
};

// Updated: Section headings are now white with a subtle drop shadow
function SectionHeading({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-[10px] font-black text-white uppercase tracking-[0.18em] drop-shadow-md">{children}</h2>
      {action}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, accent, sub }) {
  const accents = {
    indigo: { ring: 'ring-indigo-100', icon: 'text-indigo-500 bg-indigo-50',  num: 'text-indigo-700' },
    emerald:{ ring: 'ring-emerald-100',icon: 'text-emerald-500 bg-emerald-50',num: 'text-emerald-700' },
    amber:  { ring: 'ring-amber-100',  icon: 'text-amber-500 bg-amber-50',    num: 'text-amber-700'   },
    rose:   { ring: 'ring-rose-100',   icon: 'text-rose-500 bg-rose-50',      num: 'text-rose-700'    },
  };
  const c = accents[accent] || accents.indigo;

  return (
    <div className={`bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm ring-1 ${c.ring} flex flex-col gap-3`}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${c.icon}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className={`text-3xl font-black leading-none ${c.num}`}>{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
        {sub != null && (
          <p className="text-[10px] font-medium text-slate-300 mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

function BoardCard({ board, boardData, pinned, onSelect, onTogglePin, large }) {
  const total = boardTaskCount(board.id, boardData);
  const done  = boardDoneCount(board.id, boardData);
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div
      onClick={() => onSelect(board)}
      className={`relative bg-white/75 backdrop-blur-xl border border-white rounded-3xl shadow-md
                  hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all cursor-pointer group
                  ${large ? 'p-7' : 'p-6'}`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onTogglePin(board.id); }}
        title={pinned ? 'Unpin board' : 'Pin board'}
        className={`absolute top-4 right-4 p-1.5 rounded-xl transition-all
          ${pinned
            ? 'text-amber-400 bg-amber-50 hover:bg-amber-100'
            : 'text-slate-200 hover:text-amber-400 hover:bg-amber-50 opacity-0 group-hover:opacity-100'
          }`}
      >
        <Star size={14} fill={pinned ? 'currentColor' : 'none'} />
      </button>

      <div className="w-8 h-1 bg-indigo-400 rounded-full mb-4 group-hover:w-full transition-all duration-500 opacity-40" />

      <h3 className={`font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight mb-1
                      ${large ? 'text-lg' : 'text-base'}`}>
        {board.title}
      </h3>
      <p className="text-xs font-medium text-slate-400 mb-4 truncate">{board.desc}</p>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex-shrink-0">
          {total} task{total !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

// Updated: Activity text and divider line changed to white/translucent white
function ActivityItem({ item, isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${ACTIVITY_DOT[item.type] || 'bg-slate-300'}`} />
        {!isLast && <div className="w-px flex-1 bg-white/20 mt-1" />}
      </div>

      <div className={`pb-5 ${isLast ? '' : ''}`}>
        <p className="text-xs font-bold text-white leading-snug drop-shadow-sm">{item.text}</p>
        <p className="text-[10px] font-medium text-slate-200 mt-1 flex items-center gap-1">
          <Clock size={10} /> {item.time}
        </p>
      </div>
    </div>
  );
}


export default function HomeDashboard({
  user,
  boards,
  boardData,
  pinnedBoards,
  onTogglePin,
  activity,
  onSelectBoard,
  onOpenSearch,
  onOpenProfile,
  onGoToBoards,
  onLogout,
}) {
  const stats = useMemo(() => {
    const allCards = [];
    let completed = 0;

    Object.entries(boardData).forEach(([, lists]) => {
      lists.forEach(list => {
        const isDone = ['done','completed','finished'].some(k => list.title.toLowerCase().includes(k));
        list.cards.forEach(card => {
          allCards.push(card);
          if (isDone) completed++;
        });
      });
    });

    return {
      boards:      boards.length,
      total:       allCards.length,
      completed,
      highPri:     allCards.filter(c => c.label === 'High Priority').length,
      dueThisWeek: allCards.filter(c => isThisWeek(c.dueDate)).length,
    };
  }, [boards, boardData]);

  const pinnedList   = boards.filter(b => pinnedBoards.has(b.id));
  const recentBoards = boards.slice(0, 4); 

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000')] bg-cover bg-center bg-fixed p-8 font-sans relative">
      <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[2px] -z-10" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">

        <header className="flex items-center justify-between bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">TaskFlow</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Home Dashboard</p>
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
              onClick={onGoToBoards}
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white
                         text-indigo-600 px-4 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <Layers size={14} />
              <span className="hidden sm:inline">All Boards</span>
            </button>

            <button
              onClick={onOpenProfile}
              className="w-10 h-10 rounded-2xl bg-indigo-600 border-2 border-white flex items-center
                         justify-center text-xs font-black text-white hover:ring-2 hover:ring-indigo-400
                         transition-all overflow-hidden shadow-md"
              title="My Profile"
            >
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                : <span>{initials(user?.name)}</span>
              }
            </button>

            <button
              onClick={onLogout}
              className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-sm">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">{getToday()}</p>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm font-medium text-slate-400 mt-1">
            {stats.total === 0
              ? 'No tasks yet — create a board to get started.'
              : `You have ${stats.total} task${stats.total !== 1 ? 's' : ''} across ${stats.boards} board${stats.boards !== 1 ? 's' : ''}.`}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <StatCard icon={LayoutDashboard} value={stats.boards}      label="Boards"        accent="indigo" />
          <StatCard icon={ListTodo}        value={stats.total}        label="Total Tasks"   accent="indigo"
                    sub={stats.completed > 0 ? `${stats.completed} completed` : null} />
          <StatCard icon={AlertCircle}     value={stats.highPri}      label="High Priority" accent="rose" />
          <StatCard icon={Calendar}        value={stats.dueThisWeek}  label="Due This Week" accent="amber" />
        </div>

        {pinnedList.length > 0 && (
          <section>
            <SectionHeading>
              <span className="flex items-center gap-2">
                <Star size={12} className="text-amber-400" fill="currentColor" />
                Pinned Boards
              </span>
            </SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pinnedList.map(board => (
                <BoardCard
                  key={board.id}
                  board={board}
                  boardData={boardData}
                  pinned
                  onSelect={onSelectBoard}
                  onTogglePin={onTogglePin}
                  large
                />
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          <section>
            <SectionHeading action={
              <button
                onClick={onGoToBoards}
                className="flex items-center gap-1 text-[10px] font-black text-indigo-300 hover:text-white
                           uppercase tracking-widest transition-colors drop-shadow-md"
              >
                Manage <ArrowRight size={12} />
              </button>
            }>
              All Boards
            </SectionHeading>

            {boards.length === 0 ? (
              // Updated: Frosted glass container for white text readability
              <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-3xl p-12 text-center">
                <div className="text-4xl mb-3 drop-shadow-md">🗂️</div>
                <p className="font-black text-white text-xl mb-1 drop-shadow-md">No boards yet</p>
                <p className="text-xs text-slate-200 mb-5">Create your first board to start organising tasks.</p>
                <button
                  onClick={onGoToBoards}
                  className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest
                             px-6 py-3 rounded-2xl hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
                >
                  <Plus size={13} /> Create Board
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {recentBoards.map(board => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    boardData={boardData}
                    pinned={pinnedBoards.has(board.id)}
                    onSelect={onSelectBoard}
                    onTogglePin={onTogglePin}
                  />
                ))}

                <div
                  onClick={onGoToBoards}
                  className="bg-white/40 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col
                             items-center justify-center gap-2 cursor-pointer hover:bg-white/70 hover:border-indigo-300
                             transition-all group min-h-[120px]"
                >
                  <div className="w-9 h-9 rounded-2xl bg-slate-100 group-hover:bg-indigo-600 flex items-center
                                  justify-center transition-all">
                    <Plus size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 group-hover:text-indigo-600 uppercase tracking-widest transition-colors">
                    New Board
                  </p>
                </div>
              </div>
            )}
          </section>

          <section>
            <SectionHeading>Recent Activity</SectionHeading>

            {/* Updated: Frosted glass container for white text readability */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-lg">
              {activity.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-3 drop-shadow-md">💤</div>
                  <p className="text-xs font-bold text-white drop-shadow-md">No activity yet</p>
                </div>
              ) : (
                <div>
                  {activity.slice(0, 10).map((item, i) => (
                    <ActivityItem
                      key={item.id}
                      item={item}
                      isLast={i === Math.min(activity.length, 10) - 1}
                    />
                  ))}
                  {activity.length > 10 && (
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center pt-2">
                      + {activity.length - 10} more
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}