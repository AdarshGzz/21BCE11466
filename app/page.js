"use client"
import { useState, useEffect } from 'react';
import Board from '../components/Board';
import { initializeSocket } from '../lib/websocket';

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState(null);
  const [playingAs, setPlayingAs] = useState(null);

  useEffect(() => {
    const newSocket = initializeSocket();
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const handleStartGame = () => {
    if (!playerName) return;

    socket.emit('request_to_play', { playerName });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('OpponentFound', (data) => {
      setOpponentName(data.opponentName);
      setPlayingAs(data.playingAs);
      setGameState(data.initialGameState); // Set initial game state
    });

    socket.on('gameStateUpdate', (newState) => {
      setGameState(newState);
    });

    return () => {
      socket.off('OpponentFound');
      socket.off('gameStateUpdate');
    };
  }, [socket]);

  if (!playerName) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-6 bg-white rounded shadow-md">
          <input
            type="text"
            placeholder="Enter your name"
            className="p-2 border rounded"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button
            onClick={handleStartGame}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Play Online
          </button>
        </div>
      </div>
    );
  }

  if (!opponentName) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Waiting for opponent...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold mb-8">Chess-like Game</h1>
        <p className="mb-4">Playing as: {playingAs}</p>
        <p className="mb-4">Opponent: {opponentName}</p>
        {gameState && (
          <Board gameState={gameState} socket={socket} playingAs={playingAs} />
        )}
      </main>
    </div>
  );
}
