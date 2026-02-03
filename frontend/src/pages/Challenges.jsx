import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Trophy, Zap, Salad, Bike, Trash2, CheckCircle, Plus } from "lucide-react";
import confetti from "canvas-confetti"; // I'll use a simple effect or just CSS for now if package missing

export default function Challenges() {
    const { auth } = useAuth();
    const [allChallenges, setAllChallenges] = useState([]);
    const [myChallenges, setMyChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    // Icon mapping
    const icons = { Salad, Bike, Zap, Trash2 };

    const loadData = async () => {
        try {
            setLoading(true);
            const [sysRes, userRes] = await Promise.all([
                api.get("/user/challenges"),
                api.get(`/dashboard/${auth.userId}`) // to get user data including challenges
            ]);
            setAllChallenges(sysRes.data);
            // We need to fetch user challenges specifically or rely on dashboard data
            // Let's assume dashboard returns user object or we fetch user profile
            const userProfile = await api.get(`/user/leaderboard`); // Not ideal, let's just use what we have or add a better endpoint
            // Actually, I should have added a /user/me endpoint. 
            // For now, I'll rely on the join response update or fetch dashboard again.
            // Let's just track locally for MVP or re-fetch dashboard.
            const dashRes = await api.get(`/dashboard/${auth.userId}`);
            setMyChallenges(dashRes.data.challenges || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const joinChallenge = async (id) => {
        try {
            const res = await api.post("/user/challenges/join", { challengeId: id });
            setMyChallenges(res.data);
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch (err) {
            alert(err.response?.data?.error || "Failed to join");
        }
    };

    const updateProgress = async (id) => {
        try {
            const res = await api.post("/user/challenges/progress", { challengeId: id });
            alert(res.data.message);
            if (res.data.message.includes("Completed")) {
                confetti();
            }
            setMyChallenges(res.data.challenges);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="container">Loading challenges...</div>;

    return (
        <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <h1 style={{ fontSize: "2.5rem", color: "#166534" }}>Eco-Challenges</h1>
                <p style={{ color: "#64748b", fontSize: "1.1rem" }}>Join limited-time quests to boost your impact and score.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
                {allChallenges.map(c => {
                    const myCh = myChallenges.find(mc => mc.id === c.id && mc.status === "active");
                    const completed = myChallenges.find(mc => mc.id === c.id && mc.status === "completed");
                    const Icon = icons[c.icon] || Trophy;

                    return (
                        <div key={c.id} className="card" style={{
                            border: completed ? "2px solid #10b981" : myCh ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            {completed && <div style={{ position: "absolute", top: 0, right: 0, background: "#10b981", color: "white", padding: "5px 15px", borderRadius: "0 0 0 10px", fontWeight: "bold" }}>COMPLETED</div>}

                            <div style={{ display: "flex", gap: "15px", alignItems: "start", marginBottom: "1rem" }}>
                                <div style={{ background: "#f1f5f9", padding: "12px", borderRadius: "12px" }}>
                                    <Icon size={32} color="#0f172a" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{c.title}</h3>
                                    <p style={{ color: "#64748b", margin: "5px 0" }}>{c.description}</p>
                                    <p style={{ fontWeight: "bold", color: "#d97706" }}>+{c.reward} pts</p>
                                </div>
                            </div>

                            {myCh ? (
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "0.9rem" }}>
                                        <span>Progress</span>
                                        <span>{myCh.progress} / {c.target}</span>
                                    </div>
                                    <div style={{ height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden", marginBottom: "15px" }}>
                                        <div style={{
                                            height: "100%",
                                            width: `${(myCh.progress / c.target) * 100}%`,
                                            background: "#3b82f6",
                                            transition: "width 0.5s ease"
                                        }} />
                                    </div>
                                    <button onClick={() => updateProgress(c.id)} style={{ width: "100%", background: "#3b82f6" }}>
                                        Log Progress (+1)
                                    </button>
                                </div>
                            ) : completed ? (
                                <button disabled style={{ width: "100%", background: "#10b981", opacity: 1 }}>
                                    <CheckCircle size={18} /> Done!
                                </button>
                            ) : (
                                <button onClick={() => joinChallenge(c.id)} style={{ width: "100%" }} className="secondary glass">
                                    <Plus size={18} /> Join Challenge
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
