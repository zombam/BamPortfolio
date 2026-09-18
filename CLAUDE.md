# Bam Portfolio — Claude Code Context

## Project overview
Portfolio website for Natcha "Bam" Watcharawittayakul, London-based Creative Technologist & Motion Designer. Static HTML/CSS/JS pages (no framework, no build step) that fetch their content from **Sanity** (a hosted headless CMS) at load time.

## How to run locally
```bash
python3 -m http.server 8000
# Then open: http://localhost:8000/index.html
```
Pages fetch live content from Sanity's public API — no local content file needed. If a page shows no projects, check that `http://localhost:8000` is still an allowed CORS origin on the Sanity project (see "Sanity project" below) and that you're loading via `http://localhost:8000/...`, not `file://...` (the latter isn't a whitelisted origin and every fetch will silently fail).

## Key files
| File | Purpose |
|------|---------|
| `index.html` | Homepage — dynamic: fetches content via `js/sanity-data.js` and renders the "Selected specimens" grid |
| `systems.html` | Systems & Computation portfolio page — dynamic |
| `graphics.html` | Graphics & Motion portfolio page — dynamic, aurora design system (coral variant) |
| `about.html` | About / CV page — aurora design system (default blue, matches homepage) |
| `project-hand.html` | Standalone hand-built page for "The H.A.N.D." (predates `project-template.html`) |
| `project-template.html` | Shared template for every other individual project page (`?id=<project-slug>`) |
| `js/sanity-data.js` | Single fetch layer — runs one GROQ query against Sanity and reshapes the result into the object shape every page's render code expects (`{wip, systems:{meta,featured,groups}, graphics:{...}}`). All four pages above call `PORTFOLIO_DATA.fetchPortfolio()` from this file instead of hitting Sanity directly. |
| `sanity/` | The Sanity Studio project — schema, config, and the one-time migration script. See "Sanity project" below. |
| `css/shared.css` | Single source of truth for colours, fonts, font sizes, and project "content block" styles |

## Sanity project
Content is authored in **Sanity Studio**, not in a local file. Project ID `l4ak4e6v`, dataset `production` (public read — no auth needed for the live site to fetch content).

- **Editing content**: run the Studio locally with `cd sanity && npm run dev` (opens `http://localhost:3333`), or deploy a hosted Studio with `npx sanity deploy` so it's editable from anywhere without running anything locally.
- **Document types** (`sanity/schemaTypes/`): `project` (one per case study — has a `portfolio` field of `systems`/`graphics`, `isFeatured`+`badge` for the one spotlight project per portfolio, and a `blocks[]` array for the project-page body), `projectGroup` (a labelled, ordered list of project references — this is what renders as a section on `systems.html`/`graphics.html`), `wipItem` (homepage WIP strip), `siteSettings` (singleton — page titles/taglines/bios for both portfolios).
- **Media**: uploaded directly in the Studio's image/file pickers and served from Sanity's CDN — there's no more "connect a media folder" step. The local `media/` folder now only holds site-wide static assets that aren't per-project content (logo, CV PDFs).
- **CORS**: Sanity only answers browser `fetch()` calls from origins you've explicitly allowed. Currently whitelisted: `http://localhost:3333`, `http://localhost:8000`, `https://zombam.github.io`. Adding a new domain (e.g. a custom domain later): `cd sanity && npx sanity cors add https://yourdomain.com --credentials false`.
- **`sanity/scripts/migrate-portfolio.mjs`**: the one-time script used to import the old `portfolio.json` into Sanity. Kept for reference / in case a from-scratch re-import is ever needed — not part of the normal editing workflow anymore.
- **`sanity/.env`**: holds `SANITY_STUDIO_PROJECT_ID` and a write token (`SANITY_MIGRATE_TOKEN`) used only by the migration script. Gitignored — never commit it. `sanity/.env.example` shows the shape.

## Data architecture
`js/sanity-data.js` exports `PORTFOLIO_DATA.fetchPortfolio()`, which every page calls once and gets back:
```
{
  wip[]              → homepage WIP strip (currently commented out in index.html)
  systems.meta       → systems.html hero copy (from siteSettings.systemsMeta)
  systems.featured   → the one big spotlight project on systems.html (also appears on the homepage grid)
  systems.groups[]   → project sections on systems.html
    .projects[]      → individual projects, each with .blocks[]
  graphics.{meta,featured,groups[]} → same shape, for graphics.html
}
```
This is deliberately the same shape the old `portfolio.json` had, so none of the render code in `index.html`/`systems.html`/`graphics.html`/`project-template.html` needs to know Sanity exists — only `js/sanity-data.js`'s GROQ query does the reshaping. If you need a new field on the page side, add it to the relevant Sanity schema **and** to the GROQ projection in `js/sanity-data.js` — both, or it won't show up.

Each project has: `id` (from Sanity's `slug`), `title`, `latin`, `cat`, `year`, `src`/`srcType` (resolved from the Sanity `hero` media field to a real CDN URL), `desc`, `shortDesc`, `tools[]`, `tags[]`, `role`, `link` (external URL if set, otherwise auto-generated `project-template.html?id=<slug>`), `visible`, `featuredHome`, `blocks[]`. Graphics projects also carry an optional `status` (`active`/`archived`/`thesis` — drives a coloured dot) and `statusLabel`.

Blocks (rendered by `project-template.html`, styled by `css/shared.css`'s CONTENT BLOCKS section) can be: text | image | image-pair | video | pullquote | stats | divider — these map 1:1 to the `*Block` object types in `sanity/schemaTypes/objects/`.

### Homepage curation (`featuredHome`)
`index.html`'s "Selected specimens" grid is NOT a fixed list — it always shows `systems.featured` (as the big hero card) + `graphics.featured`, plus every project (from either portfolio's groups) with `featuredHome: true`. Toggle this per-project on the `project` document in the Sanity Studio. No page code to touch.

### Project pages don't show an overlay
Clicking a project card navigates straight to its page (`project-template.html?id=...`, or an external link for the handful of graphics projects still hosted elsewhere) — there's no bottom-sheet drawer anymore. If a project's `src` is a video or gif, the hero on its *card* plays on hover and pauses on mouse-leave (muted, looped); the project's own detail-page hero still autoplays normally.

## Design system — ONE place to adjust colours & font sizes
`css/shared.css` is linked by **every** page (index, systems, about, graphics, project-hand, project-template) and holds all shared tokens in its `:root` blocks, top of the file, plus the project "content block" styles further down. **To retheme, resize, or restyle project content site-wide, edit `css/shared.css` — you don't need to touch individual page files.**

- **TYPE SCALE** section: 3 tokens — `--fs-xs` (~11px, nav links/tags/labels/meta), `--fs-sm` (~13px, default body copy), `--fs-md` (~15px, larger/lead body copy). Each is a `clamp(min, preferred, max)` — fluid, shrinks a little on phones, grows a little on large desktop monitors; current numbers hold near common laptop widths (~1280–1440px). Headings/hero titles are deliberately NOT in this scale — sized per-page (fixed px or their own responsive `clamp()`) since they're already large enough and meant to differ page-to-page. To resize a specific heading, search that page for its class name (e.g. `.hero-h1`, `.card-title`) and edit its `font-size` directly.
- **Fonts**: 3 total — `Space Grotesk` (display/body sans), `Cormorant Garamond` (italic serif accent), `IBM Plex Mono` (labels/CTAs/nav — used by both design systems below). Plus `Noto Sans Thai`, used ONLY for the Thai "eyebrow mark" motif (แมงกะพรุน, ระบบ, กราฟิก, etc.) since none of the other 3 fonts contain Thai glyphs — a script requirement, not a style choice, so it doesn't count toward "how many fonts."
- **CONTENT BLOCKS** section: all `.block-*` styles (text/image/image-pair/video/pullquote/divider/stats) used by `project-template.html`. Was previously only in that page's own `<style>` tag; centralized here so it's the same "one place to edit" as everything else.
- **IRIDOPHORE PALETTE** section: colours/fonts for `project-hand.html` and `project-template.html`'s page-local tokens (`--ground`, `--irid`, `--text-1/2/3`, `--serif`, `--mono`, etc). `project-hand.html` is the last page still on this old look (a one-off page that predates the aurora system).
- **AURORA PALETTE** section: colours/fonts for `index.html`, `about.html`, and `project-template.html` (blue/periwinkle, the default) — `--aur-*`, `--mark-blue`, `--text-primary/secondary/dim/accent`, `--font-display/accent/mono/thai`. Used to be copy-pasted separately into each page's own `<style>` block — now lives here once.
- **AURORA PALETTE — EMERALD VARIANT** section: the same tokens retheme green/emerald, scoped to `:root.aurora-emerald`. `systems.html` puts `class="aurora-emerald"` on its `<html>` tag to pick this up instead of the default blue.
- **AURORA PALETTE — CORAL VARIANT** section: same tokens retheme coral/pink, scoped to `:root.aurora-coral`. `graphics.html` puts `class="aurora-coral"` on its `<html>` tag. The aurora canvas script and all page CSS are otherwise identical across every variant — to retheme a page, edit only the RGB triplets in its variant block.
- **AURORA NAV** section: the entire top bar shared by every aurora page (index/systems/graphics/about/project-template) — container, logo (incl. the swim-idle animation + hover reveal), nav links, "Open to work" pip, and CTA button. Scoped to `.aurora-nav` (put that class on `<nav>` alongside `.nav`) so it can't collide with the plain `.nav`/`.nav-link` used by the Iridophore nav (`project-hand.html`). To change the nav's size, spacing, or animation on every page at once, edit this section only.

Each page's own `<style>` block only keeps page-local layout tokens that genuinely don't need to match anything else (e.g. `project-template.html`'s `--pad`/`--col`), plus that page's own unique section CSS (e.g. `about.html`'s editorial CV layout — bio rail, experience timeline, skills grid — none of which exists on other pages).

## Aurora colour tokens (in css/shared.css's AURORA PALETTE section)
START = scroll position 0 (top), END = scroll position 1 (bottom)
- ground-start: 255,255,255 (white)
- ground-end: 214,219,255 (soft indigo)
Change these to retheme the background without touching JS. Used by index.html and systems.html.

## Pages still needing rebuild
- `project-hand.html` — the one page left on the old Iridophore look (a hand-built one-off that predates `project-template.html`). Not currently planned for rebuild unless asked.

## Known gaps
- `about.html`'s "Download CV" buttons (`#cv-strip`) point to `media/NatchaWatcharawittayakul-CV-CreativeTechnologist.pdf` and `...CV-Designer.pdf` — neither file exists yet, so both links 404. Add real PDFs at those exact paths (or update the `href`s to match whatever filenames you use).

## Git / GitHub
- `sanity/node_modules/`, `sanity/.env`, and `sanity/.sanity/` (local dev cache) are gitignored — everything else in `sanity/` (schema, config, migration script) is tracked.
- Repo: BamPortfolio (public, for GitHub Pages).

## Do not touch
- Aurora canvas JS in each page — the render loop is sensitive, test after any changes
- `--mark-blue` token — used throughout for the くB彡 logo accent
- Don't re-copy colour/font/font-size/block-style tokens back into an individual page's `<style>` block — they live in `css/shared.css` now specifically to avoid drift between pages. Add new shared values there, not per-page.
- Don't hand-edit the project card markup in `index.html`/`systems.html`/`graphics.html` — those grids are rendered by the data-loader `<script>` near the bottom of each file, reading from Sanity via `js/sanity-data.js`. Edit content in the Sanity Studio instead.
- Don't add a per-page fetch directly to Sanity's API — always go through `PORTFOLIO_DATA.fetchPortfolio()` in `js/sanity-data.js` so every page stays on one query/shape.

## Content update workflow
1. Run the Studio: `cd sanity && npm run dev`, open `http://localhost:3333` (or use a deployed Studio URL if `sanity deploy` has been run).
2. Edit/create `project` documents, toggle `visible`/`featuredHome`/`isFeatured`, upload hero + block media directly in the Studio.
3. Reorder projects within a section, or add a new section, by editing the relevant `projectGroup` document's `projects` list (drag to reorder) and `order` field.
4. Refresh the local site (`http://localhost:8000`) to verify — no download/upload/commit step needed, changes are live as soon as they're published in the Studio.

## Git workflow
- Work on `main` branch for small fixes
- Use feature branches for rebuilding pages: `git checkout -b rebuild/graphics-page`
- Commit after each working state: `git commit -m "feat: rebuild graphics.html to new style"`
- Never commit broken pages — test in browser first
