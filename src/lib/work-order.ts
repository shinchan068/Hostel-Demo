import type { Complaint, ComplaintCategory } from "./types";

const tradeForCategory: Record<ComplaintCategory, string> = {
  Electrical: "Electrician",
  Plumbing: "Plumber",
  "Wi-Fi": "IT support",
  "Mess / Food": "Mess supervisor",
  Carpentry: "Carpenter",
  Cleanliness: "Housekeeping",
  Facilities: "Maintenance technician",
};

const priorityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };

export function formatWorkOrder(complaints: Complaint[], date = new Date()) {
  const open = complaints.filter((complaint) => complaint.status !== "Resolved / Fixed");
  const groups = new Map<ComplaintCategory, Complaint[]>();
  for (const complaint of open.filter((item) => item.location.trim())) {
    groups.set(complaint.category, [...(groups.get(complaint.category) ?? []), complaint]);
  }

  const lines = [`*HOSTEL MAINTENANCE WORK ORDER — ${new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date)}*`];
  for (const [category, items] of groups) {
    lines.push("", `*${category.toUpperCase()} — ${tradeForCategory[category]}*`);
    items.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
    for (const [index, item] of items.entries()) {
      const priority = item.priority === "P0" ? "🚨 P0" : item.priority === "P1" ? "🟠 P1" : item.priority;
      lines.push(`${index + 1}. [${item.location.trim()}] ${item.title} — ${tradeForCategory[category]} (${priority})`);
      lines.push(`   Reported by: ${item.reporter}`);
    }
  }

  const missingLocation = open.filter((item) => !item.location.trim()).sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  if (missingLocation.length) {
    lines.push("", "⚠️ *MISSING LOCATION — FOLLOW UP*");
    for (const item of missingLocation) lines.push(`— [${item.priority}] ${item.reporter} reported ${item.title} (${item.category})`);
  }
  if (!open.length) lines.push("", "No open complaints.");
  return lines.join("\n");
}
