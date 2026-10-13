import { Link } from "react-router-dom";
import { Leaf, Shield, FileText, Users, BarChart3, Upload, Clock, ChevronRight, Zap, CheckCircle, Star, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: Shield, title: "BRSR Compliance Engine", desc: "Auto-fills 26+ SEBI BRSR indicators from your activity data. No more spreadsheet gymnastics.", color: "#10b981" },
  { icon: FileText, title: "Auditor-Ready Reports", desc: "Generate BRSR-aligned PDF reports with Scope 1/2/3 breakdown. Share with investors in 1 click.", color: "#6366f1" },
  { icon: Clock, title: "Audit Trail", desc: "Every data change is logged with who, when, and what. Your auditor will thank you.", color: "#f59e0b" },
  { icon: Upload, title: "CSV Bulk Import", desc: "Upload months of electricity bills, fuel receipts, and travel logs in one shot.", color: "#0ea5e9" },
  { icon: BarChart3, title: "Industry Benchmarks", desc: "See how your per-employee emissions stack up against 14 Indian industries.", color: "#8b5cf6" },
  { icon: Users, title: "Team Collaboration", desc: "Invite your team, assign roles, and track organization-wide emissions.", color: "#ec4899" },
];

const PROBLEMS = [
  { emoji: "📋", problem: "BRSR reporting is manual, confusing, and expensive", solution: "GreenScore+ auto-fills BRSR indicators from your data" },
  { emoji: "🏭", problem: "No affordable ESG tools for Indian SMEs", solution: "Starting at ₹799/mo — 50x cheaper than enterprise tools" },
  { emoji: "🤖", problem: "Generic AI tools can't maintain audit trails or compliance history", solution: "Every calculation is traceable, verifiable, and auditor-ready" },
  { emoji: "📊", problem: "Spreadsheets break when you need year-over-year tracking", solution: "Persistent baselines + automated period comparisons" },
];

