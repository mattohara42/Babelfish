import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DIALECTS,
  translate,
  mulberry32,
  toVogonPoetry,
  toDeepThoughtOracle,
  toInquisitionInterrupt,
  toDenialSpeak,
  toCommitteeSpeak,
  toMinistryMemo,
  toPlainTruth,
} from "../src/dialects.mjs";

test("every registered dialect produces non-empty output", () => {
  for (const dialect of DIALECTS) {
    const out = dialect.fn("The Vogons are approaching with the demolition orders.", mulberry32(1));
    assert.ok(out.length > 0, `${dialect.id} produced empty output`);
  }
});

test("translate() is deterministic for a given seed", () => {
  const a = translate("vogon", "hello there", mulberry32(42));
  const b = translate("vogon", "hello there", mulberry32(42));
  assert.equal(a, b);
});

test("translate() throws on an unknown dialect", () => {
  assert.throws(() => translate("klingon", "hi"), /Unknown dialect/);
});

test("vogon poetry handles empty input without crashing", () => {
  const out = toVogonPoetry("   ", mulberry32(1));
  assert.match(out, /silence/);
});

test("deep thought oracle always answers 42", () => {
  const out = toDeepThoughtOracle("What is the meaning of life?", mulberry32(7));
  assert.match(out, /THE ANSWER IS: 42/);
});

test("inquisition always interrupts, even a single short sentence", () => {
  for (let seed = 1; seed <= 20; seed++) {
    const out = toInquisitionInterrupt("Just one sentence here.", mulberry32(seed));
    assert.match(out, /\*\*\*/);
    assert.match(out, /Our chief weapons are/);
  }
});

test("inquisition never interrupts before the first word, and keeps every word in order", () => {
  const text = "The quarterly report is late again and nobody wants to own the decision.";
  for (let seed = 1; seed <= 20; seed++) {
    const out = toInquisitionInterrupt(text, mulberry32(seed));
    assert.ok(out.startsWith("The"), `seed ${seed} interrupted before the first word`);
    let cursor = 0;
    for (const word of text.split(" ")) {
      const found = out.indexOf(word, cursor);
      assert.ok(found >= 0, `seed ${seed} lost or reordered "${word}"`);
      cursor = found + word.length;
    }
  }
});

test("denial speak replaces grim words with euphemisms", () => {
  const out = toDenialSpeak("The server is dead and the deploy failed.", mulberry32(2));
  assert.doesNotMatch(out, /\bdead\b/);
  assert.doesNotMatch(out, /\bfailed\b/);
  assert.match(out, /resting/);
});

test("committee speak swaps corporate buzzwords", () => {
  const out = toCommitteeSpeak("We need a plan for the meeting.", mulberry32(5));
  assert.match(out, /leaf-backed strategic initiative/);
  assert.match(out, /circle-back synergy session/);
});

test("ministry memo numbers each sentence and stamps the result", () => {
  const out = toMinistryMemo("Please fix the bug. Then deploy it.", mulberry32(9));
  assert.match(out, /^1\. /m);
  assert.match(out, /^2\. /m);
  assert.match(out, /^\[ STAMP: .+ \]$/m);
});

// ---------------------------------------------------------------------
// Variety: repeated translations of the same input should not feel like
// the same three jokes on a loop. Every dialect draws from phrase banks
// large enough that running it across many seeds should hit a good
// number of distinct outputs, not just one or two.
// ---------------------------------------------------------------------

function countDistinctOutputs(fn, text, seedCount) {
  const outputs = new Set();
  for (let seed = 1; seed <= seedCount; seed++) {
    outputs.add(fn(text, mulberry32(seed)));
  }
  return outputs.size;
}

test("each dialect produces a good spread of distinct outputs across seeds", () => {
  const text = "The launch is delayed. The client is upset. Nobody has told finance yet.";
  const seedCount = 40;
  const minDistinct = {
    vogon: 38,
    memo: 38,
    committee: 10,
    oracle: 30,
    inquisition: 30,
    denial: 10,
    // The truth doesn't vary much, which is rather the point. This sample
    // has no officialese in it, so only the closing remark changes.
    truth: 3,
  };
  for (const dialect of DIALECTS) {
    const distinct = countDistinctOutputs(dialect.fn, text, seedCount);
    assert.ok(
      distinct >= minDistinct[dialect.id],
      `${dialect.id} only produced ${distinct}/${seedCount} distinct outputs, expected at least ${minDistinct[dialect.id]}`
    );
  }
});

// ---------------------------------------------------------------------
// Edge cases: unusual input shouldn't crash any dialect.
// ---------------------------------------------------------------------

test("every dialect handles punctuation-only input without crashing", () => {
  for (const dialect of DIALECTS) {
    assert.doesNotThrow(() => dialect.fn("...!?", mulberry32(1)));
  }
});

test("every dialect handles a single word without crashing", () => {
  for (const dialect of DIALECTS) {
    assert.doesNotThrow(() => dialect.fn("Hello", mulberry32(1)));
  }
});

test("every dialect handles unicode and emoji without crashing", () => {
  for (const dialect of DIALECTS) {
    const out = dialect.fn("Café résumé 🐟 naïve déjà vu", mulberry32(1));
    assert.ok(out.length > 0);
  }
});

test("every dialect handles a long, many-sentence input without crashing", () => {
  const longText = Array.from(
    { length: 25 },
    (_, i) => `This is sentence number ${i + 1} of a very long report.`
  ).join(" ");
  for (const dialect of DIALECTS) {
    assert.doesNotThrow(() => dialect.fn(longText, mulberry32(1)));
  }
});

