# Toolbox

A lightweight, client-side multi-tool app built with React, TypeScript, and Tailwind CSS.

## Tools

| Tool | Description |
|------|-------------|
| **Date Diff** | Calculate the number of days between multiple date pairs, with a running total |
| **UUID** | Generate 1, 50, 100, or 500 random UUIDs with one-click copy |
| **Cron** | Explain any 5-field cron expression in plain English or Spanish |

## Features

- English / Spanish language support (auto-detects browser language)
- Dark mode (auto-detects system preference)
- All preferences persisted to `localStorage` — no backend, no accounts
- Responsive: sidebar on desktop, top bar on mobile

## localStorage keys

| Key | Values | Purpose |
|-----|--------|---------|
| `theme` | `dark` / `light` | Dark mode preference |
| `lang` | `en` / `es` | Language preference |
| `active-tool` | `date-diff` / `uuid` / `cron` | Last active tool |
| `date-pairs` | JSON | Saved date pairs |

## Project structure

```
src/
├── App.tsx                  # Shell: sidebar, routing, shared state
├── i18n.ts                  # Translations (en/es) + useLocale hook
└── features/
    ├── date-diff/           # DateDiff.tsx, PairRow.tsx, usePairs.ts
    ├── uuid/                # UuidGenerator.tsx
    └── cron/                # CronExplainer.tsx (pure-TS cron parser)
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
