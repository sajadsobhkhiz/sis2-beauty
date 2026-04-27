// ─────────────────────────────────────────────
//  Shared UI library — SiS2 Beauty
//  Brand: Gold (#d4af37) on Black (#0a0a0d)
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";

// ── BRAND ─────────────────────────────────────────────────────
export const BRAND = {
  name: "SiS2 Beauty",
  tagline: "Beauty Studio",
  goldLight: "#e9c875",
  gold: "#d4af37",
  goldDark: "#a8852a",
  bronze: "#b8945f",
};

export const PRIMARY_GRADIENT = "linear-gradient(135deg, #e9c875, #d4af37, #a8852a)";

// ── THEMES ────────────────────────────────────────────────────
export const T = {
  dark: {
    bg:"#0a0a0d", card:"#15151a", hover:"#1d1d24", text:"#f5f0e1",
    muted:"#7a7568", border:"#2a2620", shadow:"0 2px 16px rgba(0,0,0,.5)",
    nav:"#0d0d10", accent: BRAND.gold,
  },
  light: {
    bg:"#faf8f3", card:"#ffffff", hover:"#f5f0e6", text:"#1a1612",
    muted:"#8a8270", border:"#e8e0d0", shadow:"0 2px 16px rgba(168,133,42,.1)",
    nav:"#ffffff", accent: BRAND.goldDark,
  },
};

// ── HOOK: auto dark/light ─────────────────────────────────────
export function useTheme() {
  const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [dark, setDark] = useState(prefersDark);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = e => setDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return [dark ? T.dark : T.light, dark, setDark];
}

