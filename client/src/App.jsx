import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("queensToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const REGION_COLORS = [
  "#ff8a65",
  "#ffd180",
  "#ce93d8",
  "#90caf9",
  "#a5d6a7",
  "#e6ee9c",
  "#b0bec5",
  "#b39ddb",
];

const createSeededRandom = (seed) => {
  let value = seed % 2147483647;

  if (value <= 0) {
    value += 2147483646;
  }

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const shuffleArray = (array, random) => {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
};

const getLevelConfig = (level) => {
  if (level <= 20) {
    return {
      boardSize: 4,
      difficulty: "Beginner",
      difficultyClass: "beginner",
      hintLimit: 1,
      title: "Learn the basics",
    };
  }

  if (level <= 40) {
    return {
      boardSize: 5,
      difficulty: "Easy",
      difficultyClass: "easy",
      hintLimit: 2,
      title: "Region thinking",
    };
  }

  if (level <= 60) {
    return {
      boardSize: 6,
      difficulty: "Medium",
      difficultyClass: "medium",
      hintLimit: 2,
      title: "Smarter moves",
    };
  }

  if (level <= 80) {
    return {
      boardSize: 7,
      difficulty: "Hard",
      difficultyClass: "hard",
      hintLimit: 1,
      title: "Tactical puzzle",
    };
  }

  return {
    boardSize: 8,
    difficulty: "Expert",
    difficultyClass: "expert",
    hintLimit: 1,
    title: "Grandmaster zone",
  };
};

const isTouching = (q1, q2) => {
  return Math.abs(q1.row - q2.row) <= 1 && Math.abs(q1.col - q2.col) <= 1;
};

const getRegionId = (regionMap, row, col) => {
  return regionMap[row][col];
};

const solveNoTouchQueens = (size, seed) => {
  const random = createSeededRandom(seed);
  const solution = [];

  const canPlace = (row, col) => {
    return !solution.some((queen) => {
      return queen.col === col || isTouching(queen, { row, col });
    });
  };

  const backtrack = (row) => {
    if (row === size) {
      return true;
    }

    const columns = shuffleArray(
      Array.from({ length: size }, (_, index) => index),
      random
    );

    for (const col of columns) {
      if (canPlace(row, col)) {
        solution.push({ row, col });

        if (backtrack(row + 1)) {
          return true;
        }

        solution.pop();
      }
    }

    return false;
  };

  return backtrack(0) ? solution : [];
};

const generateRegionMap = (size, solution, seed) => {
  const random = createSeededRandom(seed + 999);
  const map = Array.from({ length: size }, () => Array(size).fill(-1));
  const cellsByRegion = Array.from({ length: size }, () => []);

  solution.forEach((queen, regionId) => {
    map[queen.row][queen.col] = regionId;
    cellsByRegion[regionId].push({ row: queen.row, col: queen.col });
  });

  let remaining = size * size - size;

  const directions = [
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
  ];

  while (remaining > 0) {
    let progress = false;

    const regionOrder = shuffleArray(
      Array.from({ length: size }, (_, index) => index),
      random
    );

    for (const regionId of regionOrder) {
      const candidates = [];

      for (const cell of cellsByRegion[regionId]) {
        for (const dir of directions) {
          const nextRow = cell.row + dir.row;
          const nextCol = cell.col + dir.col;

          if (
            nextRow >= 0 &&
            nextRow < size &&
            nextCol >= 0 &&
            nextCol < size &&
            map[nextRow][nextCol] === -1
          ) {
            candidates.push({ row: nextRow, col: nextCol });
          }
        }
      }

      if (candidates.length > 0) {
        const picked = candidates[Math.floor(random() * candidates.length)];
        map[picked.row][picked.col] = regionId;
        cellsByRegion[regionId].push(picked);
        remaining--;
        progress = true;
      }

      if (remaining === 0) {
        break;
      }
    }

    if (!progress) {
      break;
    }
  }

  return map;
};

const generateLevelData = (level) => {
  const config = getLevelConfig(level);
  const seed = level * 7919 + config.boardSize * 97;
  const solution = solveNoTouchQueens(config.boardSize, seed);
  const regionMap = generateRegionMap(config.boardSize, solution, seed);

  return {
    ...config,
    solution,
    regionMap,
  };
};

const validatePartialQueens = (queens, regionMap, size) => {
  const rows = new Set();
  const cols = new Set();
  const regions = new Set();

  for (const queen of queens) {
    if (
      queen.row < 0 ||
      queen.row >= size ||
      queen.col < 0 ||
      queen.col >= size
    ) {
      return {
        valid: false,
        message: "A queen is outside the board.",
      };
    }

    const regionId = getRegionId(regionMap, queen.row, queen.col);

    if (rows.has(queen.row)) {
      return {
        valid: false,
        message: `Row ${queen.row + 1} already has a queen.`,
      };
    }

    if (cols.has(queen.col)) {
      return {
        valid: false,
        message: `Column ${queen.col + 1} already has a queen.`,
      };
    }

    if (regions.has(regionId)) {
      return {
        valid: false,
        message: `This color region already has a queen.`,
      };
    }

    rows.add(queen.row);
    cols.add(queen.col);
    regions.add(regionId);
  }

  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      if (isTouching(queens[i], queens[j])) {
        return {
          valid: false,
          message: "Two queens are touching each other.",
        };
      }
    }
  }

  return {
    valid: true,
    message: "Valid so far.",
  };
};

