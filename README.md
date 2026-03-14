# 🚦 Islamabad Traffic Watch

A free, community-powered web app showing real-time road status across Islamabad. Alerts are sourced from [@ITP_Offical](https://x.com/ITP_Offical) on X and posted by an admin, with community members able to submit their own reports.

**Total infrastructure cost: Rs. 0/month.**

---

## Live Demo

> Replace with your Vercel URL once live publicly.

---

## Features

- **Live traffic alerts** — admin monitors @ITP_Offical and posts structured alerts in ~20 seconds
- **Community reports** — anyone can report an issue; admin reviews before publishing
- **Interactive map** — all 136 areas plotted on OpenStreetMap with color-coded status markers
- **Search** — find any sector, area, landmark, or road instantly with autocomplete
- **Realtime updates** — homepage feed updates live via Supabase subscriptions without page refresh
- **Auto-expiry** — alerts auto-clear after a set duration (2/4/6/12 hrs or manual)
- **Spam protection** — reports with 3+ community flags are auto-hidden
- **Rate limiting** — community reports limited to 5 per hour per IP
- **Mobile-first** — bottom navigation, large tap targets, works great on phones
- **Zero cost** — Vercel + Supabase free tiers, OpenStreetMap tiles, no paid APIs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Maps | Leaflet.js + OpenStreetMap |
| Auth | Cookie-based admin session |
| Realtime | Supabase Postgres Changes |

---

## Project Structure

```
islamabad-traffic-watch/
├── app/
│   ├── page.tsx                    # Homepage — feed + search
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── components/
│   │   ├── SearchBar.tsx           # Debounced search input
│   │   ├── StatusCard.tsx          # Area/road status card
│   │   ├── AlertBadge.tsx          # Status chip (blocked/slow/etc)
│   │   ├── ActiveAlertsFeed.tsx    # Default homepage feed
│   │   ├── SearchResults.tsx       # Results view after search
│   │   ├── ReportButton.tsx        # Inline report form on cards
│   │   └── Skeletons.tsx           # Loading skeleton variants
│   ├── map/
│   │   ├── page.tsx                # Map page
│   │   └── components/
│   │       ├── MapClient.tsx       # Leaflet map (dynamic import)
│   │       ├── MapFilters.tsx      # Filter buttons
│   │       └── MapLegend.tsx       # Map legend overlay
│   ├── report/
│   │   ├── page.tsx                # Community report page
│   │   └── components/
│   │       ├── ReportForm.tsx      # Report submission form
│   │       └── RecentCommunityReports.tsx
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── layout.tsx              # Admin layout with header
│   │   ├── login/page.tsx          # Admin login
│   │   └── components/
│   │       ├── AlertForm.tsx       # Post ITP alert form
│   │       ├── RecentAlerts.tsx    # Recent alerts + clear
│   │       ├── PendingReports.tsx  # Community report queue
│   │       ├── StatsBanner.tsx     # Quick stats
│   │       ├── AreaRoadSearch.tsx  # Reusable autocomplete
│   │       ├── StatusPicker.tsx    # Status buttons
│   │       └── ReasonPicker.tsx    # Reason chips
│   └── api/
│       ├── areas/route.ts          # Search areas + roads
│       ├── areas/all/route.ts      # All areas for map
│       ├── status/route.ts         # Get/post alerts
│       ├── status/clear/route.ts   # Clear an alert
│       ├── report/route.ts         # Submit/get community reports
│       ├── vote/route.ts           # Upvote/flag
│       └── admin/
│           ├── login/route.ts
│           ├── logout/route.ts
│           ├── reports/route.ts
│           └── approve/route.ts
├── components/                     # Shared public components
├── hooks/
│   ├── useAdminApi.ts              # All admin API calls
│   ├── useActiveAlerts.ts          # Fetch + realtime alerts
│   └── useSearch.ts                # Debounced search logic
├── lib/
│   ├── supabase.ts                 # Public Supabase client
│   ├── supabase-admin.ts           # Server-only admin client
│   ├── auth.ts                     # Admin auth helpers
│   ├── types.ts                    # TypeScript interfaces
│   ├── constants.ts                # Statuses, reasons, config
│   └── leaflet-icons.ts            # Leaflet icon fix for Next.js
├── middleware.ts                   # Protects /admin/* routes
└── scripts/
    └── seed-areas-only.mjs         # One-time DB seeding script
```

---

## Database Schema

### `areas`
Stores all 136 Islamabad areas (98 sectors, 16 landmarks, 22 towns).

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name_en | text | English name |
| name_ur | text | Urdu name |
| type | text | sector / landmark / town |
| lat | float | Latitude |
| lng | float | Longitude |

### `roads`
232 named roads sourced from OpenStreetMap Overpass API.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name_en | text | English name |
| name_ur | text | Urdu name |
| road_type | text | highway / avenue / road / street |

### `road_areas`
Links roads to areas they pass through (proximity-based, ~2.5km radius). 2,598 links total.

### `status_updates`
Active and historical traffic alerts.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| area_id / area_name | uuid / text | Affected area |
| road_id / road_name | uuid / text | Affected road (optional) |
| status | text | open / blocked / diversion / slow |
| reason | text | VIP movement / protest / accident / construction / event / other |
| details | text | Additional info |
| direction | text | e.g. "towards Zero Point" |
| source | text | ITP or community |
| tweet_url | text | Link to original ITP tweet |
| reported_at | timestamptz | When posted |
| expires_at | timestamptz | Auto-clear time |
| is_active | boolean | Whether currently active |
| upvotes / flags | int | Community verification |

### `community_reports`
Reports submitted by the public, pending admin review.

### `votes`
Deduped upvotes and flags by IP hash. One vote per user per item.

---

## API Routes

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/areas?q=` | Public | Search areas and roads |
| GET | `/api/areas/all` | Public | All areas with status for map |
| GET | `/api/status` | Admin | Recent 20 alerts |
| POST | `/api/status` | Admin | Post new alert |
| POST | `/api/status/clear` | Admin | Deactivate an alert |
| GET | `/api/report?limit=` | Public | Recent approved reports |
| POST | `/api/report` | Public | Submit community report |
| POST | `/api/vote` | Public | Upvote or flag |
| GET | `/api/admin/reports?type=` | Admin | Pending/approved/flagged |
| POST | `/api/admin/approve` | Admin | Approve or reject report |
| POST | `/api/admin/login` | Public | Login, sets cookie |
| POST | `/api/admin/logout` | Public | Logout, clears cookie |

Admin routes require `x-admin-password` header. Page routes are protected by middleware checking `admin_session` cookie.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Vercel](https://vercel.com) account (free)
- A [GitHub](https://github.com) account

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/islamabad-traffic-watch.git
cd islamabad-traffic-watch
npm install
```

### 2. Set up Supabase

Create a new Supabase project, then run all SQL from the setup (tables, RLS policies, triggers, pg_cron auto-expiry, realtime publication).

### 3. Environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
ADMIN_SECRET_PASSWORD=YourChosenPassword
```

> `SUPABASE_SERVICE_KEY` is server-only — never expose it client-side.

### 4. Seed the database

```bash
node scripts/seed-areas-only.mjs
```

This seeds 136 areas, 232 roads, and 2,598 road-area proximity links.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Deploy to Vercel

```bash
git push origin main
```

Then in Vercel → Settings → Environment Variables, add all 4 variables from `.env.local`.

---

## Admin Workflow

The daily workflow for keeping the app updated:

1. Open [@ITP_Offical](https://x.com/ITP_Offical) on X
2. Go to `yoursite.vercel.app/admin`
3. Select area → pick status → pick reason → paste tweet URL → publish
4. Takes about 20 seconds per alert
5. Review any pending community reports in the right panel

---

## Architecture Decisions

**No AI parsing** — the admin reads ITP tweets manually and fills a structured form. This is more reliable, free, and requires no API keys. An LLM parsing approach was considered and deliberately skipped.

**Manual areas, OSM roads** — Islamabad sector coverage on OpenStreetMap is poor (only 22 results). A hand-curated list of 136 areas was used instead. Roads were sourced from the Overpass API which has excellent coverage (232 roads).

**Supabase admin client in all API routes** — bypasses RLS for reliable server-side reads/writes. The anon client is only used for client-side realtime subscriptions.

**Cookie + header dual auth** — cookies protect page routes via middleware, the `x-admin-password` header protects API routes. Simple and requires no third-party auth service.

**Community reports go through review** — reports are not auto-published unless the area has no existing active status. This prevents spam while still being responsive.

---

## Rate Limits & Spam Protection

- Community reports: **5 per hour per IP**
- Votes: **1 upvote + 1 flag per user per item** (deduped by IP hash)
- Auto-hide: items with **3+ flags** are automatically hidden
- Auto-expiry: alerts expire after their set duration via pg_cron (runs every 30 min)

---

## Contributing

This is an open community project for Islamabad commuters. Contributions welcome.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push and open a Pull Request

---

## License

MIT — free to use, modify, and distribute.

---

## Acknowledgements

- [Islamabad Traffic Police (@ITP_Offical)](https://x.com/ITP_Offical) — the source of truth for traffic updates
- [OpenStreetMap](https://openstreetmap.org) — free map tiles and road data
- [Supabase](https://supabase.com) — free PostgreSQL hosting with realtime
- [Vercel](https://vercel.com) — free Next.js hosting
- [Leaflet.js](https://leafletjs.com) — open source mapping library