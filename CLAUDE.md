# Bam Portfolio — Claude Code Context

## Project overview
Static portfolio website for Natcha "Bam" Watcharawittayakul, London-based Creative Technologist & Motion Designer. No framework, no build step — pure HTML/CSS/JS served as static files.

## How to run locally
```bash
python3 -m http.server 8000
# Then open: http://localhost:8000/index.html
```

## Key files
| File | Purpose |
|------|---------|
| `index.html` | Homepage |
| `systems.html` | Systems & Computation portfolio page |
| `graphics.html` | Graphics & Motion portfolio page (needs rebuild) |
| `about.html` | About / CV page (needs rebuild to new style) |
| `project-template.html` | Shared template for all individual project pages |
| `admin.html` | Unified CMS — manages all content |
| `project-admin.html` | Per-project content block editor |
| `portfolio.json` | Single source of truth for ALL site content |

## Data architecture
Everything reads from `portfolio.json`. Structure:
```
portfolio.json
  .wip[]              → homepage WIP strip (4 items)
  .systems.featured   → featured project on systems page
  .systems.groups[]   → project sections on systems page
    .projects[]       → individual projects (each has .blocks[])
  .graphics.featured  → featured project on graphics page
  .graphics.groups[]  → project sections on graphics page
```

Each project has: id, title, latin, cat, year, src, srcType, desc, shortDesc, tools[], tags[], role, link, visible, blocks[]

Blocks (for project-template.html) can be: text | image | image-pair | video | pullquote | stats | divider

## Design system — ONE place to adjust colours & font sizes
`shared.css` is linked by **every** page (index, systems, about, graphics,
project-hand, project-template) and holds all shared tokens in its `:root`
blocks, top of the file. **To retheme or resize anything site-wide, edit
`shared.css` — you don't need to touch individual page files.**

- **TYPE SCALE** section: `--fs-2xs` (10px) through `--fs-xl` (15px) — the
  full range used for nav links, tags, labels, and body copy across every
  page. Change one value here and every page using that size updates.
  Headings/hero titles are deliberately NOT in this scale — they're sized
  per-page (fixed px or responsive `clamp()`) since they're already large
  enough and meant to differ page-to-page. To resize a specific heading,
  search that page for its class name (e.g. `.hero-h1`, `.card-title`) and
  edit its `font-size` directly.
- **IRIDOPHORE PALETTE** section: colours/fonts for `about.html`,
  `graphics.html`, `project-hand.html`, `project-template.html`
  (`--ground`, `--irid`, `--text-1/2/3`, `--serif`, `--mono`, etc).
- **AURORA PALETTE** section: colours/fonts for `index.html` and
  `systems.html` only (`--aur-*`, `--mark-blue`, `--text-primary/secondary/
  dim/accent`, `--font-display/accent/mono/thai`). This used to be
  copy-pasted separately into both pages' own `<style>` blocks — a
  "keep in sync by hand" hazard flagged in git history — now lives here once.

Each page's own `<style>` block only has page-local layout tokens that
genuinely don't need to match anything else (e.g. `project-template.html`'s
`--pad`/`--col`).

## Aurora colour tokens (in shared.css's AURORA PALETTE section)
START = scroll position 0 (top), END = scroll position 1 (bottom)
- ground-start: 255,255,255 (white)
- ground-end: 214,219,255 (soft indigo)
Change these to retheme the background without touching JS. Used by
index.html and systems.html.

## Pages still needing rebuild
- `graphics.html` — old Iridophore palette, needs rewrite to match systems.html
- `about.html` — old style, needs new Space Grotesk / aurora system

## Git / GitHub
- `admin.html` and `project-admin.html` are local-only CMS tooling (gitignored) — they never get pushed to GitHub, only the content they produce (`portfolio.json`) does.
- Repo: BamPortfolio (public, for GitHub Pages).

## Do not touch
- `portfolio.json` structure — adding fields is fine, renaming top-level keys (wip/systems/graphics) breaks all pages
- Aurora canvas JS in each page — the render loop is sensitive, test after any changes
- `--mark-blue` token — used throughout for the くB彡 logo accent
- Don't re-copy colour/font/font-size tokens back into an individual page's
  `<style>` block — they live in `shared.css` now specifically to avoid
  drift between pages. Add new shared values there, not per-page.

## Git workflow
- Work on `main` branch for small fixes
- Use feature branches for rebuilding pages: `git checkout -b rebuild/graphics-page`
- Commit after each working state: `git commit -m "feat: rebuild graphics.html to new style"`
- Never commit broken pages — test in browser first

## Content update workflow
1. Open admin.html (via local server)
2. Make changes → Download JSON
3. Replace portfolio.json in folder
4. Refresh site to verify
5. git add portfolio.json && git commit -m "content: update projects"
