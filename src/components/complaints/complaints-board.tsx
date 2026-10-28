"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, GripVertical, PanelsTopLeft, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComplaintDetailDrawer } from "@/components/complaints/complaint-detail-drawer";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/reui/kanban";
import { clearComplaints, readComplaints, subscribeToComplaints, updateBoardOrder, updateComplaintStatus } from "@/lib/complaint-store";
import { complaintCategories, complaintPriorities, type Complaint, type ComplaintStatus } from "@/lib/types";

const statuses: ComplaintStatus[] = ["Todo / Triaged", "In Progress", "Resolved / Fixed"];
const statusDetails: Record<ComplaintStatus, { description: string; tone: string }> = {
  "Todo / Triaged": { description: "Newly parsed, not yet assigned.", tone: "border-neutral-200 bg-white" },
  "In Progress": { description: "Being handled by hostel staff.", tone: "border-blue-200 bg-blue-50/30" },
  "Resolved / Fixed": { description: "Completed and signed off.", tone: "border-green-200 bg-green-50/30" },
};
const priorityStyle: Record<Complaint["priority"], string> = {
  P0: "bg-red-50 text-red-700",
  P1: "bg-orange-50 text-orange-700",
  P2: "bg-blue-50 text-blue-700",
  P3: "bg-muted text-muted-foreground",
};

