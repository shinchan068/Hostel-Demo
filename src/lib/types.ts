export const complaintCategories = [
  "Electrical",
  "Plumbing",
  "Wi-Fi",
  "Mess / Food",
  "Carpentry",
  "Cleanliness",
  "Facilities",
] as const;

export const complaintPriorities = ["P0", "P1", "P2", "P3"] as const;
export type ComplaintCategory = (typeof complaintCategories)[number];
export type ComplaintPriority = (typeof complaintPriorities)[number];
export type ComplaintStatus = "Todo / Triaged" | "In Progress" | "Resolved / Fixed";

export type Complaint = {
  id: string;
  title: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  location: string;
  reporter: string;
  originalMessage: string;
  status: ComplaintStatus;
  createdAt: string;
};

export type ParsedChat = { timestamp: string; sender: string; message: string };
