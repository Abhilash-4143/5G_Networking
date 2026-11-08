# 5G Network Explorer

An interactive, educational web platform for exploring wireless communication fundamentals, 5G network architecture, live client-side network simulation, security and device authentication, AI-assisted network monitoring (rule-based sandbox), emergency-connectivity scenarios, and future network technologies.

> **Educational concept only.** Everything in this application is a client-side simulation for learning. It is not connected to any commercial carrier network, does not transmit real radio signals, and does not provide real emergency communication. Figures labelled "illustrative" or "IMT-2020 target" are planning values, never field benchmarks.

## Project identity

- **Name:** 5G Network Explorer — *Explore. Simulate. Understand the Future of Connectivity.*
- **Academic concept:** Independent Long-Range Communication Network

## Features

- 12 fully implemented routes: home, fundamentals, architecture, simulator, performance, base station, security, AI network operations, emergency network, future networks, project, about (+ a 404 page).
- Interactive 3D network hero (Three.js / React Three Fiber) with a 2D fallback and reduced-motion support.
- Layered interactive architecture explorer (SVG) with zoom, link highlighting, packet-flow animation, and full-screen mode.
- Eight-stage message transmission simulator with latency, packet-loss, density, congestion, pause/resume, and failure/recovery modes, plus a timestamped event log and local history.
- Radio fundamentals labs (frequency, bandwidth/Shannon capacity, modulation constellations, antenna arrays, noise, propagation) with a knowledge-check quiz.
- 4G vs 5G performance lab with charts and adjustable illustrative conditions.
- Base station component explorer, authentication success/failure simulator, rule-based NOC sandbox, emergency village scenario, and a future-technologies roadmap with a 4G→6G timeline.
- Global search (Ctrl/⌘+K), midnight/daylight themes, persisted preferences, keyboard and screen-reader considerations, responsive layout (360px–1920px).

## Technology

| Area | Technology |
| --- | --- |
| Framework | React 18, Vite 6, TypeScript |
| Styling | Tailwind CSS 3, custom glass + clay design system |
| UI | Lucide React, Framer Motion |
| Visualization | Three.js, React Three Fiber, Drei, Recharts |
| State | React hooks + localStorage (no backend, no API keys) |
| Hosting | GitHub + Vercel free tier |

## Getting started

**Prerequisites:** Node.js 20+ and npm.

```bash
npm install
npm run dev      # local development (Vite)
npm run build    # type-check + production build → dist/
npm run preview  # preview the production build
```

No environment variables or API keys are required.

## Deploying

### GitHub

```bash
git init
git add .
git commit -m "5G Network Explorer: interactive 5G learning platform"
git branch -M main
git remote add origin https://github.com/<you>/5g-network-explorer.git
git push -u origin main
```

### Vercel (free tier)

1. Push the repository to GitHub.
2. In [Vercel](https://vercel.com), choose **Add New → Project** and import the repository.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`. No environment variables needed.
4. Deploy. `vercel.json` is included so client-side routes resolve correctly.

## Project structure

```
src/
  components/
    common/    # Navbar, Footer, Logo, SearchDialog, ThemeProvider, PageHeader, ErrorBoundary
    ui/        # Button, Panel, Controls, Tooltip, Section, Reveal
    viz/       # NetworkHero3D, ArchitectureExplorer
  data/        # site.ts (nav/search), architecture.ts (layers/components)
  lib/         # cn, storage, meta, utils
  pages/       # one lazy-loaded page per route
  App.tsx      # route definitions
  main.tsx
  index.css    # design tokens + glass/clay utilities
```

## Credits

Academic project — Independent Long-Range Communication Network. Team members, their IDs, and the project framing are listed on the Project and About pages.
