const express = require("express");
const {
  saveScore,
  getMyScores,
  getLeaderboard,
} = require("../controllers/scoreController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/save", protect, saveScore);
router.get("/my-scores", protect, getMyScores);
router.get("/leaderboard", getLeaderboard);

module.exports = router;