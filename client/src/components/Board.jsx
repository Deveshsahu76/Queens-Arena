import Cell from "./Cell";

const Board = ({ size, queens, onCellClick, isCellConflict }) => {
  const isQueenPlaced = (row, col) => {
    return queens.some((queen) => queen.row === row && queen.col === col);
  };

  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
      }}
    >
      {Array.from({ length: size * size }).map((_, index) => {
        const row = Math.floor(index / size);
        const col = index % size;

        const isDark = (row + col) % 2 === 1;
        const hasQueen = isQueenPlaced(row, col);
        const conflict = hasQueen && isCellConflict(row, col);

        return (
          <Cell
            key={`${row}-${col}`}
            row={row}
            col={col}
            isDark={isDark}
            hasQueen={hasQueen}
            isConflict={conflict}
            onClick={onCellClick}
          />
        );
      })}
    </div>
  );
};

export default Board;