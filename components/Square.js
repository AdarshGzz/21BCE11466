import Character from './Character'

export default function Square({ index, character, onMove, canMove }) {
    const handleClick = () => {
        if (canMove) {
            onMove(index)
        }
    }

    return (
        <div
            className={`w-20 h-20 border border-gray-400 flex items-center justify-center cursor-pointer ${canMove ? 'hover:bg-gray-200' : ''
                }`}
            onClick={handleClick}
        >
            {character && <Character type={character.type} player={character.player} />}
        </div>
    )
}