test("every dialect works with the default (non-seeded) rng", () => {
  for (const dialect of DIALECTS) {
    const out = dialect.fn("The meeting ran long again.");
    assert.ok(out.length > 0);
  }
});

// ---------------------------------------------------------------------
// Deep Thought shows its working, and the working always comes to 42.
// ---------------------------------------------------------------------

test("deep thought's working is arithmetically correct and ends at 42", () => {
  const inputs = ["What is the meaning of life?", "Hi", "", "a".repeat(200), "Café résumé 🐟 naïve déjà vu"];
  for (const text of inputs) {
    const out = toDeepThoughtOracle(text, mulberry32(3));
    const [, letters, words, subtotal] = out.match(/> (\d+) - (\d+) = (-?\d+)/);
    assert.equal(Number(letters) - Number(words), Number(subtotal), `bad subtraction for "${text}"`);
    const fudge = out.match(/> (-?\d+) ([+-]) (\d+) \(.+\) = 42/);
    if (fudge) {
      const [, start, sign, amount] = fudge;
      const result = sign === "+" ? Number(start) + Number(amount) : Number(start) - Number(amount);
      assert.equal(result, 42, `fudge doesn't reach 42 for "${text}"`);
    } else {
      assert.equal(Number(subtotal), 42);
    }
  }
});

test("deep thought admits surprise when no correction is needed", () => {
  // 43 letters in one word: 43 - 1 = 42.
  const out = toDeepThoughtOracle("a".repeat(43), mulberry32(1));
  assert.match(out, /No correction required/);
});

test("deep thought no longer repeats the time remaining line", () => {
  const out = toDeepThoughtOracle("Why?", mulberry32(1));
  assert.equal(out.match(/Time remaining/g).length, 1);
});

// ---------------------------------------------------------------------
// Smaller dialect fixes.
// ---------------------------------------------------------------------

test("vogon lines don't end in stray punctuation like '.,'", () => {
  const out = toVogonPoetry("I love you. Will you marry me? The end.", mulberry32(1));
  assert.doesNotMatch(out, /[.?!],/);
});

test("denial speak keeps 'no' readable and softens ordinary bad news", () => {
  const out = toDenialSpeak("No, the intern deleted the database and we missed the deadline.", mulberry32(1));
  assert.match(out, /^Not as such, guv,/);
  assert.doesNotMatch(out, /deleted|missed the deadline/);
});

// ---------------------------------------------------------------------
// The Honest Fish: officialese back into plain truth.
// ---------------------------------------------------------------------

test("the honest fish decodes officialese and counts what it removed", () => {
  const out = toPlainTruth("Per my last email, let's circle back on the budget. Thanks in advance.", mulberry32(1));
  assert.match(out, /3 euphemisms removed/);
  assert.match(out, /As I already told you, in writing, let's forget about the budget\./);
  assert.match(out, /You no longer have a choice\./);
  assert.match(out, /If sent, this is expected to cause/);
});

test("the honest fish prefers the longest matching phrase", () => {
  const out = toPlainTruth("Let's circle back to it.", mulberry32(1));
  assert.match(out, /Let's forget about it\./);
});

test("the honest fish copes with curly apostrophes and odd spacing", () => {
  const out = toPlainTruth("Let’s take   this offline.", mulberry32(1));
  assert.match(out, /Stop saying this in front of witnesses\./);
});

test("the honest fish shouts back at shouting, but not at a lone acronym", () => {
  assert.match(toPlainTruth("PER MY LAST EMAIL, I NEED THIS ASAP.", mulberry32(1)), /AS I ALREADY TOLD YOU, IN WRITING, I NEED THIS YESTERDAY\./);
  assert.match(toPlainTruth("Can you send it ASAP?", mulberry32(1)), /Can you send it yesterday\?/);
});

test("the honest fish leaves plain speech alone and says so", () => {
  const text = "My cat knocked my coffee onto the keyboard.";
  const out = toPlainTruth(text, mulberry32(1));
  assert.match(out, /0 euphemisms removed/);
  assert.ok(out.includes(text));
  assert.doesNotMatch(out, /If sent/);
});

test("the honest fish handles empty input", () => {
  assert.match(toPlainTruth("   ", mulberry32(1)), /You said nothing/);
});

test("the honest fish undoes denial speak", () => {
  const original = "The server is dead and the deploy failed.";
  const softened = toDenialSpeak(original, mulberry32(2));
  assert.ok(toPlainTruth(softened, mulberry32(2)).includes(original));
});

test("the honest fish undoes committee speak", () => {
  const original = "We need a plan for the meeting.";
  const jargon = toCommitteeSpeak(original, mulberry32(5));
  assert.ok(toPlainTruth(jargon, mulberry32(5)).includes(original));
});

test("the honest fish recognises every other dialect's house style", () => {
  const text = "The server is dead. We need a plan for the meeting. Nobody has told finance yet.";
  for (const dialect of DIALECTS.filter((d) => d.id !== "truth")) {
    const out = toPlainTruth(dialect.fn(text, mulberry32(9)), mulberry32(9));
    assert.match(out, /TRANSLATING A TRANSLATION/, `didn't recognise ${dialect.id}`);
  }
});

test("dialects are grouped by direction", () => {
  for (const dialect of DIALECTS) {
    assert.ok(["into", "out"].includes(dialect.group), `${dialect.id} has no direction`);
  }
});
