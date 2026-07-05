const Score = require("../models/Score");

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
  if (level <= 20) return { boardSize: 4 };
  if (level <= 40) return { boardSize: 5 };
  if (level <= 60) return { boardSize: 6 };
  if (level <= 80) return { boardSize: 7 };
  return { boardSize: 8 };
};

const isTouching = (q1, q2) => {
  return (
    Math.abs(q1.row - q2.row) <= 1 &&
    Math.abs(q1.col - q2.col) <= 1
  );
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
    if (row === size) return true;

    const columns = shuffleArray(
      Array.from({ length: size }, (_, index) => index),
      random
    );

    for (const col of columns) {
      if (canPlace(row, col)) {
        solution.push({ row, col });

        if (backtrack(row + 1)) return true;

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

      if (remaining === 0) break;
    }

    if (!progress) break;
  }

  return map;
};

const generateLevelData = (level) => {
  const config = getLevelConfig(level);
  const seed = level * 7919 + config.boardSize * 97;
  const solution = solveNoTouchQueens(config.boardSize, seed);
  const regionMap = generateRegionMap(config.boardSize, solution, seed);

  return {
    boardSize: config.boardSize,
    regionMap,
  };
};

const validateQueens = (level, boardSize, queens) => {
  if (!Array.isArray(queens)) return false;
  if (queens.length !== boardSize) return false;

  const levelData = generateLevelData(level);
  const regionMap = levelData.regionMap;

  const rows = new Set();
  const cols = new Set();
  const regions = new Set();

  for (const queen of queens) {
    if (
      !Number.isInteger(queen.row) ||
      !Number.isInteger(queen.col) ||
      queen.row < 0 ||
      queen.row >= boardSize ||
      queen.col < 0 ||
      queen.col >= boardSize
    ) {
      return false;
    }

    const regionId = regionMap[queen.row][queen.col];

    if (rows.has(queen.row)) return false;
    if (cols.has(queen.col)) return false;
    if (regions.has(regionId)) return false;

    rows.add(queen.row);
    cols.add(queen.col);
    regions.add(regionId);
  }

  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      if (isTouching(queens[i], queens[j])) {
        return false;
      }
    }
  }

  return true;
};

const saveScore = async (req, res) => {
  try {
    const { level = 1, boardSize, queens, moves, timeTaken } = req.body;

    if (
      !boardSize ||
      !queens ||
      moves === undefined ||
      timeTaken === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "level, boardSize, queens, moves and timeTaken are required",
      });
    }

    const levelConfig = getLevelConfig(Number(level));

    if (levelConfig.boardSize !== Number(boardSize)) {
      return res.status(400).json({
        success: false,
        message: "Board size does not match level",
      });
    }

    if (!validateQueens(Number(level), Number(boardSize), queens)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Queens solution",
      });
    }

    const score = await Score.create({
      user: req.user._id,
      level: Number(level),
      boardSize,
      queens,
      moves,
      timeTaken,
      won: true,
    });

    return res.status(201).json({
      success: true,
      message: "Score saved successfully",
      score,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyScores = async (req, res) => {
  try {
    const scores = await Score.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      scores,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const boardSize = Number(req.query.boardSize) || 4;

    const scores = await Score.find({
      boardSize,
      won: true,
    })
      .populate("user", "name email")
      .sort({ level: -1, moves: 1, timeTaken: 1, createdAt: 1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      boardSize,
      leaderboard: scores,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  saveScore,
  getMyScores,
  getLeaderboard,
};