// Automated weekly SEO/content audit.
//
// Two tiers, matched to what each actually needs:
//   1. Mechanical checks (title/meta length, canonical, broken links) run
//      against every URL in the live sitemap, via plain fetch(). No AI
//      needed and no cost — the prerender step (frontend/scripts/prerender-
//      seo.mjs) bakes real <title>/<meta>/canonical into the static HTML
//      GitHub Pages serves, so a plain fetch sees the real values.
//   2. Judgment checks (exam-claims accuracy, content quality/tone) need an
//      actual reader, so these go to Gemini — with Google Search grounding
//      for the exam-claims check specifically, so it's checking against
//      current information, not just its training data.
//
// Judgment checks run on a small ROTATING sample each week, not everything
// at once: this is still subject to the Gemini Developer API's own quota
// (a free-tier key is 20 requests/day per generation/sourceEngine.js's own
// comment — note a Gemini *Pro consumer subscription* does NOT raise this;
// that's a different product/billing from the API key used here). A small
// weekly sample cycles through the full exam/blog catalog over a few
// months without ever risking the daily quota.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../supabaseClient.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const SITE = 'https://fasttypinglab.com';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ── Rotation state (reuses the app_settings key-value table already used
//    for Telegram post markers — see cronService.js) ────────────────────────
async function getOffset(key) {
  const { data } = await supabase.from('app_settings').select('value').eq('key', key).maybeSingle();
  return Number(data?.value) || 0;
}
async function setOffset(key, value) {
  await supabase.from('app_settings').upsert({ key, value: String(value), updated_at: new Date().toISOString() });
}

// ── Generic extractor: given TS source containing a top-level array/object
//    literal, returns the raw text of each entry (one per top-level { }
//    block). Deliberately does NOT try to parse the file as real TypeScript
//    (no dependency, no runtime risk) — it just isolates each entry's raw
//    text by brace-counting, then hands that raw text to Gemini, which can
//    read semi-structured prose/object-literal text just fine. A parsing
//    miss on one entry only drops that entry; it can't corrupt the rest. ──
function extractTopLevelBlocks(source, afterIndex) {
  // Find the assignment's opening bracket: '[' for an array literal
  // (BLOG_POSTS), '{' for a Record/object literal (EXAM_LANDINGS). For the
  // object-literal shape, the first '{' found naively IS the wrapper's own
  // opening brace -- mistaking it for the first entry swallows the entire
  // collection as one "block". Skip past the wrapper's own bracket first.
  const eqIdx = source.indexOf('=', afterIndex);
  let p = eqIdx + 1;
  while (/\s/.test(source[p])) p++;
  const wrapperChar = source[p];
  const scanStart = wrapperChar === '{' ? p + 1 : p;

  const blocks = [];
  let i = source.indexOf('{', scanStart);
  while (i !== -1) {
    let depth = 0, start = i;
    for (; i < source.length; i++) {
      if (source[i] === '{') depth++;
      else if (source[i] === '}') {
        depth--;
        if (depth === 0) { blocks.push(source.slice(start, i + 1)); i++; break; }
      }
    }
    // Peek at what's between this block and the next '{' -- a bare '}' or
    // '];' in that gap means the wrapper itself just closed, so stop instead
    // of wandering into unrelated code (e.g. a helper const/function) below.
    const nextBrace = source.indexOf('{', i);
    if (nextBrace === -1) break;
    const between = source.slice(i, nextBrace);
    if (/\}\s*;|\]\s*;/.test(between)) break;
    i = nextBrace;
  }
  return blocks;
}

function loadDataFile(relativePath, exportName) {
  const full = join(REPO_ROOT, relativePath);
  const source = readFileSync(full, 'utf8');
  const marker = `export const ${exportName}`;
  const idx = source.indexOf(marker);
  if (idx === -1) throw new Error(`${marker} not found in ${relativePath}`);
  return extractTopLevelBlocks(source, idx);
}

// ── Tier 1: mechanical checks against the live sitemap ─────────────────────
async function fetchText(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  return { status: res.status, text: res.status === 200 ? await res.text() : '' };
}

export async function auditMechanical() {
  const findings = [];
  const { status: sitemapStatus, text: sitemapXml } = await fetchText(`${SITE}/sitemap.xml`);
  if (sitemapStatus !== 200) return { error: `sitemap.xml returned ${sitemapStatus}`, findings, checked: 0 };

  const urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  let checked = 0;

  for (const url of urls) {
    try {
      const { status, text } = await fetchText(url);
      checked++;
      if (status !== 200) { findings.push({ url, issue: `HTTP ${status}` }); continue; }

      const title = (text.match(/<title>(.*?)<\/title>/)?.[1] || '').trim();
      const desc = (text.match(/<meta name="description" content="(.*?)"/)?.[1] || '').trim();
      const canonical = (text.match(/<link rel="canonical" href="(.*?)"/)?.[1] || '').trim();

      if (!title) findings.push({ url, issue: 'missing <title>' });
      else if (title.length > 70) findings.push({ url, issue: `title ${title.length} chars (>70)` });

      if (!desc) findings.push({ url, issue: 'missing meta description' });
      else if (desc.length > 160) findings.push({ url, issue: `meta description ${desc.length} chars (>160)` });

      if (!canonical) findings.push({ url, issue: 'missing canonical' });
    } catch (err) {
      findings.push({ url, issue: `fetch failed: ${err.message}` });
    }
  }
  return { findings, checked };
}

