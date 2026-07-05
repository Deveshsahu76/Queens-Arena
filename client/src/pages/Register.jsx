import { useState } from "react";
import API from "../api/axios";

const Register = ({ setUser, setCurrentPage }) => {
  const [formData, setFormData] = useState({
    name: "",
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

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/register", formData);

      localStorage.setItem("queensToken", res.data.token);
      localStorage.setItem("queensUser", JSON.stringify(res.data.user));

      setUser(res.data.user);
      setCurrentPage("game");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-card">
      <h1>Create Account</h1>
      <p>Register to save your N-Queens scores.</p>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          required
        />

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
          minLength="6"
        />

        <button type="submit">Register</button>
      </form>

      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default Register;