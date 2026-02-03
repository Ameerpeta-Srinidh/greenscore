import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);
      await api.post("/auth/register", { email, password });
      setSuccess("Registered successfully! Please login.");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Register</h2>
      {error && <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>}
      {success && <p style={{ color: "#16a34a", marginBottom: "1rem" }}>{success}</p>}
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
        {loading ? "Registering..." : "Register"}
      </button>
      <p style={{ marginTop: "1rem" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
