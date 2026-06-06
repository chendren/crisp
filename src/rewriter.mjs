/**
 * crisp — deterministic ultra-clear prompt rewriter (zero regex)
 * Pure string methods, short functions, functional style.
 * Designed for non-native English + vibe/casual coding prompts.
 * Enforces user's known standards by default (short funcs, no regex, plan mode, etc).
 */

const CASUAL_MARKERS = [
  'make a', 'make the', 'just a', 'a nice', 'kinda', 'sort of', 'like a',
  'something that', 'a button', 'a page', 'the login', 'a dashboard',
  'fix the bug', 'fix bug', 'make it work', 'make it nice', 'pretty please',
  'can you', 'could you', 'i want', 'i need', 'please create', 'do a',
];

const NON_NATIVE_PATTERNS = [
  'i want that you', 'i want you to do', 'please to', 'can you to',
  'implement that', 'make that the', 'the function that do', 'it should to',
  'how to make that', 'create for me', 'i am wanting', 'please make for me',
  'the page with', 'a component which', 'do the', 'make the x that',
];

const USER_STANDARDS = [
  'Use TypeScript for all new code.',
  'Prefer functional utilities over classes unless stateful component is truly required.',
  'Short functions with single responsibility.',
  'No regex — use LLM-based parsing or string methods (includes, startsWith, split, indexOf).',
  'No defensive coding for impossible cases; validate only at system boundaries.',
  'When the request is a casual "vibe" or feature idea, treat it as a full spec: build the complete thing with no stubs.',
  'For anything touching >3 files or involving architecture, enter plan mode first.',
  'Default stack when not specified: TypeScript + Node, React + Tailwind + shadcn/ui, SQLite/LanceDB locally.',
];

export function enhance(raw, opts = {}) {
  if (!raw || typeof raw !== 'string') return raw || '';
  const text = raw.trim();
  if (text.length === 0) return text;

  const lower = text.toLowerCase();
  const isVibe = detectVibe(lower);
  const isNonNative = detectNonNative(lower);
  const needsStructure = text.length < 280 || isVibe || isNonNative || !hasClearSuccess(text);

  let intent = extractIntent(text);
  const constraints = mergeConstraints(extractConstraints(text), USER_STANDARDS);
  const success = extractOrInferSuccess(text, isVibe);
  const context = extractContext(text);

  let out = '';

  if (needsStructure || isVibe || isNonNative) {
    out += buildStructuredPrompt(intent, constraints, success, context, { isVibe, isNonNative });
  } else {
    // Already reasonably clear — light polish only
    out += lightPolish(text);
    out += '\n\n(Standards reminder: ' + USER_STANDARDS.slice(0, 3).join(' ') + ')';
  }

  // Always end with crisp success signal
  if (!out.toLowerCase().includes('success')) {
    out += '\n\nSuccess criteria: the implementation must satisfy the intent above with zero TODOs or stubs.';
  }

  return out.trim();
}

function detectVibe(lower) {
  for (const m of CASUAL_MARKERS) {
    if (lower.includes(m)) return true;
  }
  if (lower.length < 120 && (lower.includes('make') || lower.includes('build') || lower.includes('add'))) {
    return true;
  }
  return false;
}

function detectNonNative(lower) {
  for (const p of NON_NATIVE_PATTERNS) {
    if (lower.includes(p)) return true;
  }
  // Very direct translation style without articles or with "the" overuse in wrong places (no regex)
  const words = [];
  let buf = '';
  for (let i = 0; i < lower.length; i++) {
    const ch = lower[i];
    if (ch === ' ' || ch === '\t' || ch === '\n') {
      if (buf) { words.push(buf); buf = ''; }
    } else {
      buf += ch;
    }
  }
  if (buf) words.push(buf);
  const theCount = words.filter(w => w === 'the').length;
  const articleIssues = theCount > words.length * 0.18;
  return articleIssues;
}

function hasClearSuccess(text) {
  const t = text.toLowerCase();
  return t.includes('success') || t.includes('should') && t.includes('when') ||
         t.includes('user can') || t.includes('output') || t.includes('must') ||
         t.includes('acceptance');
}

function extractIntent(text) {
  // Take first sentence-ish, strip filler (no regex anywhere). Aggressive on common non-native openers.
  let s = text;
  const enders = ['.', '!', '?'];
  let firstEnd = -1;
  for (const e of enders) {
    const pos = text.indexOf(e);
    if (pos !== -1 && (firstEnd === -1 || pos < firstEnd)) firstEnd = pos;
  }
  if (firstEnd > 8) s = text.slice(0, firstEnd);

  const lowS = s.toLowerCase().trim();
  const directStarters = [
    'i want that you ', 'i want you to ', 'i want to ', 'i want that ',
    'please to ', 'can you to ', 'could you to ',
    'please ', 'can you ', 'could you ', 'i want ', 'i need ', 'make me ', 'do a ', 'just ', 'create for me ',
  ];
  for (const f of directStarters) {
    if (lowS.startsWith(f)) {
      s = s.slice(f.length);
      break;
    }
  }
  const low2 = s.toLowerCase().trim();
  if (low2.startsWith('a ')) s = s.trim().slice(2);
  else if (low2.startsWith('the ')) s = s.trim().slice(4);
  else if (low2.startsWith('an ')) s = s.trim().slice(3);

  return capitalize(s.trim());
}