const validateFinalQueens = (queens, regionMap, size) => {
  const partial = validatePartialQueens(queens, regionMap, size);

  if (!partial.valid) {
    return partial;
  }

  if (queens.length !== size) {
    return {
      valid: false,
      message: `Place exactly ${size} queens.`,
    };
  }

  return {
    valid: true,
    message: "Solved.",
  };
};

const solveRegionPuzzle = (size, regionMap, fixedQueens, seed) => {
  const partial = validatePartialQueens(fixedQueens, regionMap, size);

  if (!partial.valid) {
    return [];
  }

  const random = createSeededRandom(seed + 505);
  const fixedByRow = new Map();

  for (const queen of fixedQueens) {
    fixedByRow.set(queen.row, queen);
  }

  const placed = [];
  const usedCols = new Set();
  const usedRegions = new Set();

  const canPlace = (row, col) => {
    const regionId = getRegionId(regionMap, row, col);

    if (usedCols.has(col) || usedRegions.has(regionId)) {
      return false;
    }

    return !placed.some((queen) => isTouching(queen, { row, col }));
  };

  const addQueen = (queen) => {
    const regionId = getRegionId(regionMap, queen.row, queen.col);
    placed.push(queen);
    usedCols.add(queen.col);
    usedRegions.add(regionId);
  };

  const removeQueen = (queen) => {
    const regionId = getRegionId(regionMap, queen.row, queen.col);
    placed.pop();
    usedCols.delete(queen.col);
    usedRegions.delete(regionId);
  };

  const backtrack = (row) => {
    if (row === size) {
      return placed.length === size;
    }

    if (fixedByRow.has(row)) {
      const fixedQueen = fixedByRow.get(row);

      if (!canPlace(fixedQueen.row, fixedQueen.col)) {
        return false;
      }

      addQueen(fixedQueen);

      if (backtrack(row + 1)) {
        return true;
      }

      removeQueen(fixedQueen);
      return false;
    }

    const columns = shuffleArray(
      Array.from({ length: size }, (_, index) => index),
      random
    );

    for (const col of columns) {
      if (canPlace(row, col)) {
        const queen = { row, col };
        addQueen(queen);

        if (backtrack(row + 1)) {
          return true;
        }

        removeQueen(queen);
      }
    }

    return false;
  };

  return backtrack(0) ? placed : [];
};

