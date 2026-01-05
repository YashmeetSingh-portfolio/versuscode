import React from 'react';
import './App.css';
import { RoomProvider } from './context/RoomContext';
import LandingPage from './components/LandingPage';
import Lobby from './components/Lobby';
import CodingEnvironment from './components/CodingEnvironment';
import Leaderboard from './components/Leaderboard';
import { useRoom } from './context/RoomContext';

const AppContent: React.FC = () => {
  const { room } = useRoom();

  if (!room) return <div className="min-h-screen p-4 flex flex-col"><LandingPage /></div>;

  if (room.status === 'lobby') return <div className="min-h-screen p-4 flex flex-col"><Lobby /></div>;

  if (room.status === 'finished') return <div className="min-h-screen p-4 flex flex-col"><Leaderboard /></div>;


  return <CodingEnvironment />;
};


function App() {
  return (
    <RoomProvider>
      <AppContent />
    </RoomProvider>
  );
}

export default App;