export function ComplaintsBoard() {
  const complaints = useSyncExternalStore(subscribeToComplaints, readComplaints, () => []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [location, setLocation] = useState("");
  const [reporter, setReporter] = useState("");
  const [view, setView] = useState<"board" | "list">("board");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ key: string; columns: Record<ComplaintStatus, Complaint[]> } | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return complaints.filter((item) =>
      (!term || [item.title, item.location, item.reporter, item.category, item.originalMessage].some((value) => value.toLowerCase().includes(term)))
      && (!category || item.category === category)
      && (!priority || item.priority === priority)
      && (!location || (location === "Not specified" ? !item.location : item.location === location))
      && (!reporter || item.reporter === reporter)
    );
  }, [complaints, query, category, priority, location, reporter]);
  const grouped = Object.fromEntries(statuses.map((status) => [status, filtered.filter((item) => item.status === status)])) as Record<ComplaintStatus, Complaint[]>;
  const filtersActive = Boolean(query || category || priority || location || reporter);
  const viewKey = `${query}|${category}|${priority}|${location}|${reporter}|${complaints.map((item) => `${item.id}:${item.status}`).join(",")}`;
  const columns = draft?.key === viewKey ? draft.columns : grouped;
  const selectedComplaint = complaints.find((item) => item.id === selectedId) ?? null;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-medium leading-tight tracking-[-1px] md:text-[30px]">Complaints Board</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Track and manage hostel complaints from triage to resolution.</p>
        </div>
        <div className="flex items-center gap-2">
          {complaints.length ? <div className="inline-flex rounded-[6px] border bg-white p-1" role="group" aria-label="Complaints view">
            <button type="button" aria-pressed={view === "board"} onClick={() => setView("board")} className={`rounded-[4px] px-3 py-1.5 text-xs ${view === "board" ? "bg-muted font-medium text-foreground" : "text-muted-foreground"}`}>Board</button>
            <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} className={`rounded-[4px] px-3 py-1.5 text-xs ${view === "list" ? "bg-muted font-medium text-foreground" : "text-muted-foreground"}`}>List</button>
          </div> : null}
          <Link href="/import" className={buttonVariants({ className: "h-9" })}>Import Chats<ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>

      {complaints.length ? (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter complaints">
            <div className="relative min-w-52 flex-1 basis-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search complaints" placeholder="Search complaints…" className="h-9 bg-white pl-9 text-xs" />
            </div>
            <FilterSelect label="Category" value={category} onChange={setCategory} options={[...complaintCategories]} />
            <FilterSelect label="Priority" value={priority} onChange={setPriority} options={[...complaintPriorities]} />
            <FilterSelect label="Location" value={location} onChange={setLocation} options={[...new Set(complaints.map((item) => item.location || "Not specified"))]} />
            <FilterSelect label="Reporter" value={reporter} onChange={setReporter} options={[...new Set(complaints.map((item) => item.reporter))]} />
            {filtersActive ? <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setCategory(""); setPriority(""); setLocation(""); setReporter(""); }}>Reset</Button> : null}
          </div>
          <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">Showing {filtered.length} of {complaints.length} complaints · Saved in this browser</p>

          {view === "board" ? (
            <Kanban
              value={columns}
              getItemValue={(item) => item.id}
              onValueChange={(value) => setDraft({ key: viewKey, columns: value })}
              onValueCommit={(value) => { updateBoardOrder(value); setDraft(null); }}
              restoreOnCancel
              role="region"
              aria-label="Complaints Kanban board"
            >
              <KanbanBoard className="flex auto-rows-auto grid-cols-none gap-3 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible">
                {statuses.map((status) => (
                  <KanbanColumn key={status} value={status} className={`min-w-[280px] rounded-[6px] border p-3 ${statusDetails[status].tone}`}>
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div><div className="flex items-center gap-2"><h2 className="text-sm font-medium">{status}</h2><span className="rounded-[4px] bg-white px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{columns[status].length}</span></div><p className="mt-1 text-[11px] leading-4 text-muted-foreground">{statusDetails[status].description}</p></div>
                    </div>
                    <KanbanColumnContent value={status} className="min-h-24 gap-2.5">
                      {columns[status].map((item) => <ComplaintCard key={item.id} complaint={item} onOpen={() => setSelectedId(item.id)} />)}
                    </KanbanColumnContent>
                    {!columns[status].length ? <p className="mt-2 rounded-[4px] border border-dashed bg-white/70 px-3 py-5 text-center text-xs text-muted-foreground">Drop a complaint here</p> : null}
                  </KanbanColumn>
                ))}
              </KanbanBoard>
              <KanbanOverlay className="w-[280px] rounded-[6px] border bg-white shadow-none">
                {({ value }) => {
                  const item = complaints.find((complaint) => complaint.id === value);
                  return item ? <ComplaintCardBody complaint={item} /> : null;
                }}
              </KanbanOverlay>
            </Kanban>
          ) : <ComplaintList complaints={filtered} onMove={updateComplaintStatus} onOpen={(id) => setSelectedId(id)} />}
          {!filtered.length ? <div className="rounded-[6px] border border-dashed bg-white px-6 py-12 text-center"><p className="text-sm font-medium">No complaints match these filters</p><Button variant="link" className="mt-1" onClick={() => { setQuery(""); setCategory(""); setPriority(""); setLocation(""); setReporter(""); }}>Clear filters</Button></div> : null}
          <div className="mt-5"><Button variant="outline" size="sm" onClick={() => { setDraft(null); clearComplaints(); }}>Clear imported complaints</Button></div>
        </>
      ) : (
        <section aria-label="Complaints board" className="flex min-h-[360px] flex-col items-center justify-center rounded-[6px] border bg-white px-6 py-16 text-center md:min-h-[440px]">
          <div className="mb-6 flex size-12 items-center justify-center rounded-[6px] border bg-background"><PanelsTopLeft size={22} strokeWidth={1.5} aria-hidden="true" /></div>
          <p className="mb-3 font-mono text-[10px] tracking-widest text-muted-foreground">HOSTELHUB TRIAGE</p>
          <h2 className="text-xl font-medium tracking-tight">Your board starts with a chat</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Import a WhatsApp export, review the extracted complaints, and add them here to begin your triage.</p>
          <Link href="/import" className={buttonVariants({ variant: "outline", className: "mt-6 h-9 px-4" })}>Import Chats<ArrowRight aria-hidden="true" /></Link>
        </section>
      )}
      <ComplaintDetailDrawer complaint={selectedComplaint} onClose={() => setSelectedId(null)} />
    </>
  );
}

