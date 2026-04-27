import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = "https://YOUR-PROJECT.supabase.co"; // ← replace
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";              // ← replace

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── AUTH ──────────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
export async function getStaffByUserId(userId) {
  const { data, error } = await supabase.from("staff").select("*").eq("user_id", userId).single();
  if (error) return null;
  return data;
}

// ── STAFF ─────────────────────────────────────────────────────
export async function fetchStaff() {
  const { data, error } = await supabase.from("staff").select("*").order("name");
  if (error) throw error; return data;
}
export async function fetchStaffBySlug(slug) {
  const { data, error } = await supabase.from("staff").select("*").eq("slug", slug).single();
  if (error) throw error; return data;
}
export async function updateStaff(id, updates) {
  const { data, error } = await supabase.from("staff").update(updates).eq("id", id).select();
  if (error) throw error; return data[0];
}

// ── PHOTO UPLOAD ──────────────────────────────────────────────
export async function uploadStaffPhoto(staffId, file) {
  const ext = file.name.split(".").pop();
  const path = `staff/${staffId}.${ext}`;
  const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  await updateStaff(staffId, { photo_url: data.publicUrl });
  return data.publicUrl;
}

// ── SERVICES ──────────────────────────────────────────────────
export async function fetchServices() {
  const { data, error } = await supabase.from("services").select("*").eq("active", true).order("category");
  if (error) throw error; return data;
}
export async function addService(service) {
  const { data, error } = await supabase.from("services").insert([service]).select();
  if (error) throw error; return data[0];
}
export async function updateService(id, updates) {
  const { data, error } = await supabase.from("services").update(updates).eq("id", id).select();
  if (error) throw error; return data[0];
}
export async function deleteService(id) {
  const { error } = await supabase.from("services").update({ active: false }).eq("id", id);
  if (error) throw error;
}
export async function fetchStaffServices(staffId) {
  const { data, error } = await supabase.from("staff_services").select("*, services(*)").eq("staff_id", staffId);
  if (error) throw error;
  return data.map(r => ({ ...r.services, price: r.price ?? r.services.default_price, duration_min: r.duration_min ?? r.services.duration_min, staff_service_id: r.id }));
}
export async function setStaffServices(staffId, serviceIds) {
  await supabase.from("staff_services").delete().eq("staff_id", staffId);
  if (!serviceIds.length) return;
  const { error } = await supabase.from("staff_services").insert(serviceIds.map(sid => ({ staff_id: staffId, service_id: sid })));
  if (error) throw error;
}

// ── AVAILABILITY ──────────────────────────────────────────────
export async function fetchAvailability(staffId) {
  const { data, error } = await supabase.from("staff_availability").select("*").eq("staff_id", staffId).order("day_of_week");
  if (error) throw error; return data;
}
export async function setAvailability(staffId, schedule) {
  await supabase.from("staff_availability").delete().eq("staff_id", staffId);
  if (!schedule.length) return;
  const { error } = await supabase.from("staff_availability").insert(schedule.map(s => ({ staff_id: staffId, ...s })));
  if (error) throw error;
}
export async function fetchTimeOff(staffId) {
  const { data, error } = await supabase.from("staff_time_off").select("*").eq("staff_id", staffId).order("start_date");
  if (error) throw error; return data;
}
export async function addTimeOff(timeOff) {
  const { data, error } = await supabase.from("staff_time_off").insert([timeOff]).select();
  if (error) throw error; return data[0];
}
export async function deleteTimeOff(id) {
  const { error } = await supabase.from("staff_time_off").delete().eq("id", id);
  if (error) throw error;
}

// ── CLIENTS ───────────────────────────────────────────────────
export async function fetchClients() {
  const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
  if (error) throw error; return data;
}
export async function addClient(client) {
  const { data, error } = await supabase.from("clients").insert([client]).select();
  if (error) throw error; return data[0];
}

// ── APPOINTMENTS ──────────────────────────────────────────────
export async function fetchAppointments() {
  const { data, error } = await supabase.from("appointments").select("*").order("date").order("time");
  if (error) throw error; return data;
}
export async function fetchAppointmentsByStaff(staffId) {
  const { data, error } = await supabase.from("appointments").select("*").eq("staff_id", staffId).order("date").order("time");
  if (error) throw error; return data;
}
export async function addAppointment(appt) {
  const { data, error } = await supabase.from("appointments").insert([appt]).select();
  if (error) throw error; return data[0];
}
export async function updateAppointmentStatus(id, status) {
  const { data, error } = await supabase.from("appointments").update({ status }).eq("id", id).select();
  if (error) throw error; return data[0];
}
export async function deleteAppointment(id) {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) throw error;
}

// ── TRANSACTIONS ──────────────────────────────────────────────
export async function fetchTransactions() {
  const { data, error } = await supabase.from("transactions").select("*").order("date", { ascending: false });
  if (error) throw error; return data;
}

// ── REALTIME ──────────────────────────────────────────────────
export function subscribeToAppointments(callback) {
  return supabase.channel("appts").on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, callback).subscribe();
}
