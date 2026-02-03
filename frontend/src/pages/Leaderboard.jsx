import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/user/leaderboard")
            .then(res => setUsers(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="container">
            <div className="header">
                <h1>🏆 Global Leaderboard</h1>
                <Link to="/" className="button secondary">Back to Dashboard</Link>
            </div>

            <div className="card">
                {loading ? (
                    <p>Loading scores...</p>
                ) : (
                    <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                <th style={{ padding: "10px" }}>Rank</th>
                                <th style={{ padding: "10px" }}>User</th>
                                <th style={{ padding: "10px" }}>GreenScore</th>
                                <th style={{ padding: "10px" }}>Tier</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => (
                                <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "10px", fontWeight: "bold" }}>#{i + 1}</td>
                                    <td style={{ padding: "10px" }}>{u.name}</td>
                                    <td style={{ padding: "10px", color: "#16a34a", fontWeight: "bold" }}>
                                        {u.greenScore.toFixed(1)}
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                        <span style={{
                                            padding: "2px 8px",
                                            borderRadius: "12px",
                                            background: u.tier === "premium" ? "#fef3c7" : "#e5e7eb",
                                            color: u.tier === "premium" ? "#d97706" : "#374151",
                                            fontSize: "0.8rem"
                                        }}>
                                            {u.tier.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
