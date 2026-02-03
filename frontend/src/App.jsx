import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Challenges from "./pages/Challenges";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/login" replace />;
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
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
