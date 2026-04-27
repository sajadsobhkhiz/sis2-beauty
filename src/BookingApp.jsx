// ─────────────────────────────────────────────
//  SiS2 Beauty — Customer Booking
//  / → all stylists
//  /:slug → book with specific stylist
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchStaff, fetchStaffBySlug, fetchStaffServices,
  fetchAvailability, fetchTimeOff, fetchAppointments, addAppointment,
} from "./supabase";
import {
  T, GRAD, LOGO_SRC, BRAND,
  Avatar, Card, GoldBtn, Input, Textarea, Spinner,
  GlobalStyles, getNextDays, getAvailableSlots, callEmailServer,
} from "./shared";

const G = "#d4af37";

// ── Logo header shared ────────────────────────────────────────
function SiteHeader({ back }) {
  return (
    <div style={{ position:"sticky", top:0, zIndex:100, background:T.bg, borderBottom:`1px solid ${G}20`, padding:"10px 20px", display:"flex", alignItems:"center", gap:10 }}>
      {back && (
        <Link to="/" style={{ color:T.muted, fontSize:20, textDecoration:"none", marginRight:4 }}>‹</Link>
      )}
      <Link to="/" style={{ textDecoration:"none", display:"flex", alignItems:"center" }}>
        <img src={LOGO_SRC} alt="SiS2 Beauty" style={{ height:50, width:"auto", objectFit:"contain", mixBlendMode:"screen" }} />
      </Link>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  HOME — all stylists
// ═══════════════════════════════════════════════════════════════
export function BookingHome() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff().then(s => setStaff(s.filter(x => x.status==="Active" && x.accepts_bookings))).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.text, paddingBottom:60 }}>
      <GlobalStyles />
      <SiteHeader />

      <div style={{ padding:"44px 24px 0", textAlign:"center", animation:"fadeUp .6s both" }}>
        <p style={{ fontSize:10, color:G, fontWeight:700, letterSpacing:5, textTransform:"uppercase", marginBottom:18 }}>Welcome to</p>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(44px,10vw,72px)", fontWeight:600, color:T.text, lineHeight:.9, letterSpacing:"-1px" }}>
          SiS<span style={{ color:G }}>2</span><br/>
          <span style={{ fontWeight:400, fontStyle:"italic", fontSize:"0.74em" }}>Beauty</span>
        </h1>
        <div style={{ width:50, height:1, background:`linear-gradient(90deg,transparent,${G},transparent)`, margin:"26px auto" }} />
        <p style={{ fontSize:13, color:T.muted, lineHeight:1.7, maxWidth:280, margin:"0 auto" }}>
          Luxury beauty studio.<br/>Choose your specialist to begin.
        </p>
      </div>

      <div style={{ padding:"36px 20px", display:"flex", flexDirection:"column", gap:12 }}>
        {loading ? <div style={{ textAlign:"center", padding:60 }}><Spinner /></div> :
          staff.map((s,i) => (
            <Link key={s.id} to={`/${s.slug}`} style={{ textDecoration:"none" }}>
              <Card style={{ padding:"20px 22px", display:"flex", alignItems:"center", gap:18, transition:"all .2s", animation:`fadeUp .5s ${i*.1}s both` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=G; e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.transform=""; }}>
                <Avatar name={s.name} photoUrl={s.photo_url} size={64} color={s.color} />
                <div style={{ flex:1 }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:21, fontWeight:600, color:T.text, letterSpacing:.2, lineHeight:1 }}>{s.name}</p>
                  <p style={{ fontSize:9, color:G, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase", marginTop:5 }}>{s.role}</p>
                  <p style={{ fontSize:12, color:T.muted, marginTop:7, lineHeight:1.5 }}>{s.bio}</p>
                </div>
                <span style={{ color:G, fontSize:22, opacity:.6 }}>›</span>
              </Card>
            </Link>
          ))
        }
      </div>

      <div style={{ textAlign:"center", padding:"10px 0 40px" }}>
        <div style={{ width:40, height:1, background:`linear-gradient(90deg,transparent,${G},transparent)`, margin:"0 auto 14px" }} />
        <p style={{ fontSize:9, color:T.muted, letterSpacing:3, textTransform:"uppercase" }}>sis<span style={{ color:G }}>2</span>.beauty</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  STAFF BOOKING
// ═══════════════════════════════════════════════════════════════
export function StaffBooking() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [staff, setStaff] = useState(null);
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [timeOff, setTimeOff] = useState([]);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState({ service:null, date:null, time:null });
  const [info, setInfo] = useState({ name:"", phone:"", email:"", notes:"" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchStaffBySlug(slug);
        if (!s) { setError("Stylist not found"); return; }
        setStaff(s);
        const [svc, avail, off, ap] = await Promise.all([
          fetchStaffServices(s.id), fetchAvailability(s.id), fetchTimeOff(s.id), fetchAppointments(),
        ]);
        setServices(svc); setAvailability(avail); setTimeOff(off); setAppts(ap);
      } catch(e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const slots = sel.date && sel.service
    ? getAvailableSlots({ date:sel.date, staffId:staff?.id, duration:sel.service.duration_min, availability, appts, timeOff })
    : [];

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const created = await addAppointment({
        staff_id: staff.id, staff_name: staff.name,
        service_id: sel.service.id, service: sel.service.name,
        client_name: info.name, client_phone: info.phone, client_email: info.email,
        date: sel.date, time: sel.time, duration_min: sel.service.duration_min,
        price: sel.service.price, status:"Pending",
        notes: info.notes ? `Online booking · ${info.notes}` : "Online booking",
      });
      // Send confirmation email
      await callEmailServer("booking-received", {
        clientName: info.name, clientEmail: info.email,
        staffName: staff.name, staffEmail: staff.email,
        service: sel.service.name, date: sel.date, time: sel.time, price: sel.service.price,
      });
      setDone(true);
    } catch(e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const reset = () => {
    setStep(1); setSel({service:null,date:null,time:null});
    setInfo({name:"",phone:"",email:"",notes:""}); setDone(false);
    fetchAppointments().then(setAppts);
  };

  if (loading) return <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center" }}><GlobalStyles /><Spinner /></div>;
  if (error || !staff) return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24 }}>
      <GlobalStyles />
      <p style={{ fontSize:18, color:T.text, fontFamily:"'Cormorant Garamond',serif" }}>{error || "Stylist not found"}</p>
      <GoldBtn variant="secondary" onClick={() => navigate("/")}>← All Stylists</GoldBtn>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.text, paddingBottom:60 }}>
      <GlobalStyles />
      <SiteHeader back />

      {/* Stylist info */}
      {!done && (
        <div style={{ padding:"20px 20px 16px", display:"flex", alignItems:"center", gap:14, borderBottom:`1px solid ${T.border}`, animation:"fadeUp .3s both" }}>
          <Avatar name={staff.name} photoUrl={staff.photo_url} size={56} color={staff.color} />
          <div style={{ flex:1 }}>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, color:T.text }}>{staff.name}</p>
            <p style={{ fontSize:9, color:G, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase", marginTop:4 }}>{staff.role}</p>
          </div>
          <GoldBtn variant="secondary" onClick={() => navigate("/")} style={{ padding:"6px 12px", fontSize:10 }}>← All</GoldBtn>
        </div>
      )}

      {/* Progress */}
      {!done && (
        <div style={{ padding:"16px 20px 0" }}>
          <div style={{ display:"flex", gap:6, marginBottom:8 }}>
            {[1,2,3].map(n => <div key={n} style={{ flex:1, height:2, borderRadius:1, background:step>=n?GRAD:T.border, transition:"background .3s" }} />)}
          </div>
          <p style={{ fontSize:9, color:T.muted, letterSpacing:2, textTransform:"uppercase" }}>Step {step} of 3</p>
        </div>
      )}

      <div style={{ padding:"24px 20px" }}>
        {/* STEP 1 */}
        {!done && step===1 && (
          <div style={{ animation:"fadeUp .3s both" }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600, marginBottom:6 }}>Choose a service</h2>
            <p style={{ fontSize:12, color:T.muted, marginBottom:22 }}>What can {staff.name.split(" ")[0]} do for you?</p>
            {services.length===0 ? <Card style={{ padding:30, textAlign:"center" }}><p style={{ color:T.muted }}>No services available yet.</p></Card> : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {services.map(s => (
                  <Card key={s.id} onClick={() => { setSel(p=>({...p,service:s})); setStep(2); }}
                    style={{ padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", transition:"border-color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor=G}
                    onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
                    <div>
                      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, color:T.text }}>{s.name}</p>
                      {s.description && <p style={{ fontSize:11, color:T.muted, marginTop:4 }}>{s.description}</p>}
                      <p style={{ fontSize:10, color:G+"90", marginTop:5 }}>⏱ {s.duration_min} min</p>
                    </div>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, color:G, flexShrink:0, marginLeft:12 }}>${s.price}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {!done && step===2 && (
          <div style={{ animation:"fadeUp .3s both" }}>
            <button onClick={() => setStep(1)} style={{ border:"none", background:"transparent", color:T.muted, fontSize:10, cursor:"pointer", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>‹ Back</button>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600, marginBottom:6 }}>Pick a date</h2>
            <p style={{ fontSize:12, color:T.muted, marginBottom:20 }}>{sel.service?.name} · {sel.service?.duration_min} min</p>

            <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:10, marginBottom:22 }}>
              {getNextDays().map(d => {
                const isSel = sel.date===d.date;
                return (
                  <button key={d.date} onClick={() => setSel(p=>({...p,date:d.date,time:null}))}
                    style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 14px", borderRadius:12, border:`1px solid ${isSel?G:T.border}`, background:isSel?GRAD:T.card, color:isSel?"#0a0a0d":T.text, cursor:"pointer", minWidth:58 }}>
                    <span style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase", opacity:.85 }}>{d.day}</span>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:600, marginTop:3, lineHeight:1 }}>{d.num}</span>
                    <span style={{ fontSize:10, opacity:.7, marginTop:2 }}>{d.mon}</span>
                    {d.isToday && <span style={{ fontSize:8, marginTop:4, color:isSel?"#0a0a0d":G, fontWeight:700 }}>TODAY</span>}
                  </button>
                );
              })}
            </div>

            {sel.date ? (
              slots.length===0 ? (
                <Card style={{ padding:30, textAlign:"center" }}>
                  <p style={{ fontSize:28, marginBottom:8, color:G }}>✦</p>
                  <p style={{ fontSize:13, color:T.muted, lineHeight:1.5 }}>Fully booked this day.<br/>Please choose another.</p>
                </Card>
              ) : (
                <>
                  <p style={{ fontSize:9, color:G, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Available Times</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(78px,1fr))", gap:8 }}>
                    {slots.map(slot => {
                      const isSel = sel.time===slot;
                      return (
                        <button key={slot} onClick={() => setSel(p=>({...p,time:slot}))}
                          style={{ padding:"11px 0", borderRadius:9, border:`1px solid ${isSel?G:T.border}`, background:isSel?GRAD:T.card, color:isSel?"#0a0a0d":T.text, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  {sel.time && <GoldBtn onClick={() => setStep(3)} style={{ marginTop:24, width:"100%", padding:"15px" }}>Continue</GoldBtn>}
                </>
              )
            ) : <p style={{ color:T.muted, fontSize:12, textAlign:"center", padding:24 }}>Select a date to see availability</p>}
          </div>
        )}

        {/* STEP 3 */}
        {!done && step===3 && (
          <div style={{ animation:"fadeUp .3s both" }}>
            <button onClick={() => setStep(2)} style={{ border:"none", background:"transparent", color:T.muted, fontSize:10, cursor:"pointer", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>‹ Back</button>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600, marginBottom:6 }}>Your details</h2>
            <p style={{ fontSize:12, color:T.muted, marginBottom:22 }}>So we can confirm your booking</p>

            <Card style={{ padding:"16px 18px", marginBottom:22, borderColor:`${G}30` }}>
              <p style={{ fontSize:9, color:G, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Booking Summary</p>
              {[["Stylist",staff.name],["Service",sel.service?.name],["Date",sel.date],["Time",sel.time]].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:11, color:T.muted }}>{k}</span>
                  <span style={{ fontSize:12, fontWeight:600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, paddingTop:10, borderTop:`1px solid ${G}20` }}>
                <span style={{ fontSize:11, color:T.muted, textTransform:"uppercase", fontWeight:600, letterSpacing:.5 }}>Total</span>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, color:G }}>${sel.service?.price}</span>
              </div>
              <p style={{ fontSize:10, color:T.muted, textAlign:"center", marginTop:10 }}>Payment in person at the salon</p>
            </Card>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <Input label="Full Name *" value={info.name} onChange={e=>setInfo(p=>({...p,name:e.target.value}))} placeholder="Jane Smith" />
              <Input label="Phone *" type="tel" value={info.phone} onChange={e=>setInfo(p=>({...p,phone:e.target.value}))} placeholder="555-0000" />
              <Input label="Email *" type="email" value={info.email} onChange={e=>setInfo(p=>({...p,email:e.target.value}))} placeholder="jane@example.com" />
              <Textarea label="Notes (optional)" rows={3} value={info.notes} onChange={e=>setInfo(p=>({...p,notes:e.target.value}))} placeholder="Any preferences…" />
              <GoldBtn onClick={submit} disabled={!info.name||!info.phone||!info.email||submitting}
                style={{ marginTop:6, padding:"16px", opacity:(!info.name||!info.phone||!info.email||submitting)?.4:1 }}>
                {submitting ? "Booking…" : "Request Appointment"}
              </GoldBtn>
              <p style={{ fontSize:10, color:T.muted, textAlign:"center" }}>You'll receive a confirmation email shortly</p>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {done && (
          <div style={{ textAlign:"center", paddingTop:30, animation:"popIn .5s both" }}>
            <div style={{ width:76, height:76, margin:"0 auto 22px", borderRadius:"50%", background:GRAD, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="34" height="34" fill="none" stroke="#0a0a0d" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <p style={{ fontSize:9, color:G, letterSpacing:4, textTransform:"uppercase", marginBottom:10, fontWeight:700 }}>Request Sent</p>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, fontWeight:600, color:T.text, marginBottom:14 }}>We'll be in touch!</h2>
            <p style={{ fontSize:13, color:T.muted, lineHeight:1.7, marginBottom:28 }}>
              Thank you, <strong style={{ color:T.text }}>{info.name}</strong>!<br/>
              A confirmation email has been sent to <strong style={{ color:T.text }}>{info.email}</strong>.
            </p>
            <Card style={{ padding:"16px 18px", textAlign:"left", marginBottom:24, borderColor:`${G}30` }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontWeight:600, marginBottom:4 }}>{sel.service?.name}</p>
              <p style={{ fontSize:12, color:T.muted, marginBottom:12 }}>with {staff.name}</p>
              <p style={{ fontSize:13 }}>📅 {sel.date}</p>
              <p style={{ fontSize:13, marginTop:4 }}>🕒 {sel.time}</p>
            </Card>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <GoldBtn onClick={reset}>Book Another</GoldBtn>
              <GoldBtn variant="secondary" onClick={() => navigate("/")}>← All Stylists</GoldBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
