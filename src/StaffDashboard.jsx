// ─────────────────────────────────────────────
//  StaffDashboard — for logged-in stylists
//  Shows their own appointments, profile editor
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  fetchAppointmentsByStaff, fetchAvailability, setAvailability,
  fetchTimeOff, addTimeOff, deleteTimeOff,
  fetchStaffServices, fetchServices, setStaffServices,
  updateAppointmentStatus, deleteAppointment,
  uploadStaffPhoto, updateStaff,
} from "./supabase";
import {
  T, GRAD, LOGO_SRC, Avatar, Badge, Card, GoldBtn, Input, Modal, Spinner,
  GlobalStyles, DAYS, getNextDays,
} from "./shared";

const today = new Date().toISOString().slice(0,10);

export default function StaffDashboard({ staffProfile, onSignOut }) {
  const [page, setPage] = useState("schedule");
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (staffProfile?.id) {
      fetchAppointmentsByStaff(staffProfile.id)
        .then(setAppts)
        .finally(() => setLoading(false));
    }
  }, [staffProfile]);

  const confirmAppt = async (id) => {
    await updateAppointmentStatus(id, "Confirmed");
    setAppts(p => p.map(a => a.id===id ? {...a,status:"Confirmed"} : a));
  };
  const cancelAppt = async (id) => {
    await deleteAppointment(id);
    setAppts(p => p.filter(a => a.id!==id));
  };

  const nav = [
    { id:"schedule", label:"Schedule", icon:"◷" },
    { id:"profile",  label:"Profile",  icon:"◉" },
    { id:"services", label:"Services", icon:"◈" },
    { id:"hours",    label:"Hours",    icon:"◻" },
  ];

  const todayAppts = appts.filter(a => a.date === today);
  const upcoming = appts.filter(a => a.date > today && a.status !== "Cancelled").slice(0,10);
  const pending = appts.filter(a => a.status === "Pending");

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:T.bg, color:T.text }}>
      <GlobalStyles />

      {/* Top bar */}
      <div style={{ padding:"14px 20px", display:"flex", alignItems:"center", gap:12, flexShrink:0, borderBottom:`1px solid #d4af3720` }}>
        <img src={LOGO_SRC} alt="SiS2 Beauty" style={{ height:44, width:"auto", objectFit:"contain", mixBlendMode:"screen" }} />
        <div style={{ flex:1 }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontWeight:600, color:T.text, lineHeight:1 }}>{staffProfile?.name}</p>
          <p style={{ fontSize:9, color:"#d4af37", letterSpacing:1.5, textTransform:"uppercase", marginTop:3 }}>{staffProfile?.role}</p>
        </div>
        <button onClick={onSignOut} style={{ padding:"6px 12px", borderRadius:18, border:`1px solid ${T.border}`, background:"transparent", color:T.muted, fontSize:10, cursor:"pointer", letterSpacing:.8, textTransform:"uppercase" }}>
          Sign Out
        </button>
        {staffProfile?.is_admin && (
          <button onClick={() => window.location.href = "/admin"}
            style={{padding:"6px 12px", borderRadius:18, border:`1px solid ${G}40`, background:`${G}15`, color:G, fontSize:10, cursor:"pointer", letterSpacing:.8, textTransform:"uppercase", fontWeight:700}}>
            Admin Panel
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 20px 100px" }}>
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:60 }}><Spinner /></div>
        ) : (
          <>
            {page === "schedule" && (
              <div style={{ display:"flex", flexDirection:"column", gap:16, animation:"fadeUp .4s both" }}>
                <div>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600 }}>My Schedule</p>
                  <p style={{ fontSize:11, color:T.muted, marginTop:2 }}>Your upcoming appointments</p>
                </div>

                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                  {[
                    ["Today", todayAppts.length, "#d4af37"],
                    ["Pending", pending.length, "#c9a961"],
                    ["Upcoming", upcoming.length, "#7cb389"],
                  ].map(([l,v,c]) => (
                    <Card key={l} style={{ padding:"14px 12px", textAlign:"center" }}>
                      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600, color:c }}>{v}</p>
                      <p style={{ fontSize:9, color:T.muted, textTransform:"uppercase", letterSpacing:1, marginTop:4 }}>{l}</p>
                    </Card>
                  ))}
                </div>

                {/* Pending */}
                {pending.length > 0 && (
                  <Card style={{ padding:18, border:`1px solid #d4af3750`, background:"#d4af3708" }}>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:12 }}>
                      <span style={{ color:"#d4af37" }}>✦</span> Pending ({pending.length})
                    </p>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {pending.map(a => (
                        <div key={a.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:T.hover }}>
                          <Avatar name={a.client_name} size={36} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:13, fontWeight:600 }}>{a.client_name}</p>
                            <p style={{ fontSize:11, color:T.muted }}>{a.service} · {a.date} {a.time?.slice(0,5)}</p>
                            {a.client_phone && <p style={{ fontSize:11, color:T.muted }}>📞 {a.client_phone}</p>}
                          </div>
                          <GoldBtn variant="success" onClick={() => confirmAppt(a.id)} style={{ padding:"5px 12px", fontSize:11 }}>✓</GoldBtn>
                          <GoldBtn variant="danger" onClick={() => cancelAppt(a.id)} style={{ padding:"5px 12px", fontSize:11 }}>✕</GoldBtn>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Today */}
                <Card style={{ padding:18 }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:14 }}>Today</p>
                  {todayAppts.length === 0 ? (
                    <p style={{ color:T.muted, fontSize:13, textAlign:"center", padding:16 }}>Nothing today ✨</p>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {todayAppts.map(a => (
                        <ApptCard key={a.id} a={a} onConfirm={confirmAppt} onCancel={cancelAppt} />
                      ))}
                    </div>
                  )}
                </Card>

                {/* Upcoming */}
                {upcoming.length > 0 && (
                  <Card style={{ padding:18 }}>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:14 }}>Upcoming</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {upcoming.map(a => (
                        <ApptCard key={a.id} a={a} onConfirm={confirmAppt} onCancel={cancelAppt} />
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {page === "profile" && <ProfileEditor staff={staffProfile} />}
            {page === "services" && <MyServices staffId={staffProfile?.id} />}
            {page === "hours" && <MyHours staffId={staffProfile?.id} />}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:T.nav, borderTop:`1px solid #d4af3720`, display:"flex", padding:"8px 0 20px", zIndex:200 }}>
        {nav.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"6px 0", border:"none", background:"transparent", color:active?"#d4af37":T.muted, cursor:"pointer" }}>
              <span style={{ fontSize:18 }}>{item.icon}</span>
              <span style={{ fontSize:9, fontWeight:active?700:500, letterSpacing:.8, textTransform:"uppercase" }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ApptCard({ a, onConfirm, onCancel }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:T.hover }}>
      <div style={{ minWidth:54, padding:"6px", borderRadius:8, background:"#d4af3712", border:"1px solid #d4af3725", textAlign:"center" }}>
        <span style={{ fontSize:12, fontWeight:700, color:"#d4af37" }}>{a.time?.slice(0,5)}</span>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:13, fontWeight:600 }}>{a.client_name}</p>
        <p style={{ fontSize:11, color:T.muted }}>{a.service}</p>
        {a.client_phone && <p style={{ fontSize:10, color:T.muted }}>📞 {a.client_phone}</p>}
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5 }}>
        <Badge label={a.status} />
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15, fontWeight:600, color:"#d4af37" }}>${a.price}</p>
        {a.status==="Pending" && (
          <GoldBtn variant="success" onClick={() => onConfirm(a.id)} style={{ padding:"4px 10px", fontSize:10 }}>✓</GoldBtn>
        )}
      </div>
    </div>
  );
}

