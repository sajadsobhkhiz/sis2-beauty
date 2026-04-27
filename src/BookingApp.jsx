// ─────────────────────────────────────────────
//  SiS2 Beauty — Customer Booking
//  Routes:
//    /          → choose any staff
//    /:slug     → book directly with one staff
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchStaff, fetchStaffBySlug, fetchStaffServices,
  fetchAvailability, fetchTimeOff, fetchAppointments, addAppointment,
} from "./supabase";
import {
  BRAND, T, Ic, Avatar, Card, Button, Input, Textarea, Spinner, Logo,
  useTheme, GlobalStyles, buildCssVars, getNextDays, getAvailableSlots, PRIMARY_GRADIENT,
} from "./shared";

// ═══════════════════════════════════════════════════════════════
//  ENTRY 1: List all staff
// ═══════════════════════════════════════════════════════════════
export function BookingHome() {
  const [t, dark, setDark] = useTheme();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff().then(s => setStaff(s.filter(x => x.status === "Active" && x.accepts_bookings))).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:t.bg, color:t.text, paddingBottom:60, ...buildCssVars(t) }}>
      <GlobalStyles t={t} />

      <Header t={t} dark={dark} setDark={setDark} subtitle="Book your appointment" />

      <div style={{ padding:"40px 20px 0", textAlign:"center" }}>
        <p style={{ fontSize:11, color:BRAND.gold, fontWeight:600, letterSpacing:3, textTransform:"uppercase", marginBottom:14 }}>
          Welcome to
        </p>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:42, fontWeight:700, color:t.text, lineHeight:1, letterSpacing:.5 }}>
          <span>SiS</span><span style={{ color:BRAND.gold }}>2</span> <span style={{ fontWeight:500 }}>Beauty</span>
        </h1>
        <div style={{ width:60, height:1, background:`linear-gradient(90deg, transparent, ${BRAND.gold}, transparent)`, margin:"20px auto" }} />
        <p style={{ fontSize:14, color:t.muted, lineHeight:1.6 }}>Choose your stylist to begin</p>
      </div>

      <div style={{ padding:"30px 20px" }}>
        {loading ? <div style={{ textAlign:"center", padding:60 }}><Spinner /></div> : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {staff.map(s => (
              <Link key={s.id} to={`/${s.slug}`} style={{ textDecoration:"none" }}>
                <Card style={{ padding:"22px 22px", display:"flex", alignItems:"center", gap:16, transition:"all .2s", borderColor:`${BRAND.gold}25` }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = BRAND.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = `${BRAND.gold}25`; }}>
                  <Avatar name={s.name} photoUrl={s.photo_url} size={64} color={s.color} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:18, fontWeight:600, color:t.text, fontFamily:"'Cormorant Garamond',serif", letterSpacing:.3 }}>{s.name}</p>
                    <p style={{ fontSize:12, color:BRAND.gold, marginTop:3, letterSpacing:1, textTransform:"uppercase", fontWeight:600 }}>{s.role}</p>
                    {s.bio && <p style={{ fontSize:12, color:t.muted, marginTop:8, lineHeight:1.5 }}>{s.bio}</p>}
                  </div>
                  <div style={{ color:BRAND.gold, fontSize:20 }}>→</div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer t={t} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ENTRY 2: Book with specific staff
// ═══════════════════════════════════════════════════════════════
export function StaffBooking() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [t, dark, setDark] = useTheme();

  const [staff, setStaff] = useState(null);
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [timeOff, setTimeOff] = useState([]);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [step, setStep] = useState(1);
  const [selService, setSelService] = useState(null);
  const [selDate, setSelDate] = useState(null);
  const [selTime, setSelTime] = useState(null);
  const [info, setInfo] = useState({ name:"", phone:"", email:"", notes:"" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchStaffBySlug(slug);
        if (!s) { setError("Stylist not found"); return; }
        setStaff(s);
        const [svc, avail, off, ap] = await Promise.all([
          fetchStaffServices(s.id),
          fetchAvailability(s.id),
          fetchTimeOff(s.id),
          fetchAppointments(),
        ]);
        setServices(svc); setAvailability(avail); setTimeOff(off); setAppts(ap);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const availableSlots = (selDate && selService)
    ? getAvailableSlots({ date: selDate, staffId: staff?.id, duration: selService.duration_min, availability, appts, timeOff })
    : [];

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await addAppointment({
        staff_id: staff.id, staff_name: staff.name,
        service_id: selService.id, service: selService.name,
        client_name: info.name, client_phone: info.phone, client_email: info.email,
        date: selDate, time: selTime, duration_min: selService.duration_min,
        price: selService.price, status: "Pending",
        notes: info.notes ? `Online booking · ${info.notes}` : "Online booking",
      });
      setStep(5);
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const reset = () => {
    setStep(1); setSelService(null); setSelDate(null); setSelTime(null); setInfo({ name:"", phone:"", email:"", notes:"" });
    fetchAppointments().then(setAppts);
  };

  if (loading) return <CenteredLoader t={t} />;
  if (error || !staff) return <CenteredError t={t} message={error || "Stylist not found"} onBack={() => navigate("/")} />;

  return (
    <div style={{ minHeight:"100vh", background:t.bg, color:t.text, paddingBottom:60, ...buildCssVars(t) }}>
      <GlobalStyles t={t} />

      <Header t={t} dark={dark} setDark={setDark} subtitle={`Book with ${staff.name}`} backTo="/" />

      {/* Stylist hero */}
      {step < 5 && (
        <div style={{ padding:"24px 20px 0", display:"flex", alignItems:"center", gap:14 }}>
          <Avatar name={staff.name} photoUrl={staff.photo_url} size={64} color={staff.color} />
          <div>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:600, color:t.text, letterSpacing:.3 }}>{staff.name}</p>
            <p style={{ fontSize:11, color:BRAND.gold, marginTop:3, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600 }}>{staff.role}</p>
          </div>
        </div>
      )}

      {/* Progress */}
      {step < 5 && (
        <div style={{ padding:"24px 20px 0" }}>
          <div style={{ display:"flex", gap:6, marginBottom:8 }}>
            {[1,2,3].map(n => (
              <div key={n} style={{ flex:1, height:3, borderRadius:2, background: step >= n ? PRIMARY_GRADIENT : t.border }} />
            ))}
          </div>
          <p style={{ fontSize:10, color:t.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:1.5 }}>Step {step} of 3</p>
        </div>
      )}

      <div style={{ padding:"24px 20px" }}>
        {step === 1 && (
          <div style={{ animation:"slideUp .3s" }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600, color:t.text, marginBottom:6, letterSpacing:.3 }}>Choose a service</h2>
            <p style={{ fontSize:13, color:t.muted, marginBottom:24, lineHeight:1.5 }}>What can {staff.name.split(" ")[0]} do for you today?</p>
            {services.length === 0 ? (
              <Card style={{ padding:30, textAlign:"center" }}><p style={{ color:t.muted }}>No services available yet.</p></Card>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {services.map(s => (
                  <Card key={s.id} onClick={() => { setSelService(s); setStep(2); }} style={{ padding:"18px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", transition:"all .2s" }}>
                    <div>
                      <p style={{ fontSize:16, fontWeight:600, color:t.text, fontFamily:"'Cormorant Garamond',serif", letterSpacing:.2 }}>{s.name}</p>
                      <p style={{ fontSize:11, color:t.muted, marginTop:4, display:"flex", alignItems:"center", gap:5, letterSpacing:.5 }}>{Ic.clock} {s.duration_min} min</p>
                      {s.description && <p style={{ fontSize:11, color:t.muted, marginTop:6, lineHeight:1.4 }}>{s.description}</p>}
                    </div>
                    <p style={{ fontSize:20, fontWeight:600, color:BRAND.gold, fontFamily:"'Cormorant Garamond',serif" }}>${s.price}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div style={{ animation:"slideUp .3s" }}>
            <button onClick={() => setStep(1)} style={{ display:"flex", alignItems:"center", gap:4, border:"none", background:"transparent", color:t.muted, fontSize:12, cursor:"pointer", marginBottom:16, letterSpacing:.5, textTransform:"uppercase" }}>{Ic.back} Back</button>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600, color:t.text, marginBottom:6, letterSpacing:.3 }}>Pick a date & time</h2>
            <p style={{ fontSize:13, color:t.muted, marginBottom:20 }}>{selService.name} · {selService.duration_min} min</p>

            <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:20 }}>
              {getNextDays().map(d => {
                const isSel = selDate === d.date;
                return (
                  <button key={d.date} onClick={() => { setSelDate(d.date); setSelTime(null); }}
                    style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 14px", borderRadius:11, border:`1px solid ${isSel?BRAND.gold:t.border}`, background:isSel?PRIMARY_GRADIENT:t.card, color:isSel?"#0a0a0d":t.text, cursor:"pointer", minWidth:60 }}>
                    <span style={{ fontSize:10, fontWeight:600, opacity:.85, textTransform:"uppercase", letterSpacing:.8 }}>{d.day}</span>
                    <span style={{ fontSize:22, fontWeight:600, marginTop:2, fontFamily:"'Cormorant Garamond',serif" }}>{d.num}</span>
                    <span style={{ fontSize:10, opacity:.75, letterSpacing:.5 }}>{d.month}</span>
                    {d.isToday && <span style={{ fontSize:8, marginTop:2, color:isSel?"#0a0a0d":BRAND.gold, fontWeight:700, letterSpacing:1 }}>TODAY</span>}
                  </button>
                );
              })}
            </div>

            {selDate ? (
              availableSlots.length === 0 ? (
                <Card style={{ padding:30, textAlign:"center" }}>
                  <p style={{ fontSize:32, marginBottom:8 }}>✦</p>
                  <p style={{ fontSize:13, color:t.muted, lineHeight:1.5 }}>No available times this day.<br/>Please select another.</p>
                </Card>
              ) : (
                <>
                  <p style={{ fontSize:10, color:t.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>Available Times</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(80px, 1fr))", gap:8 }}>
                    {availableSlots.map(slot => {
                      const isSel = selTime === slot;
                      return (
                        <button key={slot} onClick={() => setSelTime(slot)}
                          style={{ padding:"12px 0", borderRadius:9, border:`1px solid ${isSel?BRAND.gold:t.border}`, background:isSel?PRIMARY_GRADIENT:t.card, color:isSel?"#0a0a0d":t.text, fontSize:14, fontWeight:600, cursor:"pointer", letterSpacing:.5 }}>
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  {selTime && (
                    <Button onClick={() => setStep(3)} style={{ marginTop:24, width:"100%", padding:"15px" }}>Continue</Button>
                  )}
                </>
              )
            ) : (
              <p style={{ color:t.muted, fontSize:13, textAlign:"center", padding:20 }}>Select a date above</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div style={{ animation:"slideUp .3s" }}>
            <button onClick={() => setStep(2)} style={{ display:"flex", alignItems:"center", gap:4, border:"none", background:"transparent", color:t.muted, fontSize:12, cursor:"pointer", marginBottom:16, letterSpacing:.5, textTransform:"uppercase" }}>{Ic.back} Back</button>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600, color:t.text, marginBottom:6, letterSpacing:.3 }}>Your details</h2>
            <p style={{ fontSize:13, color:t.muted, marginBottom:22 }}>So we can confirm your booking.</p>

            <Card style={{ padding:"18px 20px", marginBottom:22, borderColor:`${BRAND.gold}30` }}>
              <p style={{ fontSize:10, color:BRAND.gold, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14 }}>Booking Summary</p>
              {[["Stylist", staff.name],["Service", selService.name],["Date", selDate],["Time", selTime]].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                  <span style={{ fontSize:12, color:t.muted, letterSpacing:.5 }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, paddingTop:12, borderTop:`1px solid ${BRAND.gold}30` }}>
                <span style={{ fontSize:12, color:t.muted, fontWeight:600, letterSpacing:.5, textTransform:"uppercase" }}>Total</span>
                <span style={{ fontSize:20, fontWeight:600, color:BRAND.gold, fontFamily:"'Cormorant Garamond',serif" }}>${selService.price}</span>
              </div>
              <p style={{ fontSize:10, color:t.muted, marginTop:10, textAlign:"center", letterSpacing:.5 }}>Payment in person at the salon</p>
            </Card>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <Input label="Full Name *" value={info.name} onChange={e => setInfo(p => ({...p,name:e.target.value}))} placeholder="Jane Smith" />
              <Input label="Phone *" type="tel" value={info.phone} onChange={e => setInfo(p => ({...p,phone:e.target.value}))} placeholder="555-0000" />
              <Input label="Email *" type="email" value={info.email} onChange={e => setInfo(p => ({...p,email:e.target.value}))} placeholder="jane@example.com" />
              <Textarea label="Notes (optional)" rows={3} value={info.notes} onChange={e => setInfo(p => ({...p,notes:e.target.value}))} placeholder="Any preferences or allergies?" />
              <Button onClick={submit} disabled={!info.name || !info.phone || !info.email || submitting}
                style={{ marginTop:6, padding:"16px", opacity:(!info.name||!info.phone||!info.email||submitting)?.5:1, cursor:(!info.name||!info.phone||!info.email||submitting)?"not-allowed":"pointer" }}>
                {submitting ? "Booking…" : "Request Appointment"}
              </Button>
              <p style={{ fontSize:10, color:t.muted, textAlign:"center", letterSpacing:.5 }}>We'll confirm by email within a few hours.</p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div style={{ textAlign:"center", padding:"40px 0", animation:"slideUp .4s" }}>
            <div style={{ width:80, height:80, margin:"0 auto 24px", borderRadius:"50%", background:PRIMARY_GRADIENT, display:"flex", alignItems:"center", justifyContent:"center", color:"#0a0a0d", animation:"pop .5s" }}>
              {Ic.checkBig}
            </div>
            <p style={{ fontSize:11, color:BRAND.gold, fontWeight:600, letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>Confirmed</p>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:600, color:t.text, marginBottom:14, letterSpacing:.3 }}>Request sent</h2>
            <p style={{ fontSize:14, color:t.muted, marginBottom:30, lineHeight:1.6 }}>
              Thank you, <strong style={{ color:t.text }}>{info.name}</strong>!<br/>
              We'll send a confirmation to <strong style={{ color:t.text }}>{info.email}</strong> shortly.
            </p>
            <Card style={{ padding:"20px", textAlign:"left", marginBottom:24, borderColor:`${BRAND.gold}30` }}>
              <p style={{ fontSize:10, color:BRAND.gold, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, marginBottom:14 }}>Booking Summary</p>
              <p style={{ fontSize:16, fontWeight:600, marginBottom:4, fontFamily:"'Cormorant Garamond',serif" }}>{selService.name}</p>
              <p style={{ fontSize:12, color:t.muted, marginBottom:14, letterSpacing:.5 }}>with {staff.name}</p>
              <p style={{ fontSize:14 }}>📅 {selDate}</p>
              <p style={{ fontSize:14, marginTop:5 }}>🕒 {selTime}</p>
            </Card>
            <Button variant="secondary" onClick={reset}>Book another appointment</Button>
          </div>
        )}
      </div>

      <Footer t={t} />
    </div>
  );
}

// ─── Reusable header ────────────────────────────────────────────
function Header({ t, dark, setDark, subtitle, backTo }) {
  return (
    <div style={{ padding:"20px 20px 0", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${BRAND.gold}15`, paddingBottom:18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {backTo && <Link to={backTo} style={{ color:t.muted, display:"flex", marginRight:4 }}>{Ic.back}</Link>}
        <Logo size={40} t={t} />
      </div>
      <button onClick={() => setDark(d=>!d)} style={{ padding:"7px 12px", borderRadius:20, border:`1px solid ${t.border}`, background:t.card, color:t.muted, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center" }}>
        {dark ? Ic.sun : Ic.moon}
      </button>
    </div>
  );
}

function Footer({ t }) {
  return (
    <div style={{ padding:"40px 20px 20px", textAlign:"center", marginTop:40 }}>
      <div style={{ width:40, height:1, background:`linear-gradient(90deg, transparent, ${BRAND.gold}, transparent)`, margin:"0 auto 16px" }} />
      <p style={{ fontSize:11, color:t.muted, letterSpacing:2, textTransform:"uppercase" }}>SiS<span style={{ color:BRAND.gold }}>2</span> Beauty</p>
    </div>
  );
}

function CenteredLoader({ t }) {
  return <div style={{ minHeight:"100vh", background:t.bg, display:"flex", alignItems:"center", justifyContent:"center" }}><Spinner /></div>;
}
function CenteredError({ t, message, onBack }) {
  return (
    <div style={{ minHeight:"100vh", background:t.bg, color:t.text, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20, ...buildCssVars(t) }}>
      <p style={{ fontSize:48, marginBottom:16, color:BRAND.gold }}>✦</p>
      <p style={{ fontSize:18, fontWeight:600, marginBottom:16, fontFamily:"'Cormorant Garamond',serif" }}>{message}</p>
      <Button variant="secondary" onClick={onBack}>← Back to home</Button>
    </div>
  );
}
