import { TreeDeciduous, TreePine } from "lucide-react";

export default function CarbonForest({ score }) {
    // 1 Tree for every 10 points
    const treeCount = Math.floor(score / 10);
    const trees = Array.from({ length: treeCount });

    return (
        <div className="card" style={{
            background: "linear-gradient(to bottom, #dcfce7, #bbf7d0)",
            border: "1px solid #86efac",
            textAlign: "center",
            position: "relative",
            overflow: "hidden"
        }}>
            <div style={{ position: "relative", zIndex: 2 }}>
                <h3 style={{ color: "#166534", marginBottom: "0.5rem" }}>🌳 My Carbon Forest</h3>
                <p style={{ color: "#15803d", marginBottom: "1.5rem" }}>
                    You have grown <b>{treeCount} trees</b> based on your GreenScore!
                </p>

                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    justifyContent: "center",
                    minHeight: "80px"
                }}>
                    {treeCount === 0 && <p style={{ opacity: 0.6 }}>Keep improving your score to plant your first tree!</p>}

                    {trees.map((_, i) => (
                        <div key={i} className="pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                            {i % 2 === 0 ? (
                                <TreeDeciduous size={32} color="#15803d" fill="#22c55e" />
                            ) : (
                                <TreePine size={32} color="#065f46" fill="#16a34a" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Background decoration */}
            <div style={{
                position: "absolute",
                bottom: -20,
                left: 0,
                right: 0,
                height: "40px",
                background: "#4ade80",
                borderRadius: "50% 50% 0 0",
                opacity: 0.5,
                zIndex: 1
            }} />
        </div>
    );
}
