import { useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, Star, Zap, Shield, Crown, Loader, ArrowRight } from "lucide-react";

export default function Pricing() {
  const { auth, updateAuth } = useAuth();
  const [plans, setPlans] = useState(null);
  const [billing, setBilling] = useState("monthly");
  const [loading, setLoading] = useState("");
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansRes, statusRes] = await Promise.all([
        api.get("/payment/plans"),
        api.get("/payment/status"),
      ]);
      setPlans(plansRes.data);
      setStatus(statusRes.data);
    } catch (e) { console.error(e); }
  };

  const handleUpgrade = async (plan) => {
    setLoading(plan);
    setMessage("");
    try {
      // Create order
      const orderRes = await api.post("/payment/create-order", { plan, billing });
      const order = orderRes.data;

      if (order.demoMode) {
        // Demo mode — simulate payment success
        const verifyRes = await api.post("/payment/verify", {
          orderId: order.orderId,
          paymentId: `demo_pay_${Date.now()}`,
          signature: "demo",
          plan,
          billing,
        });
        setMessage(verifyRes.data.message);
        updateAuth({ tier: plan, trialActive: false });
        loadData();
        setLoading("");
        return;
      }

      // Real Razorpay checkout
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "GreenScore+",
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan — ${billing}`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/payment/verify", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              plan,
              billing,
            });
            setMessage(verifyRes.data.message);
            updateAuth({ tier: plan, trialActive: false });
            loadData();
          } catch (err) {
            setMessage("Payment verification failed. Contact support.");
          }
          setLoading("");
        },
        prefill: { email: auth?.email || "" },
        theme: { color: "#10b981" },
        modal: {
          ondismiss: () => setLoading(""),
        },
      };

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to create order");
      setLoading("");
    }
  };

  const handleStartTrial = async () => {
    setLoading("trial");
    try {
      const res = await api.post("/payment/start-trial");
      setMessage(res.data.message);
      updateAuth({ trialActive: true, trialEndsAt: res.data.trialEndsAt, trialDaysLeft: res.data.trialDaysLeft });
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to start trial");
    }
    setLoading("");
  };

  const currentTier = status?.tier || "free";
  const trialActive = status?.trialActive;
  const trialDaysLeft = status?.trialDaysLeft || 0;

  const tierPlans = [
    {
      id: "free", name: "Free", icon: Zap,
      priceMonthly: 0, priceYearly: 0,
      features: ["50 activities/month", "Basic dashboard & charts", "GreenScore tracker", "Emission factor library", "Eco challenges"],
      color: "#64748b",
    },
    {
      id: "starter", name: "Starter", icon: Star,
      priceMonthly: 799, priceYearly: 7990,
      features: ["Unlimited activities", "CSV bulk import", "PDF report export", "3 team members", "Full benchmarks"],
      color: "#0ea5e9",
    },
    {
      id: "business", name: "Business", icon: Shield, popular: true,
      priceMonthly: 2999, priceYearly: 29990,
      features: ["Everything in Starter", "BRSR Compliance Dashboard", "Audit trail (legal defense)", "Evidence vault (bill uploads)", "Compliance calendar & alerts", "Regulatory updates feed", "Year-over-year baselines", "10 team members"],
      color: "#10b981",
    },
    {
      id: "enterprise", name: "Enterprise", icon: Crown,
      priceMonthly: 9999, priceYearly: 99990,
      features: ["Everything in Business", "Unlimited team members", "API access", "Custom report templates", "White-label options", "Priority support", "Dedicated CSM"],
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="container" style={{ maxWidth: 1100 }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Choose Your Plan</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
          Start with a 14-day free trial. No credit card required.
        </p>

        {/* Billing toggle */}
        <div style={{
          display: "inline-flex", gap: "0.25rem", background: "#f1f5f9",
          borderRadius: "999px", padding: "0.25rem", marginTop: "1rem",
        }}>
          <button
            onClick={() => setBilling("monthly")}
            style={{
              padding: "0.5rem 1.25rem", borderRadius: "999px", fontSize: "0.85rem",
              background: billing === "monthly" ? "white" : "transparent",
              color: billing === "monthly" ? "var(--text-main)" : "var(--text-muted)",
              boxShadow: billing === "monthly" ? "var(--shadow-sm)" : "none",
              border: "none",
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            style={{
              padding: "0.5rem 1.25rem", borderRadius: "999px", fontSize: "0.85rem",
              background: billing === "yearly" ? "white" : "transparent",
              color: billing === "yearly" ? "var(--text-main)" : "var(--text-muted)",
              boxShadow: billing === "yearly" ? "var(--shadow-sm)" : "none",
              border: "none",
            }}
          >
            Yearly <span style={{ color: "#10b981", fontWeight: 700, fontSize: "0.78rem" }}>Save 17%</span>
          </button>
        </div>
      </div>

      {/* Trial banner */}
      {trialActive && (
        <div style={{
          background: "linear-gradient(135deg, #ecfdf5, #f5f3ff)",
          border: "2px solid #10b981", borderRadius: "16px",
          padding: "1.25rem 1.5rem", marginBottom: "1.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "1rem",
        }}>
          <div>
            <p style={{ fontWeight: 800, margin: "0 0 0.25rem", color: "#065f46" }}>
              🎉 Free Trial Active — {trialDaysLeft} days left
            </p>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "#047857" }}>
              You have full access to Business features. Subscribe before your trial ends!
            </p>
          </div>
          <button onClick={() => handleUpgrade("business")} disabled={!!loading}>
            Upgrade Now
          </button>
        </div>
      )}

      {message && (
        <div style={{
          background: "#ecfdf5", color: "#065f46", padding: "1rem 1.5rem",
          borderRadius: "12px", marginBottom: "1.5rem", fontWeight: 600,
          textAlign: "center",
        }}>
          {message}
        </div>
      )}

      {/* Plans grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1.25rem" }}>
        {tierPlans.map(plan => {
          const Icon = plan.icon;
          const price = billing === "yearly" ? plan.priceYearly : plan.priceMonthly;
          const isCurrent = currentTier === plan.id;
          const isDowngrade = ["free", "starter", "business", "enterprise"].indexOf(plan.id) < ["free", "starter", "business", "enterprise"].indexOf(currentTier);

          return (
            <div key={plan.id} className="card" style={{
              border: plan.popular ? `2px solid ${plan.color}` : isCurrent ? "2px solid var(--primary)" : "1px solid var(--border)",
              position: "relative", padding: "2rem 1.5rem",
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                  background: plan.color, color: "white", padding: "0.2rem 0.8rem",
                  borderRadius: "0 0 8px 8px", fontSize: "0.7rem", fontWeight: 800,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                }}>
                  Recommended
                </div>
              )}

              {isCurrent && (
                <div style={{
                  position: "absolute", top: 12, right: 12,
                  background: "#dcfce7", color: "#166534",
                  padding: "0.2rem 0.6rem", borderRadius: "6px",
                  fontSize: "0.72rem", fontWeight: 800,
                }}>
                  Current
                </div>
              )}

              <div style={{
                width: 44, height: 44, borderRadius: "12px",
                background: `${plan.color}15`, display: "flex",
                alignItems: "center", justifyContent: "center", marginBottom: "1rem",
              }}>
                <Icon size={22} color={plan.color} />
              </div>

              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem" }}>{plan.name}</h3>

              <div style={{ marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2.2rem", fontWeight: 900 }}>
                  {plan.id === "free" ? "Free" : `₹${price.toLocaleString("en-IN")}`}
                </span>
                {plan.id !== "free" && (
                  <span style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                    /{billing === "yearly" ? "year" : "month"}
                  </span>
                )}
              </div>

              <ul style={{ listStyle: "none", padding: 0, marginBottom: "1.5rem" }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{
                    display: "flex", alignItems: "flex-start", gap: "0.5rem",
                    padding: "0.3rem 0", fontSize: "0.85rem", color: "var(--text-muted)",
                  }}>
                    <CheckCircle size={14} color={plan.color} style={{ marginTop: 2, flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div style={{
                  textAlign: "center", padding: "0.75rem", borderRadius: "999px",
                  background: "#f1f5f9", color: "var(--text-muted)", fontWeight: 600,
                }}>
                  Current Plan
                </div>
              ) : plan.id === "free" ? null : isDowngrade ? null : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={!!loading}
                  style={{
                    width: "100%", background: plan.popular ? plan.color : undefined,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                  }}
                >
                  {loading === plan.id ? <><Loader size={14} className="spin" /> Processing…</> : <>Upgrade <ArrowRight size={14} /></>}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="card" style={{ marginTop: "2rem", maxWidth: 700, marginLeft: "auto", marginRight: "auto" }}>
        <h3>Frequently Asked Questions</h3>
        {[
          { q: "What happens after the trial?", a: "You'll revert to the Free plan with basic features. Your data is never deleted — upgrade anytime to regain access." },
          { q: "Can I change plans anytime?", a: "Yes! Upgrade or downgrade at any time. Changes take effect immediately." },
          { q: "Is my data safe?", a: "All data is encrypted in transit and at rest. We use MongoDB Atlas with SOC2-compliant infrastructure." },
          { q: "Do you support Razorpay UPI?", a: "Yes — pay via UPI, credit/debit card, net banking, or wallets through Razorpay's secure checkout." },
        ].map((faq, i) => (
          <div key={i} style={{ marginBottom: "1rem" }}>
            <p style={{ fontWeight: 700, margin: "0 0 0.25rem", color: "var(--text-main)" }}>{faq.q}</p>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
