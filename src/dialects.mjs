// The Babel Fish's phrasebook: a set of pure, deterministic-given-an-rng
// text transforms. Each dialect takes the traveller's text and an rng
// function (() => number in [0,1)) and returns the "translation".
//
// Mostly original pastiche. A handful of famous catchphrases are borrowed
// on purpose (the Inquisition's chief weapons, the parrot's fjords),
// because those dialects are built around them.

import { HONEST_LEXICON, HONEST_CONSEQUENCES, HONEST_NOTHING_FOUND } from "./honest-lexicon.mjs";

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

// Words that can safely lose their capital when an adjective is shoved in
// front of them. Anything else might be a name, so it keeps its capital.
const LOWERCASE_SAFE = new Set([
  "the", "a", "an", "it", "this", "that", "these", "those", "we", "they",
  "he", "she", "you", "my", "our", "your", "their", "there", "and", "but",
  "so", "can", "will", "is", "are", "do", "does", "please", "nobody",
]);

function vogonLine(adjective, chunk) {
  const [first] = chunk.split(" ");
  const softened = LOWERCASE_SAFE.has(first.toLowerCase())
    ? chunk[0].toLowerCase() + chunk.slice(1)
    : chunk;
  const trimmed = softened.replace(/[.,;:]+$/, "");
  const ending = /[!?]$/.test(trimmed) ? "" : ",";
  return `  ${adjective} ${trimmed}${ending}`;
}

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
    lines.push(vogonLine(pick(rng, VOGON_ADJECTIVES), chunk));
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
  [/\bhire\b/gi, "onboard additional headcount"],
  [/\blaunch\b/gi, "go-to-market moment"],
  [/\bclient\b/gi, "key stakeholder"],
  [/\bcustomer\b/gi, "end-user stakeholder"],
  [/\bemail\b/gi, "async touchpoint"],
  [/\btomorrow\b/gi, "next sprint"],
  [/\btoday\b/gi, "this sprint"],
  [/\bthink\b/gi, "ideate"],
  [/\bpeople\b/gi, "human capital"],
  [/\breport\b/gi, "deck"],
  [/\bfix\b/gi, "remediate"],
  [/\btalk\b/gi, "sync"],
  [/\bquestion\b/gi, "parking-lot item"],
  [/\bdelayed\b/gi, "re-baselined"],
  [/\blate\b/gi, "re-baselined"],
  [/\bupset\b/gi, "misaligned"],
  [/\btold\b/gi, "socialized this with"],
  [/\bdecide\b/gi, "align"],
  [/\bengineers\b/gi, "solution architects"],
  [/\blunch\b/gi, "working lunch"],
  [/\bdinner\b/gi, "working dinner"],
  [/\bcoffee\b/gi, "informal sync"],
  [/\bweekend\b/gi, "offsite"],
  [/\bbirthday\b/gi, "annual milestone review"],
  [/\bwine\b/gi, "team-building beverages"],
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

const ORACLE_FUDGES = [
  "correction for prevailing irony",
  "the Tuesday constant",
  "a number this unit found down the back of the sofa",
  "adjustment for the observer's haircut",
  "tax",
  "rounding, enthusiastically",
  "a small offering to the god of spreadsheets",
  "the margin of error, applied in reverse",
];

// Show the working. The working is always correct, and always arrives at
// 42, because the final step is whatever it needs to be.
function oracleWorking(question, rng) {
  const letters = (question.match(/\p{L}/gu) || []).length;
  const words = splitWords(question).length;
  const subtotal = letters - words;
  const gap = 42 - subtotal;
  const lines = [
    `> Letters in query: ${letters}`,
    `> Words in query: ${words}`,
    `> ${letters} - ${words} = ${subtotal}`,
  ];
  if (gap === 0) {
    lines.push("> No correction required. This unit is as surprised as you are.");
  } else {
    const sign = gap > 0 ? "+" : "-";
    lines.push(`> ${subtotal} ${sign} ${Math.abs(gap)} (${pick(rng, ORACLE_FUDGES)}) = 42`);
  }
  return lines;
}

