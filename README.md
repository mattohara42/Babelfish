# Babelfish

**Live: [babelfish-translator.netlify.app](https://babelfish-translator.netlify.app/)**

> "The Babel fish is small, yellow, leech-like, and probably the oddest
> thing in the universe." It translates. It does not promise the result
> will be *pleasant*.

Babelfish is a small web toy that translates in both directions. Type
plain speech and it comes back as Vogon poetry, a Ministry memo, or
worse. Paste in officialese (a reorg email, a press release, an estate
agent's listing) and the Honest Fish tells you what it actually meant.

The house style is inspired by Douglas Adams and Monty Python. Most of
the writing is original pastiche, but a few famous catchphrases are
borrowed on purpose, because the Inquisition and the parrot don't work
without them.

## Dialects on offer

Officialese into plain truth:

- **The Honest Fish**: decodes corporate, bureaucratic and polite-British
  euphemism into what was really meant, counts the euphemisms it
  removed, and estimates the diplomatic fallout if you sent the honest
  version. Feed it one of the other dialects' output and it recognises
  the house style and says what it amounts to.

Plain speech into officialese:

- **Vogon Poetry**: deliberately terrible free verse.
- **Ministry Memo**: bureaucratic doublespeak, stamped and filed in
  triplicate, addressed to a department that does not exist.
- **Golgafrinchan Committee-Speak**: corporate buzzword soup, currency
  optionally denominated in leaves.
- **Deep Thought Oracle**: shows its working, using the letters and
  words of your question, and always arrives at 42.
- **Spanish Inquisition Interrupt**: bursts in mid-sentence, at a moment
  you won't expect, and then has to come in again.
- **Norwegian Blue Denial-Speak**: replaces anything grim with a cheerful
  euphemism. Nothing here is dead. It is resting.

There's also an **Improbability Drive** button, for when you'd rather not
choose.

## Things to do with a translation

**Hear it.** The fish reads the translation aloud, with a different voice
for each dialect: the Vogon is very low and very slow, the Ministry reads
at terms-and-conditions speed, and the Inquisition's interruptions are
shouted. It uses the browser's built-in speech, so how it sounds depends
on the voices your device has installed.

**Copy link.** Every translation is seeded, and the seed, text and dialect
live in the URL hash. Anyone who opens the link gets exactly the same
translation. The hash never leaves the browser, so the text isn't sent to
the server.

**Feed it back in.** Puts the translation back in the box, so you can
translate the translation. Committee-Speak and Denial-Speak are simple
word swaps, so the Honest Fish can undo them: "the server is resting"
goes back to "the server is dead."

## Running it

No build step. It's a static page.

```bash
npm start   # serves the current directory (uses npx serve)
```

Then open the printed URL. Opening `index.html` straight from disk doesn't
work in Chrome and other Chromium browsers, which block ES modules on
`file://` pages.

## Running the tests

The translation logic lives in `src/` as plain, dependency-free
functions, so it's tested with Node's built-in test runner:

```bash
npm test
```

## Project layout

```
index.html              the page
style.css               Guide-terminal styling
app.js                  DOM wiring: dialect picker, sharing, speech, fish animation
src/dialects.mjs        the "translation" logic, pure functions
src/honest-lexicon.mjs  the Honest Fish's phrasebook (officialese -> meaning)
tests/dialects.test.mjs
```

The Honest Fish phrasebook is the easiest place to contribute. Add a
`["phrase", "what it means"]` pair and it's picked up automatically.
Matching ignores case, prefers the longest phrase, and copes with curly
apostrophes.

## Deploying

Deployed on Netlify, linked to this repo's `main` branch. Every push
there rebuilds and republishes automatically, with no build command
needed since it's a static site. Any other static host (GitHub Pages,
etc.) works the same way if you'd rather point it there instead.

## Disclaimer

Wholly unofficial. Mostly harmless.
