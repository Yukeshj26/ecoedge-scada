import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';

import Nav from './components/Nav';
import Dashboard from './pages/Dashboard';
import Nodes from './pages/Nodes';
import Alerts from './pages/Alerts';
import AdminTerminal from './pages/AdminTerminal'; 
import Login from './pages/Login';
import './index.css';

// ─── PROTECTED ROUTE COMPONENT ──────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    // Listen for changes in the user's login state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  if (loading) return <div className="page">INITIATING SECURITY CHECK...</div>;

  // If no user is logged in, send them to the login page
  return user ? children : <Navigate to="/login" />;
};

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#090c0f' }}>
        <Nav />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nodes" element={<Nodes />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/login" element={<Login />} />
            
            {/* SECURE ROUTE: Only accessible if logged in */}
            <Route 
              path="/config" 
              element={
                <ProtectedRoute>
                  <AdminTerminal />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}