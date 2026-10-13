import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Leaf, LayoutDashboard, Trophy, Target, FileText, Users,
  BookOpen, Shield, History, CreditCard, LogOut, Crown, Zap
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/compliance", label: "BRSR", icon: Shield },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/audit-trail", label: "Audit Trail", icon: History },
  { to: "/team", label: "Team", icon: Users },
  { to: "/challenges", label: "Challenges", icon: Target },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/emission-factors", label: "Factors", icon: BookOpen },
];

export default function Layout() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const tier = auth?.tier || "free";
  const trialActive = auth?.trialActive;
  const trialDaysLeft = auth?.trialDaysLeft || 0;

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <>
      {/* Trial Banner */}
      {trialActive && (
        <div style={{
          background: "linear-gradient(90deg, #10b981, #059669, #6366f1)",
          color: "white", textAlign: "center",
          padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 600,
          display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem",
          flexWrap: "wrap",
        }}>
          <Zap size={14} />
          Free Trial — {trialDaysLeft} days left. All Business features unlocked!
          <button onClick={() => navigate("/pricing")}
            style={{
              background: "rgba(255,255,255,0.2)", color: "white",
              padding: "0.25rem 0.75rem", fontSize: "0.78rem",
              borderRadius: "999px", border: "1px solid rgba(255,255,255,0.3)",
            }}>
            Subscribe Now
          </button>
        </div>
      )}

      {/* Header */}
      <header className="glass" style={{
        padding: "0.75rem 1.5rem",
        borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            padding: "7px", borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Leaf size={18} color="white" fill="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.3px" }}>
            GreenScore<span style={{ color: "var(--primary)" }}>+</span>
          </span>
          {tier !== "free" && (
            <span style={{
              background: tier === "enterprise" ? "#8b5cf6" : tier === "business" ? "#10b981" : "#0ea5e9",
              color: "white", padding: "2px 8px", borderRadius: "6px",
              fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase",
            }}>
              {tier}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", gap: "0.15rem", overflowX: "auto", flex: 1, justifyContent: "center" }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === "/"}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: "0.35rem",
                  padding: "0.5rem 0.7rem", borderRadius: "8px",
                  fontSize: "0.82rem", fontWeight: 600,
                  textDecoration: "none", whiteSpace: "nowrap",
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                  background: isActive ? "var(--primary-light)" : "transparent",
                  transition: "all 0.2s",
                })}>
                <Icon size={15} />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {(tier === "free" && !trialActive) && (
            <button onClick={() => navigate("/pricing")}
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                padding: "0.4rem 0.9rem", fontSize: "0.78rem",
                display: "flex", alignItems: "center", gap: "0.3rem",
                boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
              }}>
              <Crown size={13} /> Upgrade
            </button>
          )}
          <NavLink to="/pricing"
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 0.7rem",
              borderRadius: "8px", fontSize: "0.82rem", fontWeight: 600,
              textDecoration: "none", color: "var(--text-muted)" }}>
            <CreditCard size={15} />
            <span className="nav-label">Billing</span>
          </NavLink>
          <button onClick={handleLogout}
            className="btn-ghost btn-sm"
            style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <LogOut size={14} />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ padding: "1rem 0" }}>
        <Outlet />
      </main>
    </>
  );
}