// ── Tier 2: Gemini-judged checks, small rotating sample per run ────────────
async function askGemini(prompt, { grounded = false } = {}) {
  const model = genAI.getGenerativeModel(
    grounded ? { model: 'gemini-2.5-flash', tools: [{ googleSearch: {} }] }
             : { model: 'gemini-2.5-flash' }
  );
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function auditExamClaims(sampleSize = 3) {
  const blocks = loadDataFile('frontend/src/data/examLandingData.ts', 'EXAM_LANDINGS');
  if (blocks.length === 0) return { findings: [], checked: 0 };

  const offset = await getOffset('seo_audit_exam_offset');
  const sample = [];
  for (let n = 0; n < Math.min(sampleSize, blocks.length); n++) {
    sample.push(blocks[(offset + n) % blocks.length]);
  }
  await setOffset('seo_audit_exam_offset', (offset + sampleSize) % blocks.length);

  const findings = [];
  for (const block of sample) {
    const examName = block.match(/examName:\s*'([^']+)'/)?.[1] || '(unknown exam)';
    try {
      const reply = await askGemini(
        `Here is the current landing-page copy for a government-exam typing-test page on FastTypingLab:\n\n${block}\n\n` +
        `Search for the current official notification/syllabus for this exam's typing/skill test and check the WPM ` +
        `requirement, duration, and keyboard layout stated above against it. Reply in this exact format:\n` +
        `VERDICT: OK | DISCREPANCY | UNVERIFIABLE\n` +
        `DETAIL: one or two sentences explaining your verdict, citing what you found if DISCREPANCY.`,
        { grounded: true }
      );
      const verdict = reply.match(/VERDICT:\s*(\w+)/)?.[1] || 'UNVERIFIABLE';
      const detail = reply.match(/DETAIL:\s*(.+)/s)?.[1]?.trim() || reply.trim();
      if (verdict !== 'OK') findings.push({ exam: examName, verdict, detail });
    } catch (err) {
      findings.push({ exam: examName, verdict: 'ERROR', detail: err.message });
    }
  }
  return { findings, checked: sample.length, total: blocks.length };
}

export async function auditBlogQuality(sampleSize = 3) {
  const blocks = loadDataFile('frontend/src/data/blogPosts.ts', 'BLOG_POSTS');
  if (blocks.length === 0) return { findings: [], checked: 0 };

  const offset = await getOffset('seo_audit_blog_offset');
  const sample = [];
  for (let n = 0; n < Math.min(sampleSize, blocks.length); n++) {
    sample.push(blocks[(offset + n) % blocks.length]);
  }
  await setOffset('seo_audit_blog_offset', (offset + sampleSize) % blocks.length);

  const findings = [];
  for (const block of sample) {
    const title = block.match(/title:\s*'([^']+)'/)?.[1] || '(unknown post)';
    // Only the prose matters for a quality read — trim obviously long blocks
    // so a single post can't crowd out the token budget for no benefit.
    const trimmed = block.length > 6000 ? block.slice(0, 6000) + '…[truncated]' : block;
    try {
      const reply = await askGemini(
        `Here is one blog post's data (title, metadata, and content) from a typing-practice website aimed at ` +
        `Indian students and government-exam aspirants:\n\n${trimmed}\n\n` +
        `Read the content for factual accuracy, tone, and whether it reads as genuinely useful rather than generic ` +
        `filler. Reply in this exact format:\n` +
        `VERDICT: OK | ISSUE\n` +
        `DETAIL: one or two sentences — only flag something a careful human editor would actually fix.`
      );
      const verdict = reply.match(/VERDICT:\s*(\w+)/)?.[1] || 'OK';
      const detail = reply.match(/DETAIL:\s*(.+)/s)?.[1]?.trim() || reply.trim();
      if (verdict !== 'OK') findings.push({ post: title, verdict, detail });
    } catch (err) {
      findings.push({ post: title, verdict: 'ERROR', detail: err.message });
    }
  }
  return { findings, checked: sample.length, total: blocks.length };
}

// ── Orchestration ───────────────────────────────────────────────────────────
export async function runWeeklyAudit() {
  const mechanical = await auditMechanical();
  const examClaims = await auditExamClaims(3);
  const blogQuality = await auditBlogQuality(3);
  return { ranAt: new Date().toISOString(), mechanical, examClaims, blogQuality };
}
