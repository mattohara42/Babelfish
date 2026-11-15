import { DIALECTS, translate, mulberry32 } from "./src/dialects.mjs";

const dialectSelect = document.getElementById("dialect");
const input = document.getElementById("input");
const output = document.getElementById("output");
const fish = document.getElementById("fish");
const fishStatus = document.getElementById("fish-status");
const translateBtn = document.getElementById("translate-btn");
const improbabilityBtn = document.getElementById("improbability-btn");
const outputTools = document.getElementById("output-tools");
const hearBtn = document.getElementById("hear-btn");
const copyLinkBtn = document.getElementById("copy-link-btn");
const feedBackBtn = document.getElementById("feed-back-btn");

const GROUPS = [
  ["out", "Officialese → plain truth"],
  ["into", "Plain speech → officialese"],
];
for (const [group, label] of GROUPS) {
  const optgroup = document.createElement("optgroup");
  optgroup.label = label;
  for (const dialect of DIALECTS.filter((d) => d.group === group)) {
    const option = document.createElement("option");
    option.value = dialect.id;
    option.textContent = dialect.label;
    optgroup.appendChild(option);
  }
  dialectSelect.appendChild(optgroup);
}

const IMPROBABLE_OUTCOMES = [
  "Somewhere, entirely without warning, a bowl of petunias thinks 'Oh no, not again.'",
  "For 0.4 seconds you are a sperm whale. The feeling of the wind in your (new) blowhole is, on reflection, magnificent. Then it passes.",
  "The translation arrives correctly, which is itself so improbable that everyone in the room briefly turns into a Wenlock stargoose.",
  "Your sentence is translated flawlessly into every language simultaneously, including several that do not yet exist and one that is just a smell.",
];

const AFTER_SWIM = [
  "translated. the fish looks pleased with itself.",
  "done. the fish would like it noted that it did its best.",
  "complete. the fish is now resting (the ordinary kind).",
];

// The translation on screen, kept so it can be shared or read aloud.
// Null when the Improbability Drive produced something unrepeatable.
let current = null;
let statusAfterSwim = "";

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function swimFish(during, after) {
  fish.classList.remove("swimming");
  // Force reflow so the animation can restart.
  void fish.offsetWidth;
  fish.classList.add("swimming");
  fishStatus.textContent = during;
  statusAfterSwim = after;
}

fish.addEventListener("animationend", () => {
  if (statusAfterSwim) fishStatus.textContent = statusAfterSwim;
  statusAfterSwim = "";
});

// ---------------------------------------------------------------------
// Translating, and sharing a translation by link
// ---------------------------------------------------------------------
//
// Every translation is seeded, and the seed goes in the URL alongside the
// text and dialect, so a link reproduces the exact same output. It lives
// in the hash, which browsers never send to the server.

function newSeed() {
  return Math.floor(Math.random() * 2 ** 32);
}

function runTranslation(seed = newSeed()) {
  stopSpeaking();
  const text = input.value;
  const dialectId = dialectSelect.value;
  swimFish("wriggling into place...", pickOne(AFTER_SWIM));
  output.textContent = translate(dialectId, text, mulberry32(seed));
  current = { dialectId, text, seed };
  const params = new URLSearchParams({ d: dialectId, s: String(seed), t: text });
  history.replaceState(null, "", `#${params}`);
  outputTools.hidden = false;
}

function runImprobabilityDrive() {
  if (Math.random() < 0.25) {
    stopSpeaking();
    swimFish("passing briefly through every point in the universe at once...", "back again. probably.");
    output.textContent = pickOne(IMPROBABLE_OUTCOMES);
    current = null;
    history.replaceState(null, "", location.pathname + location.search);
    outputTools.hidden = false;
    return;
  }
  dialectSelect.value = pickOne(DIALECTS).id;
  runTranslation();
}

function readSharedTranslation() {
  const params = new URLSearchParams(location.hash.slice(1));
  const dialectId = params.get("d");
  const text = params.get("t");
  const seed = Number(params.get("s"));
  const valid =
    DIALECTS.some((d) => d.id === dialectId) &&
    text !== null &&
    params.has("s") &&
    Number.isInteger(seed);
  return valid ? { dialectId, text, seed: seed >>> 0 } : null;
}

