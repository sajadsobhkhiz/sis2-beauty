// ─────────────────────────────────────────────
//  SiS2 Beauty — Admin Dashboard
//  /admin — requires is_admin = true
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  fetchClients, fetchStaff, fetchAppointments, fetchServices, fetchTransactions,
  updateAppointmentStatus, deleteAppointment, addAppointment, addClient,
  addService, updateService, deleteService,
  fetchStaffServices, setStaffServices,
  fetchAvailability, setAvailability, fetchTimeOff, addTimeOff, deleteTimeOff,
  subscribeToAppointments, supabase, signOut, uploadStaffPhoto, updateStaff,
} from "./supabase";
import {
  T, GRAD, LOGO_SRC, BRAND,
  Avatar, Badge, Card, GoldBtn, Input, Modal, Spinner,
  GlobalStyles, DAYS, callEmailServer,
} from "./shared";

const G = "#d4af37";
const today = new Date().toISOString().slice(0,10);

export default function AdminApp() {
  const [page, setPage] = useState("dashboard");
  const [appts, setAppts] = useState([]);
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadAll() {
    try {
      setLoading(true);
      const [c,s,a,sv,tx] = await Promise.all([
        fetchClients(), fetchStaff(), fetchAppointments(), fetchServices(), fetchTransactions(),
      ]);
      setClients(c); setStaff(s); setAppts(a); setServices(sv); setTransactions(tx);
      setError(null);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadAll();
    const sub = subscribeToAppointments(() => fetchAppointments().then(setAppts));
    return () => { supabase.removeChannel(sub); };
  }, []);

  const confirmAppt = async (id) => {
    await updateAppointmentStatus(id, "Confirmed");
    setAppts(p => p.map(a => a.id===id ? {...a,status:"Confirmed"} : a));
    // Send confirmation email
    const appt = appts.find(a => a.id===id);
    if (appt) {
      const st = staff.find(s => s.name===appt.staff_name);
      await callEmailServer("booking-confirmed", {
        clientName: appt.client_name, clientEmail: appt.client_email,
        clientPhone: appt.client_phone,
        staffName: appt.staff_name, staffEmail: st?.email,
        service: appt.service, date: appt.date,
        time: appt.time?.slice(0,5), price: appt.price,
      });
    }
  };

  const cancelAppt = async (id) => {
    await deleteAppointment(id);
    setAppts(p => p.filter(a => a.id!==id));
  };

  const nav = [
    { id:"dashboard",    icon:"⊞", label:"Home" },
    { id:"appointments", icon:"◷", label:"Appts" },
    { id:"clients",      icon:"◉", label:"Clients" },
    { id:"team",         icon:"◈", label:"Team" },
    { id:"services",     icon:"≡", label:"Services" },
    { id:"finance",      icon:"$", label:"Finance" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:T.bg, color:T.text }}>
      <GlobalStyles />

      {/* Top bar */}
      <div style={{ padding:"12px 20px", display:"flex", alignItems:"center", gap:12, flexShrink:0, borderBottom:`1px solid ${G}20` }}>
        <img src={LOGO_SRC} alt="SiS2 Beauty" style={{ height:48, width:"auto", objectFit:"contain", mixBlendMode:"screen" }} />
        <div style={{ flex:1 }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontWeight:600, color:T.text, lineHeight:1 }}>SiS<span style={{ color:G }}>2</span> Beauty</p>
          <p style={{ fontSize:8, color:G, letterSpacing:2, textTransform:"uppercase", marginTop:2, fontWeight:700 }}>Admin</p>
        </div>
        <button onClick={async () => { await signOut(); window.location.reload(); }}
          style={{ padding:"6px 12px", borderRadius:18, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, fontSize:10, cursor:"pointer", letterSpacing:.8, textTransform:"uppercase" }}>
          Sign Out
        </button>
        <button onClick={() => window.location.href = "/staff"}
          style={{padding:"6px 12px", borderRadius:18, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, fontSize:10, cursor:"pointer", letterSpacing:.8, textTransform:"uppercase"}}>
          My Dashboard
        </button>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 20px 100px" }}>
        {loading ? <div style={{ display:"flex", justifyContent:"center", padding:60 }}><Spinner /></div> :
         error ? <Card style={{ padding:24, textAlign:"center" }}><p style={{ color:"#c97070", marginBottom:16 }}>⚠️ {error}</p><GoldBtn onClick={loadAll}>Retry</GoldBtn></Card> : (
          <>
            {page==="dashboard"    && <Dashboard appts={appts} clients={clients} confirmAppt={confirmAppt} />}
            {page==="appointments" && <AppointmentsPage appts={appts} confirmAppt={confirmAppt} cancelAppt={cancelAppt} reload={loadAll} staff={staff} services={services} />}
            {page==="clients"      && <ClientsPage clients={clients} reload={loadAll} />}
            {page==="team"         && <TeamPage staff={staff} services={services} reload={loadAll} />}
            {page==="services"     && <ServicesPage services={services} reload={loadAll} />}
            {page==="finance"      && <FinancePage appts={appts} transactions={transactions} services={services} />}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:T.nav, borderTop:`1px solid ${G}20`, display:"flex", padding:"8px 0 20px", zIndex:200 }}>
        {nav.map(item => {
          const active = page===item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"6px 0", border:"none", background:"transparent", color:active?G:T.muted, cursor:"pointer" }}>
              <span style={{ fontSize:16 }}>{item.icon}</span>
              <span style={{ fontSize:9, fontWeight:active?700:500, letterSpacing:.8, textTransform:"uppercase" }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function Dashboard({ appts, clients, confirmAppt }) {
  const totalRev = appts.filter(a=>a.status==="Confirmed").reduce((s,a)=>s+Number(a.price),0);
  const todayAppts = appts.filter(a=>a.date===today);
  const pending = appts.filter(a=>a.status==="Pending");

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s both" }}>
      <div>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600 }}>Overview</p>
        <p style={{ fontSize:11, color:T.muted, marginTop:2 }}>SiS2 Beauty · Live</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[
          ["Revenue",`$${totalRev.toLocaleString()}`,"this month",G],
          ["Today",todayAppts.length,`${todayAppts.filter(a=>a.status==="Confirmed").length} confirmed`,"#c9a961"],
          ["Clients",clients.length,"Total","#7cb389"],
          ["Pending",pending.length,"Need review","#c9a961"],
        ].map(([l,v,sub,c]) => (
          <Card key={l} style={{ padding:"16px" }}>
            <p style={{ fontSize:9, color:T.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{l}</p>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600, color:T.text, marginTop:5, lineHeight:1 }}>{v}</p>
            <p style={{ fontSize:10, color:c, marginTop:6, fontWeight:600 }}>{sub}</p>
          </Card>
        ))}
      </div>

      {pending.length > 0 && (
        <Card style={{ padding:18, border:`1px solid ${G}50`, background:`${G}08` }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:12 }}>
            <span style={{ color:G }}>✦</span> Pending ({pending.length})
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {pending.map(a => (
              <div key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:T.hover }}>
                <Avatar name={a.client_name} size={36} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600 }}>{a.client_name}</p>
                  <p style={{ fontSize:11, color:T.muted }}>{a.service} · {a.date} {a.time?.slice(0,5)}</p>
                </div>
                <GoldBtn variant="success" onClick={() => confirmAppt(a.id)} style={{ padding:"5px 12px", fontSize:11 }}>✓</GoldBtn>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ padding:18 }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:14 }}>Today's Schedule</p>
        {todayAppts.length===0 ? <p style={{ color:T.muted, fontSize:13, textAlign:"center", padding:16 }}>Nothing today.</p> : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {todayAppts.map(a => (
              <div key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:T.hover }}>
                <div style={{ minWidth:54, padding:"6px", borderRadius:8, background:`${G}12`, border:`1px solid ${G}25`, textAlign:"center" }}>
                  <span style={{ fontSize:12, fontWeight:700, color:G }}>{a.time?.slice(0,5)}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600 }}>{a.client_name}</p>
                  <p style={{ fontSize:11, color:T.muted }}>{a.service} · {a.staff_name}</p>
                </div>
                <Badge label={a.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── APPOINTMENTS ────────────────────────────────────────────
function AppointmentsPage({ appts, confirmAppt, cancelAppt, reload, staff, services }) {
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [na, setNa] = useState({ client_name:"", staff_name:"", service:"", date:"", time:"", price:"", client_email:"", client_phone:"" });
  const filtered = filter==="All" ? appts : appts.filter(a=>a.status===filter);

  const submit = async () => {
    if (!na.client_name||!na.service) return;
    const svc = services.find(s=>s.name===na.service);
    const stf = staff.find(s=>s.name===na.staff_name);
    await addAppointment({ ...na, status:"Pending", service_id:svc?.id, staff_id:stf?.id, duration_min:svc?.duration_min||60, price:Number(na.price)||svc?.default_price||0 });
    setNa({ client_name:"", staff_name:"", service:"", date:"", time:"", price:"", client_email:"", client_phone:"" });
    setShowAdd(false); reload();
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s both" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600 }}>Appointments</p>
        <GoldBtn onClick={() => setShowAdd(true)} style={{ padding:"8px 14px", fontSize:18 }}>+</GoldBtn>
      </div>
      <div style={{ display:"flex", gap:8, overflowX:"auto" }}>
        {["All","Confirmed","Pending"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding:"7px 16px", borderRadius:9, border:`1px solid ${filter===f?G:T.border}`, background:filter===f?GRAD:T.card, color:filter===f?"#0a0a0d":T.muted, fontSize:10, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", letterSpacing:1, textTransform:"uppercase" }}>
            {f}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(a => (
          <Card key={a.id} style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
              <Avatar name={a.client_name} size={42} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:6 }}>
                  <p style={{ fontSize:14, fontWeight:600 }}>{a.client_name}</p>
                  <Badge label={a.status} />
                </div>
                <p style={{ fontSize:12, color:T.muted, marginTop:3 }}>{a.service} · {a.staff_name}</p>
                {a.client_phone && <p style={{ fontSize:11, color:T.muted, marginTop:2 }}>📞 {a.client_phone}</p>}
                {a.client_email && <p style={{ fontSize:11, color:T.muted }}>✉️ {a.client_email}</p>}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
                  <span style={{ fontSize:11, color:T.muted }}>{a.date} · {a.time?.slice(0,5)}</span>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15, fontWeight:600, color:G }}>${a.price}</span>
                    {a.status==="Pending" && <GoldBtn variant="success" onClick={() => confirmAppt(a.id)} style={{ padding:"5px 11px", fontSize:11 }}>✓</GoldBtn>}
                    <GoldBtn variant="danger" onClick={() => cancelAppt(a.id)} style={{ padding:"5px 11px", fontSize:11 }}>✕</GoldBtn>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showAdd && (
        <Modal title="New Appointment" onClose={() => setShowAdd(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Input label="Client Name" value={na.client_name} onChange={e=>setNa(p=>({...p,client_name:e.target.value}))} />
            <Input label="Client Phone" type="tel" value={na.client_phone} onChange={e=>setNa(p=>({...p,client_phone:e.target.value}))} />
            <Input label="Client Email" type="email" value={na.client_email} onChange={e=>setNa(p=>({...p,client_email:e.target.value}))} />
            <div>
              <p style={{ fontSize:9, color:T.muted, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:7 }}>Service</p>
              <select value={na.service} onChange={e=>{ const svc=services.find(s=>s.name===e.target.value); setNa(p=>({...p,service:e.target.value,price:svc?.default_price||""})); }}
                style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:`1px solid ${T.border}`, background:T.hover, color:T.text, fontSize:15, fontFamily:"inherit", outline:"none" }}>
                <option value="">Select…</option>
                {services.map(s => <option key={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <p style={{ fontSize:9, color:T.muted, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:7 }}>Staff</p>
              <select value={na.staff_name} onChange={e=>setNa(p=>({...p,staff_name:e.target.value}))}
                style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:`1px solid ${T.border}`, background:T.hover, color:T.text, fontSize:15, fontFamily:"inherit", outline:"none" }}>
                <option value="">Select…</option>
                {staff.map(s => <option key={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Input label="Date" type="date" value={na.date} onChange={e=>setNa(p=>({...p,date:e.target.value}))} />
              <Input label="Time" type="time" value={na.time} onChange={e=>setNa(p=>({...p,time:e.target.value}))} />
            </div>
            <Input label="Price ($)" type="number" value={na.price} onChange={e=>setNa(p=>({...p,price:e.target.value}))} />
            <GoldBtn onClick={submit} style={{ marginTop:6, padding:"15px" }}>Book Appointment</GoldBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CLIENTS ──────────────────────────────────────────────────
function ClientsPage({ clients, reload }) {
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [nc, setNc] = useState({ name:"", phone:"", email:"" });
  const filtered = clients.filter(c=>c.name.toLowerCase().includes(q.toLowerCase()));

  const submit = async () => {
    if (!nc.name) return;
    const av = nc.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
    await addClient({ ...nc, avatar:av, tag:"New" });
    setNc({ name:"", phone:"", email:"" }); setShowAdd(false); reload();
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s both" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600 }}>Clients</p>
        <GoldBtn onClick={() => setShowAdd(true)} style={{ padding:"8px 14px", fontSize:18 }}>+</GoldBtn>
      </div>
      <input placeholder="🔍 Search…" value={q} onChange={e=>setQ(e.target.value)}
        style={{ padding:"11px 14px", borderRadius:10, border:`1px solid ${T.border}`, background:T.card, color:T.text, fontSize:14, outline:"none", fontFamily:"inherit" }} />
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(c => (
          <Card key={c.id} style={{ padding:"16px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Avatar name={c.name} size={48} />
              <div style={{ flex:1 }}>
                <p style={{ fontSize:15, fontWeight:600 }}>{c.name}</p>
                <p style={{ fontSize:12, color:T.muted }}>{c.phone}</p>
                {c.email && <p style={{ fontSize:11, color:T.muted }}>{c.email}</p>}
              </div>
              <Badge label={c.tag} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:12 }}>
              {[["Visits",c.visits,T.text],["Last",c.last_visit||"—",T.text],["Spent",`$${Number(c.total_spent).toLocaleString()}`,G]].map(([k,v,col]) => (
                <div key={k} style={{ background:T.hover, borderRadius:8, padding:"8px 10px" }}>
                  <p style={{ fontSize:9, color:T.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:.7 }}>{k}</p>
                  <p style={{ fontSize:12, fontWeight:700, marginTop:3, color:col }}>{v}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      {showAdd && (
        <Modal title="Add Client" onClose={() => setShowAdd(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Input label="Name" value={nc.name} onChange={e=>setNc(p=>({...p,name:e.target.value}))} />
            <Input label="Phone" type="tel" value={nc.phone} onChange={e=>setNc(p=>({...p,phone:e.target.value}))} />
            <Input label="Email" type="email" value={nc.email} onChange={e=>setNc(p=>({...p,email:e.target.value}))} />
            <GoldBtn onClick={submit} style={{ padding:"15px" }}>Add Client</GoldBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── TEAM ────────────────────────────────────────────────────
function TeamPage({ staff, services, reload }) {
  const [editing, setEditing] = useState(null);
  if (editing) return <StaffEditor staff={editing} services={services} onClose={() => { setEditing(null); reload(); }} />;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"fadeUp .4s both" }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600 }}>Team</p>
      {staff.map(s => (
        <Card key={s.id} style={{ padding:"18px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <Avatar name={s.name} size={56} color={s.color} photoUrl={s.photo_url} />
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:16, fontWeight:600, fontFamily:"'Cormorant Garamond',serif" }}>{s.name}</p>
              <p style={{ fontSize:9, color:G, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginTop:3 }}>{s.role}</p>
              <p style={{ fontSize:10, color:T.muted, marginTop:6 }}>🔗 sis2.beauty/{s.slug}
                <button onClick={() => navigator.clipboard?.writeText(`https://sis2.beauty/${s.slug}`)}
                  style={{ background:"transparent", border:`1px solid ${G}40`, color:G, cursor:"pointer", fontSize:9, fontWeight:700, marginLeft:8, padding:"2px 8px", borderRadius:5, letterSpacing:.5 }}>Copy</button>
              </p>
            </div>
            <Badge label={s.status} />
          </div>
          <GoldBtn variant="secondary" onClick={() => setEditing(s)} style={{ marginTop:14, width:"100%", padding:"11px" }}>
            Manage Schedule & Services
          </GoldBtn>
        </Card>
      ))}
    </div>
  );
}

function StaffEditor({ staff, services, onClose }) {
  const [tab, setTab] = useState("photo");
  const [avail, setAvail] = useState([]);
  const [staffSvc, setStaffSvc] = useState([]);
  const [timeOff, setTimeOff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTimeOff, setShowTimeOff] = useState(false);
  const [newOff, setNewOff] = useState({ start_date:"", end_date:"", reason:"" });
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(staff.photo_url||"");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([fetchAvailability(staff.id), fetchStaffServices(staff.id), fetchTimeOff(staff.id)])
      .then(([a,s,o]) => { setAvail(a); setStaffSvc(s); setTimeOff(o); })
      .finally(() => setLoading(false));
  }, [staff.id]);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadStaffPhoto(staff.id, file); setPhotoUrl(url); }
    catch(err) { alert("Upload failed: " + err.message); }
    finally { setUploading(false); }
  };

  const toggleDay = (day) => {
    const exists = avail.find(a=>a.day_of_week===day);
    if (exists) setAvail(avail.filter(a=>a.day_of_week!==day));
    else setAvail([...avail, { day_of_week:day, start_time:"09:00", end_time:"17:00" }]);
  };
  const updateTime = (day,field,value) => setAvail(avail.map(a=>a.day_of_week===day?{...a,[field]:value}:a));
  const saveAvail = async () => { await setAvailability(staff.id, avail.map(({day_of_week,start_time,end_time})=>({day_of_week,start_time,end_time}))); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const toggleSvc = (svcId) => { if (staffSvc.find(s=>s.id===svcId)) setStaffSvc(staffSvc.filter(s=>s.id!==svcId)); else { const svc=services.find(s=>s.id===svcId); setStaffSvc([...staffSvc,svc]); } };
  const saveSvcs = async () => { await setStaffServices(staff.id, staffSvc.map(s=>s.id)); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const submitOff = async () => { if (!newOff.start_date||!newOff.end_date) return; const c=await addTimeOff({staff_id:staff.id,...newOff}); setTimeOff([...timeOff,c]); setNewOff({start_date:"",end_date:"",reason:""}); setShowTimeOff(false); };
  const removeOff = async (id) => { await deleteTimeOff(id); setTimeOff(timeOff.filter(t=>t.id!==id)); };

  if (loading) return <div style={{ display:"flex",justifyContent:"center",padding:60 }}><Spinner /></div>;

  const tabs = ["photo","availability","services","timeoff"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s both" }}>
      <button onClick={onClose} style={{ display:"flex", alignItems:"center", gap:6, border:"none", background:"transparent", color:T.muted, fontSize:10, cursor:"pointer", letterSpacing:.8, textTransform:"uppercase" }}>
        ‹ Back to Team
      </button>
      <Card style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:14, borderColor:`${G}30` }}>
        <Avatar name={staff.name} size={52} color={staff.color} photoUrl={photoUrl} />
        <div>
          <p style={{ fontSize:16, fontWeight:600, fontFamily:"'Cormorant Garamond',serif" }}>{staff.name}</p>
          <p style={{ fontSize:9, color:G, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginTop:3 }}>{staff.role}</p>
        </div>
      </Card>

      <div style={{ display:"flex", gap:4, padding:"4px", background:T.card, borderRadius:10, border:`1px solid ${T.border}`, overflowX:"auto" }}>
        {tabs.map(x => (
          <button key={x} onClick={() => setTab(x)}
            style={{ flex:1, padding:"9px 8px", borderRadius:7, border:"none", background:tab===x?GRAD:"transparent", color:tab===x?"#0a0a0d":T.muted, fontSize:10, fontWeight:700, cursor:"pointer", textTransform:"uppercase", letterSpacing:.5, whiteSpace:"nowrap" }}>
            {x==="timeoff"?"Time Off":x}
          </button>
        ))}
      </div>

      {tab==="photo" && (
        <Card style={{ padding:20 }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:16 }}>Profile Photo</p>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <Avatar name={staff.name} size={72} color={staff.color} photoUrl={photoUrl} />
            <div>
              <label style={{ cursor:"pointer" }}>
                <GoldBtn as="span" style={{ padding:"10px 18px" }}>{uploading?"Uploading…":"Upload Photo"}</GoldBtn>
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:"none" }} />
              </label>
              <p style={{ fontSize:10, color:T.muted, marginTop:10 }}>JPG, PNG — max 5MB</p>
            </div>
          </div>
        </Card>
      )}

      {tab==="availability" && (
        <Card style={{ padding:18 }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:14 }}>Weekly Schedule</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {DAYS.map((d,idx) => {
              const da = avail.find(a=>a.day_of_week===idx);
              return (
                <div key={idx} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:T.hover, borderRadius:9 }}>
                  <button onClick={()=>toggleDay(idx)} style={{ width:54, padding:"6px", borderRadius:7, border:"none", background:da?GRAD:T.border, color:da?"#0a0a0d":T.muted, fontSize:11, fontWeight:700, cursor:"pointer" }}>{d}</button>
                  {da ? (
                    <div style={{ display:"flex", gap:8, alignItems:"center", flex:1 }}>
                      <input type="time" value={da.start_time?.slice(0,5)} onChange={e=>updateTime(idx,"start_time",e.target.value)} style={{ flex:1, padding:"7px 10px", borderRadius:7, border:`1px solid ${T.border}`, background:T.bg, color:T.text, fontSize:13 }} />
                      <span style={{ color:G }}>→</span>
                      <input type="time" value={da.end_time?.slice(0,5)} onChange={e=>updateTime(idx,"end_time",e.target.value)} style={{ flex:1, padding:"7px 10px", borderRadius:7, border:`1px solid ${T.border}`, background:T.bg, color:T.text, fontSize:13 }} />
                    </div>
                  ) : <span style={{ fontSize:12, color:T.muted }}>Day off</span>}
                </div>
              );
            })}
          </div>
          <GoldBtn onClick={saveAvail} style={{ marginTop:14, width:"100%", padding:"12px" }}>{saved?"✓ Saved!":"Save Schedule"}</GoldBtn>
        </Card>
      )}

      {tab==="services" && (
        <Card style={{ padding:18 }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:14 }}>Services Offered</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {services.map(svc => {
              const enabled = staffSvc.find(s=>s.id===svc.id);
              return (
                <div key={svc.id} onClick={()=>toggleSvc(svc.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:enabled?`${G}12`:T.hover, borderRadius:10, border:`1px solid ${enabled?G:"transparent"}`, cursor:"pointer" }}>
                  <div style={{ width:22, height:22, borderRadius:6, background:enabled?GRAD:T.border, display:"flex", alignItems:"center", justifyContent:"center", color:"#0a0a0d" }}>{enabled&&"✓"}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:600 }}>{svc.name}</p>
                    <p style={{ fontSize:11, color:T.muted }}>{svc.duration_min} min · ${svc.default_price}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <GoldBtn onClick={saveSvcs} style={{ marginTop:14, width:"100%", padding:"12px" }}>{saved?"✓ Saved!":"Save Services"}</GoldBtn>
        </Card>
      )}

      {tab==="timeoff" && (
        <Card style={{ padding:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600 }}>Time Off</p>
            <GoldBtn onClick={() => setShowTimeOff(true)} style={{ padding:"6px 12px", fontSize:11 }}>+ Add</GoldBtn>
          </div>
          {timeOff.length===0 ? <p style={{ color:T.muted, fontSize:13, textAlign:"center", padding:16 }}>No time off scheduled</p> : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {timeOff.map(o => (
                <div key={o.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:T.hover, borderRadius:9 }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:600 }}>{o.start_date} → {o.end_date}</p>
                    {o.reason && <p style={{ fontSize:11, color:T.muted }}>{o.reason}</p>}
                  </div>
                  <GoldBtn variant="danger" onClick={() => removeOff(o.id)} style={{ padding:"5px 10px", fontSize:11 }}>✕</GoldBtn>
                </div>
              ))}
            </div>
          )}
          {showTimeOff && (
            <Modal title="Add Time Off" onClose={() => setShowTimeOff(false)}>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <Input label="Start Date" type="date" value={newOff.start_date} onChange={e=>setNewOff(p=>({...p,start_date:e.target.value}))} />
                <Input label="End Date" type="date" value={newOff.end_date} onChange={e=>setNewOff(p=>({...p,end_date:e.target.value}))} />
                <Input label="Reason (optional)" value={newOff.reason} onChange={e=>setNewOff(p=>({...p,reason:e.target.value}))} placeholder="Vacation, sick…" />
                <GoldBtn onClick={submitOff} style={{ padding:"13px" }}>Add Time Off</GoldBtn>
              </div>
            </Modal>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── SERVICES ─────────────────────────────────────────────────
function ServicesPage({ services, reload }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"", category:"", default_price:"", duration_min:"60", description:"" });

  const openAdd = () => { setEditing(null); setForm({ name:"", category:"", default_price:"", duration_min:"60", description:"" }); setShowAdd(true); };
  const openEdit = svc => { setEditing(svc); setForm({ name:svc.name, category:svc.category||"", default_price:svc.default_price, duration_min:svc.duration_min, description:svc.description||"" }); setShowAdd(true); };

  const submit = async () => {
    if (!form.name) return;
    const data = { ...form, default_price:Number(form.default_price)||0, duration_min:Number(form.duration_min)||60 };
    if (editing) await updateService(editing.id, data); else await addService(data);
    setShowAdd(false); reload();
  };

  const remove = async id => { if (!confirm("Hide this service?")) return; await deleteService(id); reload(); };
  const grouped = services.reduce((acc,s) => { (acc[s.category||"Other"]=acc[s.category||"Other"]||[]).push(s); return acc; }, {});

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s both" }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600 }}>Services</p>
      <GoldBtn onClick={openAdd} style={{ width:"100%", padding:"13px" }}>+ Add New Service</GoldBtn>
      {Object.entries(grouped).map(([cat,list]) => (
        <div key={cat}>
          <p style={{ fontSize:9, color:G, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>{cat}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {list.map(s => (
              <Card key={s.id} style={{ padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:15, fontWeight:600, fontFamily:"'Cormorant Garamond',serif" }}>{s.name}</p>
                    {s.description && <p style={{ fontSize:11, color:T.muted, marginTop:3 }}>{s.description}</p>}
                    <p style={{ fontSize:11, color:T.muted, marginTop:5 }}>{s.duration_min} min</p>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, color:G }}>${s.default_price}</p>
                    <div style={{ display:"flex", gap:6 }}>
                      <GoldBtn variant="secondary" onClick={() => openEdit(s)} style={{ padding:"5px 10px", fontSize:10 }}>Edit</GoldBtn>
                      <GoldBtn variant="danger" onClick={() => remove(s.id)} style={{ padding:"5px 10px", fontSize:10 }}>✕</GoldBtn>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
      {showAdd && (
        <Modal title={editing?"Edit Service":"Add Service"} onClose={() => setShowAdd(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Input label="Service Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Eyelash Extensions" />
            <Input label="Category" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} placeholder="Hair, Lashes, Nails…" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Input label="Price ($)" type="number" value={form.default_price} onChange={e=>setForm(p=>({...p,default_price:e.target.value}))} />
              <Input label="Duration (min)" type="number" value={form.duration_min} onChange={e=>setForm(p=>({...p,duration_min:e.target.value}))} />
            </div>
            <Input label="Description" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Short description for clients" />
            <GoldBtn onClick={submit} style={{ padding:"15px" }}>{editing?"Save Changes":"Add Service"}</GoldBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── FINANCE ─────────────────────────────────────────────────
function FinancePage({ appts, transactions, services }) {
  const inc = transactions.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
  const exp = transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+Math.abs(Number(t.amount)),0);
  const net = inc-exp;
  const svcBreak = services.map(svc => ({ name:svc.name, rev:appts.filter(a=>a.service===svc.name).reduce((s,a)=>s+Number(a.price),0) })).filter(s=>s.rev>0).sort((a,b)=>b.rev-a.rev);
  const maxRev = Math.max(...svcBreak.map(s=>s.rev),1);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s both" }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600 }}>Finance</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[["Income","$"+inc.toLocaleString(),"#7cb389"],["Expenses","$"+exp.toLocaleString(),"#c97070"]].map(([l,v,c]) => (
          <Card key={l} style={{ padding:"14px 16px" }}>
            <p style={{ fontSize:9, color:T.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{l}</p>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:600, color:c, marginTop:5 }}>{v}</p>
          </Card>
        ))}
      </div>
      <Card style={{ padding:"18px 20px", borderColor:`${G}40`, background:`${G}06` }}>
        <p style={{ fontSize:9, color:G, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5 }}>Net Profit</p>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:600, color:G, marginTop:5 }}>${net.toLocaleString()}</p>
      </Card>
      {svcBreak.length > 0 && (
        <Card style={{ padding:18 }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:14 }}>Top Services</p>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {svcBreak.slice(0,6).map(s => (
              <div key={s.name}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:13 }}>{s.name}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:G }}>${s.rev}</span>
                </div>
                <div style={{ height:5, borderRadius:3, background:T.hover }}>
                  <div style={{ height:"100%", width:`${(s.rev/maxRev)*100}%`, background:GRAD, borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <Card style={{ padding:18 }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:14 }}>Transactions</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {transactions.map(tx => (
            <div key={tx.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, background:T.hover }}>
              <div style={{ width:32, height:32, borderRadius:9, background:tx.type==="income"?"#7cb38920":"#c9707020", display:"flex", alignItems:"center", justifyContent:"center", color:tx.type==="income"?"#7cb389":"#c97070" }}>
                {tx.type==="income"?"↑":"↓"}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600 }}>{tx.description}</p>
                <p style={{ fontSize:11, color:T.muted }}>{tx.date}</p>
              </div>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, color:tx.type==="income"?"#7cb389":"#c97070" }}>
                {tx.type==="income"?"+":"-"}${Math.abs(Number(tx.amount)).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
