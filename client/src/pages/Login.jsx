import { useState } from "react";
import API from "../api/axios";

const Login = ({ setUser, setCurrentPage }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", formData);

      localStorage.setItem("queensToken", res.data.token);
      localStorage.setItem("queensUser", JSON.stringify(res.data.user));

      setUser(res.data.user);
      setCurrentPage("game");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-card">
      <h1>Login</h1>
      <p>Login and continue your N-Queens journey.</p>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
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

        <button type="submit">Login</button>
      </form>

      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default Login;