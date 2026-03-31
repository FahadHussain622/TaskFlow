import React, { useState } from 'react';
import Auth from './components/auth/Auth';
import BoardDashboard from './components/boards/BoardDashboard';
import BoardWorkspace from './components/lists/BoardWorkspace';
import SearchFilter from './components/search/SearchFilter';
import UserProfile from './components/profile/UserProfile';

export default function App() {
  const [user,        setUser]        = useState(null);
  const [activeBoard, setActiveBoard] = useState(null);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [boards, setBoards] = useState([
    { id: 'b1', title: 'Web Engineering Project', desc: 'MERN Stack Development' },
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

  const searchOverlay = searchOpen && (
    <SearchFilter
      boards={boards}
      boardData={boardData}
      onClose={() => setSearchOpen(false)}
      onSelectBoard={(board) => {
        setActiveBoard(board);
        setProfileOpen(false);
      }}
    />
  );

  if (!user) {
    return <Auth onLogin={(userData) => setUser(userData)} />;
  }

  if (profileOpen) {
    return (
      <>
        <UserProfile
          user={user}
          setUser={setUser}
          boards={boards}
          boardData={boardData}
          goBack={() => setProfileOpen(false)}
          onLogout={() => { setUser(null); setProfileOpen(false); }}
        />
        {searchOverlay}
      </>
    );
  }

  if (activeBoard) {
    const activeLists = boardData[activeBoard.id] || [
      { id: `l1-${Date.now()}`, title: 'To Do',       cards: [] },
      { id: `l2-${Date.now()}`, title: 'In Progress', cards: [] },
    ];

    return (
      <>
        <BoardWorkspace
          board={activeBoard}
          goBack={() => setActiveBoard(null)}
          lists={activeLists}
          setLists={(newLists) => setBoardData({ ...boardData, [activeBoard.id]: newLists })}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
          user={user}
        />
        {searchOverlay}
      </>
    );
  }

  return (
    <>
      <BoardDashboard
        user={user}
        boards={boards}
        setBoards={setBoards}
        onLogout={() => setUser(null)}
        onSelectBoard={(board) => setActiveBoard(board)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />
      {searchOverlay}
    </>
  );
}
