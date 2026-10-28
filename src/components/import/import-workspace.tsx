"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Check, FileUp, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addComplaints } from "@/lib/complaint-store";
import { analyzeChat, parseChat } from "@/lib/parse-chat";
import { complaintCategories, complaintPriorities, type Complaint } from "@/lib/types";

const MAX_CHAT_LENGTH = 100_000;

export function ImportWorkspace({ sampleChat }: { sampleChat: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rawChat, setRawChat] = useState("");
  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [results, setResults] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [noise, setNoise] = useState(0);
  const [invalidLines, setInvalidLines] = useState(0);
  const [status, setStatus] = useState<"idle" | "analyzing">("idle");
  const [error, setError] = useState("");

  function updateComplaint(id: string, updates: Partial<Complaint>) {
    setResults((items) => items.map((item) => item.id === id ? { ...item, ...updates } : item));
  }

  function loadFile(file?: File) {
    if (!file) return;
    if (file.size > MAX_CHAT_LENGTH) {
      setError("Choose a text file smaller than 100 KB.");
      return;
    }
    void file.text().then((text) => {
      setError("");
      setRawChat(text);
      setInputMode("paste");
    }).catch(() => setError("Could not read that file. Please try another text file."));
  }

  async function analyze() {
    setError("");
    setResults([]);
    setSelected([]);
    if (!rawChat.trim()) {
      setError("Paste a WhatsApp chat or load the sample before analyzing.");
      return;
    }
    if (rawChat.length > MAX_CHAT_LENGTH) {
      setError("Chats must be 100,000 characters or fewer.");
      return;
    }
    setStatus("analyzing");
    await new Promise((resolve) => setTimeout(resolve, 180));
    const parsed = parseChat(rawChat);
    const analysis = analyzeChat(parsed.messages);
    setResults(analysis.complaints);
    setSelected(analysis.complaints.map((item) => item.id));
    setNoise(analysis.noise);
    setInvalidLines(parsed.invalidLines);
    if (!analysis.complaints.length) {
      setError(parsed.messages.length ? "No maintenance complaints found. Try the sample chat or paste a WhatsApp export." : "No WhatsApp messages found. Use lines like [24/10/26, 21:14] Name: message.");
    }
    setStatus("idle");
  }

  function addSelected() {
    const items = results.filter((item) => selected.includes(item.id));
    if (!items.length) return;
    addComplaints(items);
    router.push("/complaints");
  }

  const missingLocation = results.filter((item) => !item.location).length;
  const highPriority = results.filter((item) => item.priority === "P0" || item.priority === "P1").length;
  const allSelected = results.length > 0 && selected.length === results.length;

  return (
    <>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-medium leading-tight tracking-[-1px] md:text-[30px]">Import Chats</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Paste a WhatsApp group export and review the complaints to carry onto your board.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 font-mono text-[10px] tracking-wide text-muted-foreground"><Sparkles size={13} aria-hidden="true" /> MOCK TRIAGE</span>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.22fr)]">
        <section aria-labelledby="chat-input-heading" className="rounded-[6px] border bg-white p-4 md:p-5">
          <div className="mb-4">
            <h2 id="chat-input-heading" className="text-base font-medium">Chat input</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">WhatsApp exported text, including timestamps and sender names.</p>
          </div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-[6px] bg-muted p-1" role="group" aria-label="Chat input method">
              <button type="button" aria-pressed={inputMode === "paste"} onClick={() => setInputMode("paste")} className={`rounded-[4px] px-3 py-1.5 text-xs ${inputMode === "paste" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}>Paste text</button>
              <button type="button" aria-pressed={inputMode === "upload"} onClick={() => setInputMode("upload")} className={`rounded-[4px] px-3 py-1.5 text-xs ${inputMode === "upload" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}>Upload file</button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setRawChat(sampleChat); setInputMode("paste"); setError(""); }}><FileUp aria-hidden="true" />Load sample</Button>
          </div>
          <input ref={fileRef} type="file" accept=".txt,text/plain" className="sr-only" aria-label="Choose a WhatsApp text export" onChange={(event) => loadFile(event.target.files?.[0])} />
          {inputMode === "upload" ? (
            <button type="button" onClick={() => fileRef.current?.click()} className="flex min-h-48 w-full flex-col items-center justify-center rounded-[6px] border border-dashed bg-background px-5 text-center hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <Upload size={21} className="mb-3 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Choose a WhatsApp text export</span>
              <span className="mt-1 text-xs text-muted-foreground">.txt, up to 100 KB</span>
            </button>
          ) : (
            <Textarea value={rawChat} maxLength={MAX_CHAT_LENGTH} onChange={(event) => setRawChat(event.target.value)} aria-label="WhatsApp chat dump" placeholder="[24/10/26, 21:14] Aryan Verma: The geyser in room B-304 is sparking…" className="min-h-56 resize-y rounded-[6px] bg-white font-mono text-xs leading-5 md:min-h-[360px]" />
          )}
          <div className="mt-2 flex justify-between gap-3 text-[11px] text-muted-foreground"><span>WhatsApp text exports are supported.</span><span className="shrink-0 tabular-nums">{rawChat.length.toLocaleString()} / {MAX_CHAT_LENGTH.toLocaleString()}</span></div>
          {error ? <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-destructive"><AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{error}</p> : null}
          <Button className="mt-5 h-10 w-full" onClick={analyze} disabled={status === "analyzing"}>
            <Sparkles aria-hidden="true" />{status === "analyzing" ? "Analyzing chat…" : "Analyze complaints"}<ArrowRight aria-hidden="true" />
          </Button>
          <p className="mt-3 text-center font-mono text-[9px] tracking-wide text-muted-foreground">DEMO CLASSIFIER · NO AI API CALLS</p>
        </section>

        <section aria-labelledby="analysis-heading" className="min-w-0 rounded-[6px] border bg-white p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 id="analysis-heading" className="text-base font-medium">Analysis results</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Review and edit mock extractions before adding them to the board.</p></div>
            {results.length > 0 ? <span className="font-mono text-[10px] tracking-wide text-muted-foreground">{results.length} FOUND</span> : null}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat label="Complaints" value={results.length} />
            <Stat label="Noise filtered" value={noise} />
            <Stat label="Missing location" value={missingLocation} />
            <Stat label="High priority" value={highPriority} />
          </div>
          {invalidLines > 0 ? <p className="mt-3 text-xs text-muted-foreground">Skipped {invalidLines} line{invalidLines === 1 ? "" : "s"} without a WhatsApp timestamp and sender.</p> : null}
          {results.length ? (
            <>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-y py-3">
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : results.map((item) => item.id))} aria-label="Select all complaints" className="size-4 accent-[#171717]" />Select all <span className="text-muted-foreground">({selected.length} selected)</span></label>
                <Button variant="ghost" size="sm" onClick={() => { setResults([]); setSelected([]); setError(""); }}>Clear results</Button>
              </div>
              <div className="mt-1 max-h-[580px] overflow-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[32px_minmax(150px,1.4fr)_minmax(118px,1fr)_72px_minmax(96px,0.8fr)] gap-2 px-2 py-2 font-mono text-[9px] tracking-wide text-muted-foreground" aria-hidden="true"><span></span><span>COMPLAINT</span><span>CATEGORY</span><span>PRIORITY</span><span>LOCATION</span></div>
                  {results.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-[32px_minmax(150px,1.4fr)_minmax(118px,1fr)_72px_minmax(96px,0.8fr)] items-center gap-2 border-t px-2 py-2.5">
                      <input type="checkbox" checked={selected.includes(item.id)} onChange={() => setSelected((ids) => ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id])} aria-label={`Select complaint ${index + 1}: ${item.title}`} className="size-4 accent-[#171717]" />
                      <div className="min-w-0"><label className="sr-only" htmlFor={`title-${item.id}`}>Complaint title {index + 1}</label><Input id={`title-${item.id}`} value={item.title} onChange={(event) => updateComplaint(item.id, { title: event.target.value })} className="h-8 rounded-[4px] text-xs" />
                        <p className="mt-1 truncate text-[10px] text-muted-foreground" title={`${item.reporter}: ${item.originalMessage}`}>{item.reporter}: {item.originalMessage}</p></div>
                      <div><label className="sr-only" htmlFor={`category-${item.id}`}>Category for complaint {index + 1}</label><select id={`category-${item.id}`} value={item.category} onChange={(event) => updateComplaint(item.id, { category: event.target.value as Complaint["category"] })} className="h-8 w-full rounded-[4px] border bg-white px-2 text-xs focus-visible:outline-2 focus-visible:outline-ring">{complaintCategories.map((category) => <option key={category}>{category}</option>)}</select></div>
                      <div><label className="sr-only" htmlFor={`priority-${item.id}`}>Priority for complaint {index + 1}</label><select id={`priority-${item.id}`} value={item.priority} onChange={(event) => updateComplaint(item.id, { priority: event.target.value as Complaint["priority"] })} className="h-8 w-full rounded-[4px] border bg-white px-1 text-xs focus-visible:outline-2 focus-visible:outline-ring">{complaintPriorities.map((priority) => <option key={priority}>{priority}</option>)}</select></div>
                      <div><label className="sr-only" htmlFor={`location-${item.id}`}>Location for complaint {index + 1}</label><Input id={`location-${item.id}`} value={item.location} placeholder="Not specified" onChange={(event) => updateComplaint(item.id, { location: event.target.value })} className="h-8 rounded-[4px] text-xs" /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <p className="text-xs text-muted-foreground">{selected.length} selected to add</p>
                <Button onClick={addSelected} disabled={!selected.length}><Check aria-hidden="true" />Add {selected.length} to board<ArrowRight aria-hidden="true" /></Button>
              </div>
            </>
          ) : (
            <div className="mt-4 flex min-h-52 flex-col items-center justify-center rounded-[6px] border border-dashed px-5 text-center">
              <Sparkles size={20} className="mb-3 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium">Your results will appear here</p>
              <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">Load the sample chat or paste a WhatsApp export, then analyze it to review the extracted complaints.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-[6px] border bg-background px-3 py-3"><p className="text-2xl font-medium tabular-nums">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{label}</p></div>;
}
