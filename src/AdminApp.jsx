// ─────────────────────────────────────────────
//  SiS2 Beauty — Admin Dashboard
//  Routes: /admin
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  fetchClients, fetchStaff, fetchAppointments, fetchServices, fetchTransactions,
  updateAppointmentStatus, deleteAppointment, addAppointment, addClient,
  addService, updateService, deleteService,
  fetchStaffServices, setStaffServices,
  fetchAvailability, setAvailability,
  fetchTimeOff, addTimeOff, deleteTimeOff,
  subscribeToAppointments, supabase,
} from "./supabase";
import {
  BRAND, T, Ic, Avatar, Badge, Card, Button, Input, Modal, Select, Spinner, Logo,
  useTheme, GlobalStyles, buildCssVars, PRIMARY_GRADIENT, DAYS,
} from "./shared";

const today = new Date().toISOString().slice(0,10);

export default function AdminApp() {
  const [t, dark, setDark] = useTheme();
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
      const [c, s, a, sv, tx] = await Promise.all([
        fetchClients(), fetchStaff(), fetchAppointments(), fetchServices(), fetchTransactions(),
      ]);
      setClients(c); setStaff(s); setAppts(a); setServices(sv); setTransactions(tx);
      setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadAll();
    const sub = subscribeToAppointments(() => fetchAppointments().then(setAppts));
    return () => { supabase.removeChannel(sub); };
  }, []);

  const confirmAppt = async (id) => { await updateAppointmentStatus(id, "Confirmed"); setAppts(p => p.map(a => a.id===id?{...a,status:"Confirmed"}:a)); };
  const cancelAppt = async (id) => { await deleteAppointment(id); setAppts(p => p.filter(a => a.id!==id)); };

  const nav = [
    { id:"dashboard",    icon:Ic.grid,     label:"Home" },
    { id:"appointments", icon:Ic.calendar, label:"Appts" },
    { id:"clients",      icon:Ic.users,    label:"Clients" },
    { id:"team",         icon:Ic.user,     label:"Team" },
    { id:"services",     icon:Ic.list,     label:"Services" },
    { id:"finance",      icon:Ic.dollar,   label:"Finance" },
  ];

  const titles = { dashboard:"Overview", appointments:"Appointments", clients:"Clients", team:"Team", services:"Services", finance:"Finance" };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:t.bg, color:t.text, ...buildCssVars(t) }}>
      <GlobalStyles t={t} />

      {/* Top Bar */}
      <div style={{ padding:"16px 20px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0, borderBottom:`1px solid ${BRAND.gold}15` }}>
        <Logo size={36} t={t} />
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:9, color:BRAND.gold, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", padding:"4px 10px", border:`1px solid ${BRAND.gold}40`, borderRadius:20 }}>Admin</span>
          <button onClick={() => setDark(d=>!d)} style={{ padding:"7px 10px", borderRadius:20, border:`1px solid ${t.border}`, background:t.card, color:t.muted, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center" }}>
            {dark ? Ic.sun : Ic.moon}
          </button>
        </div>
      </div>

      <div style={{ padding:"18px 20px 0", flexShrink:0 }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:30, fontWeight:600, color:t.text, letterSpacing:.3 }}>{titles[page]}</h1>
        <p style={{ fontSize:11, color:t.muted, marginTop:3, letterSpacing:.5 }}>SiS2 Beauty Studio · Live</p>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 20px 100px" }}>
        {loading ? <div style={{ display:"flex", justifyContent:"center", padding:60 }}><Spinner /></div> :
         error ? <Card style={{ padding:24, textAlign:"center" }}><p style={{ color:"#c97070", marginBottom:16 }}>⚠️ {error}</p><Button onClick={loadAll}>Retry</Button></Card> :
         <>
           {page==="dashboard"    && <Dashboard appts={appts} clients={clients} confirmAppt={confirmAppt} t={t} />}
           {page==="appointments" && <AppointmentsPage appts={appts} confirmAppt={confirmAppt} cancelAppt={cancelAppt} reload={loadAll} staff={staff} services={services} t={t} />}
           {page==="clients"      && <ClientsPage clients={clients} reload={loadAll} t={t} />}
           {page==="team"         && <TeamPage staff={staff} services={services} reload={loadAll} t={t} />}
           {page==="services"     && <ServicesPage services={services} reload={loadAll} t={t} />}
           {page==="finance"      && <FinancePage appts={appts} transactions={transactions} services={services} t={t} />}
         </>
        }
      </div>

      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:t.nav, borderTop:`1px solid ${BRAND.gold}20`, display:"flex", justifyContent:"space-around", padding:"8px 0 20px", zIndex:200 }}>
        {nav.map(item => {
          const active = page===item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"6px 8px", border:"none", background:"transparent", color:active?BRAND.gold:t.muted, cursor:"pointer", flex:1 }}>
              <div style={{ transform:active?"scale(1.15)":"scale(1)", transition:"transform .2s" }}>{item.icon}</div>
              <span style={{ fontSize:9, fontWeight:active?700:500, letterSpacing:.5, textTransform:"uppercase" }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function Dashboard({ appts, clients, confirmAppt, t }) {
  const totalRev = appts.filter(a => a.status==="Confirmed").reduce((s,a) => s+Number(a.price),0);
  const todayAppts = appts.filter(a => a.date===today);
  const pending = appts.filter(a => a.status==="Pending");

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[
          ["Revenue", `$${totalRev.toLocaleString()}`, "↑ this month", BRAND.gold, Ic.dollar],
          ["Today", todayAppts.length, `${todayAppts.filter(a=>a.status==="Confirmed").length} confirmed`, BRAND.bronze, Ic.calendar],
          ["Clients", clients.length, "Total", "#7cb389", Ic.users],
          ["Pending", pending.length, "Need review", "#c9a961", Ic.user],
        ].map(([l,v,sub,c,icon]) => (
          <Card key={l} style={{ padding:"16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <div>
                <p style={{ fontSize:9, color:t.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{l}</p>
                <p style={{ fontSize:26, fontWeight:600, color:t.text, marginTop:6, fontFamily:"'Cormorant Garamond',serif" }}>{v}</p>
                <p style={{ fontSize:10, color:c, marginTop:5, fontWeight:600, letterSpacing:.5 }}>{sub}</p>
              </div>
              <div style={{ width:38, height:38, borderRadius:9, background:`${c}18`, display:"flex", alignItems:"center", justifyContent:"center", color:c }}>{icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {pending.length > 0 && (
        <Card style={{ padding:18, borderColor:`${BRAND.gold}50`, background:`${BRAND.gold}08` }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, color:t.text, marginBottom:14, letterSpacing:.3 }}>
            <span style={{ color:BRAND.gold }}>✦</span> Pending Approvals ({pending.length})
          </h3>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {pending.slice(0,3).map(a => (
              <div key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:t.hover }}>
                <Avatar name={a.client_name} size={36} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:t.text }}>{a.client_name}</p>
                  <p style={{ fontSize:11, color:t.muted }}>{a.service} · {a.date} {a.time?.slice(0,5)}</p>
                </div>
                <Button variant="success" onClick={() => confirmAppt(a.id)} style={{ padding:"6px 12px", fontSize:11 }}>✓</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ padding:20 }}>
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, color:t.text, marginBottom:14, letterSpacing:.3 }}>Today's Schedule</h3>
        {todayAppts.length === 0 ? <p style={{ color:t.muted, fontSize:13, textAlign:"center", padding:14 }}>Nothing scheduled today.</p> : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {todayAppts.map(a => (
              <div key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:t.hover }}>
                <div style={{ minWidth:54, padding:"6px 0", borderRadius:8, background:`linear-gradient(135deg, ${BRAND.gold}15, ${BRAND.bronze}15)`, textAlign:"center", border:`1px solid ${BRAND.gold}25` }}>
                  <span style={{ fontSize:12, fontWeight:700, color:BRAND.gold, letterSpacing:.5 }}>{a.time?.slice(0,5)}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:t.text }}>{a.client_name}</p>
                  <p style={{ fontSize:11, color:t.muted }}>{a.service} · {a.staff_name}</p>
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
function AppointmentsPage({ appts, confirmAppt, cancelAppt, reload, staff, services, t }) {
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [na, setNa] = useState({ client_name:"", staff_name:"", service:"", date:"", time:"", price:"" });
  const filtered = filter==="All" ? appts : appts.filter(a => a.status===filter);

  const submit = async () => {
    if (!na.client_name || !na.service) return;
    const svc = services.find(s => s.name === na.service);
    const stf = staff.find(s => s.name === na.staff_name);
    await addAppointment({
      ...na, status:"Pending",
      service_id: svc?.id, staff_id: stf?.id,
      duration_min: svc?.duration_min || 60,
      price: Number(na.price) || svc?.default_price || 0,
    });
    setNa({ client_name:"", staff_name:"", service:"", date:"", time:"", price:"" });
    setShowAdd(false); reload();
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", gap:8, justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:8, overflowX:"auto", flex:1 }}>
          {["All","Confirmed","Pending"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:"8px 16px", borderRadius:9, border:`1px solid ${filter===f?BRAND.gold:t.border}`, background:filter===f?PRIMARY_GRADIENT:t.card, color:filter===f?"#0a0a0d":t.muted, fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", letterSpacing:.5, textTransform:"uppercase" }}>
              {f}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowAdd(true)} style={{ padding:"8px 14px" }}>{Ic.plus}</Button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(a => (
          <Card key={a.id} style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
              <Avatar name={a.client_name} size={42} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:6 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:t.text }}>{a.client_name}</p>
                  <Badge label={a.status} />
                </div>
                <p style={{ fontSize:12, color:t.muted, marginTop:3 }}>{a.service} · {a.staff_name}</p>
                {a.client_phone && <p style={{ fontSize:11, color:t.muted, marginTop:2 }}>📞 {a.client_phone}</p>}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
                  <span style={{ fontSize:11, color:t.muted, letterSpacing:.5 }}>{a.date} · {a.time?.slice(0,5)}</span>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <span style={{ fontWeight:700, fontSize:14, color:BRAND.gold, fontFamily:"'Cormorant Garamond',serif" }}>${a.price}</span>
                    {a.status==="Pending" && <Button variant="success" onClick={() => confirmAppt(a.id)} style={{ padding:"5px 11px", fontSize:11 }}>{Ic.check}</Button>}
                    <Button variant="danger" onClick={() => cancelAppt(a.id)} style={{ padding:"5px 11px", fontSize:11 }}>{Ic.x}</Button>
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
            <Input label="Client Name" value={na.client_name} onChange={e=>setNa(p=>({...p,client_name:e.target.value}))} placeholder="Sarah Johnson" />
            <Select label="Service" value={na.service} onChange={e=>{ const svc = services.find(s=>s.name===e.target.value); setNa(p=>({...p,service:e.target.value, price:svc?.default_price||""})); }} options={services.map(s=>s.name)} />
            <Select label="Staff" value={na.staff_name} onChange={e=>setNa(p=>({...p,staff_name:e.target.value}))} options={staff.map(s=>s.name)} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Input label="Date" type="date" value={na.date} onChange={e=>setNa(p=>({...p,date:e.target.value}))} />
              <Input label="Time" type="time" value={na.time} onChange={e=>setNa(p=>({...p,time:e.target.value}))} />
            </div>
            <Input label="Price ($)" type="number" value={na.price} onChange={e=>setNa(p=>({...p,price:e.target.value}))} />
            <Button onClick={submit} style={{ marginTop:6, padding:"15px" }}>Book Appointment</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CLIENTS ──────────────────────────────────────────────────
function ClientsPage({ clients, reload, t }) {
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [nc, setNc] = useState({ name:"", phone:"", email:"" });
  const filtered = clients.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));

  const submit = async () => {
    if (!nc.name) return;
    const av = nc.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
    await addClient({ ...nc, avatar:av, tag:"New" });
    setNc({ name:"", phone:"", email:"" }); setShowAdd(false); reload();
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", gap:8 }}>
        <input placeholder="🔍 Search…" value={q} onChange={e => setQ(e.target.value)}
          style={{ flex:1, padding:"11px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:t.card, color:t.text, fontSize:14, outline:"none" }} />
        <Button onClick={() => setShowAdd(true)} style={{ padding:"8px 14px" }}>{Ic.plus}</Button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(c => (
          <Card key={c.id} style={{ padding:"16px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Avatar name={c.name} size={48} />
              <div style={{ flex:1 }}>
                <p style={{ fontSize:15, fontWeight:600, color:t.text }}>{c.name}</p>
                <p style={{ fontSize:12, color:t.muted }}>{c.phone}</p>
                {c.email && <p style={{ fontSize:11, color:t.muted }}>{c.email}</p>}
              </div>
              <Badge label={c.tag} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:12 }}>
              {[["Visits",c.visits, t.text],["Last",c.last_visit||"—", t.text],["Spent",`$${Number(c.total_spent).toLocaleString()}`, BRAND.gold]].map(([k,v,col]) => (
                <div key={k} style={{ background:t.hover, borderRadius:8, padding:"8px 10px" }}>
                  <p style={{ fontSize:9, color:t.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:.7 }}>{k}</p>
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
            <Button onClick={submit} style={{ marginTop:6, padding:"15px" }}>Add Client</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── TEAM ────────────────────────────────────────────────────
function TeamPage({ staff, services, reload, t }) {
  const [editing, setEditing] = useState(null);

  if (editing) return <StaffEditor staff={editing} services={services} onClose={() => { setEditing(null); reload(); }} t={t} />;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {staff.map(s => (
        <Card key={s.id} style={{ padding:"18px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <Avatar name={s.name} size={52} color={s.color} photoUrl={s.photo_url} />
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:16, fontWeight:600, color:t.text, fontFamily:"'Cormorant Garamond',serif" }}>{s.name}</p>
              <p style={{ fontSize:11, color:BRAND.gold, marginTop:2, letterSpacing:1, textTransform:"uppercase", fontWeight:600 }}>{s.role}</p>
              <p style={{ fontSize:11, color:t.muted, marginTop:6, display:"flex", alignItems:"center", gap:5 }}>
                {Ic.link} sis2.beauty/{s.slug}
                <button onClick={() => navigator.clipboard?.writeText(`https://sis2.beauty/${s.slug}`)} style={{ background:"transparent", border:`1px solid ${BRAND.gold}40`, color:BRAND.gold, cursor:"pointer", fontSize:9, fontWeight:700, marginLeft:6, padding:"2px 8px", borderRadius:6, letterSpacing:.5, textTransform:"uppercase" }}>Copy</button>
              </p>
            </div>
            <Badge label={s.status} />
          </div>
          <div style={{ marginTop:14 }}>
            <Button variant="secondary" onClick={() => setEditing(s)} style={{ width:"100%", padding:"11px" }}>
              Manage Schedule & Services
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function StaffEditor({ staff, services, onClose, t }) {
  const [tab, setTab] = useState("availability");
  const [avail, setAvail] = useState([]);
  const [staffSvc, setStaffSvc] = useState([]);
  const [timeOff, setTimeOff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTimeOff, setShowTimeOff] = useState(false);
  const [newOff, setNewOff] = useState({ start_date:"", end_date:"", reason:"" });

  useEffect(() => {
    Promise.all([fetchAvailability(staff.id), fetchStaffServices(staff.id), fetchTimeOff(staff.id)])
      .then(([a, s, o]) => { setAvail(a); setStaffSvc(s); setTimeOff(o); })
      .finally(() => setLoading(false));
  }, [staff.id]);

  const toggleDay = (day) => {
    const exists = avail.find(a => a.day_of_week === day);
    if (exists) setAvail(avail.filter(a => a.day_of_week !== day));
    else setAvail([...avail, { day_of_week: day, start_time: "09:00", end_time: "17:00" }]);
  };

  const updateTime = (day, field, value) => {
    setAvail(avail.map(a => a.day_of_week === day ? { ...a, [field]: value } : a));
  };

  const saveAvailability = async () => {
    await setAvailability(staff.id, avail.map(({day_of_week, start_time, end_time}) => ({ day_of_week, start_time, end_time })));
    alert("Schedule saved!");
  };

  const toggleService = (svcId) => {
    if (staffSvc.find(s => s.id === svcId)) setStaffSvc(staffSvc.filter(s => s.id !== svcId));
    else { const svc = services.find(s => s.id === svcId); setStaffSvc([...staffSvc, svc]); }
  };

  const saveServices = async () => {
    await setStaffServices(staff.id, staffSvc.map(s => s.id));
    alert("Services saved!");
  };

  const submitTimeOff = async () => {
    if (!newOff.start_date || !newOff.end_date) return;
    const created = await addTimeOff({ staff_id: staff.id, ...newOff });
    setTimeOff([...timeOff, created]);
    setNewOff({ start_date:"", end_date:"", reason:"" }); setShowTimeOff(false);
  };

  const removeTimeOff = async (id) => {
    await deleteTimeOff(id); setTimeOff(timeOff.filter(t => t.id !== id));
  };

  if (loading) return <div style={{ textAlign:"center", padding:60 }}><Spinner /></div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <button onClick={onClose} style={{ display:"flex", alignItems:"center", gap:6, border:"none", background:"transparent", color:t.muted, fontSize:12, cursor:"pointer", padding:0, letterSpacing:.5, textTransform:"uppercase" }}>
        {Ic.back} Back to Team
      </button>

      <Card style={{ padding:"16px 18px", display:"flex", alignItems:"center", gap:14, borderColor:`${BRAND.gold}30` }}>
        <Avatar name={staff.name} size={52} color={staff.color} photoUrl={staff.photo_url} />
        <div>
          <p style={{ fontSize:17, fontWeight:600, fontFamily:"'Cormorant Garamond',serif" }}>{staff.name}</p>
          <p style={{ fontSize:11, color:BRAND.gold, marginTop:2, letterSpacing:1, textTransform:"uppercase", fontWeight:600 }}>{staff.role}</p>
        </div>
      </Card>

      <div style={{ display:"flex", gap:4, padding:"4px", background:t.card, borderRadius:10, border:`1px solid ${t.border}` }}>
        {["availability","services","timeoff"].map(x => (
          <button key={x} onClick={() => setTab(x)}
            style={{ flex:1, padding:"10px", borderRadius:7, border:"none", background:tab===x?PRIMARY_GRADIENT:"transparent", color:tab===x?"#0a0a0d":t.muted, fontSize:11, fontWeight:700, cursor:"pointer", textTransform:"uppercase", letterSpacing:.7 }}>
            {x === "timeoff" ? "Time Off" : x}
          </button>
        ))}
      </div>

      {tab === "availability" && (
        <Card style={{ padding:18 }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:14 }}>Weekly Schedule</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {DAYS.map((d, idx) => {
              const dayAvail = avail.find(a => a.day_of_week === idx);
              return (
                <div key={idx} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:t.hover, borderRadius:9 }}>
                  <button onClick={() => toggleDay(idx)}
                    style={{ width:54, padding:"6px", borderRadius:7, border:"none", background:dayAvail?PRIMARY_GRADIENT:t.border, color:dayAvail?"#0a0a0d":t.muted, fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:.5 }}>
                    {d}
                  </button>
                  {dayAvail ? (
                    <div style={{ display:"flex", gap:8, alignItems:"center", flex:1 }}>
                      <input type="time" value={dayAvail.start_time?.slice(0,5)} onChange={e => updateTime(idx, "start_time", e.target.value)}
                        style={{ flex:1, padding:"7px 10px", borderRadius:7, border:`1px solid ${t.border}`, background:t.bg, color:t.text, fontSize:13 }} />
                      <span style={{ color:BRAND.gold, fontSize:13 }}>→</span>
                      <input type="time" value={dayAvail.end_time?.slice(0,5)} onChange={e => updateTime(idx, "end_time", e.target.value)}
                        style={{ flex:1, padding:"7px 10px", borderRadius:7, border:`1px solid ${t.border}`, background:t.bg, color:t.text, fontSize:13 }} />
                    </div>
                  ) : (
                    <span style={{ flex:1, fontSize:12, color:t.muted, letterSpacing:.5 }}>Day off</span>
                  )}
                </div>
              );
            })}
          </div>
          <Button onClick={saveAvailability} style={{ marginTop:14, width:"100%", padding:"12px" }}>Save Schedule</Button>
        </Card>
      )}

      {tab === "services" && (
        <Card style={{ padding:18 }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:14 }}>Services Offered</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {services.map(svc => {
              const enabled = staffSvc.find(s => s.id === svc.id);
              return (
                <div key={svc.id} onClick={() => toggleService(svc.id)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:enabled?`${BRAND.gold}12`:t.hover, borderRadius:10, border:`1px solid ${enabled?BRAND.gold:"transparent"}`, cursor:"pointer" }}>
                  <div style={{ width:22, height:22, borderRadius:6, background:enabled?PRIMARY_GRADIENT:t.border, display:"flex", alignItems:"center", justifyContent:"center", color:"#0a0a0d" }}>
                    {enabled && Ic.check}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:600 }}>{svc.name}</p>
                    <p style={{ fontSize:11, color:t.muted, marginTop:2 }}>{svc.duration_min} min · ${svc.default_price}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Button onClick={saveServices} style={{ marginTop:14, width:"100%", padding:"12px" }}>Save Services</Button>
        </Card>
      )}

      {tab === "timeoff" && (
        <Card style={{ padding:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600 }}>Time Off</h3>
            <Button onClick={() => setShowTimeOff(true)} style={{ padding:"6px 12px", fontSize:11 }}>+ Add</Button>
          </div>
          {timeOff.length === 0 ? <p style={{ color:t.muted, fontSize:13, textAlign:"center", padding:20 }}>No time off scheduled</p> : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {timeOff.map(o => (
                <div key={o.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:t.hover, borderRadius:9 }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:600 }}>{o.start_date} → {o.end_date}</p>
                    {o.reason && <p style={{ fontSize:11, color:t.muted, marginTop:2 }}>{o.reason}</p>}
                  </div>
                  <Button variant="danger" onClick={() => removeTimeOff(o.id)} style={{ padding:"5px 10px" }}>{Ic.trash}</Button>
                </div>
              ))}
            </div>
          )}

          {showTimeOff && (
            <Modal title="Add Time Off" onClose={() => setShowTimeOff(false)}>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <Input label="Start Date" type="date" value={newOff.start_date} onChange={e => setNewOff(p => ({...p,start_date:e.target.value}))} />
                <Input label="End Date" type="date" value={newOff.end_date} onChange={e => setNewOff(p => ({...p,end_date:e.target.value}))} />
                <Input label="Reason (optional)" value={newOff.reason} onChange={e => setNewOff(p => ({...p,reason:e.target.value}))} placeholder="Vacation, sick, etc." />
                <Button onClick={submitTimeOff} style={{ padding:"13px" }}>Add Time Off</Button>
              </div>
            </Modal>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── SERVICES ─────────────────────────────────────────────────
function ServicesPage({ services, reload, t }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"", category:"", default_price:"", duration_min:"", description:"" });

  const openAdd = () => { setEditing(null); setForm({ name:"", category:"", default_price:"", duration_min:"60", description:"" }); setShowAdd(true); };
  const openEdit = (svc) => { setEditing(svc); setForm({ name:svc.name, category:svc.category||"", default_price:svc.default_price, duration_min:svc.duration_min, description:svc.description||"" }); setShowAdd(true); };

  const submit = async () => {
    if (!form.name) return;
    const data = { ...form, default_price: Number(form.default_price)||0, duration_min: Number(form.duration_min)||60 };
    if (editing) await updateService(editing.id, data);
    else await addService(data);
    setShowAdd(false); reload();
  };

  const remove = async (id) => {
    if (!confirm("Hide this service?")) return;
    await deleteService(id); reload();
  };

  const grouped = services.reduce((acc, s) => { (acc[s.category||"Other"] = acc[s.category||"Other"] || []).push(s); return acc; }, {});

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Button onClick={openAdd} style={{ width:"100%", padding:"13px" }}>{Ic.plus} Add New Service</Button>

      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat}>
          <p style={{ fontSize:10, color:BRAND.gold, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, marginBottom:10 }}>{cat}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {list.map(s => (
              <Card key={s.id} style={{ padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:15, fontWeight:600, color:t.text, fontFamily:"'Cormorant Garamond',serif" }}>{s.name}</p>
                    {s.description && <p style={{ fontSize:11, color:t.muted, marginTop:3 }}>{s.description}</p>}
                    <p style={{ fontSize:11, color:t.muted, marginTop:6, letterSpacing:.5 }}>{s.duration_min} min</p>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                    <p style={{ fontSize:20, fontWeight:600, color:BRAND.gold, fontFamily:"'Cormorant Garamond',serif" }}>${s.default_price}</p>
                    <div style={{ display:"flex", gap:6 }}>
                      <Button variant="secondary" onClick={() => openEdit(s)} style={{ padding:"5px 10px", fontSize:10 }}>{Ic.edit}</Button>
                      <Button variant="danger" onClick={() => remove(s.id)} style={{ padding:"5px 10px", fontSize:10 }}>{Ic.trash}</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {showAdd && (
        <Modal title={editing ? "Edit Service" : "Add Service"} onClose={() => setShowAdd(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Input label="Service Name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Eyelash Extensions" />
            <Input label="Category" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} placeholder="Hair, Lashes, Nails, etc." />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Input label="Price ($)" type="number" value={form.default_price} onChange={e=>setForm(p=>({...p,default_price:e.target.value}))} />
              <Input label="Duration (min)" type="number" value={form.duration_min} onChange={e=>setForm(p=>({...p,duration_min:e.target.value}))} />
            </div>
            <Input label="Description" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Short description" />
            <Button onClick={submit} style={{ padding:"15px" }}>{editing ? "Save Changes" : "Add Service"}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── FINANCE ─────────────────────────────────────────────────
function FinancePage({ appts, transactions, services, t }) {
  const income = transactions.filter(x => x.type==="income").reduce((s,x)=>s+Number(x.amount),0);
  const expenses = transactions.filter(x => x.type==="expense").reduce((s,x)=>s+Math.abs(Number(x.amount)),0);
  const net = income - expenses;
  const svcBreak = services.map(svc => ({
    name: svc.name,
    rev: appts.filter(a => a.service === svc.name).reduce((s,a) => s+Number(a.price), 0)
  })).filter(s => s.rev > 0).sort((a,b) => b.rev - a.rev);
  const maxRev = Math.max(...svcBreak.map(s=>s.rev), 1);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[["Income","$"+income.toLocaleString(),"#7cb389"],["Expenses","$"+expenses.toLocaleString(),"#c97070"]].map(([l,v,c]) => (
          <Card key={l} style={{ padding:"14px 16px" }}>
            <p style={{ fontSize:9, color:t.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{l}</p>
            <p style={{ fontSize:24, fontWeight:600, color:c, marginTop:5, fontFamily:"'Cormorant Garamond',serif" }}>{v}</p>
          </Card>
        ))}
      </div>
      <Card style={{ padding:"18px 20px", borderColor:`${BRAND.gold}40`, background:`${BRAND.gold}05` }}>
        <p style={{ fontSize:9, color:BRAND.gold, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5 }}>Net Profit</p>
        <p style={{ fontSize:36, fontWeight:600, color:BRAND.gold, marginTop:5, fontFamily:"'Cormorant Garamond',serif" }}>${net.toLocaleString()}</p>
      </Card>

      {svcBreak.length > 0 && (
        <Card style={{ padding:18 }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:14 }}>Top Services</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {svcBreak.slice(0,6).map(s => (
              <div key={s.name}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:13, color:t.text }}>{s.name}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:BRAND.gold, fontFamily:"'Cormorant Garamond',serif" }}>${s.rev}</span>
                </div>
                <div style={{ height:5, borderRadius:3, background:t.hover }}>
                  <div style={{ height:"100%", width:`${(s.rev/maxRev)*100}%`, background:PRIMARY_GRADIENT, borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ padding:18 }}>
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:14 }}>Transactions</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {transactions.map(tx => (
            <div key={tx.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, background:t.hover }}>
              <div style={{ width:32, height:32, borderRadius:9, background:tx.type==="income"?"#7cb38922":"#c9707022", display:"flex", alignItems:"center", justifyContent:"center", color:tx.type==="income"?"#7cb389":"#c97070" }}>{tx.type==="income"?"↑":"↓"}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600 }}>{tx.description}</p>
                <p style={{ fontSize:11, color:t.muted }}>{tx.date}</p>
              </div>
              <span style={{ fontWeight:700, color:tx.type==="income"?"#7cb389":"#c97070", fontFamily:"'Cormorant Garamond',serif" }}>{tx.type==="income"?"+":"-"}${Math.abs(Number(tx.amount)).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
