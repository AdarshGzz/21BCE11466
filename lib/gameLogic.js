// Constants for player identifiers and character types
const PLAYER_A = 'A';
const PLAYER_B = 'B';
const PAWN = 'Pawn';
const HERO1 = 'Hero1';
const HERO2 = 'Hero2';

// Helper function to create a character
function createCharacter(type, player) {
    return { type, player };
}

export function initializeGame() {
    // Initialize the 5x5 board
    const board = Array(25).fill(null);

    // Set up Player A's characters (bottom row)
    board[20] = createCharacter(PAWN, PLAYER_A);
    board[21] = createCharacter(HERO1, PLAYER_A);
    board[22] = createCharacter(HERO2, PLAYER_A);
    board[23] = createCharacter(HERO1, PLAYER_A);
    board[24] = createCharacter(PAWN, PLAYER_A);

    // Set up Player B's characters (top row)
    board[0] = createCharacter(PAWN, PLAYER_B);
    board[1] = createCharacter(HERO1, PLAYER_B);
    board[2] = createCharacter(HERO2, PLAYER_B);
    board[3] = createCharacter(HERO1, PLAYER_B);
    board[4] = createCharacter(PAWN, PLAYER_B);

    return {
        board,
        currentTurn: PLAYER_A,
        winner: null
    };
}

export function isValidMove(gameState, from, to) {
    const { board, currentTurn } = gameState;
    const character = board[from];

    // Check if the move is within the board
    if (to < 0 || to >= 25) return false;

    // Check if it's the player's turn and they're moving their own character
    if (!character || character.player !== currentTurn) return false;

    // Check if the destination is occupied by the player's own character
    if (board[to] && board[to].player === currentTurn) return false;

    const fromRow = Math.floor(from / 5);
    const fromCol = from % 5;
    const toRow = Math.floor(to / 5);
    const toCol = to % 5;

    switch (character.type) {
        case PAWN:
            // Pawn can move one square in any direction
            return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;

        case HERO1:
            // Hero1 can move two squares straight in any direction
            return (
                (Math.abs(fromRow - toRow) === 2 && fromCol === toCol) ||
                (Math.abs(fromCol - toCol) === 2 && fromRow === toRow)
            );

        case HERO2:
            // Hero2 can move two squares diagonally in any direction
            return Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2;

        default:
            return false;
    }
}

export function makeMove(gameState, from, to) {
    const newBoard = [...gameState.board];
    const movingCharacter = newBoard[from];

    // Move the character
    newBoard[to] = movingCharacter;
    newBoard[from] = null;

    // If it's Hero1 or Hero2, remove any character in the path
    if (movingCharacter.type === HERO1 || movingCharacter.type === HERO2) {
        const midPoint = (from + to) / 2;
        if (Number.isInteger(midPoint)) {
            newBoard[midPoint] = null;
        }
    }

    return {
        ...gameState,
        board: newBoard,
        currentTurn: gameState.currentTurn === PLAYER_A ? PLAYER_B : PLAYER_A
    };
}

export function checkWinCondition(gameState) {
    const { board } = gameState;
    let playerACharacters = 0;
    let playerBCharacters = 0;

    for (const cell of board) {
        if (cell) {
            if (cell.player === PLAYER_A) playerACharacters++;
            if (cell.player === PLAYER_B) playerBCharacters++;
        }
    }

    if (playerACharacters === 0) return PLAYER_B;
    if (playerBCharacters === 0) return PLAYER_A;
    return null;
}

// Helper function to get valid moves for a character
export function getValidMoves(gameState, position) {
    const validMoves = [];
    for (let i = 0; i < 25; i++) {
        if (isValidMove(gameState, position, i)) {
            validMoves.push(i);
        }
    }
    return validMoves;
}