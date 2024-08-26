import Character from './Character';

export default function Square({ index, character, onClick, isSelected, isValidMove, isCurrentPlayer }) {
    let className = "w-20 h-20 border border-gray-400 flex items-center justify-center";

    if (isSelected) {
        className += " bg-yellow-200";
    } else if (isValidMove) {
        className += " bg-green-200";
    } else if (isCurrentPlayer) {
        className += " hover:bg-gray-200";
    }

    return (
        <div
            className={className}
            onClick={onClick}
        >
            {character && <Character type={character.type} player={character.player} />}
        </div>
    );
}