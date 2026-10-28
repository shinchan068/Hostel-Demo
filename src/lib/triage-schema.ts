import { complaintCategories, complaintPriorities, type Complaint, type ParsedChat } from "./types";

export const MAX_CHAT_LENGTH = 100_000;
export const MAX_TRIAGE_MESSAGES = 100;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, max: number, allowEmpty = false): value is string {
  return typeof value === "string" && value.length <= max && (allowEmpty || Boolean(value.trim()));
}

function textList(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= 10 && value.every((item) => text(item, 100));
}

export function validateTriageResponse(value: unknown, messages: ParsedChat[]) {
  if (!Array.isArray(value) || value.length !== messages.length) throw new Error("AI returned an incomplete analysis.");
  const seen = new Set<number>();
  const complaints: Complaint[] = [];
  let noise = 0;
  for (const item of value) {
    if (!record(item) || !Number.isInteger(item.messageIndex) || typeof item.messageIndex !== "number"
      || item.messageIndex < 0 || item.messageIndex >= messages.length || seen.has(item.messageIndex)
      || typeof item.isNoise !== "boolean") throw new Error("AI returned invalid message references.");
    seen.add(item.messageIndex);
    if (item.isNoise) { noise++; continue; }
    if (!text(item.title, 180) || !text(item.summary, 1200) || !text(item.location, 160, true)
      || !complaintCategories.includes(item.category as Complaint["category"])
      || !complaintPriorities.includes(item.priority as Complaint["priority"])
      || !textList(item.urgencyKeywords) || !textList(item.missingInfo)) throw new Error("AI returned invalid complaint fields.");
    const source = messages[item.messageIndex];
    complaints.push({
      id: `HH-${crypto.randomUUID()}`,
      title: item.title.trim(),
      category: item.category as Complaint["category"],
      priority: item.priority as Complaint["priority"],
      location: item.location.trim(),
      summary: item.summary.trim(),
      urgencyKeywords: item.urgencyKeywords.filter((word) => source.message.toLowerCase().includes(word.toLowerCase())),
      missingInfo: item.missingInfo,
      reporter: source.sender,
      originalMessage: source.message,
      createdAt: source.timestamp,
      status: "Todo / Triaged",
      analysisSource: "gemma",
    });
  }
  return { complaints, noise };
}
