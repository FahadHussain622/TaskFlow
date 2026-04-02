import React, { useState } from 'react';
import Auth          from './components/auth/Auth';
import HomeDashboard from './components/dashboard/HomeDashboard';
import BoardDashboard from './components/boards/BoardDashboard';
import BoardWorkspace from './components/lists/BoardWorkspace';
import SearchFilter  from './components/search/SearchFilter';
import UserProfile   from './components/profile/UserProfile';


export default function App() {
  const [user,        setUser]        = useState(null);
  const [view,        setView]        = useState('home');
  const [activeBoard, setActiveBoard] = useState(null);
  const [searchOpen,  setSearchOpen]  = useState(false);

  const [boards, setBoards] = useState([
    { id: 'b1', title: 'Web Engineering Project', desc: 'MERN Stack Development', isArchived: false },
  ]);

  const [boardData, setBoardData] = useState({
    'b1': [
      {
        id: 'list-1',
        title: 'To Do',
        cards: [
          { id: 'c-1', content: 'Design MongoDB Schema', label: 'High Priority', dueDate: 'Apr 10', comments: 2, attachments: 1, description: 'Define collections for users and tasks.' },
          { id: 'c-2', content: 'Setup API Routes',      label: 'Feature',       dueDate: 'Apr 12', comments: 0, attachments: 0, description: '' },
        ],
      },
      { id: 'list-2', title: 'In Progress', cards: [] },
    ],
  });

  const [pinnedBoards, setPinnedBoards] = useState(new Set(['b1']));

  const [activity, setActivity] = useState([
    { id: 'a3', text: 'Added task "Setup API Routes" to Web Engineering Project',      time: '1 day ago',  type: 'card'  },
    { id: 'a2', text: 'Added task "Design MongoDB Schema" to Web Engineering Project', time: '2 days ago', type: 'card'  },
    { id: 'a1', text: 'Created board "Web Engineering Project"',                       time: '2 days ago', type: 'board' },
  ]);

  const addActivity = (entry) =>
    setActivity(prev => [{ ...entry, id: `a-${Date.now()}-${Math.random()}`, time: 'just now' }, ...prev]);

  const handleTogglePin = (boardId) => {
    const name = boards.find(b => b.id === boardId)?.title ?? '';
    setPinnedBoards(prev => {
      const next = new Set(prev);
      if (next.has(boardId)) { next.delete(boardId); addActivity({ text: `Unpinned "${name}"`, type: 'pin' }); }
      else                   { next.add(boardId);    addActivity({ text: `Pinned "${name}"`,   type: 'pin' }); }
      return next;
    });
  };

  const handleCreateBoard = (title) => {
    const id = `b${Date.now()}`;
    // Added isArchived: false here
    setBoards(prev => [...prev, { id, title, desc: 'Project Workspace', isArchived: false }]);
    addActivity({ text: `Created board "${title}"`, type: 'board' });
  };

  const openBoard = (board) => { setActiveBoard(board); setView('workspace'); };
  const goHome    = ()       => { setActiveBoard(null);  setView('home');      };
  const goBoards  = ()       => { setActiveBoard(null);  setView('boards');    };
  const goProfile = ()       => setView('profile');
  const doLogout  = ()       => { setUser(null); setView('home'); setActiveBoard(null); };

  const searchOverlay = searchOpen && (
    <SearchFilter
      boards={boards}
      boardData={boardData}
      onClose={() => setSearchOpen(false)}
      onSelectBoard={(board) => { openBoard(board); setSearchOpen(false); }}
    />
  );

  if (!user) return <Auth onLogin={(u) => setUser(u)} />;

  if (view === 'profile') return (
    <>
      <UserProfile
        user={user} setUser={setUser}
        boards={boards} boardData={boardData}
        goBack={goHome} onLogout={doLogout}
      />
      {searchOverlay}
    </>
  );

  if (view === 'workspace' && activeBoard) {
    const activeLists = boardData[activeBoard.id] || [
      { id: `l1-${Date.now()}`, title: 'To Do',       cards: [] },
      { id: `l2-${Date.now()}`, title: 'In Progress', cards: [] },
    ];
    return (
      <>
        <BoardWorkspace
          board={activeBoard}
          goBack={goHome}
          lists={activeLists}
          setLists={(nl) => setBoardData(prev => ({ ...prev, [activeBoard.id]: nl }))}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenProfile={goProfile}
          user={user}
          addActivity={addActivity}
        />
        {searchOverlay}
      </>
    );
  }

  if (view === 'boards') return (
    <>
      <BoardDashboard
        user={user}
        boards={boards}
        setBoards={setBoards} // Passed setBoards so BoardDashboard can Delete/Archive
        pinnedBoards={pinnedBoards}
        onTogglePin={handleTogglePin}
        onCreateBoard={handleCreateBoard}
        onLogout={doLogout}
        onSelectBoard={openBoard}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenProfile={goProfile}
        goHome={goHome}
      />
      {searchOverlay}
    </>
  );

  return (
    <>
      <HomeDashboard
        user={user}
        boards={boards}
        boardData={boardData}
        pinnedBoards={pinnedBoards}
        onTogglePin={handleTogglePin}
        activity={activity}
        onSelectBoard={openBoard}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenProfile={goProfile}
        onGoToBoards={goBoards}
        onLogout={doLogout}
      />
      {searchOverlay}
    </>
  );
}