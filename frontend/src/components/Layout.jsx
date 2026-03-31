import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Leaf, Trophy, LayoutDashboard, LogOut, Zap } from "lucide-react";

export default function Layout() {
    const { logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navLink = (path, icon, label) => (
        <Link
            to={path}
            style={{
                display: "flex", alignItems: "center", gap: "0.45rem",
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-full)",
                background: isActive(path) ? "var(--primary-light)" : "transparent",
                color: isActive(path) ? "var(--primary-dark)" : "var(--text-muted)",
                fontWeight: isActive(path) ? 700 : 500,
                fontSize: "0.9rem",
                transition: "var(--transition)",
                border: isActive(path) ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
            }}
        >
            {icon}
            <span className="nav-label">{label}</span>
        </Link>
    );

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Sticky top nav */}
            <header style={{
                padding: "0.85rem 2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky", top: 0, zIndex: 50,
                background: "rgba(240,253,244,0.85)",
                backdropFilter: "blur(16px) saturate(180%)",
                WebkitBackdropFilter: "blur(16px) saturate(180%)",
                borderBottom: "1px solid rgba(16,185,129,0.12)",
                boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
            }}>
                {/* Brand */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                    <div style={{
                        background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                        padding: "8px", borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 4px 10px rgba(16,185,129,0.35)",
                    }}>
                        <Leaf size={22} color="white" fill="white" />
                    </div>
                    <span style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-main)" }}>
                        GreenScore<span style={{ color: "var(--primary)" }}>+</span>
                    </span>
                </div>

                {/* Nav links */}
                <nav style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                    {navLink("/", <LayoutDashboard size={17} />, "Dashboard")}
                    {navLink("/challenges", <Zap size={17} />, "Challenges")}
                    {navLink("/leaderboard", <Trophy size={17} />, "Leaderboard")}
                </nav>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="btn-ghost btn-sm"
                    style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                    <LogOut size={16} />
                    <span className="nav-label">Logout</span>
                </button>
            </header>

            {/* Content */}
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>
        </div>
    );
}

