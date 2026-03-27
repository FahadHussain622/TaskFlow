import React, { useState } from 'react';
import Auth from './components/auth/Auth';
import BoardDashboard from './components/boards/BoardDashboard';
import BoardWorkspace from './components/lists/BoardWorkspace';

export default function App() {
  const [user, setUser] = useState(null); 
  const [activeBoard, setActiveBoard] = useState(null);

  const [boards, setBoards] = useState([
    { id: 'b1', title: 'Web Engineering Project', desc: 'MERN Stack Development' }
  ]);

  const [boardData, setBoardData] = useState({
    'b1': [
      { id: 'list-1', title: 'To Do', cards: [{ id: 'c-1', content: 'Design MongoDB Schema', label: 'High Priority', dueDate: 'Apr 10', comments: 2 }] },
      { id: 'list-2', title: 'In Progress', cards: [] }
    ]
  });

  if (!user) {
    return <Auth onLogin={(userData) => setUser(userData)} />;
  }

  if (activeBoard) {
    const activeLists = boardData[activeBoard.id] || [
      { id: `l1-${Date.now()}`, title: 'To Do', cards: [] },
      { id: `l2-${Date.now()}`, title: 'In Progress', cards: [] }
    ];

    return (
      <BoardWorkspace 
        board={activeBoard} 
        goBack={() => setActiveBoard(null)} 
        lists={activeLists}
        setLists={(newLists) => setBoardData({ ...boardData, [activeBoard.id]: newLists })}
      />
    );
  }

  return (
    <BoardDashboard 
      user={user} 
      boards={boards}
      setBoards={setBoards}
      onLogout={() => setUser(null)}
      onSelectBoard={(board) => setActiveBoard(board)} 
    />
  );
}