function extractConstraints(text) {
  const found = [];
  const lower = text.toLowerCase();
  if (lower.includes('typescript') || lower.includes(' ts ')) found.push('Use TypeScript.');
  if (lower.includes('no regex') || lower.includes('without regex')) found.push('No regex.');
  if (lower.includes('functional') || lower.includes('no class')) found.push('Prefer functional style.');
  if (lower.includes('plan') || lower.includes('architecture')) found.push('Use plan mode for complex work.');
  if (lower.includes('test')) found.push('Include tests.');
  if (lower.includes('shadcn') || lower.includes('tailwind')) found.push('Use shadcn/ui + Tailwind.');
  return found;
}

function mergeConstraints(extracted, standards) {
  const set = new Set([...extracted]);
  for (const s of standards) {
    // Keep the most important ones always
    if (s.includes('TypeScript') || s.includes('functional') || s.includes('Short functions') || s.includes('No regex')) {
      set.add(s);
    }
  }
  return Array.from(set);
}

function extractOrInferSuccess(text, isVibe) {
  const lower = text.toLowerCase();
  if (lower.includes('success')) {
    const idx = lower.indexOf('success');
    let rest = text.slice(idx);
    const enders = ['.', '!', '?'];
    let cut = rest.length;
    for (const e of enders) {
      const p = rest.indexOf(e);
      if (p !== -1 && p < cut) cut = p;
    }
    return capitalize(rest.slice(0, cut));
  }
  if (isVibe) {
    return 'A complete, working implementation that fulfills the described experience with no placeholders.';
  }
  return 'The delivered code/behavior matches the intent exactly and is immediately usable.';
}

function extractContext(text) {
  // Very lightweight: last sentence-ish if it looks like context (no regex)
  let last = text;
  const enders = ['.', '!', '?'];
  let lastEnd = -1;
  for (const e of enders) {
    const pos = text.lastIndexOf(e);
    if (pos > lastEnd) lastEnd = pos;
  }
  if (lastEnd > 0 && lastEnd < text.length - 1) {
    last = text.slice(lastEnd + 1);
  }
  const l = last.toLowerCase();
  if (last.length > 20 && (l.includes('in the') || l.includes('for the') || l.includes('using ') || l.includes('with the'))) {
    return last.trim();
  }
  return '';
}

function buildStructuredPrompt(intent, constraints, success, context, flags) {
  let p = `## Intent\n${intent}\n\n`;

  if (flags.isNonNative) {
    p += '## Clarified from non-native phrasing\n';
    p += 'The original request has been normalized for maximum precision while preserving exact user meaning.\n\n';
  }
  if (flags.isVibe) {
    p += '## Vibe expanded to spec\n';
    p += 'Casual description treated as full implementation spec per high-leverage coding agent conventions.\n\n';
  }

  p += '## Constraints\n';
  for (const c of constraints) p += `- ${c}\n`;
  if (constraints.length === 0) p += '- Deliver clean, production-grade code.\n';

  p += '\n## Success Criteria\n';
  p += `- ${success}\n`;
  p += '- Zero TODOs, stubs, or "implement later" comments.\n';
  p += '- Follows all constraints above.\n';

  if (context) {
    p += `\n## Additional Context\n${context}\n`;
  }

  p += '\n## Execution Guidance\n';
  p += '- If scope spans multiple files or involves architecture, enter plan mode first.\n';
  p += '- Ask zero clarifying questions unless the request is truly ambiguous after this normalization.\n';
  p += '- Build the full thing.';

  return p;
}

function lightPolish(text) {
  // Minimal fixes: ensure first char upper, basic sentence spacing, direct imperative start.
  // No regex: manual collapse + simple string ops.
  let t = text.trim();
  t = t.charAt(0).toUpperCase() + t.slice(1);
  // Collapse multiple spaces (no regex)
  while (t.includes('  ')) {
    t = t.split('  ').join(' ');
  }
  // Turn leading "I want ..." into direct command when safe
  const low = t.toLowerCase();
  if (low.startsWith('i want ')) {
    if (low.startsWith('i want to ')) t = t.slice(10);
    else if (low.startsWith('i want that ')) t = t.slice(12);
    else t = t.slice(7);
    t = t.charAt(0).toUpperCase() + t.slice(1);
  }
  return t;
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default { enhance };
