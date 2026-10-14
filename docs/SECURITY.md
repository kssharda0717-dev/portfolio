# Security

**Last updated:** 2026-10-07 · **Classification:** public marketing site

---

## 1. What this is

A statically rendered, single-route personal portfolio. **No backend, no
database, no authentication, no user input, no secrets.** The deployed artifact
is HTML, CSS, JS and media files.

This document exists so the small surface that *does* exist stays understood,
not because the risk is high.

## 2. Threat model

| Asset | Threat | Exposure | Mitigation |
|---|---|---|---|
| Site content | Defacement via hosting account | Low | Strong auth + 2FA on the host and the Git remote |
| Kartik's email | Scraping → spam | **Accepted** | Published deliberately; it is a contact channel |
| Résumé PDF | Public download | **Accepted** | Intentionally public; check it carries no address/phone before deploy |
| Visitors | XSS | Very low | See §3 |
| Visitors | Malicious third-party script | **None** | Zero third-party runtime scripts |
| Supply chain | Compromised npm package | Low–moderate | 5 runtime deps, lockfile committed, see §4 |
| `main` branch | A stranger's issue becoming a commit | Low | The content workflow runs only for the repo owner, see §6 |

**Out of scope:** there is no server to attack, no session to hijack, no data
to exfiltrate, and no privilege boundary to escalate across.

## 3. Application surface

### No user input
There are no forms, no search, no query-parameter handling, no `localStorage`
reads, no URL-derived rendering. **The classic injection paths do not exist
here.** Contact is a `mailto:` link.

### The one `dangerouslySetInnerHTML`

`src/app/layout.tsx:79` injects the Person JSON-LD:

```tsx
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
```

**Assessed safe:** the input is `portfolioConfig` — a build-time constant
authored by the site owner, not user or network data. `JSON.stringify` output
is placed in a non-executable `application/ld+json` block.

> **Rule:** this stays safe *only* while the config is trusted and static. If
> any config value ever becomes remote or user-supplied, this line must be
> escaped (`</script>` and `<!--` sequences) or replaced.

It is the **only** `dangerouslySetInnerHTML` in the codebase. Keep it that way.

### External links

All five `target="_blank"` links carry **`rel="noreferrer noopener"`** —
verified in `About.tsx` (2), `Work.tsx` (2) and `Contact.tsx` (1). This blocks
reverse tabnabbing and referrer leakage.

**Any new external link must carry the same `rel`.**

### Third-party requests at runtime

**None.** Fonts are self-hosted at build time by `next/font/google`. Icons are
compiled into the bundle. No analytics, no tag manager, no embeds, no CDN
scripts. The page makes no cross-origin request.

## 4. Dependency posture

Five runtime dependencies: `next`, `react`, `react-dom`, `lucide-react`,
`simple-icons`. A deliberately small surface ([RULES](RULES.md) R-8).

### Current `npm audit`: 5 high, 0 critical — all dev-only

```
@next/eslint-plugin-next · eslint-config-next · fast-glob · micromatch · braces
```

**All five are transitive under `eslint-config-next`** — lint tooling that runs
on Kartik's machine and is **never shipped to the browser**. `postcss` and
`braces` are pinned forward via `overrides` in `package.json`.

**Accepted** rather than forcing a major Next/ESLint upgrade for a risk that
does not exist in the deployed artifact. Recorded as
[DECISIONS](DECISIONS.md) D-016, revisit on the next Next.js major
([TASKS](TASKS.md) T-10).

### Practices

- `package-lock.json` is committed — builds are reproducible.
- Run `npm audit` quarterly and before any deploy.
- Vet new dependencies against R-8; prefer zero-dependency, CC0/MIT packages.
- `simple-icons` is CC0; `lucide-react` is ISC.

## 5. Privacy

**No analytics, no cookies, no tracking, no consent banner required.** Nothing
about a visitor is collected, stored or transmitted anywhere.

Personal data published **deliberately** by the owner: name, professional
history, city (Noida, India), email (`kssharda0717@gmail.com`), GitHub,
LinkedIn, a photograph, a voice recording and a résumé PDF.

> **Pre-deploy check:** confirm `public/Kartik_Sharda_Resume.pdf` does not
> contain a home address, phone number or signature image. A résumé sent to a
> named recruiter and a résumé on a public URL are different documents.

## 6. The content pipeline — the one real attack surface

[CONTENT-PIPELINE](CONTENT-PIPELINE.md) lets a GitHub issue become a commit on
`main`. **Issues are public and anyone can open one**, so this is the only part
of the project where an untrusted input reaches something that matters.

### The guard

`.github/workflows/content-update.yml` runs its job only when **both** hold:

```yaml
contains(github.event.issue.labels.*.name, 'content') &&
github.event.issue.author_association == 'OWNER'
```

`OWNER` is evaluated by GitHub from the issue author's relationship to the
repository; it is not derived from the issue body and cannot be spoofed by what
a submitter types. A stranger's issue is simply never processed.

> **If the repo ever gains collaborators**, `OWNER` stops being the right
> predicate — a collaborator is not an `OWNER`, and a repo with maintainers may
> want `OWNER, MEMBER`. Widen it deliberately, never by accident.

### What a hostile body could try, and why it fails

| Attempt | Outcome |
|---|---|
| Shell metacharacters in a field | The body reaches the script through `env:`, never interpolated into a `run:` line. `${{ github.event.issue.body }}` is **not** expanded inside a shell command anywhere in the workflow. |
| Path traversal in an id | Ids are matched against `^[a-z0-9]+(-[a-z0-9]+)*$`; nothing from the issue is used to build a file path. The five target files — `certifications`, `projects`, `techStack`, `role`, `experience` — are hardcoded string literals. |
| Malformed JSON | The script constructs objects and `JSON.stringify`s them. It never concatenates strings into JSON. |
| Content that breaks the build | `tsc --noEmit`, `eslint` and `next build` all run **before** the commit. A failure pushes nothing and comments the error. |
| Script injection via `voiceTranscript` or any config string | The single `dangerouslySetInnerHTML` (§3) is JSON-LD built from the config. The pipeline cannot write to the fields it uses, and the OWNER guard means the author is the site owner regardless. |

### Permissions

The workflow requests `contents: write` and `issues: write` — the minimum to
commit and to reply. It uses the default `GITHUB_TOKEN`; **no PAT, no secret.**

### Review the diff anyway

The Action commits to `main` unattended. Watch the commit feed. The commit
message quotes the change and the body links the issue, so an unexpected edit is
visible in `git log` without opening anything.

## 7. Recommended response headers

Set at the host (Vercel `headers()` or equivalent). Not yet configured —
fold into [TASKS](TASKS.md) T-4.

```
Content-Security-Policy: default-src 'self'; img-src 'self' data:;
  media-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
  font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
X-Frame-Options: DENY
```

`'unsafe-inline'` is required for Next's inline bootstrap and the JSON-LD
block. A nonce-based policy is stricter but needs per-request rendering, which
conflicts with static export (D-003) — not worth it for a site with no secrets.

## 8. Operational

- **2FA on the Git remote and the hosting account.** With no backend, the
  hosting account *is* the attack surface — and with the content pipeline, so is
  the GitHub account (§6).
- **No secrets in the repo.** There are none today and there is no reason for
  one to appear — the site has no API to authenticate against. Never commit a
  `.env`.
- **Protect `main`** once the remote exists; deploy from it.

## 9. Reporting

Issues: **kssharda0717@gmail.com**. There is no bounty and no SLA; this is a
personal site.
