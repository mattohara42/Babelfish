import { DIALECTS, translate } from "./src/dialects.mjs";

const dialectSelect = document.getElementById("dialect");
const input = document.getElementById("input");
const output = document.getElementById("output");
const fish = document.getElementById("fish");
const fishStatus = document.getElementById("fish-status");
const translateBtn = document.getElementById("translate-btn");
const improbabilityBtn = document.getElementById("improbability-btn");

for (const dialect of DIALECTS) {
  const option = document.createElement("option");
  option.value = dialect.id;
  option.textContent = dialect.label;
  dialectSelect.appendChild(option);
}

const IMPROBABLE_OUTCOMES = [
  "Somewhere, entirely without warning, a bowl of petunias thinks 'Oh no, not again.'",
  "For 0.4 seconds you are a sperm whale. The feeling of the wind in your (new) blowhole is, on reflection, magnificent. Then it passes.",
  "The translation arrives correctly, which is itself so improbable that everyone in the room briefly turns into a Wenlock stargoose.",
  "Your sentence is translated flawlessly into every language simultaneously, including several that do not yet exist and one that is just a smell.",
];

function swimFish(statusText) {
  fish.classList.remove("swimming");
  // Force reflow so the animation can restart.
  void fish.offsetWidth;
  fish.classList.add("swimming");
  fishStatus.textContent = statusText;
}

function runTranslation() {
  const text = input.value;
  const dialectId = dialectSelect.value;
  swimFish("wriggling into place...");
  const result = translate(dialectId, text, Math.random);
  output.textContent = result;
}

function runImprobabilityDrive() {
  swimFish("passing briefly through every point in the universe at once...");
  const roll = Math.random();
  if (roll < 0.25) {
    const outcome = IMPROBABLE_OUTCOMES[Math.floor(Math.random() * IMPROBABLE_OUTCOMES.length)];
    output.textContent = outcome;
    return;
  }
  const randomIndex = Math.floor(Math.random() * DIALECTS.length);
  dialectSelect.selectedIndex = randomIndex;
  runTranslation();
}

translateBtn.addEventListener("click", runTranslation);
improbabilityBtn.addEventListener("click", runImprobabilityDrive);

fishStatus.textContent = "resting patiently in a small jar";
