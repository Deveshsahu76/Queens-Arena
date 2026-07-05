import { useEffect, useState } from "react";
import API from "../api/axios";

const Leaderboard = () => {
  const [boardSize, setBoardSize] = useState(4);
  const [leaderboard, setLeaderboard] = useState([]);
  const [message, setMessage] = useState("");

  const fetchLeaderboard = async () => {
    try {
      const res = await API.get(`/scores/leaderboard?boardSize=${boardSize}`);
      setLeaderboard(res.data.leaderboard);
      setMessage("");
    } catch (error) {
      setMessage("Could not load leaderboard");
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [boardSize]);

  return (
    <div className="leaderboard-card">
      <h1>Leaderboard</h1>

      <div className="controls">
        <select
          value={boardSize}
          onChange={(e) => setBoardSize(Number(e.target.value))}
        >
          <option value={4}>4 x 4</option>
          <option value={5}>5 x 5</option>
          <option value={6}>6 x 6</option>
          <option value={8}>8 x 8</option>
        </select>
      </div>

      {message && <p className="error-message">{message}</p>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Moves</th>
              <th>Time</th>
              <th>Date</th>
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
                  <td>{score.moves}</td>
                  <td>{score.timeTaken}s</td>
                  <td>{new Date(score.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;