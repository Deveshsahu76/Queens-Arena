const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const playerStatsRoutes = require("./routes/playerStatsRoutes");

dotenv.config();

const app = express();

/* MongoDB Connection */
connectDB();

/* Allowed Frontend Origins */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",
  "https://queens-arena.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

/* CORS Config */
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed =
        allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* Middlewares */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* Health Check Route */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Queens Arena API is running",
  });
});

/* API Routes */
app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/player-stats", playerStatsRoutes);

/* 404 Route */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* Error Handler */
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* Server Listen */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});