import "server-only";
import type { ParsedChat } from "./types";
import { readBoundedJson } from "./read-json";
import { triagePrompt } from "./triage-prompt";
import { validateTriageResponse } from "./triage-schema";

export class GemmaError extends Error {
  constructor(message: string, public status: 502 | 503 | 504) { super(message); }
}

export async function triageWithGemma(messages: ParsedChat[], signal: AbortSignal) {
  const key = process.env.GEMMA_API_KEY?.trim();
  const endpoint = process.env.GEMMA_API_URL?.trim();
  if (!key || !endpoint) throw new GemmaError("AI triage is not configured yet. You can run demo triage instead.", 503);
  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" || url.hostname !== "generativelanguage.googleapis.com" || url.port
      || url.username || url.password || url.search || url.hash
      || !/^\/v1beta\/models\/gemma-[a-zA-Z0-9.-]+:generateContent$/.test(url.pathname)) throw new Error();
  } catch {
    throw new GemmaError("AI triage configuration is invalid. You can run demo triage instead.", 503);
  }

  let response: Response;
  const requestSignal = AbortSignal.any([signal, AbortSignal.timeout(45_000)]);
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: triagePrompt }, { text: JSON.stringify(messages.map((item, messageIndex) => ({ messageIndex, message: item.message }))) }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 16384 },
      }),
      signal: requestSignal,
      cache: "no-store",
      redirect: "error",
    });
  } catch {
    throw new GemmaError(requestSignal.aborted ? "AI analysis timed out. Try a smaller chat or retry." : "Could not reach the AI service. Please retry.", requestSignal.aborted ? 504 : 502);
  }
  if (!response.ok) {
    await response.body?.cancel();
    if (response.status === 429 || response.status >= 500) throw new GemmaError("The AI service is busy. Please retry shortly.", 503);
    throw new GemmaError("The AI service rejected the request. Please check the server's model and API configuration.", 502);
  }
  try {
    const payload = await readBoundedJson(response.body, 1_000_000) as { candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
    const candidate = payload?.candidates?.[0];
    if (!candidate || (candidate.finishReason && candidate.finishReason !== "STOP")) throw new Error();
    const text = candidate.content?.parts?.filter((part) => !part.thought && typeof part.text === "string").map((part) => part.text).join("") ?? "";
    const json = text.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, "$1");
    return validateTriageResponse(JSON.parse(json), messages);
  } catch {
    if (requestSignal.aborted) throw new GemmaError("AI analysis timed out. Try a smaller chat or retry.", 504);
    throw new GemmaError("AI returned an incomplete or invalid analysis. Please retry; no complaints were added.", 502);
  }
}
