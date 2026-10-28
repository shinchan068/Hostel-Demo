import { complaintCategories, complaintStatuses, type Complaint } from "./types";

export function getOverviewSummary(complaints: Complaint[]) {
  const open = complaints.filter((item) => item.status !== "Resolved / Fixed");
  const resolved = complaints.length - open.length;
  const priorityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
  const activity: { id: string; complaintId: string; title: string; description: string; at: string }[] = [];
  for (const complaint of complaints) {
    if (validActivityTime(complaint.importedAt)) activity.push({ id: `${complaint.id}-import`, complaintId: complaint.id, title: complaint.title, description: "Added to the board", at: complaint.importedAt });
    for (const [index, event] of (complaint.statusHistory ?? []).entries()) {
      if (validActivityTime(event.changedAt)) activity.push({ id: `${complaint.id}-status-${index}`, complaintId: complaint.id, title: complaint.title, description: `Moved to ${event.status}`, at: event.changedAt });
    }
  }
  return {
    total: complaints.length,
    open: open.length,
    critical: open.filter((item) => item.priority === "P0").length,
    resolved,
    resolvedPercent: complaints.length ? Math.round(resolved / complaints.length * 100) : 0,
    missingLocation: open.filter((item) => !item.location.trim()).length,
    categories: complaintCategories.map((category) => ({ category, count: complaints.filter((item) => item.category === category).length })),
    statuses: complaintStatuses.map((status) => ({ status, count: complaints.filter((item) => item.status === status).length })),
    needsAttention: open.filter((item) => item.priority === "P0" || item.priority === "P1" || !item.location.trim()).sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]).slice(0, 5),
    activity: activity.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 6),
  };
}

function validActivityTime(value: string | undefined): value is string {
  // Legacy report timestamps have ambiguous locale formats; only logged ISO times belong in this feed.
  return Boolean(value && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)));
}
