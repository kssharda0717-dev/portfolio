#!/usr/bin/env node
/**
 * apply-content-issue.mjs — turns a filled-in GitHub issue form into an edit of
 * `content/*.json`.
 *
 * Run by .github/workflows/content-update.yml. Reads the issue from the
 * environment, writes the files, prints a one-line summary on stdout for the
 * workflow to quote back into the issue. Exits non-zero with a human-readable
 * message on any validation failure, which leaves the issue open.
 *
 * It deliberately does no type checking of its own beyond what it can say
 * clearly: `tsc --noEmit` runs afterwards and is the real gate.
 *
 * Local dry run:
 *   ISSUE_LABELS='content:certification' ISSUE_BODY="$(cat sample.md)" \
 *     node scripts/apply-content-issue.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');

const read = (name) => JSON.parse(readFileSync(join(CONTENT, name), 'utf8'));
const write = (name, value) =>
  writeFileSync(join(CONTENT, name), `${JSON.stringify(value, null, 2)}\n`);

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

/* ── Parsing ────────────────────────────────────────────────────────────────
   An issue form renders as `### <field label>` followed by the answer. An
   untouched optional field renders the literal `_No response_`, which is the
   only way to tell "left blank" from "typed nothing".                        */

function parseIssueForm(body) {
  const fields = new Map();
  const sections = body.replace(/\r\n/g, '\n').split(/^### +/m).slice(1);

  for (const section of sections) {
    const newline = section.indexOf('\n');
    if (newline === -1) continue;
    const label = section.slice(0, newline).trim();
    const value = section.slice(newline + 1).trim();
    if (value === '_No response_' || value === '') continue;
    fields.set(label, value);
  }
  return fields;
}

const lines = (value) =>
  value
    .split('\n')
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);

const commas = (value) =>
  value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

/* ── Handlers ──────────────────────────────────────────────────────────── */

function addCertification(f) {
  const title = f.get('Certification title');
  const issuer = f.get('Issuer');
  const issueYear = f.get('Year issued');
  if (!title || !issuer || !issueYear) fail('Certification title, issuer and year are all required.');
  if (!/^\d{4}$/.test(issueYear)) fail(`Year issued must be four digits, got "${issueYear}".`);

  const certifications = read('certifications.json');
  if (certifications.some((c) => c.title === title && c.issuer === issuer)) {
    fail(`"${title}" from ${issuer} is already listed.`);
  }

  // Newest first: the Experience section renders this array in order.
  certifications.unshift({ title, issuer, issueYear });
  write('certifications.json', certifications);
  return `Added certification **${title}** (${issuer}, ${issueYear}).`;
}

function upsertProject(f) {
  const id = f.get('Short id');
  if (!id) fail('Short id is required.');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    fail(`Short id must be lowercase and hyphenated, got "${id}".`);
  }

  const githubUrl = f.get('GitHub URL');
  const availabilityNote = f.get('Availability note');
  if (!githubUrl && !availabilityNote) {
    fail('Give the project either a GitHub URL or an availability note — otherwise the panel has nothing to close on.');
  }

  const entry = {
    id,
    eyebrow: f.get('Eyebrow'),
    title: f.get('Title'),
    shortDescription: f.get('Description'),
    featureHighlights: lines(f.get('Highlights') ?? ''),
    techStackTags: commas(f.get('Tech stack') ?? ''),
  };
  for (const [key, label] of [
    ['eyebrow', 'Eyebrow'],
    ['title', 'Title'],
    ['shortDescription', 'Description'],
  ]) {
    if (!entry[key]) fail(`${label} is required.`);
  }
  if (entry.featureHighlights.length === 0) fail('Give the project at least one highlight.');
  if (entry.techStackTags.length === 0) fail('Give the project at least one tech-stack tag.');

  const statValue = f.get('Pull-stat figure');
  const statLabel = f.get('Pull-stat label');
  if (statValue) entry.statValue = statValue;
  if (statLabel) entry.statLabel = statLabel;
  const liveDemoUrl = f.get('Live demo URL');
  if (liveDemoUrl) entry.liveDemoUrl = liveDemoUrl;
  if (githubUrl) entry.githubUrl = githubUrl;
  if (availabilityNote) entry.availabilityNote = availabilityNote;

  const projects = read('projects.json');
  const existing = projects.findIndex((p) => p.id === id);
  if (existing === -1) {
    projects.unshift(entry);
  } else {
    projects[existing] = entry;
  }
  write('projects.json', projects);
  return `${existing === -1 ? 'Added' : 'Updated'} project **${entry.title}** (\`${id}\`).`;
}

