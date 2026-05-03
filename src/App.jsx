import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Auth          from './components/auth/Auth';
import HomeDashboard from './components/dashboard/HomeDashboard';
import BoardDashboard from './components/boards/BoardDashboard';
import BoardWorkspace from './components/lists/BoardWorkspace';
import SearchFilter  from './components/search/SearchFilter';
import UserProfile   from './components/profile/UserProfile';

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [boards, setBoards] = useState([]);
  const [boardData, setBoardData] = useState({});
  const [pinnedBoards, setPinnedBoards] = useState(new Set());
  const [activity, setActivity] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchMyData = useCallback(async () => {
    if (!user) return;
    const token = localStorage.getItem('token');
    
    try {
      // Fetch Boards
      const response = await fetch('http://localhost:5000/api/boards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const myBoards = await response.json();
        const formattedBoards = myBoards.map(b => ({ ...b, id: b._id }));
        setBoards(formattedBoards);

        // Fetch Lists and Cards for every board
        const loadedBoardData = {};
        for (let board of myBoards) {
          try {
            const listRes = await fetch(`http://localhost:5000/api/lists?boardId=${board._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (listRes.ok) {
              const myLists = await listRes.json();
              loadedBoardData[board._id] = myLists.map(l => ({
                ...l,
                id: l._id,
                cards: (l.cards || []).map(c => ({ ...c, id: c._id }))
              }));
            }
          } catch (err) {
            loadedBoardData[board._id] = [];
          }
        }
        setBoardData(loadedBoardData);
      }
    } catch (error) {
      console.error("Data restoration failed:", error);
    }
  }, [user]);

  // --- TRIGGER FETCH ON MOUNT OR LOGIN ---
  useEffect(() => {
    if (user) {
      fetchMyData();
    }
  }, [user, fetchMyData]);

  const addActivity = (entry) =>
    setActivity(prev => [{ ...entry, id: `a-${Date.now()}-${Math.random()}`, time: 'just now' }, ...prev]);

  const handleTogglePin = (boardId) => {
    const name = boards.find(b => b.id === boardId)?.title ?? '';
    setPinnedBoards(prev => {
      const next = new Set(prev);
      if (next.has(boardId)) next.delete(boardId);
      else next.add(boardId);
      return next;
    });
  };

  const handleCreateBoard = async (title) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: title, desc: 'Project Workspace', color: '#ffffff' })
      });
      
      if (response.ok) {
        const newBoard = await response.json();
        newBoard.id = newBoard._id; 
        setBoards(prev => [...prev, newBoard]);
        fetchMyData(); // Refresh data to include new board structure
      }
    } catch (error) {
      alert("Failed to save board.");
    }
  };

  const doLogout = () => { 
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    setUser(null); 
    setBoards([]);
    setBoardData({});
    navigate('/login');
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={
          !user ? <Auth onLogin={(u) => setUser(u)} /> : <Navigate to="/" />
        } />

        <Route path="/" element={
          user ? (
            <HomeDashboard
              user={user}
              boards={boards}
              boardData={boardData}
              pinnedBoards={pinnedBoards}
              onTogglePin={handleTogglePin}
              activity={activity}
              onOpenSearch={() => setSearchOpen(true)}
              onLogout={doLogout}
            />
          ) : <Navigate to="/login" />
        } />

        <Route path="/boards" element={
          user ? (
            <BoardDashboard
              user={user}
              boards={boards}
              setBoards={setBoards}
              pinnedBoards={pinnedBoards}
              onTogglePin={handleTogglePin}
              onCreateBoard={handleCreateBoard}
              onLogout={doLogout}
              onOpenSearch={() => setSearchOpen(true)}
            />
          ) : <Navigate to="/login" />
        } />

        {/* THIS IS THE ROUTE WE ARE MATCHING! -> /b/:boardId */}
        <Route path="/b/:boardId" element={
          user ? (
            <BoardWorkspace
              boards={boards}
              boardData={boardData}
              setBoardData={setBoardData}
              onOpenSearch={() => setSearchOpen(true)}
              user={user}
              addActivity={addActivity}
            />
          ) : <Navigate to="/login" />
        } />

        <Route path="/profile" element={
          user ? (
            <UserProfile
              user={user} setUser={setUser}
              boards={boards} boardData={boardData}
              onLogout={doLogout}
            />
          ) : <Navigate to="/login" />
        } />

        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>

      {/* CLEANED UP: The new API-powered SearchFilter only needs onClose! */}
      {searchOpen && user && (
        <SearchFilter onClose={() => setSearchOpen(false)} />
      )}
    </>
  );
}