# Product Specification: HostelHub Triage
**AI-Powered Hostel Grievance Triage & Operational Dashboard**

> Status: Phases 1–3 implemented — app shell, chat import, mock triage, and interactive complaints board
> Design System: Vercel-style (see `DESIGN.md`) — Light theme only

---

## 1. Executive Summary

In university and college hostels, informal communication channels like WhatsApp groups are the primary medium through which students report infrastructure and logistical grievances. These channels rapidly deteriorate into chaotic, noisy threads where critical safety hazards get buried under banter and routine messages.

**HostelHub Triage** is a lightweight, AI-driven operations platform designed for **Hostel Wardens** and **Student Council / Floor Representatives**. It accepts raw, messy WhatsApp chat dumps and leverages **Google Gemma 4 (an open-source model accessed via Cloud API)** to instantly extract, categorize, prioritize, and visualize complaints on an interactive Kanban Board.

---

## 2. Problem Statement

### 2.1 Current Workflow
1. Students join a large hostel WhatsApp group or channel.
2. When an issue arises, the student types a message tagging `@Hostel Warden` or `@Student Council`.
3. Some students tag messages with `P0` or `Urgent`; others use casual slang, Hinglish, or forget to mention their room number.

### 2.2 Core Pain Points
- **Signal lost in noise** — Casual chat, banter, and food requests bury genuine maintenance complaints.
- **P0s get missed** — Even when students write "P0", wardens scrolling through hundreds of mobile messages miss life-safety issues (sparks, flooding, lockouts).
- **Missing critical information** — A large share of complaints omit the room or floor number, requiring manual back-and-forth.
- **Zero status tracking** — WhatsApp has no Todo / In Progress / Fixed states. Wardens can't tell what has been dispatched vs. what is unresolved.
- **Manual staff dispatch** — Wardens manually copy, retype, and forward messages to individual technicians (electricians, plumbers, carpenters).

---

## 3. Stakeholders

| Role | Need |
| :--- | :--- |
| 👨‍💼 **Hostel Warden** | Executive overview of all hazards in < 60 seconds; one-click export to staff |
| 🧑‍🎓 **Floor / Wing Rep** | See which rooms in their wing are affected; identify complaints missing room numbers |
| 🔧 **Maintenance Staff** | Receive clean, grouped task lists by trade via WhatsApp |

---

## 4. MVP Scope

> **Four things only.** Everything else is deferred to V2.

### Screen 1 — Import & AI Triage
**Route:** `/import`

Paste raw WhatsApp chat dump into a text area. Click **Analyze Complaints**. Gemma 4 runs on the Cloud API and returns a structured table in the same view (split-pane layout):

- **Left pane:** Text input (`Paste Text` tab + `Upload File` tab) + `Load Sample Chat` button + Parsing Options (filter noise, detect missing rooms, improve titles).
- **Right pane:** Analysis results table showing:
  - `#` ID, AI-generated title (editable), Category, Priority (P0–P3), Location, Reporter, Status
  - Summary badges: **Total complaints**, **Filtered as noise**, **Missing room numbers**, **High priority (P0+P1)**
- CTA at bottom: **`Add N Complaints to Board →`**

> The `Load Sample Chat` button is required for presentations and demos — loading realistic Indian hostel WhatsApp data (Hinglish, slang, P0 tags, missing rooms) with one click.

---

### Screen 2 — Complaints Kanban Board
**Route:** `/complaints`

Three-column Kanban board tracking all complaints from triage to resolution.

**Columns:**
1. `Todo / Triaged` — Newly parsed, unassigned complaints
2. `In Progress` — Dispatched to maintenance staff
3. `Resolved / Fixed` — Completed and signed off

**Card anatomy:**
- Priority tag (P0 red, P1 orange, P2 blue, P3 gray)
- Clean AI title
- Category icon + label
- Location pill (`Room B-304`) or `⚠️ Not specified` in orange
- Time ago + Reporter name + Avatar

**Board controls:**
- Global search
- Filter dropdowns: Category, Priority, Location, Reporter
- View toggle: `Board` | `List`
- Top-right CTA: `Export Work Order`

---

### Screen 3 — Complaint Detail Drawer
**Trigger:** Click any Kanban card → right-side slide-over panel

Clicking a card opens a detail panel without leaving the board. Tabs:

