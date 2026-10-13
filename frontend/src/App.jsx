import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Challenges from "./pages/Challenges";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import EmissionFactors from "./pages/EmissionFactors";
import Compliance from "./pages/Compliance";
import AuditTrail from "./pages/AuditTrail";
import Pricing from "./pages/Pricing";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/landing" replace />;
}

function PublicRoute({ children }) {
  const { auth } = useAuth();
  return !auth ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/landing" element={
            <PublicRoute><Landing /></PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute><Register /></PublicRoute>
          } />

          {/* Protected Layout Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/team" element={<Team />} />
            <Route path="/emission-factors" element={<EmissionFactors />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/audit-trail" element={<AuditTrail />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
