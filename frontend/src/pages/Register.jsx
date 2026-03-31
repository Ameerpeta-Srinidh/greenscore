import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { Leaf } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError(""); setSuccess(""); setLoading(true);
    try {
      await api.post("/auth/register", { email, password });
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Email may already be in use.");
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
          <h1 style={{ color: "white", margin: "0 0 0.25rem", fontSize: "1.75rem" }}>Join GreenScore+</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: "0.9rem" }}>
            Start tracking your carbon footprint today.
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
        {success && (
          <div style={{
            background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)",
            color: "#6ee7b7", padding: "0.75rem 1rem", borderRadius: "10px",
            marginBottom: "1rem", fontSize: "0.9rem",
          }}>
            {success}
          </div>
        )}

        <form onSubmit={submit}>
          <label style={{ color: "rgba(255,255,255,0.85)" }}>Email</label>
          <input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", color: "white" }}
          />

          <label style={{ color: "rgba(255,255,255,0.85)", marginTop: "0.75rem" }}>Password</label>
          <input
            id="register-password"
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", color: "white" }}
          />

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="btn-lg"
            style={{ width: "100%", marginTop: "1.25rem", background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            {loading ? "Creating account…" : "Create Account 🌿"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.25rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#6ee7b7", fontWeight: 700, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
