// ─────────────────────────────────────────────
//  Supabase Client + API helpers
// ─────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = "https://kwifvvjugnpmjrrtcgjt.supabase.co"; // ← replace
const SUPABASE_ANON_KEY = "sb_publishable_uKp38_41MyKjuBOVYPWWpg_QnIlHYY9";              // ← replace

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── STAFF ─────────────────────────────────────────────────────
export async function fetchStaff() {
  const { data, error } = await supabase.from("staff").select("*").order("name");
  if (error) throw error; return data;
}
export async function fetchStaffBySlug(slug) {
  const { data, error } = await supabase.from("staff").select("*").eq("slug", slug).single();
  if (error) throw error; return data;
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

// Get services a specific staff offers (joined with their custom price)
export async function fetchStaffServices(staffId) {
  const { data, error } = await supabase
    .from("staff_services")
    .select("*, services(*)")
    .eq("staff_id", staffId);
  if (error) throw error;
  return data.map(row => ({
    ...row.services,
    price:        row.price ?? row.services.default_price,
    duration_min: row.duration_min ?? row.services.duration_min,
    staff_service_id: row.id,
  }));
}
export async function setStaffServices(staffId, serviceIds) {
  // Delete existing
  await supabase.from("staff_services").delete().eq("staff_id", staffId);
  // Insert new
  if (serviceIds.length === 0) return;
  const rows = serviceIds.map(sid => ({ staff_id: staffId, service_id: sid }));
  const { error } = await supabase.from("staff_services").insert(rows);
  if (error) throw error;
}

// ── AVAILABILITY ──────────────────────────────────────────────
export async function fetchAvailability(staffId) {
  const { data, error } = await supabase.from("staff_availability").select("*").eq("staff_id", staffId).order("day_of_week");
  if (error) throw error; return data;
}
export async function setAvailability(staffId, schedule) {
  // schedule = [{ day_of_week, start_time, end_time }, ...]
  await supabase.from("staff_availability").delete().eq("staff_id", staffId);
  if (schedule.length === 0) return;
  const rows = schedule.map(s => ({ staff_id: staffId, ...s }));
  const { error } = await supabase.from("staff_availability").insert(rows);
  if (error) throw error;
}

// ── TIME OFF ──────────────────────────────────────────────────
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
