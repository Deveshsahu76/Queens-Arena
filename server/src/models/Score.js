const mongoose = require("mongoose");

const queenSchema = new mongoose.Schema(
  {
    row: Number,
    col: Number,
  },
  {
    _id: false,
  }
);

const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    level: {
      type: Number,
      default: 1,
    },

    boardSize: {
      type: Number,
      required: true,
    },

    queens: {
      type: [queenSchema],
      required: true,
    },

    moves: {
      type: Number,
      required: true,
    },

    timeTaken: {
      type: Number,
      required: true,
    },

    won: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Score", scoreSchema);