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

function joinWithAnd(items) {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")}${items.length > 2 ? "," : ""} and ${items[items.length - 1]}`;
}

// ---------------------------------------------------------------------
// 1. Vogon Poetry
// ---------------------------------------------------------------------

const VOGON_ADJECTIVES = [
  "quangling", "blorpish", "florbuncled", "grimswaddled", "ooze-brindled",
  "half-digested", "administratively moist", "triple-audited", "gralchly",
  "wefted", "spume-encrusted", "unspeakably beige", "over-leavened",
  "notarized", "faintly sentient", "reheated", "structurally apologetic",
];
const VOGON_OPENERS = [
  "Oh freewrangled traveller,", "Hark, thou soggy one,", "Behold, oh committee of one,",
  "Yea verily, thy", "List and tremble, for thy", "Attend, small mammal,",
  "By order of the Vogon Guild of Verse,", "Prepare thy ears, oh listener,",
  "Thus speaketh the Council of Odes,", "Silence now, for the reading begins:",
];
const VOGON_CLOSERS = [
  "and the paperwork shall never, ever be filed.",
  "as is customary on a Thursday, for tax reasons.",
  "yet still your ears shall bleed with quiet dignity.",
  "in triplicate, and also in your nightmares.",
  "and the demolition order remains, regrettably, in force.",
  "for the committee has spoken and the committee is never wrong.",
  "and the rhyme scheme was filed under a separate cover.",
  "which is, on reflection, the poem's least offensive quality.",
];
const VOGON_FOOTERS = [
  "(Please return your own hearing after listening.\n Warranty void if brain liquefies.)",
  "(A complimentary earplug was not included. This was deliberate.)",
  "(Reviews of this poem are, by policy, mandatory and glowing.)",
  "(Side effects may include weeping, fainting, or mild enlightenment.)",
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
  lines.push(pick(rng, VOGON_FOOTERS));
  return lines.join("\n");
}

// ---------------------------------------------------------------------
// 2. Ministry Memo (Bureaucratese)
// ---------------------------------------------------------------------

const MINISTRIES = [
  "Ministry of Silly Walks", "Ministry of Redundant Departments",
  "Ministry of Reasonably Priced Miracles", "Ministry of Wasted Correspondence",
  "Sub-Committee for the Sub-Committee on Sub-Committees",
  "Ministry of Anticlimax", "Office of Perpetual Review",
  "Ministry of Forms About Forms", "Department for Departments",
  "Ministry of Slightly Too Much Paperwork",
];
const MEMO_QUALIFIERS = [
  "without prejudice to the aforementioned,", "subject to further review by nobody in particular,",
  "pending approval of the approval,", "notwithstanding clause 4(b)(ii),",
  "in a manner to be determined at a later, unspecified date,",
  "in accordance with a policy nobody has read,",
  "as per the memo about the memo,",
  "for reasons that remain classified even from this office,",
  "contingent upon a signature that does not yet exist,",
  "as is traditional, if not strictly required,",
];
const MEMO_CLOSERS = [
  "This memorandum must be countersigned in triplicate and returned to a\ndepartment that, for administrative reasons, does not yet exist.",
  "Kindly file this under both \"Urgent\" and \"Indefinitely Postponed,\"\nas appropriate to your reading of the situation.",
  "A response is requested at your earliest inconvenience, addressed to\nwhichever committee claims jurisdiction this week.",
  "This document is now the property of a filing cabinet that has since\nbeen relocated to an undisclosed corridor.",
];
const MEMO_STAMPS = [
  "APPROVED IN PRINCIPLE, PENDING FURTHER APPROVAL OF THE APPROVAL",
  "NOTED, FILED, AND QUIETLY FORGOTTEN",
  "REFERRED UPWARD, THEN SIDEWAYS, THEN BACK",
  "PROVISIONALLY STAMPED, STAMP SUBJECT TO REVIEW",
  "RECEIVED WITH THE USUAL RESERVATIONS",
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
  lines.push(pick(rng, MEMO_CLOSERS));
  lines.push("");
  lines.push(`[ STAMP: ${pick(rng, MEMO_STAMPS)} ]`);
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
  [/\bgoal\b/gi, "north-star leaf metric"],
  [/\bdeadline\b/gi, "aspirational leaf-date"],
  [/\bbudget\b/gi, "leaf allocation envelope"],
  [/\brisk\b/gi, "downside leaf exposure"],
  [/\bupdate\b/gi, "stakeholder-facing leaf sync"],
  [/\bfeedback\b/gi, "actionable leaf-back"],
  [/\bstrategy\b/gi, "leaf-forward roadmap"],
  [/\bpriority\b/gi, "top-of-leaf initiative"],
];
const COMMITTEE_TAGS = [
  "Going forward, we should really put a leaf on it.",
  "Action item: form a committee to discuss forming a committee.",
  "Let's take this offline, into an even smaller ark.",
  "We'll circle back once the leaves have appreciated in value.",
  "Noted. Escalating to the Sub-Committee for Escalation.",
  "Let's park that and revisit once the leaves have vested.",
  "Strong initiative. Recommend a working group to rename it.",
  "Aligned in spirit; misaligned in leaf-denominated specifics.",
  "This has been logged in the ark-wide tracking spreadsheet.",
  "Let's socialize this with the B Ark before committing further.",
  "Adding it to the agenda for the agenda-setting meeting.",
  "We should really loop in Telephone Sanitizing on this one.",
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
  "structurally similar to several unanswerable ones",
  "the kind of question that ages a computer prematurely",
  "a question best asked of a smaller, angrier computer",
  "a question whose punctuation alone took four centuries to parse",
  "surprisingly load-bearing for something so short",
  "a question that will look worse in retrospect",
];
const ORACLE_WAITS = [
  "> Time remaining: 7,500,000 years. (skipping ahead, for the demo)",
  "> Time remaining: 7,500,000 years. (buffering. please enjoy this eternity.)",
  "> Time remaining: 7,500,000 years. (the fans have started; this is normal.)",
  "> Time remaining: 7,500,000 years. (a light snack is recommended.)",
  "> Time remaining: 7,500,000 years. (rounding down, generously.)",
];
const ORACLE_SUGGESTIONS = [
  "Might I suggest building a considerably larger computer to work that part out?",
  "A successor unit, larger and considerably more bad-tempered, may be required.",
  "This unit recommends commissioning something the size of a small planet.",
  "Further computation is available, at a cost this unit is not authorized to discuss.",
  "Perhaps the Question was never the point. This unit doubts that, but perhaps.",
];

