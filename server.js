import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeGame, isValidMove, makeMove, checkWinCondition } from './lib/gameLogic.js';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

const waitingPlayers = [];
const activeGames = new Map();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('request_to_play', (data) => {
        console.log('Request to play received:', data, 'from socket:', socket.id);
        const { playerName } = data;

        if (waitingPlayers.length > 0) {
            const opponent = waitingPlayers.pop();
            console.log('Match found:', playerName, 'vs', opponent.playerName);

            const gameState = initializeGame();

            activeGames.set(socket.id, { opponent: opponent.socket, gameState });
            activeGames.set(opponent.socket.id, { opponent: socket, gameState });

            console.log('Emitting OpponentFound to', socket.id);
            socket.emit('OpponentFound', { opponentName: opponent.playerName, playingAs: 'A' });

            console.log('Emitting OpponentFound to', opponent.socket.id);
            opponent.socket.emit('OpponentFound', { opponentName: playerName, playingAs: 'B' });

            console.log('Emitting gameStateUpdate to both players');
            io.to(socket.id).to(opponent.socket.id).emit('gameStateUpdate', gameState);
        } else {
            console.log('Player waiting:', playerName);
            waitingPlayers.push({ socket, playerName });
        }
    });

    socket.on('playerMove', (data) => {
        console.log('Player move received:', data, 'from socket:', socket.id);
        const { from, to } = data;
        const game = activeGames.get(socket.id);

        if (game && isValidMove(game.gameState, from, to)) {
            const updatedState = makeMove(game.gameState, from, to);
            game.gameState = updatedState;

            console.log('Emitting gameStateUpdate after move');
            io.to(socket.id).to(game.opponent.id).emit('gameStateUpdate', updatedState);

            const winner = checkWinCondition(updatedState);
            if (winner) {
                console.log('Game over, winner:', winner);
                io.to(socket.id).to(game.opponent.id).emit('gameOver', { winner });
                activeGames.delete(socket.id);
                activeGames.delete(game.opponent.id);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        const index = waitingPlayers.findIndex(player => player.socket.id === socket.id);
        if (index !== -1) {
            waitingPlayers.splice(index, 1);
        }

        const game = activeGames.get(socket.id);
        if (game) {
            console.log('Emitting opponentDisconnected');
            game.opponent.emit('opponentDisconnected');
            activeGames.delete(socket.id);
            activeGames.delete(game.opponent.id);
        }
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});