// ─── PROFILE EDITOR ──────────────────────────────────────────
function ProfileEditor({ staff }) {
  const [name, setName] = useState(staff?.name || "");
  const [bio, setBio] = useState(staff?.bio || "");
  const [phone, setPhone] = useState(staff?.phone || "");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(staff?.photo_url || "");

  const saveProfile = async () => {
    await updateStaff(staff.id, { name, bio, phone });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadStaffPhoto(staff.id, file);
      setPhotoUrl(url);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, animation:"fadeUp .4s both" }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600 }}>My Profile</p>

      {/* Photo */}
      <Card style={{ padding:20, display:"flex", alignItems:"center", gap:16 }}>
        <Avatar name={staff?.name||"?"} size={72} color={staff?.color} photoUrl={photoUrl} />
        <div>
          <p style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>Profile Photo</p>
          <label style={{ cursor:"pointer" }}>
            <GoldBtn as="span" style={{ padding:"8px 16px", fontSize:11 }}>
              {uploading ? "Uploading…" : "Upload Photo"}
            </GoldBtn>
            <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:"none" }} />
          </label>
          <p style={{ fontSize:10, color:T.muted, marginTop:8 }}>JPG, PNG — max 5MB</p>
        </div>
      </Card>

      {/* Info */}
      <Card style={{ padding:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="555-0000" />
          <div>
            <p style={{ fontSize:9, color:T.muted, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:7 }}>Bio</p>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Short bio visible to clients…"
              style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:`1px solid ${T.border}`, background:T.hover, color:T.text, fontSize:14, fontFamily:"inherit", outline:"none", resize:"vertical" }} />
          </div>
          <p style={{ fontSize:10, color:"#d4af37" }}>
            🔗 Your booking link: <strong>sis2.beauty/{staff?.slug}</strong>
          </p>
          <GoldBtn onClick={saveProfile} style={{ padding:"13px" }}>
            {saved ? "✓ Saved!" : "Save Profile"}
          </GoldBtn>
        </div>
      </Card>
    </div>
  );
}

