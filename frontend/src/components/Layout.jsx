import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Leaf, Trophy, LayoutDashboard, LogOut, Star } from "lucide-react";

export default function Layout() {
    const { logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navStyle = (path) => ({
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        textDecoration: "none",
        padding: "0.6rem 1.2rem",
        borderRadius: "12px",
        background: isActive(path) ? "var(--primary-light)" : "transparent",
        color: isActive(path) ? "var(--primary-dark)" : "var(--text-muted)",
        fontWeight: isActive(path) ? "700" : "500",
        transition: "all 0.3s ease"
    });

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
            {/* Top Navigation Bar - Glass Effect */}
            <header className="glass" style={{
                padding: "1rem 2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                zIndex: 50,
                borderBottom: "1px solid rgba(255,255,255,0.3)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                        background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                        padding: "8px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 10px rgba(16, 185, 129, 0.4)"
                    }}>
                        <Leaf size={24} color="white" fill="white" />
                    </div>
                    <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
                        GreenScore<span style={{ color: "var(--primary)" }}>+</span>
                    </span>
                </div>

                <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <Link to="/" style={navStyle("/")}>
                        <LayoutDashboard size={18} />
                        <span className="nav-label">Dashboard</span>
                    </Link>
                    <Link to="/leaderboard" style={navStyle("/leaderboard")}>
                        <Trophy size={18} />
                        <span className="nav-label">Leaderboard</span>
                    </Link>
                    <Link to="/challenges" style={navStyle("/challenges")}>
                        <Star size={18} />
                        <span className="nav-label">Challenges</span>
                    </Link>
                </nav>

                <button
                    onClick={logout}
                    className="secondary"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", borderRadius: "12px" }}
                >
                    <LogOut size={16} /> <span className="nav-label">Logout</span>
                </button>
            </header>

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: "2rem", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
                <Outlet />
            </main>
        </div>
    );
}
