import type { Complaint, ComplaintCategory, ComplaintPriority, ParsedChat } from "./types";

const whatsappLine = /^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/;
const roomPattern = /\b(?:room\s+)?([A-Z]-\d{3})\b/i;
const floorPattern = /\b\d+(?:st|nd|rd|th)\s+floor\b/i;
const rules: [RegExp, ComplaintCategory, string][] = [
  [/geyser|sparking|electricity trip|fan regulator|tube light|light not working|short circuit/i, "Electrical", "Electrical issue"],
  [/water|leak|tap|purifier|flood|dripping/i, "Plumbing", "Water issue"],
  [/wi[ -]?fi|router|internet|network/i, "Wi-Fi", "Wi-Fi issue"],
  [/mess|dinner|food|paneer|vendor/i, "Mess / Food", "Mess / food quality issue"],
  [/door|latch|carpentry|lock/i, "Carpentry", "Door or carpentry repair"],
  [/clean|hygiene|garbage/i, "Cleanliness", "Cleanliness issue"],
  [/maintenance|broken|repair|issue/i, "Facilities", "Hostel maintenance issue"],
];

export function parseChat(rawChat: string): { messages: ParsedChat[]; invalidLines: number } {
  let invalidLines = 0;
  const messages = rawChat.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("```") || trimmed.startsWith("#") || trimmed.startsWith("---")) return [];
    const match = trimmed.match(whatsappLine);
    if (!match) {
      if (trimmed.startsWith("[")) invalidLines++;
      return [];
    }
    return [{ timestamp: match[1], sender: match[2].trim(), message: match[3].trim() }];
  });
  return { messages, invalidLines };
}

function classify(message: string): { category: ComplaintCategory; priority: ComplaintPriority; title: string; location: string } | null {
  const matched = rules.find(([pattern]) => pattern.test(message));
  if (!matched) return null;
  const [, category, fallbackTitle] = matched;
  const priority: ComplaintPriority = /\bp0\b|sparking|electricity trip|short circuit|immediately/i.test(message)
    ? "P0"
    : /\bp1\b|asap|midsems|stomach issues|locked in|locked out|urgently|urgent|flood/i.test(message)
      ? "P1" : /\bp3\b/i.test(message) ? "P3" : /\bp2\b/i.test(message) ? "P2" : "P2";
  const location = message.match(roomPattern)?.[1]?.toUpperCase()
    ?? message.match(floorPattern)?.[0]
    ?? message.match(/wing\s+[a-z]/i)?.[0]
    ?? (/\bmess\b/i.test(message) ? "Hostel Mess" : "");
  const title = category === "Electrical" && /geyser/i.test(message) ? "Geyser sparking"
    : category === "Plumbing" && /leak|flood|purifier/i.test(message) ? "Water leakage reported"
      : category === "Wi-Fi" ? "Wi-Fi not working"
        : category === "Mess / Food" ? "Mess food quality issue"
          : category === "Carpentry" ? "Door or latch repair"
            : category === "Electrical" && /fan regulator/i.test(message) ? "Fan regulator broken"
              : category === "Electrical" && /tube light|light not working/i.test(message) ? "Light not working"
                : category === "Plumbing" ? "Water supply issue" : fallbackTitle;
  return { category, priority, title, location };
}

export function analyzeChat(messages: ParsedChat[]) {
  let noise = 0;
  let missingLocation = 0;
  const complaints: Complaint[] = [];
  for (const [index, item] of messages.entries()) {
    const result = classify(item.message);
    if (!result) { noise++; continue; }
    if (!result.location) missingLocation++;
    complaints.push({
      id: `HH-${Date.now().toString(36)}-${index}`,
      title: result.title,
      category: result.category,
      priority: result.priority,
      location: result.location,
      reporter: item.sender,
      originalMessage: item.message,
      status: "Todo / Triaged",
      analysisSource: "demo",
      createdAt: item.timestamp,
    });
  }
  return { complaints, noise, missingLocation, highPriority: complaints.filter((item) => item.priority === "P0" || item.priority === "P1").length };
}
