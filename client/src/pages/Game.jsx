import { useEffect, useState } from "react";
import Board from "../components/Board";
import API from "../api/axios";
import {
  hasConflict,
  isCellInConflict,
  solveNQueens,
} from "../utils/nQueens";

const Game = ({ user }) => {
  const [size, setSize] = useState(4);
  const [queens, setQueens] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [message, setMessage] = useState(
    "Place queens so that no two queens attack each other."
  );

  useEffect(() => {
    let timer;

    if (gameStarted && !gameWon) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [gameStarted, gameWon]);

  const saveScore = async (finalQueens, finalMoves, finalTime) => {
    try {
      await API.post("/scores/save", {
        boardSize: size,
        queens: finalQueens,
        moves: finalMoves,
        timeTaken: finalTime,
      });

      setMessage("🎉 You solved it! Score saved to leaderboard.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Score could not be saved.");
    }
  };

  const handleCellClick = async (row, col) => {
    if (gameWon) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    const queenAlreadyPlaced = queens.some(
      (queen) => queen.row === row && queen.col === col
    );

    let updatedQueens;

    if (queenAlreadyPlaced) {
      updatedQueens = queens.filter(
        (queen) => !(queen.row === row && queen.col === col)
      );
    } else {
      updatedQueens = [...queens, { row, col }];
    }

    const finalMoves = moves + 1;

    setQueens(updatedQueens);
    setMoves(finalMoves);

    if (updatedQueens.length === size && !hasConflict(updatedQueens)) {
      setGameWon(true);
      setGameStarted(false);
      await saveScore(updatedQueens, finalMoves, seconds);
    } else if (hasConflict(updatedQueens)) {
      setMessage("⚠️ Some queens are attacking each other.");
    } else {
      setMessage(`${size - updatedQueens.length} queens left to place.`);
    }
  };

  const handleReset = () => {
    setQueens([]);
    setMoves(0);
    setSeconds(0);
    setGameStarted(false);
    setGameWon(false);
    setMessage("Game reset. Start again carefully.");
  };

  const handleSizeChange = (newSize) => {
    setSize(Number(newSize));
    setQueens([]);
    setMoves(0);
    setSeconds(0);
    setGameStarted(false);
    setGameWon(false);
    setMessage(`New ${newSize}x${newSize} board started.`);
  };

  const handleHint = () => {
    const solution = solveNQueens(size, queens);

    if (solution.length === 0) {
      setMessage("No valid hint. Remove conflicting queens first.");
      return;
    }

    const nextHint = solution.find(
      (solutionQueen) =>
        !queens.some(
          (queen) =>
            queen.row === solutionQueen.row && queen.col === solutionQueen.col
        )
    );

    if (nextHint) {
      setMessage(
        `💡 Hint: Try Row ${nextHint.row + 1}, Column ${nextHint.col + 1}.`
      );
    } else {
      setMessage("All solution queens are already placed.");
    }
  };

  const handleAutoSolve = () => {
    const solution = solveNQueens(size, queens);

    if (solution.length === 0) {
      setMessage("No solution found. Remove conflicting queens first.");
      return;
    }

    setQueens(solution);
    setGameStarted(false);
    setGameWon(true);
    setMessage("✅ Auto-solved for learning. Auto-solved score is not saved.");
  };

  const checkCellConflict = (row, col) => {
    return isCellInConflict(row, col, queens);
  };

  return (
    <div className="game-card">
      <h1>N-Queens Puzzle</h1>

      <p className="description">
        Welcome {user?.name}. Place {size} queens on a {size}x{size} board.
      </p>

      <div className="controls">
        <select value={size} onChange={(e) => handleSizeChange(e.target.value)}>
          <option value={4}>4 x 4</option>
          <option value={5}>5 x 5</option>
          <option value={6}>6 x 6</option>
          <option value={8}>8 x 8</option>
        </select>

        <button onClick={handleReset}>Reset</button>
        <button onClick={handleHint}>Hint</button>
        <button onClick={handleAutoSolve}>Auto Solve</button>
      </div>

      <Board
        size={size}
        queens={queens}
        onCellClick={handleCellClick}
        isCellConflict={checkCellConflict}
      />

      <div className="game-info">
        <p className="message">{message}</p>
        <p>Queens placed: {queens.length}/{size}</p>
        <p>Moves: {moves}</p>
        <p>Time: {seconds}s</p>
      </div>
    </div>
  );
};

export default Game;