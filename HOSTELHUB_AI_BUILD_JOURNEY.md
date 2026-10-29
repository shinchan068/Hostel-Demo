# From Problem Statement to Working Product
## How HostelHub Was Built with Antigravity and Codex

**Project:** [HostelHub Triage](https://github.com/shinchan068/Hostel-Demo)  
**Audience:** Students learning AI-assisted product development and vibe coding  
**Purpose:** Explain the real workflow, decisions, prompts, mistakes, and verification behind the project.

> This is not a story about one magical prompt. The project became usable because the problem was clarified, the MVP was reduced, the design was documented, implementation was divided into phases, and every major phase was reviewed and tested.

---

## 1. What is HostelHub?

Hostel complaints are often reported inside busy WhatsApp groups. Genuine maintenance issues become mixed with casual conversation, repeated messages, slang, and incomplete information. Important hazards can be missed, and WhatsApp does not provide a clear workflow for tracking whether an issue is new, being handled, or resolved.

HostelHub turns a raw WhatsApp chat dump into structured maintenance complaints. It can:

1. Accept pasted or uploaded WhatsApp chat text.
2. Separate genuine complaints from noise.
3. Extract category, location, reporter, and priority.
4. Flag missing information such as an absent room number.
5. Place complaints on a Todo → In Progress → Resolved board.
6. Show the original message and status activity.
7. Generate a WhatsApp-ready maintenance work order.
8. Show an operational overview using the same complaint data.

The app uses Next.js, TypeScript, Tailwind CSS, Shadcn-style components, browser-local storage, and a server-side Google AI endpoint configured for a Gemma model.

### Terminology note

Gemma is more accurately described as an **open-weight model**, not automatically as fully open-source software under every formal definition. The application uses a hosted API, so the model does not need to run on the developer's laptop.

---

## 2. Which AI tools were used?

### Antigravity

Antigravity was used primarily for:

- validating the interpretation of the problem statement;
- challenging incorrect assumptions;
- deciding MVP features and non-goals;
- proposing the initial wireframe;
- reviewing design references;
- creating the product specification;
- creating the phased build plan;
- initializing the project.

### Codex

Codex does have a CLI/TUI workflow. The recovered implementation session identifies its origin as `codex-tui` running through the editor environment in the `Hostel-Demo` workspace.

Codex was used primarily for:

- reading the approved specification and plan;
- implementing one phase at a time;
- creating feature branches;
- running tests and browser checks;
- debugging implementation problems;
- integrating the Gemma API safely;
- creating pull requests and merging completed phases.

### How context moved between chats

The chats were not magically synchronized. Context was transferred through project artifacts:

- `PRODUCT_SPECIFICATION.md`
- `DESIGN.md`
- `Build_PLAN.md`
- design screenshots
- source code and Git history

This is an important lesson: **files are more reliable than expecting a new AI chat to remember an old conversation.**

---

## 3. Verified conversation and repository evidence

The following local records were used to reconstruct this guide:

| Source | Verified identifier |
| --- | --- |
| Antigravity product-planning conversation | `6cc4d4c7-3b7f-4e92-99ab-139ee56d6ee2` |
| Antigravity initialization conversation | `5082ace0-b334-44cc-9293-ea8f001d0231` |
| Main Codex implementation session | `01a180f5-27c9-7602-9eaf-8491dd79066c` |
| Repository | `shinchan068/Hostel-Demo` |
| Pull requests | PRs #1–#7 |

Both UUIDs supplied for Antigravity were found in Antigravity's local conversation storage. The Codex implementation history was found separately in the local Codex session records.

Prompts marked **Recovered and edited** preserve the original request while correcting spelling and grammar. Prompts marked **Reusable version** are improved templates created from the real workflow.

---

# Part I — Product Thinking with Antigravity

## 4. Stage 1: Explain your understanding and ask the AI to challenge it

The project did not begin with “build me an app.” It began by explaining the real situation and asking whether the interpretation was correct.

### Recovered and edited prompt

```text
Here is how I understand the problem statement.

Students report hostel and logistical issues in a college WhatsApp group by
tagging the hostel warden or student council. The group has become messy.
Important messages are mixed with casual conversation, some complaints are
missed, and priority labels such as P0 are difficult to track.

My idea is to build a platform where a warden can paste the messy chat text.
The system will analyze it, extract complaints, assign priority and category,
and create an operational dashboard or Kanban board showing what is pending,
in progress, or fixed.

For the demo, we can create a Markdown file containing realistic sample chat
messages. The project is required to use an open model. My laptop cannot run a
large model locally, so I want to use a hosted Google model API.

Please tell me:
1. What have I understood correctly?
2. Which assumptions are incorrect or weak?
3. Am I going in the right direction?
4. What should the first MVP contain?
```

### Why this prompt worked

- It supplied real context instead of a one-line app idea.
- It separated the problem from the proposed solution.
- It invited criticism rather than asking the AI to agree.
- It asked for scope before implementation.

### Important correction produced during this stage

The conversation identified a distinction between Gemini and Gemma. A proprietary Gemini model would not satisfy a requirement specifically asking for an open model. The project direction was therefore updated to use a hosted Gemma model endpoint.

### Reusable version

```text
I am building a student project for [problem statement].

This is how I currently understand the real-world problem:
[your explanation]

This is the solution I am considering:
[your proposed workflow]

Do not simply agree with me. Tell me:
- what is correct;
- which assumptions are weak;
- what is missing;
- what should be in a small demo-ready MVP;
- what should be deferred.

Ask only the questions that would materially change the product decision.
Do not write application code yet.
```

---

## 5. Stage 2: Confirm the model and deployment constraint

### Recovered and edited prompt

```text
Update the project context with this decision:

- We will use a hosted Google Gemma model endpoint.
- I will provide the exact model and API details in a later phase.
- We will use a cloud API instead of running the model on my laptop.

Do not implement the API yet. Keep the architecture ready for a server-side
model integration later.
```

### Lesson

A tool or model decision should be recorded as a constraint, but API integration should not block UI and workflow development. The project used deterministic demo triage first and connected the real model later.

---

## 6. Stage 3: Ask for a wireframe before production UI

### Recovered and edited prompt

```text
Propose a rough, minimal UI for this product using a Markdown wireframe.

The planned stack is Next.js, Shadcn UI, and Tailwind CSS. We may use another
component library only if it solves a specific need.

After the Markdown wireframe, create a standalone HTML wireframe so I can see
where each section and action will appear. Use the attached screenshots only
as references for hierarchy and layout. The app must use a light theme.

Do not build the production application without my approval. Avoid generic,
over-decorated AI-generated UI.
```

### Why a wireframe was useful

The wireframe answered structural questions before implementation:

- Where does chat input appear?
- Where are AI results reviewed?
- How does the user reach the board?
- Which information is visible on a complaint card?
- Where does the work-order action live?

The wireframe was not treated as the final visual design. It was a low-cost way to validate the user flow.

---

## 7. Stage 4: Write the product idea and problem in a specification

### Recovered and edited prompt

```text
Create a Markdown document that explains:

- the original problem;
- the current WhatsApp-based workflow;
- the main pain points;
- the target users;
- the proposed product idea;
- the features currently being considered;
- the technical constraints.

Keep this as a product document. Do not start implementation.
```

This became the foundation for `PRODUCT_SPECIFICATION.md`.

---

## 8. Stage 5: Review screenshots and cut the MVP

The initial screen references represented a much larger operations product. The AI was asked to judge which parts were necessary for the first version.

### Recovered and edited prompt

```text
Review the design screenshots and PRODUCT_SPECIFICATION.md again.

I think we need to improve the product decisions. Give me an honest verdict on:
- what belongs in the MVP;
- what should be removed or deferred;
- whether any screen duplicates another workflow;
- whether the demo can clearly show the main value.

The visual system must continue to follow DESIGN.md. We can refine the product
scope, but we should not replace the approved visual direction.
```

### Final MVP decision

The MVP was reduced to four connected capabilities:

1. Import and AI triage.
2. Complaints Kanban board.
3. Complaint detail drawer.
4. WhatsApp work-order export.

The following were initially deferred:

- a separate work-order management subsystem;
- maintenance staff management;
- settings;
- notifications;
- a multi-page review wizard;
- analytics that did not help demonstrate the main flow.

The Overview dashboard was later promoted and implemented as Phase 8, after the core flow was stable.

---

## 9. Stage 6: Decide the stack and ask clarifying questions

### Recovered and edited prompt

```text
Before creating the implementation plan, review the technical stack and tell
me what information you still need.

Current choices:
- latest stable Next.js with App Router and TypeScript;
- Tailwind CSS;
- Shadcn UI;
- ReUI Kanban component, which we can customize;
- Lucide or another suitable icon library;
- hosted Gemma model integration later;
- local execution for the demo.

Use existing components where practical instead of building every primitive
from scratch. Review the supplied design screenshots and adapt them to our
actual product.

Before writing the plan, ask any question whose answer would change the
architecture, scope, or implementation order.
```

### Questions that mattered

The AI asked about:

- whether more design references were available;
- whether AI should be mocked before using the real API;
- whether the app would run locally or be deployed.

The answers were:

- use the supplied design screens;
- add the real API manually in a later phase;
- run locally for the demonstration.

---

## 10. Stage 7: Create a phase-by-phase plan, but do not implement yet

### Recovered and edited prompt

```text
Create a comprehensive phase-by-phase implementation plan.

For every phase include:
- the goal;
- visible user outcome;
- files or modules likely to change;
- important interactions;
- tests or checks required;
- dependencies on earlier phases.

Do not implement anything until I review and approve the plan.
```

The approved sequence was:

1. Pre-build setup.
2. Shared application shell.
3. Import and demo triage.
4. Complaints board.
5. Complaint details.
6. Work-order export.
7. Real Gemma integration.
8. Polish and testing.
9. Overview dashboard, added later as Phase 8 in the repository's numbering.

---

## 11. Stage 8: Continue in a new chat using files as the handoff

### Recovered and edited prompt

```text
I want to continue implementation in a new chat. If I attach or reference
Build_PLAN.md, PRODUCT_SPECIFICATION.md, DESIGN.md, and the design screenshots,
will the new chat have enough context to execute one phase at a time?
```

### Recommended handoff prompt

```text
Read these files before doing anything:
- Build_PLAN.md
- PRODUCT_SPECIFICATION.md
- DESIGN.md
- the supplied design screenshots

Summarize the current scope and the phase I am requesting. Mention any conflict
between the documents and the existing source code. Then implement only
[PHASE NAME/NUMBER]. Do not start the next phase automatically.
```

---

# Part II — Implementation with Codex

## 12. Start by asking what exists and what comes next

The main Codex session began by asking it to read the documents and explain the current position.

### Recovered and edited prompt

```text
Read Build_PLAN.md and PRODUCT_SPECIFICATION.md.
Tell me what has already been completed and what the next implementation step is.
```

Before Phase 1, the user asked for a short execution summary rather than immediately authorizing changes.

### Recovered and edited prompt

```text
The design-screen folder contains the screens planned at the beginning.
Read those screens and DESIGN.md carefully.

Before implementing Phase 1, give me a short list of three or four bullet
points explaining how you will build it. Use the Vercel-inspired design rules
from DESIGN.md where relevant.
```

Approval was then given explicitly:

```text
Yes, implement Phase 1.
```

### Lesson

A useful pattern is:

1. Ask the coding agent to inspect.
2. Ask it to summarize the intended change.
3. Approve the bounded phase.
4. Verify the result before moving on.

---

## 13. Use a repeatable implementation prompt for each phase

### Reusable phase prompt

```text
Read PRODUCT_SPECIFICATION.md, DESIGN.md, Build_PLAN.md, and the existing code.

Implement only Phase [number/name].

Requirements:
- preserve the current architecture and design system;
- reuse existing components where appropriate;
- do not add deferred V2 features;
- keep AI credentials on the server;
- explain the files changed;
- run the smallest relevant tests, type checks, and browser checks;
- report anything that still needs manual verification.

Before editing, summarize your intended work in four bullets.
```

This prompt is more reliable than repeatedly saying “continue” because it restores boundaries and acceptance criteria.

---

## 14. Git and pull-request workflow

The user later defined a repeatable Git workflow.

### Recovered and edited prompt

```text
For every remaining phase:

1. Pick the phase being implemented.
2. Create a new feature branch.
3. Implement and test the phase.
4. Push the source changes.
5. Create a pull request to main.
6. Merge it after verification.
7. Repeat for the next phase.

Do not include planning documents, design references, sample data, screenshots,
or learning notes in feature pull requests unless the phase specifically
requires them.

I will provide the real API key manually when the AI integration phase begins.
```

### Verified repository progression

| Stage | Commit | Pull request |
| --- | --- | --- |
| Initial Next.js and component setup | `d806b0a` | Before phase PR loop |
| Shared design system and app shell | `a1674bb` | Before phase PR loop |
| Import and triage experience | `7d46a60` | PR #1 |
| Planning docs and dashboard mockups | `d9a8c65` | PR #2 |
| Complaint details and activity | `45b5321` | PR #3 |
| WhatsApp work-order export | `642963e` | PR #4 |
| Gemma API integration | `683d8e0` | PR #5 |
| Triage polish and model verification | `db1935b` | PR #6 |
| Overview dashboard | `3e752bd` | PR #7 |

---

## 15. Integrate the AI only after the workflow works

Before the real API was connected, the import screen used an explicit deterministic demo mode. This allowed the UI, review workflow, complaint storage, and board to be completed without spending model quota.

### Recovered intent

```text
I have added the API configuration. Use it carefully because the free tier has
rate limits. Tell me whether you have enough information to continue with the
next phase.
```

### Better reusable prompt

```text
Integrate the configured model endpoint into the existing server-side triage
route.

Constraints:
- never expose credentials to the browser;
- do not silently fall back to demo data when the live request fails;
- validate the model's JSON response;
- limit input and output sizes;
- add a timeout;
- show sanitized user-facing errors;
- preserve the original message, reporter, timestamp, and source ID using
  trusted application logic;
- minimize live requests because the account uses a limited free quota.

Use mocked provider responses for most tests. Make only one small live request
if credentials are available and a live check is necessary.
```

### What the implementation actually protected

The merged AI phase:

- kept credentials server-side;
- allowed only the expected Google API host and Gemma endpoint pattern;
- bounded request and response sizes;
- limited the number of analyzed messages;
- validated categories, priorities, and field lengths;
- rejected malformed or incomplete model output;
- returned sanitized errors;
- kept demo mode explicit instead of silently substituting it.

---

## 16. Debugging prompt

The project occasionally encountered errors and the implementation work moved into Codex. The safest debugging approach is to request diagnosis before edits.

### Reusable debugging prompt

```text
The following problem occurs:
[error message or visible symptom]

Steps to reproduce:
1. [step]
2. [step]
3. [step]

Inspect the relevant files and explain the root cause before editing.
Apply the smallest correct fix. Do not rewrite unrelated components or install
a new dependency unless the existing stack cannot solve the problem.

After the fix, run a focused test and verify the affected browser flow.
```

Avoid using only “fix it” when the agent does not already have enough context. A screenshot is useful, but reproduction steps and expected behavior make the fix much safer.

---

# Part III — What Was Built Phase by Phase

## 17. Phase outcomes

### Foundation

- Next.js App Router project initialized.
- TypeScript, Tailwind, UI primitives, ReUI Kanban, and shared tokens added.
- Wireframe and base component structure created.

### Shared shell

- Sidebar and header.
- Routes for Overview, Import, Complaints, and Work Orders.
- Light-only Vercel-inspired visual system.

### Import and triage

- Paste or upload WhatsApp text.
- Load realistic sample chat.
- Parse messages.
- Run deterministic demo triage.
- Edit and select extracted complaints.
- Store selected complaints in the browser.

### Complaints board

- Todo, In Progress, and Resolved columns.
- Drag-and-drop and direct status controls.
- Filters, search, board view, and list view.
- Persisted card status and order.

### Complaint details

- Side drawer.
- AI summary and extracted fields.
- Original message.
- Status activity.
- Quick status actions.

### Work-order export

- Grouped maintenance dispatch text.
- Priority ordering.
- WhatsApp-ready formatting.
- Clipboard action.

### Real model integration

- Server-only Gemma request.
- Structured JSON validation.
- Rate-limit-conscious verification.
- Explicit demo mode and safe error handling.

### Polish

- Better parsing for multiline and Android-style messages.
- Loading, empty, and error states.
- Keyboard-accessible tabs.
- Offline regression tests.
- Browser accessibility and workflow checks.

### Overview

- Total, open, unresolved P0, and resolved counts.
- Category and status summaries.
- Urgent and missing-location follow-up.
- Recent activity.
- Reuse of complaint details and work-order export.

---

# Part IV — Mistakes and Corrections

## 18. What could have been done better?

### 1. “Open source” and “open weight” were mixed together

For accurate technical communication, describe Gemma as an **open-weight model** and mention the exact license and model ID being used.

### 2. “Gemini API” and “Gemma model” were initially confused

The API platform and the model are separate decisions. Record both explicitly:

```text
Provider/API platform: Google AI Studio generateContent API
Model: exact Gemma model ID
License/terms: link to the model terms
```

### 3. The initial product was too large

The early mockups included analytics, staff management, settings, dedicated work orders, and multiple review pages. Cutting these features made the core demo clearer.

### 4. Some prompts became too short

Messages such as “continue,” “next,” or “work” are acceptable only when the current context is stable. In a new chat or after an error, restate the phase, files, and acceptance criteria.

### 5. Planning documents became slightly stale

The app evolved while some documentation still described older phase status or framework versions. The source code and `package.json` should be treated as implementation truth; planning documents should be updated after each merged phase.

### 6. Mobile acceptance remained manual

Automated desktop checks were strong, but the final mobile visual acceptance was intentionally left for manual review. This should be listed honestly rather than claiming complete cross-device verification.

---

# Part V — Student Prompt Pack

## 19. Master prompt: from problem statement to MVP

```text
I am working on this problem statement:
[paste the problem statement]

Here is my interpretation:
[explain it in your own words]

Here is the product idea I currently have:
[describe the workflow]

Act as a critical product mentor. Do not build anything yet.

1. Tell me what I understood correctly.
2. Correct weak or incorrect assumptions.
3. Identify the real users and their pain points.
4. Propose the smallest demo-ready MVP.
5. List features that should be deferred.
6. Ask only questions that would change the product decision.
```

## 20. Master prompt: wireframe and design direction

```text
Using the approved MVP, create a text wireframe showing:
- page hierarchy;
- primary user flow;
- key actions;
- important data on each screen;
- empty, loading, validation, and error states.

Then review the attached visual references. Do not copy their branding.
Extract reusable principles for typography, spacing, color, surfaces, borders,
and component density. Write these rules into DESIGN.md.

Do not implement the production application yet.
```

## 21. Master prompt: product specification

```text
Create PRODUCT_SPECIFICATION.md for the approved MVP.

Include:
- executive summary;
- problem statement;
- current workflow and pain points;
- users and needs;
- exact MVP features;
- non-goals and deferred features;
- routes/screens;
- key data fields;
- important user flows;
- technical constraints;
- security and privacy constraints;
- acceptance criteria.

Do not add features that were not approved.
```

## 22. Master prompt: implementation plan

```text
Read PRODUCT_SPECIFICATION.md and DESIGN.md.
Create Build_PLAN.md with small, testable phases.

For each phase include:
- goal;
- user-visible outcome;
- likely files/modules;
- behavior and edge cases;
- tests and browser verification;
- dependencies;
- definition of done.

Put the real AI integration after the non-AI workflow is usable.
Do not implement until I approve the plan.
```

## 23. Master prompt: implement one phase

```text
Read PRODUCT_SPECIFICATION.md, DESIGN.md, Build_PLAN.md, and the existing code.

Implement only Phase [number/name]. Before editing, summarize your approach in
four bullets.

Rules:
- preserve existing behavior;
- follow the approved design system;
- reuse current components;
- do not add deferred features;
- make the smallest coherent change;
- run focused tests and browser checks;
- list manual checks honestly.

When complete, summarize the changed files and evidence of verification.
```

## 24. Master prompt: code review before merge

```text
Review the current branch against the approved phase.

Check for:
- missing acceptance criteria;
- regressions;
- unnecessary dependencies;
- exposed secrets;
- weak input/output validation;
- accessibility problems;
- loading, empty, and error states;
- desktop and mobile overflow;
- documentation that is now inaccurate.

Fix only confirmed issues, run focused verification, and prepare a concise pull
request summary. Do not merge until the checks pass.
```

---

# Part VI — Recommended Classroom Explanation

## 25. Short version to tell students

> I did not begin by asking AI to build the entire application. First, I explained my understanding of the problem and asked the AI to correct me. Then I reduced the product to a small MVP, created a wireframe, documented the design system, wrote a product specification, and prepared a phased implementation plan. After that, Codex implemented one phase at a time using Git branches and pull requests. The AI output was reviewed, tested, and corrected throughout the process. The speed came from structured context and verification—not from one magic prompt.

## 26. The core workflow

```text
Problem statement
        ↓
Explain your understanding
        ↓
Ask AI to challenge assumptions
        ↓
Choose a small MVP
        ↓
Wireframe and design references
        ↓
PRODUCT_SPECIFICATION.md + DESIGN.md
        ↓
Phase-by-phase Build_PLAN.md
        ↓
Implement one phase per Git branch
        ↓
Test → review → pull request → merge
        ↓
Integrate real AI safely
        ↓
Polish and demonstrate the complete user flow
```

---

## 27. Final takeaway

Vibe coding works best when the developer remains the decision-maker.

AI can help you:

- understand a problem;
- challenge assumptions;
- write specifications;
- explore UI structure;
- implement bounded features;
- diagnose failures;
- test and review code.

But the developer must still:

- define the real problem;
- approve the scope;
- verify technical claims;
- protect credentials;
- review generated code;
- test the product;
- explain the final system in their own words.

The most reusable artifact is not the chat history. It is the combination of a clear product specification, a practical design system, a phased plan, and a verified Git history.
