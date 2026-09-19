// The Babel Fish's phrasebook: a set of pure, deterministic-given-an-rng
// text transforms. Each dialect takes the traveller's text and an rng
// function (() => number in [0,1)) and returns the "translation".
//
// None of this quotes the source material; it's original pastiche in the
// style of the jokes, not the jokes themselves.

function pick(rng, list) {
  return list[Math.floor(rng() * list.length) % list.length];
}

function splitWords(text) {
  return text.trim().split(/\s+/).filter(Boolean);
}

function splitSentences(text) {
  const parts = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [text.trim()];
}

// ---------------------------------------------------------------------
// 1. Vogon Poetry
// ---------------------------------------------------------------------

const VOGON_ADJECTIVES = [
  "quangling", "blorpish", "florbuncled", "grimswaddled", "ooze-brindled",
  "half-digested", "administratively moist", "triple-audited",
];
const VOGON_OPENERS = [
  "Oh freewrangled traveller,", "Hark, thou soggy one,", "Behold, oh committee of one,",
  "Yea verily, thy", "List and tremble, for thy",
];
const VOGON_CLOSERS = [
  "and the paperwork shall never, ever be filed.",
  "as is customary on a Thursday, for tax reasons.",
  "yet still your ears shall bleed with quiet dignity.",
  "in triplicate, and also in your nightmares.",
];

export function toVogonPoetry(text, rng = Math.random) {
  const words = splitWords(text);
  if (words.length === 0) {
    return "( ... the silence itself is scanned, found metrically deficient, and read aloud anyway. )";
  }
  const lineSize = 3;
  const lines = [];
  lines.push(`${pick(rng, VOGON_OPENERS)}`);
  for (let i = 0; i < words.length; i += lineSize) {
    const chunk = words.slice(i, i + lineSize).join(" ");
    lines.push(`  ${pick(rng, VOGON_ADJECTIVES)} ${chunk},`);
  }
  lines.push(pick(rng, VOGON_CLOSERS));
  lines.push("");
  lines.push("(Please return your own hearing after listening.");
  lines.push(" Warranty void if brain liquefies.)");
  return lines.join("\n");
}

// ---------------------------------------------------------------------
// 2. Ministry Memo (Bureaucratese)
// ---------------------------------------------------------------------

const MINISTRIES = [
  "Ministry of Silly Walks", "Ministry of Redundant Departments",
  "Ministry of Reasonably Priced Miracles", "Ministry of Wasted Correspondence",
  "Sub-Committee for the Sub-Committee on Sub-Committees",
];
const MEMO_QUALIFIERS = [
  "without prejudice to the aforementioned,", "subject to further review by nobody in particular,",
  "pending approval of the approval,", "notwithstanding clause 4(b)(ii),",
  "in a manner to be determined at a later, unspecified date,",
];

export function toMinistryMemo(text, rng = Math.random) {
  const sentences = splitSentences(text).length ? splitSentences(text) : [text];
  const formNumber = `27B/${Math.floor(rng() * 900) + 6}`;
  const lines = [];
  lines.push(`${pick(rng, MINISTRIES).toUpperCase()}`);
  lines.push("INTERDEPARTMENTAL MEMORANDUM — STRICTLY ROUTINE");
  lines.push(`Re: your submission, ${pick(rng, MEMO_QUALIFIERS)} filed on Form ${formNumber}`);
  lines.push("");
  sentences.forEach((s, i) => {
    lines.push(`${i + 1}. ${pick(rng, MEMO_QUALIFIERS)} it is noted that: "${s}"`);
  });
  lines.push("");
  lines.push(`This memorandum must be countersigned in triplicate and returned to a`);
  lines.push(`department that, for administrative reasons, does not yet exist.`);
  lines.push("");
  lines.push("[ STAMP: APPROVED IN PRINCIPLE, PENDING FURTHER APPROVAL OF THE APPROVAL ]");
  return lines.join("\n");
}

// ---------------------------------------------------------------------
// 3. Golgafrinchan Committee-Speak
// ---------------------------------------------------------------------

const BUZZWORD_MAP = [
  [/\bplan\b/gi, "leaf-backed strategic initiative"],
  [/\bmeeting\b/gi, "circle-back synergy session"],
  [/\bproblem\b/gi, "growth opportunity"],
  [/\bidea\b/gi, "actionable ideation artifact"],
  [/\bmoney\b/gi, "leaves"],
  [/\bwork\b/gi, "value-added activity"],
  [/\bteam\b/gi, "high-agency committee"],
  [/\bdecision\b/gi, "consensus-adjacent alignment"],
];
const COMMITTEE_TAGS = [
  "Going forward, we should really put a leaf on it.",
  "Action item: form a committee to discuss forming a committee.",
  "Let's take this offline, into an even smaller ark.",
  "We'll circle back once the leaves have appreciated in value.",
  "Noted. Escalating to the Sub-Committee for Escalation.",
];

