# Design Khajana

A premium, responsive design-tools dashboard. Eleven studios · 68 tools — built as a modular, future-ready UI foundation.

![Design Khajana](./.github/banner.svg)

## Roadmap status

Everything is **UI-ready and non-functional by design**:

- Sidebar navigation across **11 main sections** (Overview + 10 studios).
- Each section lists its tools as navigable cards.
- Clicking any tool opens a polished **“Coming Soon”** dialog.
- No APIs, no database, no authentication, no file storage — yet.

## Sections

| Studio | Tools |
| --- | --- |
| **Image Lab** | BG Remove · 4K Upscale · Enhance · Sharpen · Resize · Crop · Compress · Format Convert · Background Change |
| **Icon Khajana** | Icon Search · Categories · SVG Icons · PNG Icons · Icon Editor |
| **Colour Studio** | Colour Picker · Palette Generator · Gradient Generator · Contrast Checker · Colour Harmony · Colour Converter |
| **Typography Studio** | Typography Rules · Font Pairing · Type Scale · Hierarchy · Line Height · Letter Spacing |
| **Text Studio** | Text Hierarchy · Heading · Subheading · Body · CTA · Rewrite · Shorten · Professional · Premium · Corporate · Catchy |
| **Design Size & Layout** | Social Media Sizes · Print Sizes · Custom Canvas · Ratios |
| **Print Studio** | DPI Calculator · RGB/CMYK · Bleed · Safe Area · Unit Converter · Print Resolution |
| **Inspector** | Image Inspector · Resolution · DPI · File Info · Colour Mode · Print Check |
| **Design Doctor** | Design Checker · Typography Check · Colour Check · Contrast Check · Spacing · Alignment · Composition · Auto Fix |
| **Grid Khajana** | Featured Grids · Ratio · Grid Library · References · Show Grid · Use on Canvas · How to Use |

## Architecture

The codebase is fully data-driven — adding a tool is a one-line catalog change.

```
src/
├── app/                 # Next.js App Router (routes, metadata, manifest, sitemap)
│   ├── [section]/       # One dynamic route renders all 10 studios
│   ├── layout.tsx       # Root layout: fonts, metadata, app shell
│   └── page.tsx         # Overview dashboard
├── components/
│   ├── home/            # Overview dashboard
│   ├── layout/          # Sidebar, topbar, mobile drawer
│   ├── sections/        # Section hero, tool cards, tool grid
│   └── ui/              # Icon system, coming-soon modal
└── lib/
    ├── catalog.ts       # Single source of truth for sections + tools
    └── utils.ts         # cn() helper
```

Future-ready by design: each tool is a typed `Tool` entry with name, description and icon, grouped under a `Section` with its own visual accent. Engines can be added per-tool with no structural changes.

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

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to your production URL (used for metadata, Open Graph and the sitemap).

```bash
cp .env.example .env.local
```

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

> Tip: every route is static (the `[section]` page uses `generateStaticParams`), so builds are fast and edge-friendly.

### Any other host

```bash
npm run build
npm run start
```

## Customisation

- **Sections & tools**: edit `src/lib/catalog.ts`.
- **Accent colours**: the `Accent` interface in `catalog.ts`; class strings map to Tailwind utilities.
- **Icons**: add a key to the icon map in `src/components/ui/icon.tsx`.