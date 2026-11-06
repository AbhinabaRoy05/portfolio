# Abhinaba Roy — Portfolio

Static site: `index.html` + `css/` + `js/`. Hosted on GitHub Pages.

## Publish changes

Edit files, then double-click **`publish.bat`** (or run `git add -A && git commit -m "Update" && git push`).
GitHub Pages rebuilds automatically; the live link updates in about a minute.

## Edit everything in `js/data.js`

- `email` — address used by the LET'S CONNECT button.
- `portrait` — e.g. `"assets/img/portrait.jpg"` (4:5 works best).
- `tools[].icon` — optional path to an icon in `assets/icons/` (white logo on transparent, ~120×120 `.webp`); leave empty to show the letter mark.
- `categories[].items[]`
  - `video` — YouTube link (watch, youtu.be, shorts), Vimeo link, or a local `.mp4`.
  - `thumb` — optional image; YouTube links get their thumbnail automatically.
  - `preview` — optional muted `.mp4` that plays on hover (Motion Graphics).
  - `title`, `description`, `meta`.

`IMAGES/` holds the original logo files the toolkit icons were made from.
