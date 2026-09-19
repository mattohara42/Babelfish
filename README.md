# Babelfish

> "The Babel fish is small, yellow, leech-like, and probably the oddest
> thing in the universe." It translates. It does not promise the result
> will be *pleasant*.

Babelfish is a small web toy: type any text, pick a target "dialect," and
get back an absurd mistranslation in a house style inspired by Douglas
Adams and Monty Python. It is a fan pastiche written in original language,
not a reproduction of anything from the books or sketches.

## Dialects on offer

- **Vogon Poetry** — deliberately terrible free verse.
- **Ministry Memo** — bureaucratic doublespeak, stamped and filed in
  triplicate, addressed to a department that does not exist.
- **Golgafrinchan Committee-Speak** — corporate buzzword soup, currency
  optionally denominated in leaves.
- **Deep Thought Oracle** — answers every question with 42, after a
  suitably portentous (and mercifully abbreviated) delay.
- **Spanish Inquisition Interrupt** — chops your text with dramatic,
  self-aware interruptions.
- **Norwegian Blue Denial-Speak** — replaces anything grim with a cheerful
  euphemism. Nothing here is dead. It is resting.

There's also an **Improbability Drive** button, for when you'd rather not
choose.

## Running it

No build step. It's a static page.

```bash
npm start   # serves the current directory (uses npx serve)
```

Then open the printed URL, or just open `index.html` directly in a
browser.

## Running the tests

The translation logic lives in `src/dialects.mjs` as plain, dependency-free
functions, so it's tested with Node's built-in test runner:

```bash
npm test
```

## Project layout

```
index.html          the page
style.css           Guide-terminal styling
app.js              DOM wiring (dialect select, buttons, fish animation)
src/dialects.mjs     the actual "translation" logic, pure functions
tests/dialects.test.mjs
```

## Deploying

It's a static site with no server-side dependencies, so any static host
works (Netlify, GitHub Pages, etc.) — point it at the repo root, no build
command needed.

## Disclaimer

Wholly unofficial. Mostly harmless.
