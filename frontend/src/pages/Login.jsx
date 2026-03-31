import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Leaf } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login({ token: res.data.token, userId: res.data.userId });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-gradient">
      <div className="glass" style={{
        borderRadius: "1.75rem", padding: "2.5rem 2rem",
        width: "100%", maxWidth: 420,
        position: "relative", zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem",
            boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
          }}>
            <Leaf size={28} color="white" />
          </div>
          <h1 style={{ color: "white", margin: "0 0 0.25rem", fontSize: "1.75rem" }}>GreenScore+</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: "0.9rem" }}>
            Track your carbon footprint the smart way.
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
            color: "#fca5a5", padding: "0.75rem 1rem", borderRadius: "10px",
            marginBottom: "1rem", fontSize: "0.9rem",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <label style={{ color: "rgba(255,255,255,0.85)" }}>Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", color: "white" }}
          />

          <label style={{ color: "rgba(255,255,255,0.85)", marginTop: "0.75rem" }}>Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", color: "white" }}
          />

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-lg"
            style={{ width: "100%", marginTop: "1.25rem", background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            {loading ? "Signing in…" : "Sign In 🌿"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.25rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
          No account?{" "}
          <Link to="/register" style={{ color: "#6ee7b7", fontWeight: 700, textDecoration: "none" }}>
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
