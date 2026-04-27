// ─────────────────────────────────────────────
//  LoginPage — for Admin & Staff
// ─────────────────────────────────────────────

import { useState } from "react";
import { signIn } from "./supabase";
import { T, GRAD, LOGO_SRC, GoldBtn, GlobalStyles, Input } from "./shared";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!email || !password) return;
    setLoading(true); setError(null);
    try {
      await signIn(email, password);
      onLogin();
    } catch (e) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <GlobalStyles />

      <div style={{ width:"100%", maxWidth:380, animation:"fadeUp .5s both" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <img src={LOGO_SRC} alt="SiS2 Beauty" style={{ height:100, width:"auto", objectFit:"contain", mixBlendMode:"screen" }} />
        </div>

        {/* Card */}
        <div style={{ background:T.card, borderRadius:18, border:`1px solid ${T.border}`, padding:32 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:600, color:T.text, marginBottom:6, letterSpacing:.3 }}>
            Sign In
          </h2>
          <p style={{ fontSize:12, color:T.muted, marginBottom:28, letterSpacing:.5 }}>
            Admin & Staff Portal
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKey}
              placeholder="your@email.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKey}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {error && (
              <p style={{ fontSize:12, color:"#c97070", background:"#c9707015", padding:"10px 14px", borderRadius:9, border:"1px solid #c9707040" }}>
                ⚠️ {error}
              </p>
            )}

            <GoldBtn onClick={submit} disabled={!email||!password||loading}
              style={{ marginTop:8, padding:"15px", opacity:(!email||!password||loading)?.5:1 }}>
              {loading ? "Signing in…" : "Sign In"}
            </GoldBtn>
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:24 }}>
          <div style={{ width:40, height:1, background:`linear-gradient(90deg,transparent,#d4af37,transparent)`, margin:"0 auto 14px" }} />
          <p style={{ fontSize:9, color:T.muted, letterSpacing:3, textTransform:"uppercase" }}>
            sis<span style={{ color:"#d4af37" }}>2</span>.beauty
          </p>
        </div>
      </div>
    </div>
  );
}