async function copyLink() {
  if (!current) {
    fishStatus.textContent = "that outcome was far too improbable to link to.";
    return;
  }
  try {
    await navigator.clipboard.writeText(location.href);
    fishStatus.textContent = "link copied. whoever opens it gets this exact translation.";
  } catch {
    fishStatus.textContent = "the fish couldn't reach your clipboard, but the link is in the address bar.";
  }
}

function feedBack() {
  input.value = output.textContent;
  input.scrollIntoView({ block: "center", behavior: "smooth" });
  fishStatus.textContent =
    dialectSelect.value === "truth"
      ? "fed back in. the fish eyes its own work with suspicion."
      : "fed back in. try the Honest Fish on it.";
}

// ---------------------------------------------------------------------
// Reading it aloud
// ---------------------------------------------------------------------
//
// Each dialect gets its own voice. Browsers differ a lot in how far they
// honour pitch and rate, so these are stage directions, not a score.

const synth = "speechSynthesis" in window ? window.speechSynthesis : null;

const VOICES = {
  truth: { pitch: 0.9, rate: 0.95 },
  vogon: { pitch: 0.1, rate: 0.7 },
  memo: { pitch: 0.8, rate: 1.4 },
  committee: { pitch: 1.4, rate: 1.15 },
  oracle: { pitch: 0.3, rate: 0.8 },
  inquisition: { pitch: 1.1, rate: 1.0 },
  denial: { pitch: 1.5, rate: 1.05 },
};
// Used for the Inquisition's "*** NOBODY EXPECTS ... ***" lines.
const SHOUT = { pitch: 2, rate: 1.5 };

function speakable(line) {
  return line
    .replace(/[*>[\]]/g, " ")
    .replace(/ - /g, " minus ")
    .replace(/ \+ /g, " plus ")
    .replace(/ = /g, " equals ")
    .replace(/\s+/g, " ")
    .trim();
}

function preferredVoice() {
  const voices = synth.getVoices();
  return (
    voices.find((v) => v.lang === "en-GB") ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null
  );
}

// Tracked here rather than read from speechSynthesis.speaking, which some
// browsers report unreliably (and headless ones never set at all).
let speaking = false;

function setSpeaking(on) {
  speaking = on;
  hearBtn.textContent = on ? "■ Stop" : "🔊 Hear it";
  hearBtn.setAttribute("aria-pressed", String(on));
}

function stopSpeaking() {
  if (synth) synth.cancel();
  setSpeaking(false);
}

function speak() {
  if (speaking) {
    stopSpeaking();
    return;
  }
  // The Improbability Drive's outcomes get a voice nobody could predict.
  const profile = current
    ? VOICES[current.dialectId]
    : { pitch: 0.2 + Math.random() * 1.8, rate: 0.6 + Math.random() * 1.0 };
  const voice = preferredVoice();
  const lines = output.textContent
    .split("\n")
    .map((raw) => ({ raw, text: speakable(raw) }))
    .filter((line) => line.text);
  if (!lines.length) return;

  lines.forEach(({ raw, text }, i) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const settings = raw.includes("***") ? SHOUT : profile;
    utterance.pitch = settings.pitch;
    utterance.rate = settings.rate;
    if (voice) utterance.voice = voice;
    const isLast = i === lines.length - 1;
    utterance.onend = () => {
      if (isLast) setSpeaking(false);
    };
    utterance.onerror = (event) => {
      // Being cut off by Stop or a new translation is not a failure.
      if (event.error === "interrupted" || event.error === "canceled") {
        if (isLast) setSpeaking(false);
        return;
      }
      stopSpeaking();
      fishStatus.textContent = "the fish has lost its voice. your browser couldn't produce any speech.";
    };
    synth.speak(utterance);
  });
  setSpeaking(true);
  fishStatus.textContent = "the fish clears its throat.";
}

if (!synth) hearBtn.hidden = true;

// ---------------------------------------------------------------------

translateBtn.addEventListener("click", () => runTranslation());
improbabilityBtn.addEventListener("click", runImprobabilityDrive);
hearBtn.addEventListener("click", speak);
copyLinkBtn.addEventListener("click", copyLink);
feedBackBtn.addEventListener("click", feedBack);

const shared = readSharedTranslation();
if (shared) {
  input.value = shared.text;
  dialectSelect.value = shared.dialectId;
  runTranslation(shared.seed);
  statusAfterSwim = "delivered from a shared link, slightly damp.";
} else {
  fishStatus.textContent = "resting patiently in a small jar";
}
