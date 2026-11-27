#!/usr/bin/env node
/**
 * Checks the catalog and writes its table into README.md.
 *
 *   node tools/catalog.mjs          validate catalog/*.json and rewrite the table in README.md
 *   node tools/catalog.mjs --check  validate only; exit 1 if a file is invalid or the table is out of date
 *
 * A catalog file holds metadata and one link. It never holds lyrics, so the allowed fields are a closed list and
 * every text field is a single short line.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogDir = path.join(root, 'catalog');
const readme = path.join(root, 'README.md');

const LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  'es-AR': 'Spanish (Argentina)',
  fr: 'French',
  ja: 'Japanese',
  ru: 'Russian',
};
const REQUIRED = ['number', 'title', 'artist', 'languages', 'youtube', 'published', 'note'];
const OPTIONAL = ['title_en'];
const MAX_LINE = 240;
const START = '<!-- catalog:start -->';
const END = '<!-- catalog:end -->';

const oneLine = (value) => typeof value === 'string' && value.length > 0 && value.length <= MAX_LINE && !/[\r\n]/.test(value);

/** Problems in one catalog entry, as readable sentences. */
export function problems(entry, file) {
  const found = [];
  const say = (text) => found.push(`${file}: ${text}`);
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [`${file}: must hold one JSON object`];
  for (const key of REQUIRED) if (!(key in entry)) say(`missing "${key}"`);
  for (const key of Object.keys(entry)) if (!REQUIRED.includes(key) && !OPTIONAL.includes(key)) say(`unknown field "${key}"`);
  if (!Number.isInteger(entry.number) || entry.number < 1) say('"number" must be a positive whole number');
  for (const key of ['title', 'artist', 'note']) if (key in entry && !oneLine(entry[key])) say(`"${key}" must be one line of at most ${MAX_LINE} characters`);
  if ('title_en' in entry && !oneLine(entry.title_en)) say(`"title_en" must be one line of at most ${MAX_LINE} characters`);
  if (!Array.isArray(entry.languages) || entry.languages.length < 2 || new Set(entry.languages).size !== entry.languages.length) {
    say('"languages" must list at least two different languages');
  } else {
    for (const code of entry.languages) if (!(code in LANGUAGES)) say(`unknown language "${code}"`);
  }
  if (typeof entry.youtube !== 'string' || !/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/.test(entry.youtube)) say('"youtube" must be a full watch link');
  if (entry.published !== null && !(typeof entry.published === 'string' && /^\d{4}-\d{2}(-\d{2})?$/.test(entry.published))) say('"published" must be YYYY-MM-DD, YYYY-MM or null');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*\.json$/.test(file)) say('file name must be lowercase words joined by hyphens');
  return found;
}

/** Every entry in the catalog folder, newest first, with the problems found across them. */
export function readCatalog(directory = catalogDir) {
  const entries = [];
  const found = [];
  for (const file of fs.readdirSync(directory).filter((name) => name.endsWith('.json')).sort()) {
    let entry;
    try {
      entry = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    } catch (error) {
      found.push(`${file}: not valid JSON (${error.message})`);
      continue;
    }
    found.push(...problems(entry, file));
    entries.push({ file, ...entry });
  }
  for (const key of ['number', 'youtube']) {
    const seen = new Map();
    for (const entry of entries) {
      if (seen.has(entry[key])) found.push(`${entry.file}: "${key}" repeats ${seen.get(entry[key])}`);
      else seen.set(entry[key], entry.file);
    }
  }
  entries.sort((a, b) => b.number - a.number);
  return { entries, problems: found };
}

const cell = (text) => String(text).replace(/[\\|]/g, (character) => `&#${character.charCodeAt(0)};`);

/** The catalog as a Markdown table. */
export function table(entries) {
  const rows = entries.map((entry) => {
    const song = entry.title_en ? `${entry.title} (${entry.title_en})` : entry.title;
    const languages = entry.languages.map((code) => LANGUAGES[code]).join(' / ');
    return `| ${cell(song)} | ${cell(entry.artist)} | ${languages} | ${cell(entry.note)} | [Watch](${entry.youtube}) |`;
  });
  return ['| Song | Original artist | Languages | Note | Video |', '| --- | --- | --- | --- | --- |', ...rows].join('\n');
}

/** README text with the table between its two markers replaced. */
export function withTable(text, entries) {
  const from = text.indexOf(START);
  const to = text.indexOf(END);
  if (from < 0 || to < from) throw new Error('README.md is missing the catalog markers');
  return `${text.slice(0, from + START.length)}\n${table(entries)}\n${text.slice(to)}`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const { entries, problems: found } = readCatalog();
  const current = fs.readFileSync(readme, 'utf8');
  const next = withTable(current, entries);
  if (check && next !== current) found.push('README.md: the catalog table is out of date (run node tools/catalog.mjs)');
  if (found.length) {
    for (const line of found) console.error(line);
    process.exit(1);
  }
  if (!check && next !== current) fs.writeFileSync(readme, next);
  console.log(`${entries.length} catalog entries. ${check ? 'Table is current.' : 'README.md table written.'}`);
}
