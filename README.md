# Abhinaba Roy — Portfolio

Open `index.html` in a browser. For YouTube embeds to play, serve the folder (e.g. `npx serve .` or VS Code Live Server) or host it (Netlify / Vercel / GitHub Pages) — YouTube blocks embeds on pages opened directly from disk.

## Edit everything in `js/data.js`

- `email` — address used by the LET'S CONNECT button.
- `portrait` — e.g. `"assets/img/portrait.jpg"` (4:5 works best).
- `tools[].icon` — optional path to an icon file in `assets/icons/`; leave empty to show the letter mark.
- `categories[].items[]`
  - `video` — YouTube link (watch, youtu.be, shorts), Vimeo link, or a local `.mp4`.
  - `thumb` — optional image; YouTube links get their thumbnail automatically.
  - `preview` — optional muted `.mp4` that plays on hover (Motion Graphics).
  - `title`, `description`, `meta`.
