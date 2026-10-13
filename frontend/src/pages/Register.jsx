import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Leaf, CheckCircle, Star } from "lucide-react";

const TRIAL_FEATURES = [
  "BRSR Compliance Dashboard",
  "Audit Trail & Evidence Vault",
  "CSV Bulk Import",
  "PDF Report Export",
  "Industry Benchmarks",
  "Team Collaboration",
];

export default function Register() {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/register", { email, password, name, companyName });
      // Auto-login after register
      login({
        token: res.data.token,
        userId: res.data.userId,
        email: res.data.email,
        name: res.data.name,
        companyName: res.data.companyName,
        tier: res.data.tier,
        trialActive: res.data.trialActive,
        trialEndsAt: res.data.trialEndsAt,
        trialDaysLeft: res.data.trialDaysLeft,
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-gradient" style={{ display: "flex", gap: "2rem", flexWrap: "wrap", padding: "2rem" }}>
      {/* Trial features panel */}
      <div style={{
        flex: "1 1 340px", maxWidth: 400,
        position: "relative", zIndex: 1, padding: "2rem", color: "white",
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)",
          padding: "0.3rem 0.9rem", borderRadius: "999px", fontSize: "0.8rem",
          fontWeight: 700, marginBottom: "1.5rem", color: "#6ee7b7",
          width: "fit-content",
        }}>
          <Star size={12} fill="#fbbf24" color="#fbbf24" /> 14-DAY FREE TRIAL
        </div>

        <h2 style={{ color: "white", fontSize: "1.6rem", marginBottom: "1rem", lineHeight: 1.3 }}>
          Get full access to every feature — free for 14 days
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem" }}>
          No credit card required. Experience the full BRSR compliance workflow before you commit.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {TRIAL_FEATURES.map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle size={16} color="#34d399" />
              <span style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.9)" }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Register form */}
      <div className="glass" style={{
        borderRadius: "1.75rem", padding: "2.5rem 2rem",
        width: "100%", maxWidth: 420, flex: "1 1 320px",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem",
            boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
          }}>
            <Leaf size={28} color="white" />
          </div>
          <h1 style={{ color: "white", margin: "0 0 0.25rem", fontSize: "1.5rem" }}>Join GreenScore+</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: "0.88rem" }}>
            Start your free trial today — all features unlocked.
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
          <label style={{ color: "rgba(255,255,255,0.85)" }}>Full Name</label>
          <input id="register-name" type="text" placeholder="Your name"
            value={name} onChange={e => setName(e.target.value)}
            style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", color: "white" }}
          />

          <label style={{ color: "rgba(255,255,255,0.85)", marginTop: "0.5rem" }}>Company Name</label>
          <input id="register-company" type="text" placeholder="Your company (optional)"
            value={companyName} onChange={e => setCompanyName(e.target.value)}
            style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", color: "white" }}
          />

          <label style={{ color: "rgba(255,255,255,0.85)", marginTop: "0.5rem" }}>Email</label>
          <input id="register-email" type="email" placeholder="you@company.com"
            value={email} onChange={e => setEmail(e.target.value)}
            style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", color: "white" }}
          />

          <label style={{ color: "rgba(255,255,255,0.85)", marginTop: "0.5rem" }}>Password</label>
          <input id="register-password" type="password" placeholder="Min. 6 characters"
            value={password} onChange={e => setPassword(e.target.value)}
            style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", color: "white" }}
          />

          <button id="register-submit" type="submit" disabled={loading}
            className="btn-lg" style={{ width: "100%", marginTop: "1.25rem", background: "linear-gradient(135deg, #10b981, #059669)" }}>
            {loading ? "Creating account…" : "Start Free Trial 🚀"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1rem", color: "rgba(255,255,255,0.6)", fontSize: "0.78rem" }}>
          By signing up, you agree to our Terms of Service.<br />
          14-day free trial · No credit card · Cancel anytime
        </p>

        <p style={{ textAlign: "center", marginTop: "0.75rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#6ee7b7", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