export function toDeepThoughtOracle(text, rng = Math.random) {
  const question = text.trim() || "(nothing in particular)";
  const hedge = pick(rng, ORACLE_HEDGES);
  const lines = [
    `> QUERY RECEIVED: "${question}"`,
    "> CLASSIFYING QUERY... please wait.",
    "> Time remaining: 7,500,000 years.",
    pick(rng, ORACLE_WAITS),
    "> ...",
    `> This is ${hedge}.`,
    "> THE ANSWER IS: 42",
    "",
    "Unfortunately nobody currently knows what the Question actually was,",
    "which does rather undercut the usefulness of the Answer.",
    pick(rng, ORACLE_SUGGESTIONS),
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
  ["surprise", "a strongly worded memo"],
  ["fear", "surprise", "a modestly upholstered ottoman"],
  ["ruthless efficiency", "an appointment scheduled well in advance"],
  ["surprise", "fear", "fear again, but louder"],
  ["an almost fanatical devotion to the agenda", "surprise"],
];
const INQUISITION_SHOUTS = [
  "*** NOBODY EXPECTS WHAT HAPPENS NEXT! ***",
  "*** NOBODY EXPECTS THIS EITHER! ***",
  "*** AND YET AGAIN, NOBODY EXPECTED THAT! ***",
  "*** ONCE MORE, ENTIRELY WITHOUT WARNING! ***",
  "*** SURPRISE, REVISITED! ***",
];
const INQUISITION_EXITS = [
  "...we'll come in again.",
  "...I'll come in again.",
  "...let's start that bit over.",
  "...one moment, we'll re-enter.",
];

export function toInquisitionInterrupt(text, rng = Math.random) {
  const sentences = splitSentences(text);
  const out = [];
  sentences.forEach((s, i) => {
    if (i > 0) {
      out.push("");
      out.push(pick(rng, INQUISITION_SHOUTS));
      const weapons = pick(rng, INQUISITION_WEAPONS);
      out.push(`Our chief weapons are ${joinWithAnd(weapons)}...`);
      out.push(pick(rng, INQUISITION_EXITS));
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
  [/\bcancell?ed\b/gi, "postponed indefinitely, and restfully"],
  [/\bclosed\b/gi, "napping, commercially speaking"],
  [/\bobsolete\b/gi, "pining, but structurally sound"],
  [/\bexpired\b/gi, "resting past its stated date"],
  [/\bmissing\b/gi, "off having a lie-down, location unclear"],
  [/\bbankrupt\b/gi, "voluntarily and restfully insolvent"],
  [/\bretired\b/gi, "resting in an emeritus capacity"],
];
const DENIAL_CLOSERS = [
  "This is not a deceased {item}. It is, in fact, a very tired one.",
  "The {item} is merely resting, and entitled to its rest.",
  "Rest assured: the {item} has merely nodded off, mid-sentence.",
  "Any resemblance between this {item} and a deceased one is coincidental.",
];

export function toDenialSpeak(text, rng = Math.random) {
  let out = text;
  for (const [pattern, replacement] of DENIAL_MAP) {
    out = out.replace(pattern, replacement);
  }
  const item = pick(rng, ["parrot", "project", "printer", "quarterly report", "toaster", "server", "startup", "houseplant"]);
  const closer = pick(rng, DENIAL_CLOSERS).replace("{item}", item);
  return `${out}\n\n${closer}`;
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