// ─── MY SERVICES ─────────────────────────────────────────────
function MyServices({ staffId }) {
  const [allServices, setAllServices] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([fetchServices(), fetchStaffServices(staffId)])
      .then(([all, mine]) => { setAllServices(all); setMyServices(mine); })
      .finally(() => setLoading(false));
  }, [staffId]);

  const toggle = (svcId) => {
    if (myServices.find(s => s.id === svcId)) setMyServices(myServices.filter(s => s.id !== svcId));
    else { const svc = allServices.find(s => s.id === svcId); setMyServices([...myServices, svc]); }
  };

  const save = async () => {
    await setStaffServices(staffId, myServices.map(s => s.id));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div style={{ display:"flex", justifyContent:"center", padding:60 }}><Spinner /></div>;

  const grouped = allServices.reduce((acc, s) => { (acc[s.category||"Other"] = acc[s.category||"Other"]||[]).push(s); return acc; }, {});

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, animation:"fadeUp .4s both" }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600 }}>My Services</p>
      <p style={{ fontSize:12, color:T.muted }}>Select the services you offer</p>

      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat}>
          <p style={{ fontSize:9, color:"#d4af37", fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>{cat}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {list.map(svc => {
              const enabled = myServices.find(s => s.id === svc.id);
              return (
                <div key={svc.id} onClick={() => toggle(svc.id)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:enabled?"#d4af3712":T.hover, borderRadius:11, border:`1px solid ${enabled?"#d4af37":"transparent"}`, cursor:"pointer" }}>
                  <div style={{ width:22, height:22, borderRadius:6, background:enabled?GRAD:T.border, display:"flex", alignItems:"center", justifyContent:"center", color:"#0a0a0d", fontSize:13 }}>
                    {enabled && "✓"}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:600 }}>{svc.name}</p>
                    <p style={{ fontSize:11, color:T.muted }}>{svc.duration_min} min · ${svc.default_price}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <GoldBtn onClick={save} style={{ padding:"13px" }}>{saved ? "✓ Saved!" : "Save Services"}</GoldBtn>
    </div>
  );
}

// ─── MY HOURS ────────────────────────────────────────────────
function MyHours({ staffId }) {
  const [avail, setAvail] = useState([]);
  const [timeOff, setTimeOff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showAddOff, setShowAddOff] = useState(false);
  const [newOff, setNewOff] = useState({ start_date:"", end_date:"", reason:"" });

  useEffect(() => {
    Promise.all([fetchAvailability(staffId), fetchTimeOff(staffId)])
      .then(([a, t]) => { setAvail(a); setTimeOff(t); })
      .finally(() => setLoading(false));
  }, [staffId]);

  const toggleDay = (day) => {
    const exists = avail.find(a => a.day_of_week === day);
    if (exists) setAvail(avail.filter(a => a.day_of_week !== day));
    else setAvail([...avail, { day_of_week: day, start_time:"09:00", end_time:"17:00" }]);
  };

  const updateTime = (day, field, value) => setAvail(avail.map(a => a.day_of_week===day ? {...a,[field]:value} : a));

  const saveHours = async () => {
    await setAvailability(staffId, avail.map(({day_of_week,start_time,end_time}) => ({day_of_week,start_time,end_time})));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const submitTimeOff = async () => {
    if (!newOff.start_date || !newOff.end_date) return;
    const created = await addTimeOff({ staff_id: staffId, ...newOff });
    setTimeOff([...timeOff, created]);
    setNewOff({ start_date:"", end_date:"", reason:"" }); setShowAddOff(false);
  };

  const removeOff = async (id) => {
    await deleteTimeOff(id); setTimeOff(timeOff.filter(t => t.id !== id));
  };

  if (loading) return <div style={{ display:"flex", justifyContent:"center", padding:60 }}><Spinner /></div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16, animation:"fadeUp .4s both" }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:600 }}>My Hours</p>

      <Card style={{ padding:18 }}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600, marginBottom:14 }}>Weekly Schedule</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {DAYS.map((d, idx) => {
            const da = avail.find(a => a.day_of_week === idx);
            return (
              <div key={idx} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:T.hover, borderRadius:9 }}>
                <button onClick={() => toggleDay(idx)}
                  style={{ width:54, padding:"6px", borderRadius:7, border:"none", background:da?GRAD:T.border, color:da?"#0a0a0d":T.muted, fontSize:11, fontWeight:700, cursor:"pointer" }}>
                  {d}
                </button>
                {da ? (
                  <div style={{ display:"flex", gap:8, alignItems:"center", flex:1 }}>
                    <input type="time" value={da.start_time?.slice(0,5)} onChange={e => updateTime(idx,"start_time",e.target.value)}
                      style={{ flex:1, padding:"7px 10px", borderRadius:7, border:`1px solid ${T.border}`, background:T.bg, color:T.text, fontSize:13 }} />
                    <span style={{ color:"#d4af37" }}>→</span>
                    <input type="time" value={da.end_time?.slice(0,5)} onChange={e => updateTime(idx,"end_time",e.target.value)}
                      style={{ flex:1, padding:"7px 10px", borderRadius:7, border:`1px solid ${T.border}`, background:T.bg, color:T.text, fontSize:13 }} />
                  </div>
                ) : (
                  <span style={{ fontSize:12, color:T.muted }}>Day off</span>
                )}
              </div>
            );
          })}
        </div>
        <GoldBtn onClick={saveHours} style={{ marginTop:14, width:"100%", padding:"12px" }}>
          {saved ? "✓ Saved!" : "Save Schedule"}
        </GoldBtn>
      </Card>

      <Card style={{ padding:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:600 }}>Time Off</p>
          <GoldBtn onClick={() => setShowAddOff(true)} style={{ padding:"6px 12px", fontSize:11 }}>+ Add</GoldBtn>
        </div>
        {timeOff.length === 0 ? (
          <p style={{ color:T.muted, fontSize:13, textAlign:"center", padding:16 }}>No time off scheduled</p>
        ) : (
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
      </Card>

      {showAddOff && (
        <Modal title="Add Time Off" onClose={() => setShowAddOff(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Input label="Start Date" type="date" value={newOff.start_date} onChange={e => setNewOff(p=>({...p,start_date:e.target.value}))} />
            <Input label="End Date" type="date" value={newOff.end_date} onChange={e => setNewOff(p=>({...p,end_date:e.target.value}))} />
            <Input label="Reason (optional)" value={newOff.reason} onChange={e => setNewOff(p=>({...p,reason:e.target.value}))} placeholder="Vacation, sick, etc." />
            <GoldBtn onClick={submitTimeOff} style={{ padding:"13px" }}>Add Time Off</GoldBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}
