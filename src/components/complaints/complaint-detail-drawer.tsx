"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { updateComplaintStatus } from "@/lib/complaint-store";
import type { Complaint, ComplaintStatus } from "@/lib/types";

const statuses: ComplaintStatus[] = ["Todo / Triaged", "In Progress", "Resolved / Fixed"];
const priorityStyle: Record<Complaint["priority"], string> = {
  P0: "bg-red-50 text-red-800",
  P1: "bg-orange-50 text-orange-800",
  P2: "bg-blue-50 text-blue-800",
  P3: "bg-muted text-neutral-800",
};

export function ComplaintDetailDrawer({ complaint, onClose, onExport }: { complaint: Complaint | null; onClose: () => void; onExport: (complaint: Complaint) => void }) {
  const [tab, setTab] = useState<"details" | "message" | "activity">("details");

  return (
    <Sheet open={Boolean(complaint)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-full overflow-hidden p-0 sm:max-w-xl" aria-label="Complaint details">
        {complaint ? <>
          <SheetHeader className="border-b pr-14">
            <div className="flex items-center gap-2">
              <span className={`rounded-[4px] px-2 py-1 font-mono text-[10px] ${priorityStyle[complaint.priority]}`}>{complaint.priority}</span>
              <span className="font-mono text-[11px] text-foreground">#{complaint.id}</span>
            </div>
            <SheetTitle className="pt-1">{complaint.title}</SheetTitle>
            <SheetDescription className="text-neutral-700">{complaint.category} · {complaint.location || "Location not specified"}</SheetDescription>
          </SheetHeader>

          <div className="flex border-b px-4" role="tablist" aria-label="Complaint information">
            {([ ["details", "Details"], ["message", "Original message"], ["activity", "Activity"] ] as const).map(([value, label]) => (
              <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`border-b-2 px-3 py-3 text-xs ${tab === value ? "border-foreground font-medium" : "border-transparent text-neutral-700 hover:text-foreground"}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 text-neutral-800" role="tabpanel" tabIndex={0}>
            {tab === "details" ? <>
              <section>
                <h3 className="text-xs font-medium">Issue summary</h3>
                <p className="mt-2 rounded-[6px] border bg-white p-3 text-sm leading-6">
                  {complaint.title} reported by {complaint.reporter}{complaint.location ? ` at ${complaint.location}` : "; location not specified"}.
                </p>
                <p className="mt-2 text-[11px] text-neutral-700">Summary from the current triage fields.</p>
              </section>
              <section className="mt-6">
                <h3 className="text-xs font-medium">Key details</h3>
                <dl className="mt-3 divide-y rounded-[6px] border bg-white px-3">
                  <Detail label="Category" value={complaint.category} />
                  <Detail label="Priority" value={complaint.priority} />
                  <Detail label="Location" value={complaint.location || "Not specified"} />
                  <Detail label="Reported by" value={complaint.reporter} />
                  <Detail label="Reported at" value={complaint.createdAt} />
                  <Detail label="Status" value={complaint.status} />
                </dl>
              </section>
            </> : tab === "message" ? <section>
              <h3 className="text-xs font-medium">Original WhatsApp message</h3>
              <p className="mt-3 whitespace-pre-wrap break-words rounded-[6px] border bg-white p-4 text-sm leading-6">{complaint.originalMessage}</p>
              <p className="mt-2 text-xs text-muted-foreground">{complaint.reporter} · {complaint.createdAt}</p>
            </section> : <section>
              <h3 className="text-xs font-medium">Status activity</h3>
              <ol className="mt-4 space-y-4">
                {[...(complaint.statusHistory?.length ? complaint.statusHistory : [{ status: complaint.status, changedAt: complaint.createdAt }])].reverse().map((event, index) => (
                  <li key={`${event.changedAt}-${event.status}-${index}`} className="flex gap-3 text-sm">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-neutral-400" aria-hidden="true" />
                    <div><p className="font-medium">{event.status}</p><time className="mt-1 block text-xs text-muted-foreground">{formatTime(event.changedAt)}</time></div>
                  </li>
                ))}
              </ol>
            </section>}
          </div>

          <footer className="border-t bg-background p-4">
            <p className="mb-2 text-[11px] text-muted-foreground">Update status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => <Button key={status} size="sm" variant={status === complaint.status ? "default" : "outline"} disabled={status === complaint.status} onClick={() => updateComplaintStatus(complaint.id, status)}>{status === complaint.status ? `Current: ${status}` : status === "Resolved / Fixed" ? "Mark resolved" : status === "In Progress" ? "Move to in progress" : "Reopen"}</Button>)}
            </div>
            {complaint.status !== "Resolved / Fixed" ? <Button className="mt-2 w-full" variant="outline" onClick={() => onExport(complaint)}>Copy to WhatsApp</Button> : null}
          </footer>
        </> : null}
      </SheetContent>
    </Sheet>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 py-3 text-xs"><dt className="text-neutral-700">{label}</dt><dd className="text-right font-medium">{value}</dd></div>;
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
