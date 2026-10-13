/**
 * Team.jsx
 * Organization management: create, invite, members list.
 */

import { useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Building2, Users, UserPlus, Crown, LogOut, Copy,
  Check, Settings, ChevronDown, Shield
} from "lucide-react";

export default function Team() {
  const { auth, updateAuth } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Create org form
  const [createForm, setCreateForm] = useState({ name: "", industry: "IT/Software", employeeCount: 5, state: "" });
  const [industries, setIndustries] = useState([]);
  const [states, setStates] = useState([]);
  const [creating, setCreating] = useState(false);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [inviting, setInviting] = useState(false);

  // Join form
  const [joinToken, setJoinToken] = useState("");
  const [joining, setJoining] = useState(false);

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadOrg();
    loadMeta();
  }, []);

  const loadOrg = async () => {
    try {
      const res = await api.get("/org/mine");
      setOrg(res.data);
    } catch (e) { /* no org */ }
    setLoading(false);
  };

  const loadMeta = async () => {
    try {
      const res = await api.get("/org/meta");
      setIndustries(res.data.industries || []);
      setStates(res.data.states || []);
    } catch (e) { /* ignore */ }
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) { setError("Organization name is required"); return; }
    setCreating(true); setError("");
    try {
      const res = await api.post("/org", createForm);
      setOrg(res.data);
      updateAuth({ organizationId: res.data._id, orgRole: "admin" });
      setShowCreate(false);
      setSuccess("Organization created!");
      setTimeout(() => setSuccess(""), 3000);
      loadOrg();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create organization");
    } finally { setCreating(false); }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) { setError("Email is required"); return; }
    setInviting(true); setError("");
    try {
      const res = await api.post("/org/invite", { email: inviteEmail });
      setInviteToken(res.data.token);
      setInviteEmail("");
      setSuccess("Invite sent!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send invite");
    } finally { setInviting(false); }
  };

  const handleJoin = async () => {
    if (!joinToken.trim()) { setError("Invite token is required"); return; }
    setJoining(true); setError("");
    try {
      const res = await api.post("/org/join", { token: joinToken });
      setOrg(res.data.org);
      updateAuth({ organizationId: res.data.org._id, orgRole: "member" });
      setJoinToken("");
      setSuccess("Joined organization!");
      setTimeout(() => setSuccess(""), 3000);
      loadOrg();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to join");
    } finally { setJoining(false); }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm("Remove this member?")) return;
    try {
      await api.delete(`/org/member/${memberId}`);
      loadOrg();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove member");
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this organization?")) return;
    try {
      await api.post("/org/leave");
      setOrg(null);
      updateAuth({ organizationId: null, orgRole: null });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to leave");
    }
  };

  const handleUpdateOrg = async () => {
    try {
      await api.put("/org", createForm);
      setShowSettings(false);
      setSuccess("Settings updated!");
      setTimeout(() => setSuccess(""), 3000);
      loadOrg();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update");
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(inviteToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container">
        {[1, 2].map(i => (
          <div key={i} className="skeleton" style={{ height: 120, borderRadius: "var(--radius-lg)", marginBottom: "1rem" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "1rem",
        marginBottom: "1.5rem", flexWrap: "wrap",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          padding: "12px", borderRadius: "14px",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
        }}>
          <Users size={24} color="white" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Team</h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Manage your organization and team members
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1rem", fontSize: "0.9rem" }}>
          {error}
          <button onClick={() => setError("")} className="btn-ghost btn-sm" style={{ float: "right", padding: "0 0.3rem" }}>×</button>
        </div>
      )}
      {success && (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1rem", fontSize: "0.9rem" }}>
          {success}
        </div>
      )}

      {/* No org — Create or Join */}
      {!org && (
        <div className="card-grid">
          {/* Create */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
            borderColor: "#c4b5fd", cursor: showCreate ? "default" : "pointer",
          }} onClick={() => !showCreate && setShowCreate(true)}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Building2 size={20} color="#6366f1" />
              <h3 style={{ margin: 0 }}>Create Organization</h3>
            </div>

            {!showCreate ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Set up your company to collaborate with team members and track organization-wide emissions.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input placeholder="Company name" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
                <select value={createForm.industry} onChange={e => setCreateForm({ ...createForm, industry: e.target.value })}>
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <input type="number" placeholder="Employee count" value={createForm.employeeCount} onChange={e => setCreateForm({ ...createForm, employeeCount: parseInt(e.target.value) || 1 })} min={1} />
                <select value={createForm.state} onChange={e => setCreateForm({ ...createForm, state: e.target.value })}>
                  <option value="">Select state (for electricity factor)</option>
                  {states.map(s => <option key={s.value} value={s.value}>{s.label} ({s.factor} kg/kWh)</option>)}
                </select>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={handleCreate} disabled={creating} style={{ flex: 1, background: "#6366f1" }}>
                    {creating ? "Creating…" : "🏢 Create"}
                  </button>
                  <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Join */}
          <div className="card" style={{
            background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
            borderColor: "#bbf7d0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <UserPlus size={20} color="var(--primary)" />
              <h3 style={{ margin: 0 }}>Join Organization</h3>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              Have an invite token? Enter it below to join your team.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input placeholder="Paste invite token" value={joinToken} onChange={e => setJoinToken(e.target.value)} />
              <button onClick={handleJoin} disabled={joining}>
                {joining ? "…" : "Join"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Has org */}
      {org && (
        <>
          {/* Org info card */}
          <div className="card" style={{ marginBottom: "1.5rem", border: "2px solid #c4b5fd" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <Building2 size={20} color="#6366f1" />
                  <h2 style={{ margin: 0 }}>{org.name}</h2>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  <span className="badge badge-purple">{org.industry}</span>
                  <span className="badge badge-gray">{org.employeeCount} employees</span>
                  {org.state && <span className="badge badge-blue">{org.state}</span>}
                  <span className="badge badge-green">{org.tier} plan</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                {auth?.orgRole === "admin" && (
                  <button className="btn-ghost btn-sm" onClick={() => {
                    setCreateForm({ name: org.name, industry: org.industry, employeeCount: org.employeeCount, state: org.state || "" });
                    setShowSettings(!showSettings);
                  }}>
                    <Settings size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Settings panel */}
            {showSettings && (
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input placeholder="Name" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
                <select value={createForm.industry} onChange={e => setCreateForm({ ...createForm, industry: e.target.value })}>
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <input type="number" placeholder="Employees" value={createForm.employeeCount} onChange={e => setCreateForm({ ...createForm, employeeCount: parseInt(e.target.value) || 1 })} />
                <select value={createForm.state} onChange={e => setCreateForm({ ...createForm, state: e.target.value })}>
                  <option value="">Select state</option>
                  {states.map(s => <option key={s.value} value={s.value}>{s.label} ({s.factor} kg/kWh)</option>)}
                </select>
                <button onClick={handleUpdateOrg} style={{ background: "#6366f1" }}>💾 Save Settings</button>
              </div>
            )}
          </div>

          {/* Members */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={18} /> Members ({org.members?.length || 0})
              </h3>
              {auth?.orgRole === "admin" && (
                <button className="btn-ghost btn-sm" onClick={() => setShowInvite(!showInvite)}
                  style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
                >
                  <UserPlus size={14} /> Invite
                </button>
              )}
            </div>

            {/* Invite panel */}
            {showInvite && (
              <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f5f3ff", borderRadius: "10px", border: "1px solid #e9d5ff" }}>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <input placeholder="member@company.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                  <button onClick={handleInvite} disabled={inviting} style={{ background: "#6366f1" }}>
                    {inviting ? "…" : "Send Invite"}
                  </button>
                </div>
                {inviteToken && (
                  <div style={{ background: "white", padding: "0.75rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <code style={{ flex: 1, fontSize: "0.8rem", wordBreak: "break-all" }}>{inviteToken}</code>
                    <button className="btn-ghost btn-sm" onClick={copyToken}>
                      {copied ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  Share the invite token with the team member. They can paste it on this page to join.
                </p>
              </div>
            )}

            {/* Member list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {(org.members || []).map((m, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.75rem 1rem", background: "var(--bg-card)", borderRadius: "10px",
                  border: "1px solid var(--border)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: m.role === "admin" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "linear-gradient(135deg, #10b981, #059669)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: 700, fontSize: "0.85rem",
                    }}>
                      {(m.name || m.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem" }}>
                        {m.name || m.email}
                        {m.role === "admin" && (
                          <Crown size={12} color="#f59e0b" style={{ marginLeft: 4, verticalAlign: "middle" }} />
                        )}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {m.email} · GreenScore: {m.greenScore || 0}
                      </p>
                    </div>
                  </div>

                  {auth?.orgRole === "admin" && m.userId?.toString() !== auth.userId && (
                    <button className="btn-ghost btn-sm" onClick={() => handleRemoveMember(m.userId)}
                      style={{ color: "#ef4444", fontSize: "0.8rem" }}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Pending invites */}
            {org.invites?.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Pending Invites ({org.invites.length})
                </p>
                {org.invites.map((inv, i) => (
                  <div key={i} style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: "0.3rem 0" }}>
                    📧 {inv.email}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leave org */}
          {auth?.orgRole !== "admin" && (
            <button className="btn-ghost" onClick={handleLeave} style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <LogOut size={16} /> Leave Organization
            </button>
          )}
        </>
      )}
    </div>
  );
}