// ── ICONS ─────────────────────────────────────────────────────
export const Ic = {
  grid:     <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  calendar: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  users:    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3a4 4 0 010 7.7M21 21v-2a4 4 0 00-3-3.87"/></svg>,
  user:     <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  dollar:   <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  list:     <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  plus:     <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  x:        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  check:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>,
  checkBig: <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>,
  sun:      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  moon:     <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  back:     <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>,
  clock:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  link:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  trash:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  edit:     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  // SiS2 logo mark — stylized "S" with crescent
  logoMark: (
    <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#e9c875"/>
          <stop offset="50%" stopColor="#d4af37"/>
          <stop offset="100%" stopColor="#a8852a"/>
        </linearGradient>
      </defs>
      <path d="M28 8 Q32 12 30 18 Q28 22 24 24 Q28 26 30 30 Q32 34 28 36"
            stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="33" cy="10" r="1.5" fill="url(#goldGrad)"/>
      <path d="M14 20 Q12 14 16 10 Q20 8 22 12"
            stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
};

export const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
export const DAYS_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// ── HELPERS ───────────────────────────────────────────────────
export function Avatar({ name="?", size=38, color, photoUrl }) {
  if (photoUrl) return <img src={photoUrl} alt={name} style={{ width:size, height:size, borderRadius:size*0.28, objectFit:"cover", flexShrink:0, border:`1px solid ${BRAND.gold}30` }} />;
  const palette = [BRAND.gold, BRAND.bronze, "#c9a961", "#9b7d3a", "#bfa05a"];
  const bg = color || palette[(name.charCodeAt(0)||0) % palette.length];
  const initials = name.includes(" ") ? name.split(" ").map(w=>w[0]).join("").slice(0,2) : name.slice(0,2);
  return <div style={{ width:size, height:size, borderRadius:size*0.28, background:`${bg}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.36, fontWeight:700, color:bg, flexShrink:0, fontFamily:"'Cormorant Garamond',serif", letterSpacing:.5 }}>{initials.toUpperCase()}</div>;
}

export function Badge({ label }) {
  const map = {
    Confirmed:"#7cb389", Pending: BRAND.gold, Cancelled:"#c97070", Completed: BRAND.bronze,
    VIP: BRAND.gold, Regular: BRAND.bronze, New:"#7cb389",
    Active:"#7cb389", "On Leave": BRAND.gold, Inactive:"#7a7568",
  };
  const c = map[label] || BRAND.gold;
  return <span style={{ padding:"3px 11px", borderRadius:20, fontSize:10, fontWeight:700, background:`${c}20`, color:c, whiteSpace:"nowrap", letterSpacing:.5, textTransform:"uppercase" }}>{label}</span>;
}

export function Card({ children, style={}, onClick }) {
  return <div onClick={onClick} style={{ background:"var(--card)", borderRadius:14, border:"1px solid var(--border)", boxShadow:"var(--shadow)", cursor: onClick?"pointer":"default", ...style }}>{children}</div>;
}

export function FieldLabel({ children }) {
  return <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", color:"var(--muted)", marginBottom:7 }}>{children}</label>;
}

export function Input({ label, ...props }) {
  return <div>{label && <FieldLabel>{label}</FieldLabel>}<input {...props} style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid var(--border)", background:"var(--bg)", color:"var(--text)", fontSize:15, fontFamily:"inherit", outline:"none" }} /></div>;
}

export function Textarea({ label, ...props }) {
  return <div>{label && <FieldLabel>{label}</FieldLabel>}<textarea {...props} style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid var(--border)", background:"var(--bg)", color:"var(--text)", fontSize:15, fontFamily:"inherit", outline:"none", resize:"vertical" }} /></div>;
}

export function Select({ label, options, placeholder="Select…", ...props }) {
  return <div>{label && <FieldLabel>{label}</FieldLabel>}<select {...props} style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid var(--border)", background:"var(--bg)", color:"var(--text)", fontSize:15, fontFamily:"inherit", outline:"none" }}><option value="">{placeholder}</option>{options.map(o => typeof o === "string" ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
}

export function Button({ children, variant="primary", style={}, ...props }) {
  const variants = {
    primary: { background: PRIMARY_GRADIENT, color:"#0a0a0d", boxShadow:`0 4px 16px ${BRAND.gold}40`, letterSpacing:.5 },
    secondary: { background:"var(--card)", color:"var(--text)", border:"1px solid var(--border)" },
    danger: { background:"#c9707020", color:"#c97070" },
    success: { background:"#7cb38920", color:"#7cb389" },
    ghost: { background:"transparent", color:"var(--muted)" },
  };
  return <button {...props} style={{ padding:"12px 22px", borderRadius:10, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all .15s", textTransform:"uppercase", letterSpacing:.8, ...variants[variant], ...style }}>{children}</button>;
}

export function Modal({ title, onClose, children, maxWidth=540 }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:300, backdropFilter:"blur(8px)" }} onClick={onClose}>
      <div style={{ background:"var(--card)", borderRadius:"20px 20px 0 0", padding:"28px 24px 40px", width:"100%", maxWidth, border:"1px solid var(--border)", borderBottom:"none", maxHeight:"90vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ width:40, height:4, borderRadius:2, background:BRAND.gold+"60", margin:"0 auto 24px" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:700, color:"var(--text)", letterSpacing:.3 }}>{title}</h2>
          <button onClick={onClose} style={{ padding:8, borderRadius:9, border:"none", background:"var(--hover)", color:"var(--muted)", cursor:"pointer", display:"flex" }}>{Ic.x}</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Spinner({ size=40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="20" fill="none" stroke={BRAND.gold} strokeWidth="3" strokeLinecap="round" strokeDasharray="80" strokeDashoffset="60">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

export function Logo({ size=36, withText=true, t }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ width:size, height:size, borderRadius:size*0.25, background:"linear-gradient(135deg, #1a1612, #0a0a0d)", border:`1px solid ${BRAND.gold}40`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {Ic.logoMark}
      </div>
      {withText && (
        <div>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:size*0.55, fontWeight:700, color:t?.text||BRAND.gold, lineHeight:1, letterSpacing:.5 }}>
            <span>SiS</span><span style={{ color: BRAND.gold }}>2</span>
          </p>
          <p style={{ fontSize:size*0.22, color:t?.muted||BRAND.bronze, letterSpacing:3, marginTop:3, fontWeight:600, textTransform:"uppercase" }}>Beauty</p>
        </div>
      )}
    </div>
  );
}

// ── Time helpers ──────────────────────────────────────────────
export const toMin = (t) => { const [h,m] = t.split(":").map(Number); return h*60 + m; };
export const minToTime = (m) => `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;

export function getNextDays(count = 14) {
  const days = []; const t0 = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(t0); d.setDate(t0.getDate() + i);
    days.push({
      date: d.toISOString().slice(0,10),
      day: d.toLocaleDateString("en", { weekday: "short" }),
      num: d.getDate(),
      month: d.toLocaleDateString("en", { month: "short" }),
      isToday: i === 0,
      dayOfWeek: d.getDay(),
    });
  }
  return days;
}

export function getAvailableSlots({ date, staffId, duration, availability, appts, timeOff, slotMinutes = 30 }) {
  const dayOfWeek = new Date(date+"T00:00:00").getDay();
  const dayAvail = availability.filter(a => a.day_of_week === dayOfWeek);
  if (dayAvail.length === 0) return [];

  const isTimeOff = timeOff.some(t => date >= t.start_date && date <= t.end_date);
  if (isTimeOff) return [];

  const today = new Date().toISOString().slice(0,10);
  const now = new Date();
  const nowMin = now.getHours()*60 + now.getMinutes();

  const slots = [];
  for (const block of dayAvail) {
    const startMin = toMin(block.start_time.slice(0,5));
    const endMin = toMin(block.end_time.slice(0,5));
    for (let m = startMin; m + duration <= endMin; m += slotMinutes) {
      const slot = minToTime(m);
      if (date === today && m <= nowMin) continue;
      const conflict = appts.some(a => {
        if (a.date !== date || a.status === "Cancelled") return false;
        if (staffId && a.staff_id !== staffId) return false;
        const apptStart = toMin(a.time.slice(0,5));
        const apptEnd = apptStart + (a.duration_min || 60);
        return m < apptEnd && (m + duration) > apptStart;
      });
      if (!conflict) slots.push(slot);
    }
  }
  return slots;
}

export function GlobalStyles({ t }) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      body { font-family:'DM Sans',sans-serif; background:${t.bg}; color:${t.text}; }
      ::-webkit-scrollbar{width:3px;height:3px}
      ::-webkit-scrollbar-thumb{background:${BRAND.gold}40;border-radius:4px}
      select option{background:${t.card};color:${t.text}}
      ::selection { background: ${BRAND.gold}; color: #0a0a0d; }
      @keyframes pop {0%{transform:scale(.7);opacity:0} 100%{transform:scale(1);opacity:1}}
      @keyframes slideUp {from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1}}
      @keyframes shimmer {0%,100%{opacity:1} 50%{opacity:.7}}
    `}</style>
  );
}

export function buildCssVars(t) {
  return { "--bg":t.bg,"--card":t.card,"--hover":t.hover,"--text":t.text,"--muted":t.muted,"--border":t.border,"--shadow":t.shadow };
}
