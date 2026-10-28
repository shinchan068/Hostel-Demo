import type { Complaint, ComplaintStatus } from "./types";

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
  writeComplaints([...current, ...incoming.filter((complaint) => !ids.has(complaint.id))]);
}

export function updateComplaintStatus(id: string, status: ComplaintStatus) {
  const current = readComplaints();
  const complaint = current.find((item) => item.id === id);
  if (!complaint || complaint.status === status) return;
  const remaining = current.filter((item) => item.id !== id);
  let targetEnd = -1;
  for (let index = 0; index < remaining.length; index++) {
    if (remaining[index].status === status) targetEnd = index;
  }
  remaining.splice(targetEnd + 1, 0, { ...complaint, status });
  writeComplaints(remaining);
}

export function updateBoardOrder(columns: Record<ComplaintStatus, Complaint[]>) {
  const current = readComplaints();
  const visibleOrder = Object.values(columns).flat().map((item) => item.id);
  const visibleIds = new Set(visibleOrder);
  const nextStatus = new Map<string, ComplaintStatus>();
  for (const [status, items] of Object.entries(columns) as [ComplaintStatus, Complaint[]][]) {
    for (const item of items) nextStatus.set(item.id, status);
  }

  const result: Complaint[] = [];
  const included = new Set<string>();
  for (const status of ["Todo / Triaged", "In Progress", "Resolved / Fixed"] as const) {
    const previous = current.filter((item) => item.status === status);
    const visible = columns[status].map((item) => current.find((entry) => entry.id === item.id) ?? item);
    let visibleIndex = 0;
    const merged: Complaint[] = [];
    for (const previousItem of previous) {
      const item = visibleIds.has(previousItem.id) ? visible[visibleIndex++] : previousItem;
      if (item) merged.push(item);
    }
    merged.push(...visible.slice(visibleIndex));
    for (const item of merged) {
      const statusForItem = nextStatus.get(item.id) ?? status;
      result.push(item.status === statusForItem ? item : { ...item, status: statusForItem });
      included.add(item.id);
    }
  }
  for (const item of current) if (!included.has(item.id)) result.push(item);
  writeComplaints(result);
}

function writeComplaints(complaints: Complaint[]) {
  localStorage.setItem(storageKey, JSON.stringify(complaints));
  cachedRaw = null;
  window.dispatchEvent(new Event(changeEvent));
}

export function clearComplaints() {
  writeComplaints([]);
}
