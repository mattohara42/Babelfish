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
  assert.doesNotMatch(single, /NOBODY EXPECTS/);

  const multi = toInquisitionInterrupt("First sentence. Second sentence.", mulberry32(3));
  assert.match(multi, /NOBODY EXPECTS/);
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
  assert.match(out, /APPROVED IN PRINCIPLE/);
});