export function toDeepThoughtOracle(text, rng = Math.random) {
  const question = text.trim();
  const hedge = pick(rng, ORACLE_HEDGES);
  const lines = [
    `> QUERY RECEIVED: "${question || "(nothing in particular)"}"`,
    "> CLASSIFYING QUERY... please wait.",
    pick(rng, ORACLE_WAITS),
    "> ...",
    ...oracleWorking(question, rng),
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

const INQUISITION_RESUMES = [
  "As I was saying: ",
  "Where was I. Ah, yes: ",
  "(Ahem.) ",
  "Right. Carrying on: ",
  "Anyway. ",
];

// The whole point of the Inquisition is that you can't see it coming, so
// it cuts in after a random word rather than politely between sentences.
// Roughly one interruption per dozen words, and always at least one.
export function toInquisitionInterrupt(text, rng = Math.random) {
  const words = splitWords(text);
  if (words.length === 0) {
    return [
      "*** NOBODY EXPECTS AN EMPTY ROOM! ***",
      "Our chief weapons are surprise, and... there's nobody here.",
      "...we'll come in again when there is.",
    ].join("\n");
  }

  const wanted = Math.max(1, Math.round(words.length / 12));
  const cuts = new Set();
  for (let i = 0; i < wanted; i++) {
    cuts.add(1 + Math.floor(rng() * words.length));
  }
  const cutPoints = [...cuts].sort((a, b) => a - b);

  const out = [];
  let start = 0;
  for (const cut of cutPoints) {
    const segment = words.slice(start, cut).join(" ");
    const finishedSentence = /[.!?]$/.test(segment);
    const resume = start === 0 ? "" : pick(rng, INQUISITION_RESUMES);
    const lead = start > 0 && !/[.!?]$/.test(words[start - 1]) ? "..." : "";
    out.push(`${resume}${lead}${segment}${finishedSentence ? "" : "..."}`);
    out.push("");
    out.push(pick(rng, INQUISITION_SHOUTS));
    out.push(`Our chief weapons are ${joinWithAnd(pick(rng, INQUISITION_WEAPONS))}...`);
    out.push(pick(rng, INQUISITION_EXITS));
    out.push("");
    start = cut;
  }
  if (start < words.length) {
    const lead = /[.!?]$/.test(words[start - 1]) ? "" : "...";
    out.push(`${pick(rng, INQUISITION_RESUMES)}${lead}${words.slice(start).join(" ")}`);
  } else {
    out.pop();
  }
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
  [/\bfailed\b/gi, "achieved a restful outcome"],
  [/\bNo,/g, "Not as such, guv,"],
  [/\bwrong\b/gi, "resting its case"],
  [/\bcancell?ed\b/gi, "postponed indefinitely, and restfully"],
  [/\bclosed\b/gi, "napping, commercially speaking"],
  [/\bobsolete\b/gi, "pining, but structurally sound"],
  [/\bexpired\b/gi, "resting past its stated date"],
  [/\bmissing\b/gi, "off having a lie-down, location unclear"],
  [/\bbankrupt\b/gi, "voluntarily and restfully insolvent"],
  [/\bretired\b/gi, "resting in an emeritus capacity"],
  [/\bis late\b/gi, "is having a lie-in"],
  [/\bare late\b/gi, "are having a lie-in"],
  [/\bdeleted\b/gi, "tidied away, permanently"],
  [/\bcrashed\b/gi, "had a little sit-down"],
  [/\bis down\b/gi, "is having a lie-down"],
  [/\bfired\b/gi, "released into the wild"],
  [/\blaid off\b/gi, "released into the wild"],
  [/\blost\b/gi, "temporarily misplaced"],
  [/\bmissed the deadline\b/gi, "let the deadline have a rest"],
  [/\bbugs\b/gi, "resting features"],
  [/\bbug\b/gi, "resting feature"],
  [/\boutage\b/gi, "unscheduled nap"],
  [/\bupset\b/gi, "resting, emotionally"],
  [/\bresigned\b/gi, "retired to a quieter perch"],
  [/\bterrible\b/gi, "restful"],
  [/\bawful\b/gi, "exceptionally restful"],
  [/\bdisaster\b/gi, "well-earned rest"],
  [/\bruined\b/gi, "rested"],
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
// 7. The Honest Fish (officialese back into what it actually meant)
// ---------------------------------------------------------------------
//
// Every other dialect turns plain speech into nonsense. This one runs the
// other way, which is the direction that causes the wars.

function normalisePhrase(phrase) {
  return phrase.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
}

function phraseToPattern(phrase) {
  const escaped = phrase
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/'/g, "['’]")
    .replace(/ /g, "\\s+");
  const start = /^\w/.test(phrase) ? "\\b" : "";
  const end = /\w$/.test(phrase) ? "\\b" : "";
  return `${start}${escaped}${end}`;
}

// The Committee and Denial dialects are simple word swaps, so the fish can
// read them backwards: "resting" goes back to "dead", "leaves" to "money".
function originalWordFrom(pattern) {
  return pattern.source.replace(/\\b/g, "").replace(/\?/g, "");
}

const HONEST_TABLE = new Map();
for (const [pattern, replacement] of [...BUZZWORD_MAP, ...DENIAL_MAP]) {
  HONEST_TABLE.set(normalisePhrase(replacement), originalWordFrom(pattern));
}
for (const [phrase, meaning] of HONEST_LEXICON) {
  HONEST_TABLE.set(normalisePhrase(phrase), meaning);
}

// One combined pattern, longest phrases first, so "let's circle back on"
// wins over "circle back" and nothing gets translated twice.
const HONEST_PATTERN = new RegExp(
  [...HONEST_TABLE.keys()]
    .sort((a, b) => b.length - a.length)
    .map(phraseToPattern)
    .join("|"),
  "gi"
);

function capitalise(text) {
  return text.replace(/^([^A-Za-z]*)([a-z])/, (_, lead, letter) => lead + letter.toUpperCase());
}

function isAllCaps(text) {
  const letters = text.replace(/[^A-Za-z]/g, "");
  return letters.length > 1 && letters === letters.toUpperCase();
}

// Shouted phrases are shouted back. A lone acronym like "EOD" only counts
// as shouting when the rest of the message is shouting too.
function matchCase(original, replacement, atSentenceStart, wholeMessageShouted) {
  if (isAllCaps(original) && (/\s/.test(original) || wholeMessageShouted)) {
    return replacement.toUpperCase();
  }
  return atSentenceStart ? capitalise(replacement) : replacement;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsAny(text, phrases) {
  const flat = text.replace(/\s+/g, " ");
  return phrases.some((phrase) => flat.includes(phrase.replace(/\s+/g, " ")));
}

const DENIAL_CLOSER_PATTERNS = DENIAL_CLOSERS.map(
  (closer) => new RegExp(escapeRegExp(closer).replace("\\{item\\}", ".+?"))
);

// When someone feeds the fish one of its own translations, it recognises
// the house style and says what it really amounts to.
const SIBLING_VERDICTS = [
  {
    found: (t) => t.includes("INTERDEPARTMENTAL MEMORANDUM"),
    verdict: "A government department has received your message and will do nothing about it.",
  },
  {
    found: (t) => containsAny(t, VOGON_FOOTERS),
    verdict: "Someone has written you a poem. You will be expected to say you liked it.",
  },
  {
    found: (t) => t.includes("THE ANSWER IS: 42"),
    verdict: "A very large computer did not understand you, and has invoiced you anyway.",
  },
  {
    found: (t) => t.includes("Our chief weapons are"),
    verdict: "You kept being interrupted by people reading from a script they had not learned.",
  },
  {
    found: (t) => containsAny(t, COMMITTEE_TAGS),
    verdict: "A committee has heard you, and formed a smaller committee so it never has to hear you again.",
  },
  {
    found: (t) => DENIAL_CLOSER_PATTERNS.some((p) => p.test(t)),
    verdict: "Something has died, and everyone involved has agreed not to mention it.",
  },
];

export function toPlainTruth(text, rng = Math.random) {
  if (!text.trim()) {
    return "[ THE HONEST FISH ]\n\nYou said nothing. The fish respects this enormously. It is the most honest message it has received all week.";
  }

  const verdicts = SIBLING_VERDICTS.filter((s) => s.found(text)).map((s) => s.verdict);

  const shouted = isAllCaps(text);
  let removed = 0;
  const decoded = text.replace(HONEST_PATTERN, (match, offset, whole) => {
    const meaning = HONEST_TABLE.get(normalisePhrase(match));
    if (meaning === undefined) return match;
    removed++;
    const atSentenceStart = /(^|[.!?]["')\]]?\s+|\n\s*)$/.test(whole.slice(0, offset));
    return matchCase(match, meaning, atSentenceStart, shouted);
  });

  const lines = [`[ THE HONEST FISH: ${removed} euphemism${removed === 1 ? "" : "s"} removed ]`, ""];
  if (verdicts.length) {
    lines.push("TRANSLATING A TRANSLATION. The fish feels a strange tightness in its gills.");
    for (const verdict of verdicts) lines.push(`In plain terms: ${verdict}`);
    lines.push("");
  }
  lines.push(decoded.trim(), "");
  if (removed > 0) {
    const tier = HONEST_CONSEQUENCES.find((t) => removed >= t.atLeast);
    lines.push(`If sent, this is expected to cause ${pick(rng, tier.outcomes)}.`);
  } else if (!verdicts.length) {
    lines.push(pick(rng, HONEST_NOTHING_FOUND));
  }
  return lines.join("\n").trimEnd();
}

// ---------------------------------------------------------------------

// "into" dialects turn plain speech into nonsense; "out" runs the other way.
export const DIALECTS = [
  { id: "truth", label: "Honest Fish (plain truth)", group: "out", fn: toPlainTruth },
  { id: "vogon", label: "Vogon Poetry", group: "into", fn: toVogonPoetry },
  { id: "memo", label: "Ministry Memo", group: "into", fn: toMinistryMemo },
  { id: "committee", label: "Golgafrinchan Committee-Speak", group: "into", fn: toCommitteeSpeak },
  { id: "oracle", label: "Deep Thought Oracle", group: "into", fn: toDeepThoughtOracle },
  { id: "inquisition", label: "Spanish Inquisition Interrupt", group: "into", fn: toInquisitionInterrupt },
  { id: "denial", label: "Norwegian Blue Denial-Speak", group: "into", fn: toDenialSpeak },
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
