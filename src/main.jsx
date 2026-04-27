// ─────────────────────────────────────────────
//  src/main.jsx — App entry point with routing
// ─────────────────────────────────────────────

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BookingHome, StaffBooking } from "./BookingApp";
import AdminApp from "./AdminApp";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* sis2.beauty/admin → admin dashboard */}
        <Route path="/admin" element={<AdminApp />} />

        {/* sis2.beauty → list of all stylists */}
        <Route path="/" element={<BookingHome />} />

        {/* sis2.beauty/zara → book directly with Zara */}
        <Route path="/:slug" element={<StaffBooking />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
