import { useState, useEffect } from 'react';
import Square from './Square';
import { getValidMoves } from '../lib/gameLogic';

export default function Board({ gameState, onMove, playingAs }) {
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validMoves, setValidMoves] = useState([]);

    useEffect(() => {
        if (selectedSquare !== null) {
            const moves = getValidMoves(gameState, selectedSquare);
            setValidMoves(moves);
        } else {
            setValidMoves([]);
        }
    }, [selectedSquare, gameState]);

    const handleSquareClick = (index) => {
        if (gameState.currentTurn !== playingAs) {
            // Not this player's turn
            return;
        }

        if (selectedSquare === null) {
            // Selecting a piece
            if (gameState.board[index] && gameState.board[index].player === playingAs) {
                setSelectedSquare(index);
            }
        } else {
            // Moving a piece
            if (validMoves.includes(index)) {
                onMove(selectedSquare, index);
                setSelectedSquare(null);
            } else if (gameState.board[index] && gameState.board[index].player === playingAs) {
                // Selecting a different piece
                setSelectedSquare(index);
            } else {
                // Deselecting
                setSelectedSquare(null);
            }
        }
    };

    const isValidMove = (index) => validMoves.includes(index);

    return (
        <div className="grid grid-cols-5 gap-1">
            {gameState.board.map((square, index) => (
                <Square
                    key={index}
                    index={index}
                    character={square}
                    onClick={() => handleSquareClick(index)}
                    isSelected={index === selectedSquare}
                    isValidMove={isValidMove(index)}
                    isCurrentPlayer={gameState.currentTurn === playingAs}
                />
            ))}
        </div>
    );
}