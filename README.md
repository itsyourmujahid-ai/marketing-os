# Marketing OS

The operating system for modern marketing teams — strategy, campaigns, content, leads, automation and analytics in one place.

A modular, future-ready SaaS foundation built with Next.js App Router.

## Roadmap status

Marketing OS is in its foundation phase:

- **Dashboard** (`/dashboard`) — functional with health score, overview cards, active campaigns, upcoming content, AI marketing manager and recommended actions.
- **Feature registry** in `src/lib/features.ts` — 35 features registered with routes and status.
- **Coming Soon** states for Strategy, Campaigns, Content, Leads, Automation, Analytics, Team, Integrations and Settings.
- No APIs, no database, no authentication — yet.

## Feature routes

| Feature | Route |
| --- | --- |
| **Dashboard** | `/dashboard` |
| **Strategy** | `/strategy` |
| **Campaigns** | `/campaigns` |
| **Content** | `/content` |
| **Leads** | `/leads` |
| **Automation** | `/automation` |
| **Analytics** | `/analytics` |
| **Team** | `/team` |
| **Integrations** | `/integrations` |
| **Settings** | `/settings` |

## Architecture

The codebase is fully data-driven — adding a feature is a one-line registry change in `src/lib/features.ts`.

```
src/
├── app/                    # Next.js App Router (routes, metadata, manifest, sitemap)
│   ├── dashboard/          # Functional dashboard
│   ├── [feature]/          # Coming Soon routes
│   ├── layout.tsx          # Root layout: fonts, metadata, app shell
├── components/
│   ├── layout/             # Sidebar, topbar, mobile drawer
│   └── ui/                 # Icon system, coming-soon component
└── lib/
    ├── features.ts         # Single source of truth for all features
    └── utils.ts            # cn() helper
```

Each feature is a typed registry entry with name, description, route and icon.

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build (static prerendering for all routes) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Configuration

Set `NEXT_PUBLIC_SITE_URL` to your production URL (used for metadata, Open Graph and the sitemap).

## Deploying

### Vercel

This project is a standard Next.js App Router app with zero server dependencies.

1. Push the repository to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add the `NEXT_PUBLIC_SITE_URL` environment variable.
4. Deploy — the framework preset (`Next.js`) is detected automatically.

or from the CLI:

```bash
npm i -g vercel
vercel
```

## Customisation

- **Features & navigation**: edit `src/lib/features.ts`.
- **Icons**: add a key to the icon map in `src/components/ui/icon.tsx`.