- **Details tab:**
  - Priority badge + complaint ID (`#HH-024`)
  - AI summary paragraph (labeled `✦ Analyzed with Gemma 4`)
  - Key Details: Category, Priority, Location, Reporter, Timestamp, Status, Assigned To
  - Extracted Information checklist (Room Number ✓, Wing/Block ✓, Urgency Keywords highlighted)
- **Original Message tab:** Raw WhatsApp text exactly as the student typed it
- **Activity tab:** Status change log

**Quick Actions at bottom:**
- `→ Move to In Progress` (primary filled button)
- `Edit` | `✓ Mark as Resolved`

---

### Feature 4 — WhatsApp Work Order Export
**Trigger:** `Export Work Order` button on the board header OR `Copy to WhatsApp` in the detail drawer

Generates a clean, formatted plain-text maintenance dispatch message grouped by trade. Wardens copy and paste this directly into WhatsApp chats with technicians.

```
*HOSTEL MAINTENANCE WORK ORDER — 28 Oct 2026*

🚨 *URGENT (P0):*
1. [Room B-304] Geyser sparking — Electrician required ASAP
2. [Wing A] Water purifier flooding corridor — Plumber required ASAP

🟠 *HIGH PRIORITY (P1):*
3. [2nd Floor] Wi-Fi router offline — IT Admin
4. [Central Mess] Food quality complaint — Mess Supervisor

⚠️ *MISSING DETAILS (follow up):*
— Shaurya S. reported fan regulator broken (room number unknown)
```

---

## 5. Deferred to V2

The following screens were designed but deliberately excluded from the MVP to keep the scope tight:

| Feature | Reason Deferred |
| :--- | :--- |
| Dedicated Work Orders sub-system (separate CRUD) | Adds data-sync complexity; board + export covers the need |
| Maintenance Staff management (profiles, shifts) | Zero impact on AI triage demonstration |
| Multi-page Review Wizard (Import → Review → Board) | Adds unnecessary page hops; split-pane import is faster |
| Settings & configuration pages | Not required for demo or evaluation |
| Notifications & alert system | V2 feature |

---

## 6. Technical Stack

| Component | Choice |
| :--- | :--- |
| **Framework** | Next.js 14/15 (App Router, TypeScript) |
| **UI Library** | Tailwind CSS + Shadcn UI |
| **Icons** | Lucide React |
| **Fonts** | Geist Sans + Geist Mono (per `DESIGN.md`) |
| **AI Model** | **Google Gemma 4** (open-source) |
| **AI Execution** | **Cloud API** — zero local compute |
| **Theme** | **Light only** — `#fafafa` canvas, `#171717` text, hairline borders |

### Design Constraints (from `DESIGN.md`)
- Canvas: `#fafafa` | Cards: `#ffffff` | Borders: `1px #ebebeb`
- Border radius: `6px` cards/buttons, `9999px` pills
- Typography: Geist Sans (headings/body), Geist Mono (tags, labels, metadata, timestamps)
- Primary button: `bg #171717`, `text #ffffff`, `6px radius`
- No drop shadows — hairline box-shadow rings only
- No chromatic color outside semantic status indicators (Red P0, Green resolved)

---

## 7. Delivery Roadmap

| Phase | Status | Description |
| :--- | :--- | :--- |
| **Phase 1** | ✅ Done | Problem definition, specification, wireframe (`wireframe.html`), sample data (`sample_whatsapp_dump.md`) |
| **Phase 2** | ✅ Done | Shared app shell, WhatsApp text import, sample loader, deterministic mock triage, editable results, browser-local complaint handoff |
| **Phase 3** | ✅ Done | Complaints Kanban board, drag-and-drop status updates, filters, and board/list views |
| **Phase 4** | ✅ Done | Complaint detail drawer with original messages and status activity |
| **Phase 5** | ✅ Done | Formatted WhatsApp work order preview and clipboard copy |
| **Phase 6** | ✅ Done | Server-only Google Gemma integration and response validation |
| **Phase 7** | ✅ Done | Edge cases, error recovery, keyboard tabs, offline tests, and one successful live Gemma check |
| **Phase 8** | ✅ Done | Overview counts, category/status breakdowns, urgent follow-up, and recorded activity; promoted from the original V2 scope and merged in PR #7 |
