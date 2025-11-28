import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div 
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f7fafc"
      }}
    >
      <div style={{ 
        width: "350px",
        background: "#fff",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
      }}>
        <h2 style={{ marginBottom: "16px" }}>Admin Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="admin@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
              border: "1px solid #d4d4d4"
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
              border: "1px solid #d4d4d4"
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#0b1220",
              color: "#fff",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Login
          </button>
        </form>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </div>
    </div>
  );
}
