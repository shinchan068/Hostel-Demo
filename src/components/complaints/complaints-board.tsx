"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, PanelsTopLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { clearComplaints, readComplaints, subscribeToComplaints } from "@/lib/complaint-store";
import type { Complaint } from "@/lib/types";

const priorityStyle: Record<Complaint["priority"], string> = {
  P0: "bg-red-50 text-red-700",
  P1: "bg-orange-50 text-orange-700",
  P2: "bg-blue-50 text-blue-700",
  P3: "bg-muted text-muted-foreground",
};

export function ComplaintsBoard() {
  const complaints = useSyncExternalStore(subscribeToComplaints, readComplaints, () => []);

  return (
    <>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-[28px] font-medium leading-tight tracking-[-1px] md:text-[30px]">Complaints Board</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Track and manage hostel complaints from triage to resolution.</p></div>
        <Link href="/import" className={buttonVariants({ className: "h-9" })}>Import Chats<ArrowRight aria-hidden="true" /></Link>
      </div>
      {complaints.length ? (
        <section aria-label="Imported complaints" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {complaints.map((complaint) => (
            <article key={complaint.id} className="rounded-[6px] border bg-white p-4">
              <div className="flex items-center justify-between gap-3"><span className={`rounded-[4px] px-2 py-1 font-mono text-[10px] ${priorityStyle[complaint.priority]}`}>{complaint.priority}</span><span className="font-mono text-[9px] tracking-wide text-muted-foreground">{complaint.status}</span></div>
              <h2 className="mt-3 text-sm font-medium">{complaint.title}</h2>
              <p className="mt-2 text-xs text-muted-foreground">{complaint.category} · {complaint.location || "Location not specified"}</p>
              <p className="mt-3 truncate text-xs text-muted-foreground" title={complaint.originalMessage}>{complaint.reporter}: {complaint.originalMessage}</p>
            </article>
          ))}
        </section>
      ) : (
        <section aria-label="Complaints board" className="flex min-h-[360px] flex-col items-center justify-center rounded-[6px] border bg-white px-6 py-16 text-center md:min-h-[440px]">
          <div className="mb-6 flex size-12 items-center justify-center rounded-[6px] border bg-background"><PanelsTopLeft size={22} strokeWidth={1.5} aria-hidden="true" /></div>
          <p className="mb-3 font-mono text-[10px] tracking-widest text-muted-foreground">HOSTELHUB TRIAGE</p>
          <h2 className="text-xl font-medium tracking-tight">Your board starts with a chat</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Import a WhatsApp export, review the extracted complaints, and add them here to begin your triage.</p>
          <Link href="/import" className={buttonVariants({ variant: "outline", className: "mt-6 h-9 px-4" })}>Import Chats<ArrowRight aria-hidden="true" /></Link>
        </section>
      )}
      {complaints.length ? <p className="mt-4 text-xs text-muted-foreground">{complaints.length} imported · Saved in this browser.</p> : null}
      {complaints.length ? <div className="mt-5"><Button variant="outline" size="sm" onClick={clearComplaints}>Clear imported complaints</Button></div> : null}
    </>
  );
}
