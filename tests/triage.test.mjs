import { test, beforeEach, afterEach, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = mkdtempSync(path.join(tmpdir(), "hostelhub-triage-tests-"));
execFileSync(process.execPath, [fileURLToPath(import.meta.resolve("typescript/bin/tsc")), "--outDir", output, "--target", "es2022", "--module", "commonjs", "--moduleResolution", "node", "--esModuleInterop", "--skipLibCheck", "--strict", "src/lib/parse-chat.ts", "src/lib/gemma-client.ts", "src/lib/work-order.ts"], { cwd: root, stdio: "pipe" });
symlinkSync(path.join(root, "node_modules"), path.join(output, "node_modules"), "dir");
after(() => rmSync(output, { recursive: true }));

const { parseChat, analyzeChat } = (await import(pathToFileURL(path.join(output, "parse-chat.js")))).default;
const { validateTriageResponse } = (await import(pathToFileURL(path.join(output, "triage-schema.js")))).default;
const { readBoundedJson } = (await import(pathToFileURL(path.join(output, "read-json.js")))).default;
const { triageWithGemma } = (await import(pathToFileURL(path.join(output, "gemma-client.js")))).default;
const { formatWorkOrder } = (await import(pathToFileURL(path.join(output, "work-order.js")))).default;

const nativeFetch = global.fetch;
const originalKey = process.env.GEMMA_API_KEY;
const originalEndpoint = process.env.GEMMA_API_URL;
beforeEach(() => {
  process.env.GEMMA_API_KEY = "test-key";
  process.env.GEMMA_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-4-test:generateContent";
  global.fetch = async () => { throw new Error("Tests must never make network requests"); };
});
afterEach(() => {
  global.fetch = nativeFetch;
  if (originalKey === undefined) delete process.env.GEMMA_API_KEY;
  else process.env.GEMMA_API_KEY = originalKey;
  if (originalEndpoint === undefined) delete process.env.GEMMA_API_URL;
  else process.env.GEMMA_API_URL = originalEndpoint;
});

const source = [{ timestamp: "28/10/26, 10:00", sender: "Student", message: "Room B-304 geyser sparking" }];
const extracted = { messageIndex: 0, isNoise: false, title: "Geyser sparking", category: "Electrical", priority: "P0", location: "B-304", summary: "A geyser is sparking.", urgencyKeywords: ["sparking"], missingInfo: [] };
const providerResult = (items, finishReason = "STOP") => Response.json({ candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(items) }] } }] });

test("bracketed and Android exports preserve multiline source messages", () => {
  const result = parseChat("\u200e[28/10/26, 10:00] Student: Room B-304 geyser sparking\nPlease help urgently.\n# safety\n28/10/2026, 10:01 AM - Other: 👍");
  assert.equal(result.messages.length, 2);
  assert.equal(result.messages[0].message, "Room B-304 geyser sparking\nPlease help urgently.\n# safety");
  assert.equal(result.messages[1].sender, "Other");
  assert.equal(result.messages[1].message, "👍");
  assert.equal(result.invalidLines, 0);
});

test("missing timestamps are reported, long text stays intact, and emoji chatter is noise", () => {
  assert.equal(parseChat("Student: water is leaking").invalidLines, 1);
  assert.equal(parseChat("Student: water is leaking").messages.length, 0);
  const long = "x".repeat(20000);
  assert.equal(parseChat("[28/10/26, 10:00] Student: " + long).messages[0].message, long);
  const emoji = analyzeChat(parseChat("[28/10/26, 10:00] Student: 👍🙂").messages);
  assert.equal(emoji.complaints.length, 0);
  assert.equal(emoji.noise, 1);
});

test("demo locations distinguish wing letters from the phrase 'wing is'", () => {
  const result = analyzeChat(parseChat("[28/10/26, 10:00] Student: mess dinner was uncooked; the wing is complaining\n[28/10/26, 10:01] Other: Wing A tap is leaking").messages);
  assert.equal(result.complaints[0].location, "Hostel Mess");
  assert.equal(result.complaints[1].location, "Wing A");
});

test("AI source fields remain authoritative and fabricated urgency words are removed", () => {
  const result = validateTriageResponse([{ ...extracted, reporter: "Invented", originalMessage: "Invented", status: "Resolved / Fixed", urgencyKeywords: ["sparking", "invented"] }], source);
  const item = result.complaints[0];
  assert.equal(item.reporter, source[0].sender);
  assert.equal(item.originalMessage, source[0].message);
  assert.equal(item.createdAt, source[0].timestamp);
  assert.equal(item.status, "Todo / Triaged");
  assert.deepEqual(item.urgencyKeywords, ["sparking"]);
});

test("AI validation rejects incomplete, duplicate, invalid, and oversized fields", () => {
  for (const result of [[], [extracted, extracted], [{ ...extracted, messageIndex: 9 }], [{ ...extracted, priority: "P9" }], [{ ...extracted, category: "Unknown" }], [{ ...extracted, title: "x".repeat(181) }], [{ ...extracted, summary: "" }]]) {
    assert.throws(() => validateTriageResponse(result, source));
  }
});

test("JSON readers bound bytes and reject malformed payloads", async () => {
  await assert.rejects(readBoundedJson(new Response("x".repeat(101)).body, 100), RangeError);
  await assert.rejects(readBoundedJson(new Response("{bad").body, 100), SyntaxError);
});

test("small Gemma 4 requests use minimal thinking, a bounded output budget, and server credentials", async () => {
  let calls = 0;
  global.fetch = async (url, options) => {
    calls++;
    assert(!url.includes("test-key"));
    assert.equal(options.headers["x-goog-api-key"], "test-key");
    assert.equal(options.redirect, "error");
    const body = JSON.parse(options.body);
    assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, "minimal");
    assert(body.generationConfig.maxOutputTokens <= 2048);
    assert.equal(body.tools, undefined);
    return providerResult([extracted]);
  };
  assert.equal((await triageWithGemma(source, new AbortController().signal)).complaints.length, 1);
  assert.equal(calls, 1);
});

test("quota errors make one attempt and return a clear message without secrets", async () => {
  let calls = 0;
  global.fetch = async () => { calls++; return new Response("private provider details: test-key", { status: 429 }); };
  await assert.rejects(triageWithGemma(source, new AbortController().signal), (error) => error.status === 429 && error.message.includes("No automatic retry") && !error.message.includes("test-key"));
  assert.equal(calls, 1);
});

test("truncated provider output never becomes a partial complaint import", async () => {
  global.fetch = async () => providerResult([extracted], "MAX_TOKENS");
  await assert.rejects(triageWithGemma(source, new AbortController().signal), (error) => error.status === 502);
});

test("work orders preserve inputs, sort by priority, and separate missing locations", () => {
  const item = validateTriageResponse([extracted], source).complaints[0];
  const items = [{ ...item, priority: "P2", title: "Routine repair" }, item, { ...item, title: "Resolved repair", status: "Resolved / Fixed" }, { ...item, title: "Unknown room", location: " " }];
  const before = JSON.stringify(items);
  const text = formatWorkOrder(items, new Date("2026-10-28T12:00:00Z"));
  assert(text.indexOf("Geyser sparking") < text.indexOf("Routine repair"));
  assert(!text.includes("Resolved repair"));
  assert(text.includes("MISSING LOCATION"));
  assert(text.includes("[P0] Student reported Unknown room"));
  assert.equal(JSON.stringify(items), before);
});
