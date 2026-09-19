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

test("inquisition interrupt only fires between sentences, not before the first", () => {
  const single = toInquisitionInterrupt("Just one sentence.", mulberry32(3));
  assert.doesNotMatch(single, /\*\*\*/);

  const multi = toInquisitionInterrupt("First sentence. Second sentence.", mulberry32(3));
  assert.match(multi, /\*\*\*/);
  assert.match(multi, /Our chief weapons are/);
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
