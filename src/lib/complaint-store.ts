import type { Complaint } from "./types";

const storageKey = "hostelhub.complaints.v1";
const changeEvent = "hostelhub:complaints-changed";
let cachedRaw: string | null = null;
let cachedComplaints: Complaint[] = [];

export function readComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === cachedRaw) return cachedComplaints;
    cachedRaw = raw;
    const value: unknown = JSON.parse(raw ?? "[]");
    cachedComplaints = Array.isArray(value) ? value as Complaint[] : [];
  } catch {
    cachedRaw = null;
    cachedComplaints = [];
  }
  return cachedComplaints;
}

export function subscribeToComplaints(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

export function addComplaints(incoming: Complaint[]) {
  const current = readComplaints();
  const ids = new Set(current.map((complaint) => complaint.id));
  localStorage.setItem(storageKey, JSON.stringify([...current, ...incoming.filter((complaint) => !ids.has(complaint.id))]));
  window.dispatchEvent(new Event(changeEvent));
}

export function clearComplaints() {
  localStorage.removeItem(storageKey);
  window.dispatchEvent(new Event(changeEvent));
}
