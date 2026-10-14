# Kartik Sharda — Portfolio

A single-page portfolio for an AI & automation engineer. Next.js 15 App Router,
React 19, Tailwind v4, TypeScript. Statically rendered, five runtime
dependencies, no backend.

```bash
npm install
npm run dev        # localhost:3000
```

| | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |

> ⚠️ **Never run `npm run build` while `npm run dev` is running.** They share
> `.next` and the build will wipe the dev server. Recovery: stop dev,
> `rm -rf .next`, restart.

---

## Updating content

### The short version: open an issue

**Certifications, projects, skills and your role are updated by filling in a
form** — Issues → New issue → pick a form. An Action edits the JSON,
type-checks and builds it, commits, and the site redeploys. Nothing to install,
nothing to clone.

Changing one thing about something that already exists is a **two-box issue**:
the id, and the field you are changing. The project and skill forms merge —
anything left blank keeps what it had.

See **[docs/CONTENT-PIPELINE.md](docs/CONTENT-PIPELINE.md)**, including the two
repo settings the pipeline needs before any of it fires.

### By hand

Content lives in two places and **never** in `src/`:

| | |
|---|---|
| [`content/*.json`](content/) | The things that grow — and what the Action edits |
| [`portfolio.config.ts`](portfolio.config.ts) | The types, the prose, the settings |

Everything is typed — a malformed entry fails the type check instead of
breaking the page.

After any edit: `npx tsc --noEmit && npm run lint`, then look at it in the browser.

### Add a certification — 1 line

In `content/certifications.json`. Keep newest first.

```json
{ "title": "Fusion HCM Implementation Professional", "issuer": "Oracle", "issueYear": "2027" },
```

### Change your role or title

All five strings are in `content/role.json`:

```json
{
  "roleTitle":      "AI Solutions Engineer",            // hero H1, JSON-LD jobTitle
  "heroSubline":    "Enterprise payroll · agentic AI",  // line under the H1
  "headline":       "Oracle Fusion HCM Consultant · …", // long-form positioning
  "seoTitle":       "Kartik Sharda — …",                // tab + share preview
  "seoDescription": "…"
}
```

Add the job itself to `content/experience.json`, newest first.

### Add a project

In `content/projects.json`. Give it **either** `githubUrl` **or**
`availabilityNote` — the note renders in place of the link for work that can't
be published.

```json
{
  "id": "new-thing",
  "eyebrow": "Agentic AI · RAG",
  "title": "New Thing — What It Does",
  "shortDescription": "One or two sentences on the problem it solves.",
  "featureHighlights": ["…", "…", "…"],
  "techStackTags": ["Python", "FastAPI", "Postgres"],
  "githubUrl": "https://github.com/…"
}
```

`id` is permanent — `relatedProjectIds` in the stack points at it. The desktop
accordion is `h-[38rem]`; a body longer than ~606px scrolls inside its panel.

### Update an experience entry

In `content/experience.json`. The bullets are what unfold as the timeline
scrolls — keep them to 3–5 so the card stays readable.

### Add a skill to the periodic table

In `content/techStack.json`. **This is the one entry with friction by hand** —
you must pick a free `row` / `col` in the 10-column grid yourself (the gaps are
deliberate). The *Add or update a skill* form does this for you, and leaves the
cell alone on an update.

```json
{
  "id": "langgraph", "symbol": "Lg", "name": "LangGraph",
  "category": "ai",
  "proficiency": "Advanced", "yearsExperience": 1,
  "description": "What you actually used it for.",
  "relatedProjectIds": ["nexus"],
  "row": 5, "col": 10
}
```

For its brand logo, add an import to `MARKS` in
[`src/components/BrandMark.tsx`](src/components/BrandMark.tsx). If there isn't
one it falls back to the monogram — which is the periodic-table conceit anyway.

### Other common edits

| Want to change | Where |
|---|---|
| Bio paragraph | `personalInfo.bioParagraph` |
| "Outer Facts" table | `personalInfo.outerFacts[]` |
| ID card front (checklist) | `personalInfo.whatIAm[]` |
| ID card back (badge) | `personalInfo.idCard` |
| Pull quote | `personalInfo.pullQuote` |
| Metrics | `content/achievements.json` |
| Closing line + CTA | `contact` |
| Résumé PDF | Replace `public/Kartik_Sharda_Resume.pdf` |
| Hero loop / voiceover | Replace the files in `public/avatar/`, then update `personalInfo.avatar.voiceTranscript` |

---

## Documentation

| Doc | What's in it |
|---|---|
| [docs/MEMORY.md](docs/MEMORY.md) | **Start here.** Project context, current state, hard-won gotchas |
| [docs/PRD.md](docs/PRD.md) | Why the site exists, audience, scope, success criteria |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, directory layout, data flow, server/client boundary |
| [docs/DESIGN.md](docs/DESIGN.md) | Colour tokens, typography, motion, accessibility baseline |
| [docs/RULES.md](docs/RULES.md) | Binding engineering conventions + preview-browser traps |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Decision log — what was chosen, and what was rejected |
| [docs/TASKS.md](docs/TASKS.md) | Open work, prioritised |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model, dependency posture, recommended headers |
| [docs/CONTENT-PIPELINE.md](docs/CONTENT-PIPELINE.md) | Updating the site without opening an editor |

## Structure

```
content/*.json          ← the content that grows (7 files)
portfolio.config.ts     ← types, prose, settings; imports the above
.github/                issue forms + the content-update workflow
scripts/                apply-content-issue.mjs
src/app/
  layout.tsx            fonts · SEO metadata · JSON-LD · skip link
  page.tsx              section composition
  globals.css           design tokens + typographic primitives
src/components/         15 components — no personal data
public/avatar/          hero loop, voiceover, poster, photo
```

## Credits

Visual design is a re-interpretation of **Lohitha Damisetti's** portfolio —
layout, motion language and section structure. All content, the stack and the
colour system are Kartik's own. See [docs/PRD.md](docs/PRD.md) §8.
