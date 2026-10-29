# HostelHub Triage — Build Execution Plan

> **Status:** Phases 1–8 implemented and merged into `main`; mobile acceptance remains manual
> **Last Updated:** 28 Oct 2026
> **Design Reference:** Screenshots in `desing-screen/`
> **Design System:** `DESIGN.md` (Vercel-style, light theme only)

---

## Current Progress

- Foundation installed: Next.js 16.4.3, Tailwind, Shadcn primitives, ReUI Kanban, and Geist fonts/design tokens.
- Phase 1 complete: shared shell and navigation across `/overview`, `/import`, `/complaints`, and `/work-orders`.
- Phase 2 complete: paste/upload WhatsApp text, sample loading, deterministic mock triage, editable/selectable results, and browser-local complaint handoff.
- Phase 3 complete: three status columns, drag-and-drop and direct status controls, filters, Board/List views, and persisted card order/status.
- Phases 4–5 complete: complaint details, original messages, persisted status activity, and WhatsApp work order preview/copy.
- Phase 6 complete: server-only Google Gemma integration, bounded requests, validated responses, and explicit demo mode.
- Phase 7 complete: multiline/Android parsing, loading and empty states, error recovery, keyboard tabs, and ten offline regression tests. One live Gemma 4 call succeeded using 637 total tokens; remaining flow checks reused its saved response.
- Maintenance Staff and Settings are disabled for V2. Global header search is display-only; complaint search and filters work on the board.
- Validation: TypeScript and focused lint pass; production build passes with `npx next build --webpack`; sample import-to-board, status persistence, filtered drag, List view, and accessibility scan passed in `agent-browser`. Mobile layout acceptance remains for the user to check manually.
- Further mobile acceptance testing will be performed manually by the user.
- Imported complaints remain in the current browser. AI credentials remain in the server environment and are never committed.
- Phase 8 complete (PR #7): `/overview` now shows metrics, category/status breakdowns, urgent follow-up, and recorded activity. All 13 offline tests pass; empty/populated/resolved-only Overview browser scans reported zero WCAG A/AA violations and zero incomplete checks. Same-tab and cross-tab updates were checked. No additional AI calls were made.

---

## Pre-Build: Skills & Tooling Setup

**What we do before writing any app code.**

### Step 1 — Install Vercel React Best Practices Skill
```bash
npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y
```
Gives us: Next.js App Router patterns, Tailwind conventions, component structure guidance.

### Step 2 — Scaffold Next.js 15 Project
```bash
npx create-next-app@latest hostel-hub --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Step 3 — Install Shadcn UI
```bash
npx shadcn@latest init
```
Configure: New York style, Slate base color, CSS variables enabled, `src/components/ui` path.

### Step 4 — Install the Kanban Component
```bash
npx shadcn@latest add @reui/c-kanban-1
```
We will tweak this component to match our design system (Geist fonts, `#fafafa` canvas, `6px` radius, hairline borders).

### Step 5 — Install Required Shadcn Primitives
```bash
npx shadcn@latest add button card badge dialog sheet input textarea tabs select dropdown-menu separator avatar tooltip scroll-area table command
```

### Step 6 — Install Additional Dependencies
```bash
npm install lucide-react
```

### Step 7 — Configure Design Tokens
- Override Tailwind config / CSS variables to match `DESIGN.md` tokens exactly (`#fafafa`, `#171717`, `#ebebeb`, Geist fonts, `6px` radius, hairline shadows).
- Set up Geist Sans + Geist Mono via `next/font/local` or `next/font/google`.
- Create `.env.local` with placeholder `GEMMA_API_KEY=your-key-here`.

**Deliverable:** Empty Next.js project that runs on `localhost:3000` with correct fonts, colors, and all Shadcn components available.

---

## Phase 1 — App Shell & Layout

**Goal:** Sidebar navigation, top header bar, page routing — matching the design screenshots exactly.

### Files to Create

```
src/
├── app/
│   ├── layout.tsx              ← Root layout with Geist fonts, light theme forced
│   ├── page.tsx                ← Redirect to /overview
│   ├── overview/
│   │   └── page.tsx            ← Empty placeholder (V2 — not building charts)
│   ├── import/
│   │   └── page.tsx            ← Import & AI Triage (Phase 2)
│   ├── complaints/
│   │   └── page.tsx            ← Kanban Board (Phase 3)
│   └── work-orders/
│       └── page.tsx            ← Empty placeholder (V2)
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx         ← Left sidebar nav (HostelHub TRIAGE logo, nav items, Gemma 4 badge, Warden profile)
│   │   ├── header.tsx          ← Top bar (search, ⌘K shortcut hint, "+ Import Chats" CTA, Warden avatar)
│   │   └── app-shell.tsx       ← Combines sidebar + header + main content area
│   └── ui/                     ← Shadcn generated components (auto)
├── lib/
│   ├── types.ts                ← TypeScript types for Complaint, WorkOrder, Priority, Category
│   ├── constants.ts            ← Category list, priority levels, colors, sample data
│   ├── mock-data.ts            ← Hardcoded sample complaints for UI development
│   └── utils.ts                ← Shadcn cn() utility + helpers
```

### What the Sidebar Looks Like (from design screenshots)

```
┌──────────────────────┐
│ HostelHub            │
│ T R I A G E          │
│                      │
│ 🏠 Overview          │
│ 📥 Import Chats      │
│ 📋 Complaints        │
│ 📄 Work Orders       │
│                      │
│ ─── MANAGE ───       │
│ 👥 Maintenance Staff  │  ← Visible but disabled (V2)
│ ⚙️ Settings           │  ← Visible but disabled (V2)
│                      │
│ ✦ Analyzed with      │
│   Gemma 4            │
│                      │
│ (W) Warden           │
│     Hostel Block B ▾ │
└──────────────────────┘
```

### What the Header Looks Like

```
┌──[grid icon]───[🔍 Search complaints, rooms, students...  ⌘K]──────[🔔]──[W Warden ▾]┐
```

**Deliverable:** Clicking sidebar items navigates between pages. All pages show the shell with placeholder content. Pixel-matches the design screenshots for sidebar width, font sizes, colors.

---

## Phase 2 — Import & AI Triage Page

**Goal:** The core AI page. Paste WhatsApp chat → Click Analyze → See extracted complaints table.

### Reference Screenshot
`HostelHub Triage Dashboard.png` — Split-pane layout with input left, results right.

### Layout

```
┌─────────────────────────────────────┬──────────────────────────────────────────────────┐
│         LEFT PANE (40%)             │              RIGHT PANE (60%)                     │
│                                     │                                                  │
│  Import Chats                       │  Analysis Results                                │
│  Paste your WhatsApp chat dump      │  ✦ Analyzed with Gemma 4                         │
│  and let AI extract and organize.   │                                                  │
│                                     │  ┌──────┬──────┬──────┬──────┐                   │
│  [Paste Text] [Upload File]         │  │  10  │  13  │   3  │   6  │  KPI badges       │
│              [Load Sample Chat]     │  │Total │Noise │Miss  │High  │                   │
│                                     │  └──────┴──────┴──────┴──────┘                   │
│  ┌─────────────────────────────┐    │                                                  │
│  │ 8:12 PM  Aarav: Guys wifi  │    │  [Search] [Category▾] [Priority▾] [Status▾]      │
│  │ 8:13 PM  Karan: @warden    │    │                                                  │
│  │ 8:14 PM  Riya: can someone │    │  ┌──┬───┬────────────┬────────┬─────┬────┬──────┐│
│  │ 8:16 PM  Mayank: water not │    │  │# │AI │AI TITLE    │CATEGORY│LOC  │PRI │MSG   ││
│  │ ...                        │    │  ├──┼───┼────────────┼────────┼─────┼────┼──────┤│
│  └─────────────────────────────┘    │  │1 │→  │Geyser spark│⚡Electr│B-304│ P0 │Karan:││
│                                     │  │2 │→  │Water supply│💧Plumb │WingA│ P0 │Mayan ││
│  12,480 characters                  │  │3 │→  │Wi-Fi not   │📶Wi-Fi │2ndFl│ P1 │Aarav ││
│                                     │  │...│   │...         │...     │...  │... │...   ││
│  ⚙️ Parsing Options          ▾     │  └──┴───┴────────────┴────────┴─────┴────┴──────┘│
│  ┌─────────────────────────────┐    │                                                  │
│  │ Hostel Name (optional)      │    │  0 selected         [Discard] [Add 10 to Board →]│
│  │ Date Range (optional)       │    │                                                  │
│  │ ☑ Filter casual messages    │    │                                                  │
│  │ ☑ Detect missing room #     │    │                                                  │
│  │ ☑ Use AI to improve titles  │    │                                                  │
│  │ ☐ Group similar complaints  │    │                                                  │
│  └─────────────────────────────┘    │                                                  │
│                                     │                                                  │
│  [✦ Analyze Complaints →]           │                                                  │
└─────────────────────────────────────┴──────────────────────────────────────────────────┘
```

### Files to Create

```
src/
├── app/import/
│   └── page.tsx                      ← Import page with split-pane layout
├── components/import/
│   ├── chat-input-pane.tsx           ← Left pane: textarea, tabs, sample loader, parsing options
│   ├── analysis-results-pane.tsx     ← Right pane: KPI badges + results table
│   ├── results-table.tsx             ← Data table with editable AI titles, category dropdowns
│   └── kpi-badges.tsx                ← Four summary metric cards
├── lib/
│   ├── sample-chat.ts               ← The realistic WhatsApp dump text (from sample_whatsapp_dump.md)
│   └── parse-chat.ts                ← Client-side regex to split WhatsApp lines into {timestamp, sender, message}
```

### Behavior

1. User pastes text or clicks **"Load Sample Chat"** → text fills the textarea.
2. User clicks **"✦ Analyze Complaints →"** → a local demo classifier parses messages and shows mock triage results in the right pane.
3. Results can be edited and selected; filtered noise and invalid WhatsApp lines are counted separately. No AI endpoint is called in this phase.
4. User selects complaints → click **"Add N Complaints to Board →"** → complaints are saved in browser `localStorage` and the user is redirected to `/complaints`.

**Deliverable:** Import page with local mock analysis. Clicking "Add to Board" persists and shows complaint cards on `/complaints`; the full Kanban arrives in Phase 3.

---

## Phase 3 — Complaints Kanban Board

**Goal:** 3-column drag-and-drop Kanban board. This is the operational heart of the app.

### Reference Screenshots
- `HostelHub Complaints Kanban Board.png` — Full board view
- `HostelHub Complaints Triage Dashboard.png` — Board with detail drawer open

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  Complaints Board                                    [Board] [List]  [Export Work Order] │
│  Track and manage hostel complaints from triage to resolution.                          │
│                                                                                         │
│  [Search...] [All Categories▾] [All Priorities▾] [All Locations▾] [All Reporters▾] [Reset] │
│                                                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐             │
│  │ ⭕ Todo/Triaged (10) │  │ 🔵 In Progress (8)  │  │ 🟢 Resolved/Fixed(5)│             │
│  │ + Add               │  │ + Add               │  │ + Add               │             │
│  │─────────────────────│  │─────────────────────│  │─────────────────────│             │
│  │ ┌─────────────────┐ │  │ ┌─────────────────┐ │  │ ┌─────────────────┐ │             │
│  │ │ [P0]    12m ago │ │  │ │ [P0]    30m ago │ │  │ │ [P0]     1d ago │ │             │
│  │ │ Geyser sparking │ │  │ │ Lift not working│ │  │ │ Elec short circ ✓│ │             │
│  │ │ ⚡Electrical      │ │  │ │ ⚙️Mechanical     │ │  │ │ ⚡Electrical      │ │             │
│  │ │ 📍B-304  👤Aarav │ │  │ │ 📍Block B 👤Raj │ │  │ │ 📍A-101  👤Raj  │ │             │
│  │ └─────────────────┘ │  │ └─────────────────┘ │  │ └─────────────────┘ │             │
│  │ ┌─────────────────┐ │  │ ┌─────────────────┐ │  │ ┌─────────────────┐ │             │
│  │ │ [P0]    28m ago │ │  │ │ [P1]    2h ago  │ │  │ │ [P1]     1d ago │ │             │
│  │ │ Water leakage   │ │  │ │ Water supply cut│ │  │ │ Wi-Fi rebooted ✓│ │             │
│  │ │ 💧Plumbing       │ │  │ │ 💧Plumbing       │ │  │ │ 📶Wi-Fi          │ │             │
│  │ │ 📍Wing A 👤Riya │ │  │ │ 📍Wing C 👤Imran│ │  │ │ 📍3rd Fl 👤Ankit│ │             │
│  │ └─────────────────┘ │  │ └─────────────────┘ │  │ └─────────────────┘ │             │
│  │ ...more cards...    │  │ ...more cards...    │  │ ...more cards...    │             │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘             │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### Files to Create

```
src/
├── app/complaints/
│   └── page.tsx                      ← Complaints board page
├── components/complaints/
│   ├── board-header.tsx              ← Title, view toggle (Board/List), Export button
│   ├── board-filters.tsx             ← Search + filter dropdowns row
│   ├── kanban-board.tsx              ← 3-column layout using @reui/c-kanban-1 (tweaked)
│   ├── kanban-column.tsx             ← Single column (header + card list)
│   ├── complaint-card.tsx            ← Individual card (priority badge, title, category, location, reporter, time)
│   └── complaint-detail-drawer.tsx   ← Phase 4 (slide-over panel)
├── lib/
│   └── store.ts                      ← Client-side state management (React Context or Zustand) for complaints across pages
```

### Card Component Anatomy (from `HostelHub Complaints Kanban Board.png`)

```
┌──────────────────────────────────┐
│ [P0]                    12m ago ⋯│   ← Priority badge (red/orange/blue/gray) + time + menu
│                                  │
│ Geyser sparking in bathroom      │   ← AI-cleaned title (Geist Sans 14px, weight 500, #171717)
│                                  │
│ ⚡ Electrical   📍 B-304   👤 Aarav│   ← Category icon + Location + Reporter avatar
└──────────────────────────────────┘
```

### Behavior
- Drag-and-drop cards between columns (or use ⋯ menu → "Move to In Progress" / "Move to Resolved").
- Filter chips narrow visible cards.
- Clicking a card opens the Detail Drawer (Phase 4).
- Board + List view toggle (list view shows a flat table — same data, different layout).

**Deliverable:** Fully interactive Kanban board populated with mock data (and data from Import page if available). Cards move between columns.

---

## Phase 4 — Complaint Detail Drawer

**Goal:** Clicking any Kanban card opens a right slide-over panel with full extracted details.

### Reference Screenshot
`HostelHub Complaints Triage Dashboard.png` — Right side panel.

### Layout

```
┌──────────────────────────────────────────────┐
│  #HH-024                    ← →    ✕        │  ← ID, prev/next nav, close
│  Created 12 minutes ago                      │
│                                              │
│  [P0 · Critical]                             │  ← Priority badge (large)
│                                              │
│  Geyser sparking in bathroom                 │  ← Title (Geist Sans 20px)
│  Electrical issue with visible sparks,       │  ← Subtitle description
│  risk of short circuit.                      │
│                                              │
│  ⚡ Electrical  📍 Room B-304  👤 Aarav S.   │  ← Quick metadata row
│                                              │
│  ─────────────────────────────────────────── │
│  [Details]  [Original Message]  [Activity]   │  ← Tab navigation
│  ─────────────────────────────────────────── │
│                                              │
│  AI Summary           ✦ Analyzed with Gemma 4│
│  ┌──────────────────────────────────────────┐│
│  │ Geyser in room B-304 is sparking and     ││
│  │ there is risk of short circuit. Needs    ││
│  │ immediate attention.                     ││
│  └──────────────────────────────────────────┘│
│                                              │
│  Key Details                      [✏️ Edit]  │
│  Category      ⚡ Electrical                 │
│  Priority      🔴 P0 · Critical             │
│  Location      📍 Room B-304                │
│  Reported by   👤 Aarav S.                   │
│  Time          📅 Oct 26, 2026, 8:12 PM     │
│  Status        ● Todo / Triaged              │
│  Assigned to   Not assigned     [Assign ▾]   │
│                                              │
│  Extracted Information                       │
│  Room Number    B-304              ✅        │
│  Wing / Block   Block B            ✅        │
│  Issue Type     Geyser / Water Heater ✅     │
│  Urgency Words  [sparking] [risk] [urgent]   │
│                                              │
│  ─────────────────────────────────────────── │
│  Quick Actions                               │
│  [→ Move to In Progress] [Edit] [✓ Resolved]│
└──────────────────────────────────────────────┘
```

### Files to Create

```
src/components/complaints/
├── complaint-detail-drawer.tsx       ← Shadcn Sheet component, right-side slide-over
├── detail-tabs/
│   ├── details-tab.tsx               ← AI summary + Key Details table + Extracted Info checklist
│   ├── original-message-tab.tsx      ← Shows raw WhatsApp message in a monospace block
│   └── activity-tab.tsx              ← Simple timeline of status changes
└── assign-dropdown.tsx               ← Mock staff dropdown (Ramesh - Electrician, Imran - Plumber, etc.)
```

### Behavior
- Opens as a `Sheet` (Shadcn) from the right, 420px wide.
- Previous/Next arrows cycle through cards.
- Quick actions update card status and reflect immediately on the Kanban board.
- "Original Message" tab shows the exact raw WhatsApp text that produced this complaint.

**Deliverable:** Drawer opens on card click. All fields populated. Status changes sync back to board.

---

## Phase 5 — WhatsApp Work Order Export

**Goal:** Select complaints → generate formatted maintenance dispatch text → copy to clipboard.

### Reference Screenshot
`HostelHub Work Orders Dashboard.png` — Export modal + formatted output.

### Files to Create

```
src/components/
├── export/
│   ├── export-work-order-dialog.tsx  ← Shadcn Dialog/Sheet with formatted output
│   └── format-work-order.ts         ← Pure function: takes Complaint[] → formatted string
```

### Formatted Output Preview

```
*HOSTEL MAINTENANCE WORK ORDER*
*Date: Oct 28, 2026*

[ ELECTRICAL ]
1. Geyser sparking in bathroom
   - Location: Room B-304
   - Priority: P0 (Critical)
   - Reported by: Aarav S.

2. Fan regulator not working
   - Location: Room C-205
   - Priority: P2 (Medium)
   - Reported by: Vivek T.

[ PLUMBING ]
3. Water leakage near washroom
   - Location: Wing A
   - Priority: P0 (Critical)
   - Reported by: Riya K.
```

### Behavior
- Accessible from: Board header `[Export Work Order]` button OR Detail Drawer `[Copy to WhatsApp]` button.
- Groups complaints by trade/category.
- Sorts by priority within each group (P0 first).
- One-click **"Copy to Clipboard"** button with success toast.

**Deliverable:** Export modal generates correct formatted text. Copy button works.

---

## Phase 6 — Gemma 4 API Integration

**Goal:** Replace mock AI responses with real Google Gemma 4 Cloud API calls.

### Files to Create

```
src/
├── app/api/triage/
│   └── route.ts                      ← Next.js API route: receives raw chat, calls Gemma 4, returns structured JSON
├── lib/
│   ├── gemma-client.ts               ← API client for Google Gemma 4 Cloud endpoint
│   ├── triage-prompt.ts              ← System prompt + few-shot examples for structured extraction
│   └── triage-schema.ts              ← Zod schema for validating/parsing Gemma 4 JSON response
```

### API Route Flow

```
Client (Import Page)
  │
  ▼ POST /api/triage { rawChat: string, options: {...} }
  │
  ▼ Server: parse raw text into individual messages
  │
  ▼ Server: construct prompt with system instructions + chat messages
  │
  ▼ Server: call Gemma 4 Cloud API (user's endpoint from .env.local)
  │
  ▼ Server: validate response against Zod schema
  │
  ▼ Return: { complaints: Complaint[], stats: { total, filtered, missingRoom, highPriority } }
```

### Prompt Strategy
- System prompt instructs Gemma 4 to act as a hostel complaint triage assistant.
- Input: array of raw WhatsApp messages.
- Output: JSON array where each item has `title`, `category`, `priority`, `location`, `reporter`, `summary`, `urgencyKeywords[]`, `missingInfo[]`, `isNoise: boolean`.
- Few-shot examples included in prompt for reliable structured output.

### Environment Variable
```env
# .env.local
GEMMA_API_KEY=paste-your-key-here
GEMMA_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemma-...
```

**Deliverable:** Import page now calls real Gemma 4. Results are live AI-generated, not mocked.

---

## Phase 7 — Polish & Testing

**Goal:** Final pass — edge cases, responsive tweaks, demo rehearsal.

### Tasks
1. **Loading & empty states**: Skeleton loaders on the results table, empty board illustration, error toasts for API failures.
2. **Edge cases**: Very long messages, pure emoji messages, messages with no timestamp, Hinglish mixed text.
3. **Responsive**: Sidebar collapses to icons on narrow screens. Kanban stacks vertically on mobile (not critical for local demo but nice).
4. **Demo flow rehearsal**: Open app → Click "Import Chats" → Click "Load Sample Chat" → Click "Analyze" → Review results → Add to Board → View Kanban → Click card → See AI extraction → Export Work Order → Copy to WhatsApp. Total time: < 90 seconds.
5. **README.md**: Setup instructions, env vars, how to run.

**Deliverable:** Production-quality demo-ready app.

---

## Phase 8 — Overview Dashboard

**Goal:** Replace the Overview placeholder using existing browser-local complaints and the supplied empty-state design.

1. Show total, open, unresolved P0, and resolved counts with a clear empty onboarding state.
2. Add category bars and a status breakdown derived from real saved data; do not invent trends or resolution durations.
3. Surface urgent/missing-location complaints and timestamped import/status activity; reuse the existing detail drawer and work order copy flow.
4. Record actual import times for new complaints. Preserve older records; do not infer activity times from ambiguous WhatsApp dates.
5. Test empty, populated, resolved-only, cross-tab updates, drawer actions, and navigation with offline data. Mobile acceptance remains manual.

**Delivery:** Separate Phase 8 branch, focused tests/build/browser checks, code-only push, PR, and merge. Planning/design/README/sample/image files remain local.

---

## Summary: Phase Checklist

| Phase | What | Depends On | Est. Effort |
| :--- | :--- | :--- | :--- |
| **Pre-Build** | Scaffold + Shadcn + Design tokens + Kanban component | Nothing | Setup |
| **Phase 1** | App shell, sidebar, header, routing | Pre-Build | Layout |
| **Phase 2** | Import page (paste chat → mock AI → results table) | Phase 1 | Core feature |
| **Phase 3** | ✅ Done — Kanban board (3 columns, cards, filters, drag-drop, list view) | Phase 2 | Core feature |
| **Phase 4** | Detail drawer (AI summary, extracted info, actions) | Phase 3 | Core feature |
| **Phase 5** | WhatsApp export (formatted text, copy to clipboard) | Phase 3 | Feature |
| **Phase 6** | Gemma 4 real API integration (replace mocks) | Phase 2 + your API key | Integration |
| **Phase 7** | Polish, edge cases, loading states, README | All above | QA |
| **Phase 8** | Overview metrics, category/status breakdowns, urgent follow-up, and activity | Phases 3–7 | Dashboard |