/*
  The periodic table has hand-placed coordinates and deliberate gaps, which is
  the one thing a content edit could not previously do without opening the
  file. Rather than guess at the aesthetic, this fills the first free cell in
  the rows that category already occupies, and only starts a new row if those
  are full — so the existing silhouette is never rearranged.
*/
function placeElement(techStack, category) {
  const occupied = new Set(techStack.map((e) => `${e.row}:${e.col}`));
  const categoryRows = [...new Set(techStack.filter((e) => e.category === category).map((e) => e.row))].sort(
    (a, b) => a - b
  );
  const allRows = [...new Set(techStack.map((e) => e.row))].sort((a, b) => a - b);
  const candidates = [...categoryRows, ...allRows, (allRows.at(-1) ?? 0) + 1];

  for (const row of candidates) {
    for (let col = 1; col <= 10; col += 1) {
      if (!occupied.has(`${row}:${col}`)) return { row, col };
    }
  }
  return fail('The periodic grid is full — add a row by hand.');
}

function addSkill(f) {
  const id = f.get('Short id');
  const name = f.get('Name');
  const symbol = f.get('Symbol');
  const category = f.get('Category');
  const proficiency = f.get('Proficiency');
  const years = f.get('Years of experience');
  const description = f.get('Description');

  if (!id || !name || !symbol || !category || !proficiency || !years || !description) {
    fail('Every field except "Related project ids" is required.');
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail(`Short id must be lowercase and hyphenated, got "${id}".`);
  if (!/^[A-Za-z0-9]{1,2}$/.test(symbol)) fail(`Symbol must be one or two letters, got "${symbol}".`);
  if (!/^\d+$/.test(years)) fail(`Years of experience must be a whole number, got "${years}".`);

  const techStack = read('techStack.json');
  if (techStack.some((e) => e.id === id)) fail(`A skill with id "${id}" already exists.`);

  const relatedProjectIds = commas(f.get('Related project ids') ?? '');
  const known = new Set(read('projects.json').map((p) => p.id));
  const unknown = relatedProjectIds.filter((pid) => !known.has(pid));
  if (unknown.length) {
    fail(`Unknown project id(s): ${unknown.join(', ')}. Known ids: ${[...known].join(', ')}.`);
  }

  const { row, col } = placeElement(techStack, category);
  techStack.push({
    id,
    symbol,
    name,
    category,
    proficiency,
    yearsExperience: Number(years),
    description,
    relatedProjectIds,
    row,
    col,
  });
  write('techStack.json', techStack);
  return `Added skill **${name}** (${symbol}) to *${category}* at row ${row}, column ${col}.`;
}

function updateRole(f) {
  const changes = [];
  const role = read('role.json');

  for (const [key, label] of [
    ['roleTitle', 'Role title'],
    ['heroSubline', 'Hero subline'],
    ['headline', 'Long-form positioning'],
    ['seoTitle', 'Share-preview title'],
    ['seoDescription', 'Share-preview description'],
  ]) {
    const value = f.get(label);
    if (value && value !== role[key]) {
      role[key] = value;
      changes.push(label);
    }
  }
  if (changes.length) write('role.json', role);

  const jobRole = f.get('Job role');
  if (jobRole) {
    const organisation = f.get('Organisation');
    const period = f.get('Period');
    const highlights = lines(f.get('Highlights') ?? '');
    if (!organisation || !period || highlights.length === 0) {
      fail('A new job needs an organisation, a period and at least one highlight.');
    }
    const experience = read('experience.json');
    // Newest first: the timeline renders this array in order.
    experience.unshift({ role: jobRole, organisation, period, highlights });
    write('experience.json', experience);
    changes.push(`new role at ${organisation}`);
  }

  if (changes.length === 0) fail('Nothing to change — every field was left blank.');
  return `Updated: ${changes.join(', ')}.`;
}

/* ── Dispatch ──────────────────────────────────────────────────────────── */

const HANDLERS = {
  'content:certification': addCertification,
  'content:project': upsertProject,
  'content:skill': addSkill,
  'content:role': updateRole,
};

const labels = (process.env.ISSUE_LABELS ?? '')
  .split(',')
  .map((label) => label.trim())
  .filter(Boolean);

const kind = labels.find((label) => label in HANDLERS);
if (!kind) {
  fail(
    `No content label found on this issue. Expected one of: ${Object.keys(HANDLERS).join(', ')}. ` +
      'Use one of the issue forms rather than a blank issue.'
  );
}

const body = process.env.ISSUE_BODY ?? '';
if (!body.trim()) fail('The issue body is empty.');

console.log(HANDLERS[kind](parseIssueForm(body)));
