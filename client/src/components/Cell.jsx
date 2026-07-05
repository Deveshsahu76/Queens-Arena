const Cell = ({ row, col, isDark, hasQueen, isConflict, onClick }) => {
  return (
    <button
      className={`cell ${isDark ? "dark-cell" : "light-cell"} ${
        isConflict ? "conflict-cell" : ""
      }`}
      onClick={() => onClick(row, col)}
    >
      {hasQueen && <span className="queen">♛</span>}
    </button>
  );
};

export default Cell;