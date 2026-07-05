const express = require("express");
const jwt = require("jsonwebtoken");
const PlayerStats = require("../models/PlayerStats");

const router = express.Router();

const defaultStats = {
  coins: 0,
  hintCredits: 0,
  totalWins: 0,
  noHintWins: 0,
  highestLevel: 1,
  currentStreak: 0,
  bestStreak: 0,
  lastDailyClaim: "",
  checkInDates: [],
  completedLevels: [],
  achievements: [],
  dailyChallengesCompleted: 0,
  completedDailyChallenges: [],
};

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id || decoded._id;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

router.get("/me", protect, async (req, res) => {
  try {
    let stats = await PlayerStats.findOne({ user: req.userId });

    if (!stats) {
      stats = await PlayerStats.create({
        user: req.userId,
        ...defaultStats,
      });
    }

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch player stats",
    });
  }
});

router.put("/me", protect, async (req, res) => {
  try {
    const allowedFields = [
      "coins",
      "hintCredits",
      "totalWins",
      "noHintWins",
      "highestLevel",
      "currentStreak",
      "bestStreak",
      "lastDailyClaim",
      "checkInDates",
      "completedLevels",
      "achievements",
      "dailyChallengesCompleted",
      "completedDailyChallenges",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const stats = await PlayerStats.findOneAndUpdate(
      { user: req.userId },
      {
        $set: updateData,
        $setOnInsert: {
          user: req.userId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not save player stats",
    });
  }
});

module.exports = router;