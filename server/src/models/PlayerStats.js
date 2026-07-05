const mongoose = require("mongoose");

const playerStatsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    coins: {
      type: Number,
      default: 0,
    },

    hintCredits: {
      type: Number,
      default: 0,
    },

    totalWins: {
      type: Number,
      default: 0,
    },

    noHintWins: {
      type: Number,
      default: 0,
    },

    highestLevel: {
      type: Number,
      default: 1,
    },

    currentStreak: {
      type: Number,
      default: 0,
    },

    bestStreak: {
      type: Number,
      default: 0,
    },

    lastDailyClaim: {
      type: String,
      default: "",
    },

    checkInDates: {
      type: [String],
      default: [],
    },

    completedLevels: {
      type: [Number],
      default: [],
    },

    achievements: {
      type: [String],
      default: [],
    },

    dailyChallengesCompleted: {
      type: Number,
      default: 0,
    },

    completedDailyChallenges: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PlayerStats", playerStatsSchema);