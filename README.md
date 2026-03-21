# Gramercy Home Planner

Interactive home improvement planning tool for 3506 S Gramercy Place, Los Angeles — a 1914 bungalow (~1,000 sqft, 2BR/2BA).

Built to help Aaron & Edina compare projects, visualize timelines, and make informed financial decisions over a 5-year improvement horizon.

## Live App

Deployed on Vercel (URL TBD after deployment).

## Features

### Project Planning
- **7 configurable projects**: Foundation + floors, bedroom expansion, ADU, backyard privacy, kitchen/living refresh, fixtures/lighting, and a stay-vs-move comparison
- **Project cards** with cost ranges, timelines, disruption levels, baby-relevance flags, and dependency tracking
- **Mutual exclusivity** between ADU and house extension options
- **Preset plans**: Conservative (must-dos only), Balanced (essentials + QoL), Go Big (everything + ADU)

### Financial Analysis
- **3 budget tiers**: $200k / $350k / $500k with personalized ROI projections
- **Investment analysis modal**: Compares home spending vs. stock market returns, factors in the 2.9% rate lock advantage, retirement readiness check, and emergency fund assessment
- **Stay vs. Move comparison**: Side-by-side financial breakdown including transaction costs, rate lock savings, and 5-year net position

### Timeline
- **5-year Gantt-style view** (2026–2030) showing project sequencing and overlap
- Optimized for the baby timeline (structural work before arrival)

### UX
- **URL state persistence** — share a specific configuration via link
- **Mobile-responsive** layout with breakpoint-aware components
- **Sticky summary bar** with real-time budget tracking and progress indicator

## Tech Stack

Single-file React component (JSX) designed for use as a claude.ai artifact or standalone deployment.

- React (hooks: useState, useMemo, useEffect, useCallback)
- Tailwind CSS (utility classes only, no build step required)
- No external dependencies beyond React and Tailwind

## Future Roadmap

Features we're considering for future iterations:

1. **Baby countdown banner** — visual countdown to target arrival date with milestone markers tied to project completion
2. **Category color coding** — color-code project cards by category (structural, cosmetic, lifestyle) for faster scanning
3. **Per-project notes & comments** — inline notes field on each project card so Aaron and Edina can leave comments/disagreements for each other
4. **Contractor contact integration** — store and display contractor info, quotes, and availability per project
5. **Photo gallery per project** — attach before/after photos, inspiration images, and reference material
6. **Actual cost tracking** — once work begins, track real spend vs. estimates
7. **Export to PDF** — generate a printable summary of the current plan configuration

## Project History

| Date | Work | Cost |
|------|------|------|
| 2022 | Front & back garden + deck (TimberTech Azek English Walnut) | ~$10-15k |
| 2023 | Perimeter foundation repair | ~$15k + temp housing |
| 2026 | This planning tool | $0 (vibes) |

## Files

- `gramercy-home-planner.jsx` — the entire app in a single file
- `README.md` — you are here

## Local Development

This is a single JSX file intended to run in environments that provide React and Tailwind (like claude.ai artifacts, or a Vite/Next.js project). To run standalone:

```bash
npm create vite@latest gramercy-planner -- --template react
cd gramercy-planner
# replace src/App.jsx with gramercy-home-planner.jsx content
npm install
npm run dev
```

---

*Last updated March 2026*
