import { useEffect, useState } from "react";
import { api } from "../api";

export default function ActivityHistory({ userId, refreshTrigger, onActivityDeleted }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load activities when userId updates or a new activity is added (refreshTrigger changes)
    useEffect(() => {
        if (userId) {
            setLoading(true);
            api.get(`/activity/user/${userId}`)
                .then(res => setActivities(res.data))
                .catch(err => console.error("Failed to load history", err))
                .finally(() => setLoading(false));
        }
    }, [userId, refreshTrigger]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this activity?")) return;

        try {
            await api.delete(`/activity/${id}`);
            // Remove from local list immediately
            setActivities(prev => prev.filter(a => a._id !== id));
            // Notify parent to refresh stats
            if (onActivityDeleted) onActivityDeleted();
        } catch (err) {
            alert("Failed to delete activity");
            console.error(err);
        }
    };

    if (loading) return <p>Loading history...</p>;
    if (activities.length === 0) return <p className="text-gray-500">No activities yet.</p>;

    return (
        <div className="card">
            <h3>📜 Recent Activities</h3>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <thead>
                        <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                            <th style={{ padding: "8px" }}>Activity</th>
                            <th style={{ padding: "8px" }}>Carbon</th>
                            <th style={{ padding: "8px" }}>Type</th>
                            <th style={{ padding: "8px" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map(a => (
                            <tr key={a._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                <td style={{ padding: "8px" }}>{a.rawText}</td>
                                <td style={{ padding: "8px", fontWeight: "bold", color: "#dc2626" }}>
                                    {a.carbonKg.toFixed(2)} kg
                                </td>
                                <td style={{ padding: "8px" }}>
                                    <span style={{
                                        background: "#e5e7eb",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontSize: "0.75rem"
                                    }}>
                                        {a.type}
                                    </span>
                                </td>
                                <td style={{ padding: "8px" }}>
                                    <button
                                        onClick={() => handleDelete(a._id)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#9ca3af"
                                        }}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
