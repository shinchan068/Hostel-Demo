import { parseChat } from "@/lib/parse-chat";
import { GemmaError, triageWithGemma } from "@/lib/gemma-client";
import { readBoundedJson } from "@/lib/read-json";
import { MAX_CHAT_LENGTH, MAX_TRIAGE_MESSAGES } from "@/lib/triage-schema";

function error(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") return error("Cross-origin requests are not allowed.", 403);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return error("Send the chat as JSON.", 415);
  let payload: unknown;
  try {
    payload = await readBoundedJson(request.body, 650_000);
  } catch (cause) {
    return error(cause instanceof RangeError ? "The chat request is too large." : "The chat request is not valid JSON.", cause instanceof RangeError ? 413 : 400);
  }
  if (!payload || typeof payload !== "object" || !("rawChat" in payload) || typeof payload.rawChat !== "string" || !payload.rawChat.trim()) return error("Paste a WhatsApp chat before analyzing.", 400);
  if (payload.rawChat.length > MAX_CHAT_LENGTH) return error("Chats must be 100,000 characters or fewer.", 413);
  const parsed = parseChat(payload.rawChat);
  if (!parsed.messages.length) return error("No WhatsApp messages found. Use lines like [24/10/26, 21:14] Name: message.", 400);
  if (parsed.messages.length > MAX_TRIAGE_MESSAGES) return error(`Analyze at most ${MAX_TRIAGE_MESSAGES} messages at a time. Split this chat into smaller parts.`, 413);
  try {
    const result = await triageWithGemma(parsed.messages, request.signal);
    return Response.json({ ...result, invalidLines: parsed.invalidLines }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    if (cause instanceof GemmaError) return error(cause.message, cause.status);
    return error("AI analysis could not be completed. Please retry.", 502);
  }
}