function Navbar({ user, currentPage, setCurrentPage, logout }) {
  return (
    <nav className="navbar">
      <button
        className="brand"
        onClick={() => setCurrentPage(user ? "game" : "login")}
      >
        <span className="brand-icon">♛</span>
        <span>Queens Arena</span>
      </button>

      <div className="nav-links">
        {user ? (
          <>
            <button
              className={currentPage === "game" ? "active-nav" : ""}
              onClick={() => setCurrentPage("game")}
            >
              Game
            </button>

            <button
              className={currentPage === "leaderboard" ? "active-nav" : ""}
              onClick={() => setCurrentPage("leaderboard")}
            >
              Leaderboard
            </button>

            <span className="user-name">Hi, {user.name}</span>

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className={currentPage === "login" ? "active-nav" : ""}
              onClick={() => setCurrentPage("login")}
            >
              Login
            </button>

            <button
              className={currentPage === "register" ? "active-nav" : ""}
              onClick={() => setCurrentPage("register")}
            >
              Register
            </button>

            <button
              className={currentPage === "leaderboard" ? "active-nav" : ""}
              onClick={() => setCurrentPage("leaderboard")}
            >
              Leaderboard
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

function Login({ setUser, setCurrentPage }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await API.post("/auth/login", formData);

      localStorage.setItem("queensToken", res.data.token);
      localStorage.setItem("queensUser", JSON.stringify(res.data.user));

      setUser(res.data.user);
      setCurrentPage("game");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Backend may be offline."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="section-tag">Welcome back</div>
        <h1>Login</h1>
        <p>Continue your Queens challenge and save your scores.</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && <p className="error">{message}</p>}

        <p className="switch-text">
          New player?{" "}
          <button type="button" onClick={() => setCurrentPage("register")}>
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}

function Register({ setUser, setCurrentPage }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await API.post("/auth/register", formData);

      localStorage.setItem("queensToken", res.data.token);
      localStorage.setItem("queensUser", JSON.stringify(res.data.user));

      setUser(res.data.user);
      setCurrentPage("game");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Registration failed. Backend may be offline."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="section-tag">Join Arena</div>
        <h1>Create Account</h1>
        <p>Register to play levels, track moves, and enter leaderboard.</p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="name"
            placeholder="Enter name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            minLength="6"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        {message && <p className="error">{message}</p>}

        <p className="switch-text">
          Already registered?{" "}
          <button type="button" onClick={() => setCurrentPage("login")}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

function Board({ size, regionMap, queens, marks, onCellClick }) {
  const queenMap = new Set(queens.map((queen) => `${queen.row}-${queen.col}`));
  const markMap = new Set(marks.map((mark) => `${mark.row}-${mark.col}`));
  const boardStatus = validatePartialQueens(queens, regionMap, size);

  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
        "--board-size": size,
      }}
    >
      {Array.from({ length: size * size }).map((_, index) => {
        const row = Math.floor(index / size);
        const col = index % size;
        const regionId = getRegionId(regionMap, row, col);
        const key = `${row}-${col}`;
        const hasQueen = queenMap.has(key);
        const mark = markMap.has(key);
        const conflict = hasQueen && !boardStatus.valid;

        return (
          <button
            key={key}
            className={`cell ${hasQueen ? "has-queen" : ""} ${
              conflict ? "conflict" : ""
            }`}
            style={{
              backgroundColor: REGION_COLORS[regionId % REGION_COLORS.length],
            }}
            onClick={() => onCellClick(row, col)}
            title={`Row ${row + 1}, Column ${col + 1}, Region ${regionId + 1}`}
          >
            {hasQueen && <span className="queen">♛</span>}
            {!hasQueen && mark && <span className="x-mark">×</span>}
          </button>
        );
      })}
    </div>
  );
}

function WinModal({ level, moves, seconds, onNextLevel, onReplay }) {
  return (
    <div className="modal-backdrop">
      <div className="win-modal">
        <div className="celebrate">🎉🏆✨</div>
        <h1>Congratulations!</h1>
        <p>You completed Level {level} successfully.</p>

        <div className="modal-stats">
          <div>
            <span>Moves</span>
            <strong>{moves}</strong>
          </div>

          <div>
            <span>Time</span>
            <strong>{seconds}s</strong>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onReplay}>Replay Level</button>

          {level < 100 ? (
            <button className="primary-action" onClick={onNextLevel}>
              Next Level →
            </button>
          ) : (
            <button className="primary-action" onClick={onReplay}>
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Game({ user }) {
  const savedUnlockedLevel =
    Number(localStorage.getItem("queensUnlockedLevel")) || 1;

  const savedCurrentLevel =
    Number(localStorage.getItem("queensCurrentLevel")) || 1;

  const initialUnlockedLevel = Math.max(1, Math.min(100, savedUnlockedLevel));
  const initialCurrentLevel = Math.max(
    1,
    Math.min(initialUnlockedLevel, savedCurrentLevel)
  );

  const [level, setLevel] = useState(initialCurrentLevel);
  const [unlockedLevel, setUnlockedLevel] = useState(initialUnlockedLevel);

  const levelData = useMemo(() => generateLevelData(level), [level]);

  const size = levelData.boardSize;
  const regionMap = levelData.regionMap;

  const [tool, setTool] = useState("queen");
  const [queens, setQueens] = useState([]);
  const [marks, setMarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [usedHelp, setUsedHelp] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showWinModal, setShowWinModal] = useState(false);
  const [hintText, setHintText] = useState("");
  const [message, setMessage] = useState(
    "Place queens using the rules. Use X to eliminate cells."
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

  const pushHistory = () => {
    setHistory((prev) => [
      ...prev,
      {
        queens,
        marks,
        moves,
        message,
      },
    ]);
  };

  const resetBoardState = (newLevel = level) => {
    const config = getLevelConfig(newLevel);

    setQueens([]);
    setMarks([]);
    setHistory([]);
    setMoves(0);
    setSeconds(0);
    setGameStarted(false);
    setGameWon(false);
    setUsedHelp(false);
    setHintsUsed(0);
    setShowWinModal(false);
    setHintText("");
    setTool("queen");
    setMessage(`Level ${newLevel} started. Difficulty: ${config.difficulty}.`);
  };

  const saveScore = async (finalQueens, finalMoves, finalTime) => {
    try {
      await API.post("/scores/save", {
        level,
        boardSize: size,
        queens: finalQueens,
        moves: finalMoves,
        timeTaken: finalTime,
      });

      setMessage("🎉 Great solve! Your score is saved to leaderboard.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Score could not be saved.");
    }
  };

  const completeLevel = async (updatedQueens, finalMoves) => {
    setGameWon(true);
    setGameStarted(false);
    setShowWinModal(true);

    if (usedHelp) {
      setMessage("🎉 Level completed! Score is not saved because hint was used.");
    } else {
      await saveScore(updatedQueens, finalMoves, seconds);
    }
  };

  const handleCellClick = async (row, col) => {
    if (gameWon) {
      setMessage("Level already completed. Go to next level or replay.");
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
    }

    const hasQueen = queens.some(
      (queen) => queen.row === row && queen.col === col
    );

    const hasMark = marks.some((mark) => mark.row === row && mark.col === col);

    let updatedQueens = [...queens];
    let updatedMarks = [...marks];

    if (tool === "mark") {
      if (hasQueen) {
        setMessage("Remove the queen before marking this cell.");
        return;
      }

      pushHistory();

      if (hasMark) {
        updatedMarks = updatedMarks.filter(
          (mark) => !(mark.row === row && mark.col === col)
        );
      } else {
        updatedMarks = [...updatedMarks, { row, col }];
      }

      setMarks(updatedMarks);
      setMoves((prev) => prev + 1);
      setHintText("");
      setMessage("Cell marked. Use marks to eliminate impossible cells.");
      return;
    }

    pushHistory();

    if (hasQueen) {
      updatedQueens = updatedQueens.filter(
        (queen) => !(queen.row === row && queen.col === col)
      );
    } else {
      if (updatedQueens.length >= size) {
        setMessage(`You already placed ${size} queens. Remove one queen first.`);
        return;
      }

      updatedMarks = updatedMarks.filter(
        (mark) => !(mark.row === row && mark.col === col)
      );

      updatedQueens = [...updatedQueens, { row, col }];
    }

    const finalMoves = moves + 1;

    setQueens(updatedQueens);
    setMarks(updatedMarks);
    setMoves(finalMoves);
    setHintText("");

    const partial = validatePartialQueens(updatedQueens, regionMap, size);

    if (
      updatedQueens.length === size &&
      validateFinalQueens(updatedQueens, regionMap, size).valid
    ) {
      await completeLevel(updatedQueens, finalMoves);
    } else if (!partial.valid) {
      setMessage(`⚠️ ${partial.message}`);
    } else {
      setMessage(`${size - updatedQueens.length} queens left to place.`);
    }
  };

  const undoMove = () => {
    if (history.length === 0 || gameWon) {
      return;
    }

    const previous = history[history.length - 1];

    setQueens(previous.queens);
    setMarks(previous.marks);
    setMoves(previous.moves);
    setMessage(previous.message);
    setHintText("");
    setHistory((prev) => prev.slice(0, -1));
  };

  const showHint = () => {
    if (gameWon) {
      setMessage("Level already completed. Go to next level or replay.");
      return;
    }

    if (hintsUsed >= levelData.hintLimit) {
      setHintText("Hint limit reached for this level.");
      setMessage("Hint limit reached.");
      return;
    }

    const partial = validatePartialQueens(queens, regionMap, size);

    if (!partial.valid) {
      setHintText(`Fix this first: ${partial.message}`);
      setMessage("Remove conflict first, then use hint.");
      return;
    }

    const seed = level * 7919 + size * 97;
    const solution = solveRegionPuzzle(size, regionMap, queens, seed);

    if (solution.length === 0) {
      setHintText("No safe hint found. Try removing one queen or mark.");
      setMessage("No valid hint found.");
      return;
    }

    const hintQueen = solution.find(
      (solQueen) =>
        !queens.some(
          (queen) => queen.row === solQueen.row && queen.col === solQueen.col
        )
    );

    if (!hintQueen) {
      setHintText("All queens look correctly placed. Check final rule.");
      return;
    }

    const regionId = getRegionId(regionMap, hintQueen.row, hintQueen.col);

    setUsedHelp(true);
    setHintsUsed((prev) => prev + 1);

    setHintText(
      `Hint: Color region ${regionId + 1} still needs one queen. A possible safe cell is Row ${
        hintQueen.row + 1
      }, Column ${hintQueen.col + 1}.`
    );

    setMessage("Hint generated. Read the hint panel below the board.");
  };

  const resetGame = () => {
    resetBoardState(level);
  };

  const goToNextLevel = () => {
    const nextLevel = Math.min(level + 1, 100);
    const nextUnlockedLevel = Math.max(unlockedLevel, nextLevel);

    setLevel(nextLevel);
    setUnlockedLevel(nextUnlockedLevel);

    localStorage.setItem("queensCurrentLevel", String(nextLevel));
    localStorage.setItem("queensUnlockedLevel", String(nextUnlockedLevel));

    resetBoardState(nextLevel);
  };

  const replayLevel = () => {
    resetBoardState(level);
  };

  const currentStatus = validatePartialQueens(queens, regionMap, size);

  return (
    <>
      {showWinModal && (
        <WinModal
          level={level}
          moves={moves}
          seconds={seconds}
          onNextLevel={goToNextLevel}
          onReplay={replayLevel}
        />
      )}

      <div className="game-shell">
        <section className="game-area">
          <div className="top-game-bar">
            <div>
              <div className={`difficulty-pill ${levelData.difficultyClass}`}>
                {levelData.difficulty}
              </div>
              <h1>Queens Puzzle</h1>
              <p>
                Level {level} • {levelData.title} • {size}x{size} board
              </p>
            </div>

            <div className="timer-box">
              <span>Time</span>
              <strong>{seconds}s</strong>
            </div>
          </div>

          <div className="level-progress">
            <div className="progress-info">
              <span>Unlocked Progress</span>
              <strong>{unlockedLevel}/100</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${unlockedLevel}%` }}
              ></div>
            </div>
          </div>

          <div className="controls-row">
            <div className="level-badge">Level {level}</div>

            <button
              className={tool === "queen" ? "tool-active" : ""}
              onClick={() => setTool("queen")}
            >
              ♛ Queen
            </button>

            <button
              className={tool === "mark" ? "tool-active" : ""}
              onClick={() => setTool("mark")}
            >
              × Mark
            </button>

            <button onClick={undoMove} disabled={history.length === 0}>
              Undo
            </button>

            <button onClick={resetGame}>Reset</button>

            <button onClick={showHint}>
              Hint {levelData.hintLimit - hintsUsed}/{levelData.hintLimit}
            </button>
          </div>

          <Board
            size={size}
            regionMap={regionMap}
            queens={queens}
            marks={marks}
            onCellClick={handleCellClick}
          />

          {hintText && (
            <div className="hint-panel">
              <div>
                <strong>Hint</strong>
                <p>{hintText}</p>
              </div>

              <button onClick={() => setHintText("")}>×</button>
            </div>
          )}

          <div className={`status-box ${!currentStatus.valid ? "danger" : ""}`}>
            <p>{message}</p>
          </div>
        </section>

        <aside className="side-panel">
          <div className="profile-box">
            <span className="avatar">
              {user?.name?.[0]?.toUpperCase() || "Q"}
            </span>

            <div>
              <p>Player</p>
              <h3>{user?.name}</h3>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span>Level</span>
              <strong>{level}</strong>
            </div>

            <div className="stat-card">
              <span>Unlocked</span>
              <strong>{unlockedLevel}/100</strong>
            </div>

            <div className="stat-card">
              <span>Queens</span>
              <strong>
                {queens.length}/{size}
              </strong>
            </div>

            <div className="stat-card">
              <span>Moves</span>
              <strong>{moves}</strong>
            </div>

            <div className="stat-card">
              <span>Marks</span>
              <strong>{marks.length}</strong>
            </div>

            <div className="stat-card">
              <span>Status</span>
              <strong>
                {gameWon
                  ? "Solved"
                  : !currentStatus.valid
                  ? "Conflict"
                  : "Playing"}
              </strong>
            </div>
          </div>

          <div className="rules-box">
            <h3>How to Play</h3>

            <ol>
              <li>Place exactly one ♛ in every row.</li>
              <li>Place exactly one ♛ in every column.</li>
              <li>Place exactly one ♛ in every color region.</li>
              <li>Two queens cannot touch, even diagonally.</li>
              <li>Use × marks to eliminate impossible cells.</li>
              <li>Using hint will stop score saving for that level.</li>
            </ol>
          </div>
        </aside>
      </div>
    </>
  );
}

function Leaderboard() {
  const [boardSize, setBoardSize] = useState(4);
  const [leaderboard, setLeaderboard] = useState([]);
  const [message, setMessage] = useState("");

  const fetchLeaderboard = async () => {
    try {
      const res = await API.get(`/scores/leaderboard?boardSize=${boardSize}`);
      setLeaderboard(res.data.leaderboard);
      setMessage("");
    } catch (error) {
      setLeaderboard([]);
      setMessage("Could not load leaderboard. Backend may be offline.");
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [boardSize]);

  return (
    <div className="leaderboard-wrapper">
      <div className="leaderboard-card">
        <div className="section-tag">Top players</div>
        <h1>Leaderboard</h1>

        <div className="controls-row compact">
          <select
            value={boardSize}
            onChange={(e) => setBoardSize(Number(e.target.value))}
          >
            <option value={4}>4 x 4</option>
            <option value={5}>5 x 5</option>
            <option value={6}>6 x 6</option>
            <option value={7}>7 x 7</option>
            <option value={8}>8 x 8</option>
          </select>
        </div>

        {message && <p className="error">{message}</p>}

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Level</th>
                <th>Moves</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="5">No scores yet.</td>
                </tr>
              ) : (
                leaderboard.map((score, index) => (
                  <tr key={score._id}>
                    <td>#{index + 1}</td>
                    <td>{score.user?.name || "Unknown"}</td>
                    <td>{score.level || "-"}</td>
                    <td>{score.moves}</td>
                    <td>{score.timeTaken}s</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <span>♛</span>
        <strong>Queens Arena</strong>
      </div>

      <p>Think sharp. Place wisely. Rule the arena.</p>

      <div className="footer-links">
        <span>100 Levels</span>
        <span>Ranked Arena</span>
        <span>Brain Training</span>
        <span>Logic Battles</span>
      </div>

      <small>© 2026 Queens Arena. Play smart, win smarter.</small>
    </footer>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("queensUser");
    const savedToken = localStorage.getItem("queensToken");

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setCurrentPage("game");
      } catch (error) {
        localStorage.removeItem("queensUser");
        localStorage.removeItem("queensToken");
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("queensUser");
    localStorage.removeItem("queensToken");
    setUser(null);
    setCurrentPage("login");
  };

  return (
    <div className="app">
      <Navbar
        user={user}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        logout={logout}
      />

      <main className="main-content">
        {currentPage === "login" && (
          <Login setUser={setUser} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === "register" && (
          <Register setUser={setUser} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === "game" && user && <Game user={user} />}

        {currentPage === "game" && !user && (
          <Login setUser={setUser} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === "leaderboard" && <Leaderboard />}
      </main>

      <Footer />
    </div>
  );
}

export default App;