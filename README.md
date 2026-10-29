# HostelHub Triage

A hostel maintenance dashboard for turning messy WhatsApp chat dumps into organized complaints. The planned workflow is to import chats, review AI-extracted issues, track them on a Kanban board, and copy formatted work orders into WhatsApp.

## Current status

**Phases 1–3 — app shell, chat import, demo triage, and complaints board are implemented.** The application currently provides:

- A shared sidebar and header with active navigation and an Import Chats link.
- A mobile navigation drawer, keyboard focus indicators, and a skip-to-content link.
- Light-only styling with Geist Sans and Geist Mono, a `#fafafa` canvas, hairline borders, and 6px corners.
- A complaints Kanban with drag-and-drop status changes, direct status controls, filters, and Board/List views.
- Overview and Work Orders placeholders. Maintenance Staff and Settings are disabled V2 items; global header search is display-only and the Warden profile is not authentication.

| Route | Current behavior |
| --- | --- |
| `/` | Redirects to `/overview` |
| `/overview` | Phase 8 metrics dashboard: complaint counts, category/status breakdowns, follow-up, and activity |
| `/import` | Paste/upload WhatsApp text, use real Gemma or explicit demo triage, review and select results |
| `/complaints` | Filter, reorder, and move imported complaints across the three status columns |
| `/work-orders` | Placeholder for the V2 work order workspace |

Phases 1–8 are implemented: import, real Google Gemma triage, explicit local demo triage, editable results, browser-local complaint storage, the board, complaint details/status history, WhatsApp work order export, and the Overview dashboard using the same local data.

## Run locally

Requires Node.js **20.9 or later** and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to Overview.

**No environment variables or API credentials are required for Phase 3.** Server-side AI credentials will be documented when the real integration is added. Never commit API keys.

Geist fonts are loaded through `next/font/google`, so the initial compilation or production build requires access to Google Fonts.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create the production build and check TypeScript |
| `npm start` | Serve an existing production build |

Run `npm test` for offline regression checks; tests never call Google. TypeScript, focused lint, and the styled Webpack production build pass. One small live Gemma 4 request succeeded using 637 total tokens. Browser flow checks reused that saved response. Mobile acceptance remains manual.

## Next step

**Phase 8 — Overview is implemented and merged (PR #7).** The metrics dashboard, category/status breakdowns, urgent follow-up, and recent recorded activity pass 13 offline tests and focused browser checks. Mobile acceptance remains for the user.

Dedicated work order management, staff management, settings, and notifications remain deferred. Work order export from complaint details and the board is implemented.

## Project structure

```text
src/
  app/
    layout.tsx          Root layout, fonts, and metadata
    page.tsx            Redirect to /overview
    globals.css         Design tokens and global styles
    overview/           Overview placeholder
    import/             Import workspace
    complaints/         Imported complaints view
    work-orders/        Work Orders placeholder
  components/
    layout/             Shared shell, navigation, header, and placeholders
    ui/                 Installed Shadcn primitives
    reui/               Installed Kanban components
    examples/           Kanban example, not connected to the app
  lib/
    complaint-store.ts  Browser-local imported complaints
    parse-chat.ts       WhatsApp parsing and deterministic demo triage
    types.ts            Complaint types and categories
    utils.ts            Shared class-name utility
```

The stack is Next.js **16.4.3** with the App Router, React **19.3**, TypeScript, Tailwind CSS **4**, Shadcn/Base UI, Lucide icons, and installed dnd-kit/ReUI components for the upcoming board.

## Planning and design references

- [Build execution plan](Build_PLAN.md) — detailed implementation phases; phase numbers in this README follow this document.
- [Product specification](PRODUCT_SPECIFICATION.md) — problem, MVP scope, and deferred features.
- [Design system](DESIGN.md) — Vercel-inspired typography, colors, spacing, and surfaces.
- [Screen references](desing-screen/) — eight screenshots, including alternate designs and V2 features.
- [Wireframe](wireframe.html) — initial layout reference.
- [Sample WhatsApp dump](sample_whatsapp_dump.md) — sample input for the upcoming import workflow.

The planning documents retain older setup/status notes and Next.js version references. Use `package.json` for the installed stack and the current source for implemented behavior. Screenshots guide layout; the product specification determines MVP scope.

Before changing Next.js code, follow [AGENTS.md](AGENTS.md) and read the relevant version-specific guides in `node_modules/next/dist/docs/`.
