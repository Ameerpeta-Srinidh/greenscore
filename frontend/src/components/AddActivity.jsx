import { useState } from "react";
import { api } from "../api";
import { Mic } from "lucide-react";

export default function AddActivity({ userId, onAdded }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [feedback, setFeedback] = useState(null); // { recommendation, savings }
  const [listening, setListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support voice input. Try Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev ? prev + " " + transcript : transcript);
    };

    recognition.start();
  };

  const submit = async () => {
    if (!text.trim()) {
      setError("Please enter an activity description");
      return;
    }

    try {
      setError("");
      setFeedback(null);
      setSuccess("");
      setLoading(true);
      const res = await api.post("/activity/ai-text", {
        userId,
        text
      });

      const { parsedData } = res.data;
      if (parsedData?.recommendation) {
        setFeedback({
          tip: parsedData.recommendation,
          saved: parsedData.potential_savings_kg
        });
      }

      setText("");
      setSuccess("Activity added successfully!");
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add activity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Add Activity</h3>
      {error && <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>}
      {success && <p style={{ color: "#16a34a", marginBottom: "1rem" }}>{success}</p>}

      {/* Smart Coach Feedback */}
      {feedback && (
        <div style={{
          background: "#ecfdf5",
          border: "1px solid #10b981",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "start",
          gap: "10px"
        }}>
          <span style={{ fontSize: "1.5rem" }}>💡</span>
          <div>
            <p style={{ margin: 0, fontWeight: "600", color: "#065f46" }}>Smart Tip:</p>
            <p style={{ margin: "5px 0", color: "#064e3b" }}>{feedback.tip}</p>
            {feedback.saved > 0 && (
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#047857" }}>
                Potential Savings: <b>{feedback.saved} kg CO₂</b>
              </p>
            )}
          </div>
        </div>
      )}

      <div style={{ position: "relative", display: "flex", gap: "10px" }}>
        <input
          value={text}
          placeholder="I travelled 10 km by bus"
          onChange={e => setText(e.target.value)}
          onKeyPress={e => e.key === "Enter" && !loading && submit()}
          style={{ paddingRight: "40px" }} // Space for mic
        />
        <button
          onClick={startListening}
          style={{
            position: "absolute",
            right: "80px", // adjust based on 'Add' button width 
            top: "50%",
            transform: "translateY(-50%)",
            background: listening ? "#fee2e2" : "transparent",
            padding: "8px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            color: listening ? "#dc2626" : "#6b7280"
          }}
          title="Voice Input"
        >
          <Mic size={20} className={listening ? "pulse" : ""} />
        </button>
        <button onClick={submit} disabled={loading} style={{ width: "auto" }}>
          {loading ? "..." : "Add"}
        </button>
      </div>
      {listening && <p style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "5px" }}>🔴 Listening...</p>}
    </div>
  );
}
