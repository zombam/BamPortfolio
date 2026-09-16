# Bam Portfolio — Claude Code Context

## Project overview
Static portfolio website for Natcha "Bam" Watcharawittayakul, London-based Creative Technologist & Motion Designer. No framework, no build step — pure HTML/CSS/JS served as static files.

## How to run locally
```bash
python3 -m http.server 8000
# Then open: http://localhost:8000/index3.html
```

## Key files
| File | Purpose |
|------|---------|
| `index3.html` | Homepage — do not rename until ready to go live |
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

## Design system tokens (in each page's :root)
- `--mark-blue: #0000FF` — logo accent, used sparingly
- `--font-display: 'Space Grotesk'` — headings
- `--font-accent: 'Cormorant Garamond'` — italic em accents
- `--font-mono: 'IBM Plex Mono'` — labels, CTAs
- `--font-thai: 'Noto Sans Thai'` — Thai eyebrow marks
- Aurora aurora is a fixed canvas background — colours driven by CSS tokens `--aur-*`

## Aurora colour tokens (top of each page's :root)
START = scroll position 0 (top), END = scroll position 1 (bottom)
- ground-start: 255,255,255 (white)
- ground-end: 214,219,255 (soft indigo)
Change these to retheme the background without touching JS.

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