export default function Landing() {
  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white" }}>
      {/* ─── Nav ─── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1.25rem 2rem", maxWidth: 1200, margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            padding: "8px", borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Leaf size={22} color="white" fill="white" />
          </div>
          <span style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.5px" }}>
            GreenScore<span style={{ color: "#10b981" }}>+</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link to="/login" style={{ color: "#94a3b8", textDecoration: "none", fontWeight: 600, padding: "0.5rem 1rem" }}>
            Sign In
          </Link>
          <Link to="/register" style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "white", textDecoration: "none", fontWeight: 700,
            padding: "0.65rem 1.5rem", borderRadius: "999px", fontSize: "0.95rem",
            boxShadow: "0 4px 14px rgba(16,185,129,0.4)",
          }}>
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section style={{
        maxWidth: 1200, margin: "0 auto", padding: "5rem 2rem 4rem",
        textAlign: "center", position: "relative",
      }}>
        {/* Glow effects */}
        <div style={{ position: "absolute", top: "-100px", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
          padding: "0.4rem 1.25rem", borderRadius: "999px", marginBottom: "1.5rem",
          fontSize: "0.85rem", color: "#34d399",
        }}>
          <Zap size={14} /> BRSR Compliance Made Simple
        </div>

        <h1 style={{
          fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 900,
          lineHeight: 1.1, marginBottom: "1.5rem", letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          India's ESG Reporting<br />
          Platform for{" "}
          <span style={{ background: "linear-gradient(135deg, #10b981, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            SMEs
          </span>
        </h1>

        <p style={{
          fontSize: "1.2rem", color: "#94a3b8", maxWidth: 650, margin: "0 auto 2.5rem",
          lineHeight: 1.6,
        }}>
          Track Scope 1/2/3 carbon emissions, auto-generate BRSR reports,
          and stay ahead of SEBI compliance — starting at ₹799/month.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register" style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "white", textDecoration: "none", fontWeight: 800,
            padding: "1rem 2.5rem", borderRadius: "999px", fontSize: "1.1rem",
            boxShadow: "0 8px 30px rgba(16,185,129,0.4)",
            display: "flex", alignItems: "center", gap: "0.5rem",
          }}>
            Start 14-Day Free Trial <ArrowRight size={18} />
          </Link>
          <a href="#features" style={{
            border: "2px solid rgba(255,255,255,0.15)", color: "#e2e8f0",
            textDecoration: "none", fontWeight: 600,
            padding: "1rem 2rem", borderRadius: "999px", fontSize: "1.05rem",
          }}>
            See Features
          </a>
        </div>

        {/* Trust bar */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "2rem", marginTop: "3rem",
          flexWrap: "wrap", opacity: 0.6,
        }}>
          {["CEA India Data", "GHG Protocol", "SEBI BRSR", "ISO 14064"].map(t => (
            <span key={t} style={{ fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ─── Problem → Solution ─── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Why Companies Are Switching
        </h2>
        <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "2.5rem" }}>
          ChatGPT can calculate emissions. But it can't file your BRSR, maintain audit trails, or track compliance deadlines.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px", padding: "1.75rem", transition: "all 0.3s",
            }}>
              <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.75rem" }}>{p.emoji}</span>
              <p style={{ color: "#ef4444", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                ✗ {p.problem}
              </p>
              <p style={{ color: "#34d399", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>
                ✓ {p.solution}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 800, marginBottom: "2.5rem" }}>
          Everything You Need for ESG Compliance
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px", padding: "2rem", position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: f.color,
                }} />
                <div style={{
                  width: 44, height: 44, borderRadius: "12px",
                  background: `${f.color}15`, display: "flex",
                  alignItems: "center", justifyContent: "center", marginBottom: "1rem",
                }}>
                  <Icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "white" }}>{f.title}</h3>
                <p style={{ color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Pricing Preview ─── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Simple, Transparent Pricing
        </h2>
        <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "2.5rem" }}>
          Start free. Upgrade when you're ready. No credit card required for trial.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
          {[
            { name: "Free", price: "₹0", period: "forever", features: ["50 activities/month", "Basic dashboard", "GreenScore", "Emission factors library"], cta: "Get Started", popular: false },
            { name: "Starter", price: "₹799", period: "/month", features: ["Unlimited activities", "CSV Import", "PDF Reports", "3 team members"], cta: "Start Trial", popular: false },
            { name: "Business", price: "₹2,999", period: "/month", features: ["BRSR Compliance Dashboard", "Audit Trail", "Evidence Vault", "10 team members", "Compliance Calendar", "Industry Benchmarks"], cta: "Start Trial", popular: true },
            { name: "Enterprise", price: "₹9,999", period: "/month", features: ["Everything in Business", "Unlimited team", "API Access", "Custom reports", "Priority support"], cta: "Contact Us", popular: false },
          ].map((plan, i) => (
            <div key={i} style={{
              background: plan.popular ? "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(99,102,241,0.1))" : "rgba(255,255,255,0.03)",
              border: plan.popular ? "2px solid #10b981" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px", padding: "2rem", position: "relative",
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                  background: "#10b981", color: "white", padding: "0.25rem 1rem",
                  borderRadius: "0 0 8px 8px", fontSize: "0.72rem", fontWeight: 800,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "white" }}>{plan.name}</h3>
              <div style={{ marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "white" }}>{plan.price}</span>
                <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "1.5rem" }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.35rem 0", fontSize: "0.88rem", color: "#cbd5e1",
                  }}>
                    <CheckCircle size={14} color="#10b981" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" style={{
                display: "block", textAlign: "center", textDecoration: "none",
                padding: "0.75rem", borderRadius: "999px", fontWeight: 700,
                background: plan.popular ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.08)",
                color: "white", fontSize: "0.95rem",
                boxShadow: plan.popular ? "0 4px 14px rgba(16,185,129,0.3)" : "none",
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section style={{
        maxWidth: 800, margin: "0 auto", padding: "5rem 2rem",
        textAlign: "center",
      }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1rem" }}>
          Ready to simplify your ESG reporting?
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "2rem" }}>
          Join 100+ Indian companies using GreenScore+ for BRSR compliance.
          14-day free trial. No credit card required.
        </p>
        <Link to="/register" style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "white", textDecoration: "none", fontWeight: 800,
          padding: "1.1rem 3rem", borderRadius: "999px", fontSize: "1.15rem",
          boxShadow: "0 8px 30px rgba(16,185,129,0.4)",
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
        }}>
          Start Free Trial <ArrowRight size={20} />
        </Link>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "2rem", textAlign: "center", color: "#475569",
        fontSize: "0.85rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <Leaf size={16} color="#10b981" /> GreenScore+ — India's ESG Reporting Platform for SMEs
        </div>
        <p>Emission factors sourced from CEA India, IPCC AR6 & GHG Protocol.</p>
      </footer>
    </div>
  );
}