export function toCommitteeSpeak(text, rng = Math.random) {
  let out = text;
  for (const [pattern, replacement] of BUZZWORD_MAP) {
    out = out.replace(pattern, replacement);
  }
  const sentences = splitSentences(out);
  const withTags = sentences.map((s) => `${s} (${pick(rng, COMMITTEE_TAGS)})`);
  return withTags.join(" ");
}

// ---------------------------------------------------------------------
// 4. Deep Thought Oracle
// ---------------------------------------------------------------------

const ORACLE_HEDGES = [
  "a question of genuinely staggering banality",
  "not, strictly, the right question",
  "closer to the right question than most, which isn't saying much",
  "a question this unit finds oddly moving",
];

export function toDeepThoughtOracle(text, rng = Math.random) {
  const question = text.trim() || "(nothing in particular)";
  const hedge = pick(rng, ORACLE_HEDGES);
  const lines = [
    `> QUERY RECEIVED: "${question}"`,
    "> CLASSIFYING QUERY... please wait.",
    "> Time remaining: 7,500,000 years.",
    "> Time remaining: 7,500,000 years. (skipping ahead, for the demo)",
    "> ...",
    `> This is ${hedge}.`,
    "> THE ANSWER IS: 42",
    "",
    "Unfortunately nobody currently knows what the Question actually was,",
    "which does rather undercut the usefulness of the Answer. Might I",
    "suggest building a considerably larger computer to work that part out?",
  ];
  return lines.join("\n");
}

// ---------------------------------------------------------------------
// 5. Spanish Inquisition Interrupt
// ---------------------------------------------------------------------

const INQUISITION_WEAPONS = [
  ["surprise", "fear"],
  ["surprise", "fear", "ruthless efficiency"],
  ["surprise", "fear", "ruthless efficiency", "an almost fanatical devotion to the paperwork"],
];

export function toInquisitionInterrupt(text, rng = Math.random) {
  const sentences = splitSentences(text);
  const out = [];
  sentences.forEach((s, i) => {
    if (i > 0) {
      out.push("");
      out.push("*** NOBODY EXPECTS WHAT HAPPENS NEXT! ***");
      const weapons = pick(rng, INQUISITION_WEAPONS);
      out.push(
        `Our chief weapons are ${weapons.slice(0, -1).join(", ")}` +
          `${weapons.length > 1 ? ", and " : ""}${weapons[weapons.length - 1]}...`
      );
      out.push("...we'll come in again.");
      out.push("");
    }
    out.push(s);
  });
  return out.join("\n");
}

// ---------------------------------------------------------------------
// 6. Norwegian Blue Denial-Speak
// ---------------------------------------------------------------------

const DENIAL_MAP = [
  [/\bdead\b/gi, "resting"],
  [/\bdied\b/gi, "went to join the choir invisible"],
  [/\bbroken\b/gi, "pining for the fjords"],
  [/\bfinished\b/gi, "stunned, merely stunned"],
  [/\bfailed\b/gi, "bereft of success, but in otherwise rude health"],
  [/\bno\b/gi, "it's merely resting, guv"],
  [/\bwrong\b/gi, "resting its case"],
];

export function toDenialSpeak(text, rng = Math.random) {
  let out = text;
  for (const [pattern, replacement] of DENIAL_MAP) {
    out = out.replace(pattern, replacement);
  }
  const item = pick(rng, ["parrot", "project", "printer", "quarterly report", "toaster"]);
  return `${out}\n\nThis is not a deceased ${item}. It is, in fact, a very tired one.`;
}

// ---------------------------------------------------------------------

export const DIALECTS = [
  { id: "vogon", label: "Vogon Poetry", fn: toVogonPoetry },
  { id: "memo", label: "Ministry Memo", fn: toMinistryMemo },
  { id: "committee", label: "Golgafrinchan Committee-Speak", fn: toCommitteeSpeak },
  { id: "oracle", label: "Deep Thought Oracle", fn: toDeepThoughtOracle },
  { id: "inquisition", label: "Spanish Inquisition Interrupt", fn: toInquisitionInterrupt },
  { id: "denial", label: "Norwegian Blue Denial-Speak", fn: toDenialSpeak },
];

export function translate(dialectId, text, rng = Math.random) {
  const dialect = DIALECTS.find((d) => d.id === dialectId);
  if (!dialect) {
    throw new Error(`Unknown dialect: ${dialectId}`);
  }
  return dialect.fn(text, rng);
}

// A tiny seedable PRNG (mulberry32) so tests and "share this translation"
// links can reproduce a specific output.
export function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
