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
 * Entries keyed by an id — projects and skills — are *merged*, not replaced. A
 * field left blank keeps whatever it already had, so correcting one link is a
 * one-field issue instead of a retype of the whole entry. The forms therefore
 * mark almost nothing `required`; completeness is demanded here, and only of a
 * genuinely new entry, because that is the only case where a blank cannot be
 * inherited from somewhere.
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

/*
  Collects only the fields the author actually filled in. `parseIssueForm` has
  already dropped `_No response_`, so a key being absent here means "left
  blank", which on an update means "leave this as it is". That distinction is
  the whole reason adding one link is a one-field issue rather than a retype of
  the entry.
*/
function provided(f, spec) {
  const out = {};
  for (const [key, label, transform] of spec) {
    const raw = f.get(label);
    if (raw === undefined) continue;
    out[key] = transform ? transform(raw) : raw;
  }
  return out;
}

/* Rebuild in a fixed key order so an update diffs as the changed line alone. */
const ordered = (object, keys) => {
  const out = {};
  for (const key of keys) if (object[key] !== undefined) out[key] = object[key];
  return out;
};

const PROJECT_KEYS = [
  'id',
  'eyebrow',
  'title',
  'shortDescription',
  'featureHighlights',
  'techStackTags',
  'statValue',
  'statLabel',
  'githubUrl',
  'liveDemoUrl',
  'availabilityNote',
];

function upsertProject(f) {
  const id = f.get('Short id');
  if (!id) fail('Short id is required.');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    fail(`Short id must be lowercase and hyphenated, got "${id}".`);
  }

  const projects = read('projects.json');
  const index = projects.findIndex((p) => p.id === id);
  const current = index === -1 ? null : projects[index];

  const fields = provided(f, [
    ['eyebrow', 'Eyebrow'],
    ['title', 'Title'],
    ['shortDescription', 'Description'],
    ['featureHighlights', 'Highlights', lines],
    ['techStackTags', 'Tech stack', commas],
    ['statValue', 'Pull-stat figure'],
    ['statLabel', 'Pull-stat label'],
    ['githubUrl', 'GitHub URL'],
    ['liveDemoUrl', 'Live demo URL'],
    ['availabilityNote', 'Availability note'],
  ]);

  if (current && Object.keys(fields).length === 0) {
    fail(`Nothing to change — "${id}" already exists and every other field was left blank.`);
  }

  const entry = ordered({ ...current, ...fields, id }, PROJECT_KEYS);

  /*
    Work.tsx renders the links when there are any and the availability note
    only when there are none, so the two are mutually exclusive by design.
    Merging would otherwise leave a "no public repo" line sitting in the file
    beside the repo link that replaced it — invisible on the page, and a lie to
    the next person who reads the JSON. Whichever the author supplied this time
    is the one they meant, so it evicts the other.
  */
  if (fields.githubUrl || fields.liveDemoUrl) delete entry.availabilityNote;
  else if (fields.availabilityNote) {
    delete entry.githubUrl;
    delete entry.liveDemoUrl;
  }

  // Completeness is only demanded of a *new* entry. An update inherits whatever
  // it does not mention, so these are already satisfied.
  if (!current) {
    for (const [key, label] of [
      ['eyebrow', 'Eyebrow'],
      ['title', 'Title'],
      ['shortDescription', 'Description'],
    ]) {
      if (!entry[key]) fail(`${label} is required when adding a new project.`);
    }
    if (!entry.featureHighlights?.length) fail('Give the new project at least one highlight.');
    if (!entry.techStackTags?.length) fail('Give the new project at least one tech-stack tag.');
  }

  if (!entry.githubUrl && !entry.liveDemoUrl && !entry.availabilityNote) {
    fail(
      'Give the project a GitHub URL, a live demo URL, or an availability note — otherwise the panel has nothing to close on.'
    );
  }

  if (current) projects[index] = entry;
  else projects.unshift(entry);

  write('projects.json', projects);
  const changed = Object.keys(fields).join(', ');
  return current
    ? `Updated project **${entry.title}** (\`${id}\`) — changed: ${changed}.`
    : `Added project **${entry.title}** (\`${id}\`).`;
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

const SKILL_KEYS = [
  'id',
  'symbol',
  'name',
  'category',
  'proficiency',
  'yearsExperience',
  'description',
  'relatedProjectIds',
  'row',
  'col',
];

function upsertSkill(f) {
  const id = f.get('Short id');
  if (!id) fail('Short id is required.');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail(`Short id must be lowercase and hyphenated, got "${id}".`);

  const techStack = read('techStack.json');
  const index = techStack.findIndex((e) => e.id === id);
  const current = index === -1 ? null : techStack[index];

  const fields = provided(f, [
    ['name', 'Name'],
    ['symbol', 'Symbol'],
    ['category', 'Category'],
    ['proficiency', 'Proficiency'],
    ['yearsExperience', 'Years of experience'],
    ['description', 'Description'],
    ['relatedProjectIds', 'Related project ids', commas],
  ]);

  if (current && Object.keys(fields).length === 0) {
    fail(`Nothing to change — "${id}" already exists and every other field was left blank.`);
  }

  if (fields.symbol !== undefined && !/^[A-Za-z0-9]{1,2}$/.test(fields.symbol)) {
    fail(`Symbol must be one or two letters, got "${fields.symbol}".`);
  }
  if (fields.yearsExperience !== undefined) {
    if (!/^\d+$/.test(fields.yearsExperience)) {
      fail(`Years of experience must be a whole number, got "${fields.yearsExperience}".`);
    }
    fields.yearsExperience = Number(fields.yearsExperience);
  }

  if (fields.relatedProjectIds) {
    const known = new Set(read('projects.json').map((p) => p.id));
    const unknown = fields.relatedProjectIds.filter((pid) => !known.has(pid));
    if (unknown.length) {
      fail(`Unknown project id(s): ${unknown.join(', ')}. Known ids: ${[...known].join(', ')}.`);
    }
  }

  const merged = { ...current, ...fields, id };

  if (!current) {
    for (const [key, label] of [
      ['name', 'Name'],
      ['symbol', 'Symbol'],
      ['category', 'Category'],
      ['proficiency', 'Proficiency'],
      ['description', 'Description'],
    ]) {
      if (!merged[key]) fail(`${label} is required when adding a new skill.`);
    }
    if (merged.yearsExperience === undefined) fail('Years of experience is required when adding a new skill.');
    merged.relatedProjectIds ??= [];
    /*
      Only a new element is placed. An update keeps the cell it already holds,
      because the grid is a hand-tuned silhouette — re-placing on, say, a
      category change would punch a hole in one block and shunt a tile into
      another. A moved tile is a deliberate edit of techStack.json, not a
      side effect of correcting a typo.
    */
    Object.assign(merged, placeElement(techStack, merged.category));
  }

  const entry = ordered(merged, SKILL_KEYS);
  if (current) techStack[index] = entry;
  else techStack.push(entry);

  write('techStack.json', techStack);
  return current
    ? `Updated skill **${entry.name}** (\`${id}\`) — changed: ${Object.keys(fields).join(', ')}.`
    : `Added skill **${entry.name}** (${entry.symbol}) to *${entry.category}* at row ${entry.row}, column ${entry.col}.`;
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
  'content:skill': upsertSkill,
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
