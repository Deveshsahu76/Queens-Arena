export const isAttacking = (queen1, queen2) => {
  return (
    queen1.row === queen2.row ||
    queen1.col === queen2.col ||
    Math.abs(queen1.row - queen2.row) === Math.abs(queen1.col - queen2.col)
  );
};

export const hasConflict = (queens) => {
  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      if (isAttacking(queens[i], queens[j])) {
        return true;
      }
    }
  }

  return false;
};

export const isCellInConflict = (row, col, queens) => {
  const currentQueen = { row, col };

  return queens.some((queen) => {
    if (queen.row === row && queen.col === col) {
      return false;
    }

    return isAttacking(currentQueen, queen);
  });
};

export const isSafePosition = (row, col, queens) => {
  const newQueen = { row, col };

  return !queens.some((queen) => isAttacking(newQueen, queen));
};

export const solveNQueens = (size, fixedQueens = []) => {
  if (hasConflict(fixedQueens)) {
    return [];
  }

  const fixedByRow = new Map();

  for (const queen of fixedQueens) {
    if (fixedByRow.has(queen.row)) {
      return [];
    }

    fixedByRow.set(queen.row, queen);
  }

  const solution = [];

  const backtrack = (row) => {
    if (row === size) {
      return solution.length === size;
    }

    if (fixedByRow.has(row)) {
      const queen = fixedByRow.get(row);

      if (isSafePosition(queen.row, queen.col, solution)) {
        solution.push(queen);

        if (backtrack(row + 1)) {
          return true;
        }

        solution.pop();
      }

      return false;
    }

    for (let col = 0; col < size; col++) {
      if (isSafePosition(row, col, solution)) {
        solution.push({ row, col });

        if (backtrack(row + 1)) {
          return true;
        }

        solution.pop();
      }
    }

    return false;
  };

  const solved = backtrack(0);

  return solved ? solution : [];
};