function ComplaintCard({ complaint, onOpen }: { complaint: Complaint; onOpen: () => void }) {
  return (
    <KanbanItem value={complaint.id} role="group" tabIndex={-1} className="rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <article className="rounded-[6px] border bg-white p-3.5 transition-colors hover:border-neutral-300">
        <ComplaintCardBody complaint={complaint} onOpen={onOpen} />
        <div className="mt-3 flex items-center justify-between gap-2 border-t pt-2.5">
          <span className="text-[11px] text-muted-foreground">Move to</span>
          <label className="sr-only" htmlFor={`move-${complaint.id}`}>Move {complaint.title} to status</label>
          <select id={`move-${complaint.id}`} value={complaint.status} onChange={(event) => updateComplaintStatus(complaint.id, event.target.value as ComplaintStatus)} className="max-w-40 rounded-[4px] border bg-white px-2 py-1 text-[11px] focus-visible:outline-2 focus-visible:outline-ring">
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </article>
    </KanbanItem>
  );
}

function ComplaintCardBody({ complaint, onOpen }: { complaint: Complaint; onOpen?: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-[4px] px-2 py-1 font-mono text-[10px] ${priorityStyle[complaint.priority]}`}>{complaint.priority}</span>
        <KanbanItemHandle render={(props) => <button {...props} type="button" aria-label={`Drag ${complaint.title}`} className="rounded p-1 text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><GripVertical size={15} aria-hidden="true" /></button>} />
      </div>
      <h3 className="mt-2 text-sm font-medium leading-5">{onOpen ? <button type="button" onClick={onOpen} aria-label={`Open details for ${complaint.title}`} className="text-left hover:underline focus-visible:outline-2 focus-visible:outline-ring">{complaint.title}</button> : complaint.title}</h3>
      <p className="mt-2 text-xs text-muted-foreground">{complaint.category} · {complaint.location || <span className="text-orange-700">Location not specified</span>}</p>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span className="truncate">{complaint.reporter}</span><time className="shrink-0 font-mono text-[10px]">{complaint.createdAt}</time></div>
      <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-muted-foreground" title={complaint.originalMessage}>{complaint.originalMessage}</p>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  const allLabel: Record<string, string> = { Category: "All categories", Priority: "All priorities", Location: "All locations", Reporter: "All reporters" };
  return (
    <label className="relative">
      <span className="sr-only">Filter by {label.toLowerCase()}</span>
      <select aria-label={`Filter by ${label.toLowerCase()}`} value={value} onChange={(event) => onChange(event.target.value)} className="h-9 min-w-28 rounded-[6px] border bg-white px-2.5 pr-7 text-xs focus-visible:outline-2 focus-visible:outline-ring">
        <option value="">{allLabel[label]}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ComplaintList({ complaints: items, onMove, onOpen }: { complaints: Complaint[]; onMove: (id: string, status: ComplaintStatus) => void; onOpen: (id: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-[6px] border bg-white">
      <table className="w-full min-w-[760px] text-left text-xs">
        <thead className="border-b bg-background font-mono text-[9px] tracking-wide text-muted-foreground"><tr>{["PRIORITY", "TITLE", "CATEGORY", "LOCATION", "REPORTED BY", "STATUS"].map((item) => <th key={item} scope="col" className="px-3 py-3 font-normal">{item}</th>)}</tr></thead>
        <tbody>{items.map((item) => <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
          <td className="px-3 py-3"><span className={`rounded-[4px] px-2 py-1 font-mono text-[10px] ${priorityStyle[item.priority]}`}>{item.priority}</span></td>
          <th scope="row" className="max-w-64 truncate px-3 py-3 font-medium" title={item.title}><button type="button" onClick={() => onOpen(item.id)} className="text-left hover:underline focus-visible:outline-2 focus-visible:outline-ring">{item.title}</button></th>
          <td className="px-3 py-3">{item.category}</td><td className="px-3 py-3">{item.location || "Not specified"}</td><td className="px-3 py-3">{item.reporter}</td>
          <td className="px-3 py-3"><label className="sr-only" htmlFor={`list-move-${item.id}`}>Move {item.title} to status</label><select id={`list-move-${item.id}`} value={item.status} onChange={(event) => onMove(item.id, event.target.value as ComplaintStatus)} className="rounded-[4px] border bg-white px-2 py-1.5 text-xs focus-visible:outline-2 focus-visible:outline-ring">{statuses.map((status) => <option key={status}>{status}</option>)}</select></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}
