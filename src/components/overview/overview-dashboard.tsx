"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Clock3, MessageSquare } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ComplaintDetailDrawer } from "@/components/complaints/complaint-detail-drawer";
import { WorkOrderExportDialog } from "@/components/complaints/work-order-export-dialog";
import { readComplaints, readServerComplaints, subscribeToComplaints } from "@/lib/complaint-store";
import { getOverviewSummary } from "@/lib/overview";
import type { Complaint } from "@/lib/types";

const priorityTone = { P0: "bg-red-50 text-red-800", P1: "bg-orange-50 text-orange-800", P2: "bg-blue-50 text-blue-800", P3: "bg-muted text-neutral-700" };
const statusColors = ["#171717", "#2563eb", "#15803d"];

export function OverviewDashboard() {
  const complaints = useSyncExternalStore(subscribeToComplaints, readComplaints, readServerComplaints);
  const summary = getOverviewSummary(complaints);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exportComplaints, setExportComplaints] = useState<Complaint[] | null>(null);
  const selectedComplaint = complaints.find((item) => item.id === selectedId) ?? null;
  const todoEnd = summary.total ? summary.statuses[0].count / summary.total * 100 : 0;
  const progressEnd = summary.total ? todoEnd + summary.statuses[1].count / summary.total * 100 : 0;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-medium leading-tight tracking-[-1px] md:text-[30px]">Overview</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Hostel operations at a glance.</p>
        </div>
        {summary.total ? <div className="flex flex-wrap gap-2">
          <Link href="/complaints" className={buttonVariants({ variant: "outline" })}>View board</Link>
          <Link href="/import" className={buttonVariants()}>Import Chats<ArrowRight aria-hidden="true" /></Link>
        </div> : null}
      </div>

      {!summary.total ? <section aria-labelledby="overview-empty-heading" className="grid gap-10 rounded-[6px] border bg-white p-6 md:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground">NO COMPLAINTS YET</p>
          <h2 id="overview-empty-heading" className="mt-5 max-w-xl text-3xl font-medium leading-tight tracking-[-1px] md:text-4xl">Turn WhatsApp messages into organized complaints.</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">Import a hostel chat, review the extracted issues, and track maintenance from triage to resolution.</p>
          <Link href="/import" className={buttonVariants({ className: "mt-7" })}>Import WhatsApp chats<ArrowRight aria-hidden="true" /></Link>
          <p className="mt-3 text-xs text-muted-foreground">You can load a sample chat on the import screen.</p>
        </div>
        <ol className="space-y-3" aria-label="How HostelHub works">
          {[
            { title: "Import", description: "Paste a WhatsApp export or upload a text file.", icon: MessageSquare },
            { title: "Analyze and review", description: "Check the category, priority, and location of each complaint.", icon: ClipboardList },
            { title: "Track and dispatch", description: "Update the board and copy work orders to WhatsApp.", icon: CheckCircle2 },
          ].map(({ title, description, icon: Icon }, index) => <li key={title} className="flex items-start gap-4 rounded-[6px] border bg-background p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[6px] border bg-white"><Icon size={18} strokeWidth={1.5} aria-hidden="true" /></span>
            <div><p className="text-sm font-medium"><span className="mr-2 font-mono text-xs text-muted-foreground">0{index + 1}</span>{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div>
          </li>)}
        </ol>
      </section> : <>
        <p className="mb-4 text-xs text-muted-foreground">Saved in this browser · Updates as complaints change</p>
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total complaints" value={summary.total} description="All complaints on the board" />
          <Metric label="Open complaints" value={summary.open} description="Awaiting resolution" />
          <Metric label="Critical (P0)" value={summary.critical} description="Open issues needing immediate attention" critical={summary.critical > 0} />
          <Metric label="Resolved" value={summary.resolved} description={`${summary.resolvedPercent}% of all complaints`} />
        </dl>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <section aria-labelledby="category-heading" className="rounded-[6px] border bg-white p-5">
            <h2 id="category-heading" className="text-sm font-medium">Complaints by category</h2>
            <p className="mt-1 text-xs text-muted-foreground">All saved complaints, including resolved issues.</p>
            <ul className="mt-5 space-y-4">
              {summary.categories.map(({ category, count }) => <li key={category}>
                <div className="mb-1.5 flex justify-between gap-3 text-xs"><span>{category}</span><span className="font-mono tabular-nums">{count}</span></div>
                <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-neutral-700" style={{ width: `${count / summary.total * 100}%` }} /></div>
              </li>)}
            </ul>
          </section>
          <section aria-labelledby="status-heading" className="rounded-[6px] border bg-white p-5">
            <h2 id="status-heading" className="text-sm font-medium">Status breakdown</h2>
            <p className="mt-1 text-xs text-muted-foreground">Progress from triage to resolution.</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-8">
              <div aria-hidden="true" className="flex size-40 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${statusColors[0]} 0% ${todoEnd}%, ${statusColors[1]} ${todoEnd}% ${progressEnd}%, ${statusColors[2]} ${progressEnd}% 100%)` }}>
                <div className="flex size-32 flex-col items-center justify-center rounded-full bg-white"><span className="text-3xl font-medium tracking-tight">{summary.resolvedPercent}%</span><span className="mt-1 text-xs text-muted-foreground">resolved</span></div>
              </div>
              <ul className="min-w-44 flex-1 space-y-5 text-xs">
                {summary.statuses.map(({ status, count }, index) => <li key={status} className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: statusColors[index] }} />{status}</span><span className="font-mono tabular-nums">{count}</span></li>)}
              </ul>
            </div>
          </section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section aria-labelledby="attention-heading" className="rounded-[6px] border bg-white p-5">
            <div className="flex items-start justify-between gap-4"><div><h2 id="attention-heading" className="text-sm font-medium">Needs attention</h2><p className="mt-1 text-xs text-muted-foreground">Open P0/P1 complaints and missing locations.</p></div><AlertTriangle size={17} className="shrink-0 text-muted-foreground" aria-hidden="true" /></div>
            {summary.missingLocation ? <p className="mt-4 text-xs text-orange-800">{summary.missingLocation} open {summary.missingLocation === 1 ? "complaint needs" : "complaints need"} a location.</p> : null}
            {summary.needsAttention.length ? <ul className="mt-3 divide-y">
              {summary.needsAttention.map((item) => <li key={item.id} className="py-3.5">
                <button type="button" onClick={() => setSelectedId(item.id)} className="flex w-full items-start gap-3 rounded text-left focus-visible:outline-2 focus-visible:outline-ring">
                  <span className={`mt-0.5 shrink-0 rounded-[4px] px-2 py-1 font-mono text-[10px] ${priorityTone[item.priority]}`}>{item.priority}</span>
                  <span className="min-w-0 flex-1"><span className="block break-words text-sm font-medium">{item.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.category} · {item.location.trim() || "Location not specified"}</span></span>
                  <ArrowRight size={15} className="mt-1 shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>
              </li>)}
            </ul> : <div className="flex min-h-40 flex-col items-center justify-center text-center"><CheckCircle2 size={23} className="text-green-700" aria-hidden="true" /><p className="mt-3 text-sm font-medium">No urgent follow-up</p><p className="mt-1 text-xs text-muted-foreground">{summary.open ? "Routine complaints are available on the board." : "All imported complaints have been resolved."}</p></div>}
            <Link href="/complaints" className="mt-3 inline-flex items-center gap-2 text-xs font-medium underline-offset-4 hover:underline">View all complaints<ArrowRight size={13} aria-hidden="true" /></Link>
          </section>
          <section aria-labelledby="activity-heading" className="rounded-[6px] border bg-white p-5">
            <div className="flex items-start justify-between gap-4"><div><h2 id="activity-heading" className="text-sm font-medium">Recent activity</h2><p className="mt-1 text-xs text-muted-foreground">New imports and recorded status updates.</p></div><Clock3 size={17} className="text-muted-foreground" aria-hidden="true" /></div>
            {summary.activity.length ? <ol className="mt-4 divide-y">
              {summary.activity.map((event) => <li key={event.id} className="py-3">
                <p className="text-xs text-muted-foreground">{event.description}</p>
                <button type="button" onClick={() => setSelectedId(event.complaintId)} className="mt-1 block max-w-full break-words text-left text-sm font-medium hover:underline focus-visible:outline-2 focus-visible:outline-ring">{event.title}</button>
                <time dateTime={event.at} className="mt-1.5 block font-mono text-[10px] text-muted-foreground">{new Date(event.at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</time>
              </li>)}
            </ol> : <div className="flex min-h-44 flex-col items-center justify-center text-center"><p className="text-sm font-medium">Activity starts with your next update</p><p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">New imports and status changes will appear here. Earlier import times were not recorded.</p></div>}
          </section>
        </div>
      </>}
      <ComplaintDetailDrawer complaint={selectedComplaint} onClose={() => setSelectedId(null)} onExport={(item) => setExportComplaints([item])} />
      {exportComplaints ? <WorkOrderExportDialog complaints={exportComplaints} onClose={() => setExportComplaints(null)} /> : null}
    </>
  );
}

function Metric({ label, value, description, critical = false }: { label: string; value: number; description: string; critical?: boolean }) {
  return <div className="rounded-[6px] border bg-white p-5"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-3"><span className={`text-3xl font-medium tracking-tight tabular-nums ${critical ? "text-red-700" : "text-foreground"}`}>{value}</span><p className="mt-2 text-[11px] leading-5 text-muted-foreground">{description}</p></dd></div>;
}
