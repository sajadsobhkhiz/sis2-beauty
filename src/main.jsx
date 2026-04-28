import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BookingHome, StaffBooking } from "./BookingApp";
import AdminApp from "./AdminApp";
import LoginPage from "./LoginPage";
import StaffDashboard from "./StaffDashboard";
import { useAuth } from "./shared";
import { signOut } from "./supabase";
import "./index.css";

function AppRouter() {
  const { session, staffProfile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:"#0a0a0d", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="40" height="40" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" strokeDasharray="80" strokeDashoffset="60">
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public booking pages */}
      <Route path="/" element={<BookingHome />} />
      <Route path="/:slug" element={<StaffBooking />} />

      {/* Login — redirect if already logged in */}
      <Route path="/login" element={
        session
          ? <Navigate to={isAdmin ? "/admin" : "/staff"} replace />
          : <LoginPage onLogin={async () => {
              await new Promise(r => setTimeout(r, 500));
              window.location.reload();
            }} />
      } />

      {/* Admin dashboard — requires admin role */}
      <Route path="/admin" element={
        !session
          ? <Navigate to="/login" replace />
          : isAdmin
            ? <AdminApp />
            : <Navigate to="/staff" replace />
      } />

      {/* Staff dashboard — requires login */}
      <Route path="/staff" element={
        loading
          ? <div style={{minHeight:"100vh",background:"#0a0a0d"}}/>
          : !session
            ? <Navigate to="/login" replace />
            : staffProfile
              ? <StaffDashboard
                  staffProfile={staffProfile}
                  onSignOut={async () => { await signOut(); window.location.reload(); }}
                />
              : (
              <div style={{ minHeight:"100vh", background:"#0a0a0d", display:"flex", alignItems:"center", justifyContent:"center", color:"#d4af37", flexDirection:"column", gap:16 }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22 }}>No staff profile found.</p>
                <p style={{ fontSize:13, color:"#6b6050" }}>Ask your admin to link your account in the Staff table.</p>
                <button onClick={async () => { await signOut(); window.location.reload(); }}
                  style={{ padding:"8px 20px", borderRadius:10, border:"1px solid #2a2318", background:"transparent", color:"#6b6050", cursor:"pointer" }}>
                  Sign Out
                </button>
              </div>
            )
      } />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);
