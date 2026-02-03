import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.token;

      const decoded = jwtDecode(token);
      login({ token, userId: decoded.id });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      {error && <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>}
      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={submit} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
      <p style={{ marginTop: "1rem" }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
