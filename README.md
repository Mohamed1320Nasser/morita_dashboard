# Morita Dashboard

Admin dashboard for **Morita**, an OSRS (Old School RuneScape) services marketplace that runs on Discord.
Admins and support staff use it to manage orders, users, wallets, tickets, services, rewards and referrals.

The dashboard is a front end only. All data comes from the **Morita REST API** (`morita_backend` repository).

---

## Contents

- [Overview](#overview)
- [Main sections](#main-sections)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Running in production](#running-in-production)
- [Project structure](#project-structure)
- [Conventions](#conventions)

---

## Overview

```
  Browser ──▶ Dashboard (Next.js, :3001) ──HTTPS + JWT──▶ Morita API (:3000) ──▶ MySQL
```

- Admins sign in on `/login`; the API returns a JWT that is sent with every request.
- When the API answers `401`, the session is cleared and the user is sent back to the login page.
- Actions that must happen in Discord (closing a ticket, creating a referral invite) go to the API,
  which forwards them to the Discord bot.

---

## Main sections

| Section | Path | What it is for |
|---|---|---|
| Dashboard | `/` | Overview of activity and revenue |
| Quick Create Service | `/quick-create` | Create a service with its pricing in one step |
| Orders | `/orders` | Order list, details, status, cancel and worker reassignment |
| Tickets | `/tickets` | Support tickets, ticket types, transcripts (view / download) |
| Users | `/users` | Profiles, roles, orders, wallet and referral link per user |
| Wallets / Transactions | `/wallets`, `/transactions` | Balances, deposits, adjustments and the full money ledger |
| Accounts | `/accounts` | Account shop stock |
| Loyalty Tiers | `/loyalty-tiers` | Tier levels and their benefits |
| Referrals | `/referrals`, `/referral-reward` | Referral list and network, fraud analytics, reward settings and history, order rewards |
| Daily Reward / Order Reward | `/daily-reward`, `/order-reward` | Reward configuration, claims and leaderboard |
| Payments | `/blockchain`, `/payments` | Crypto wallets, transaction verification, payment methods, Discord payment config |
| Services & Pricing | `/services`, `/categories`, `/pricing/methods` | Service catalogue, categories and pricing methods |
| Onboarding | `/onboarding/*` | Terms of Service, onboarding questions and member answers |
| Analytics | `/kpis`, `/reports`, `/service-analytics` | KPIs, reports and per-service analytics |
| System Settings | `/settings` | Branding and system configuration |

---

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (Pages Router) |
| UI | React 18, React-Bootstrap, SCSS modules |
| Tables | Material React Table |
| Charts | Recharts |
| HTTP | Axios |
| Notifications | React-Toastify |

---

## Requirements

- **Node.js** 20.9 or newer, and npm
- A running **Morita API** reachable from the browser

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure the environment
cp .env.example .env.local
#    set NEXT_PUBLIC_API_BASE to your API, e.g. http://localhost:3000

# 3. Start the development server
npm run dev
```

Open <http://localhost:3001> and sign in with an admin account.

---

## Configuration

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | Yes | Base URL of the Morita API (production: `https://api.morita.vip`) |
| `NEXT_PUBLIC_SITE_BASE` | No | Public URL of the site |
| `NEXT_PUBLIC_APP_NAME` | No | Name shown in the interface |

Variables starting with `NEXT_PUBLIC_` are built into the browser bundle: **never put secrets in them**.
After changing them, rebuild the app (`npm run build`).

Remote images are allowed from the domains listed in `next.config.js` (`images.remotePatterns`).
Add a domain there if images are served from a new CDN.

---

## Running in production

```bash
git pull
npm ci
npm run build
npm run start          # serves on port 3001
```

On the server, keep it running with PM2:

```bash
pm2 start npm --name morita-dashboard -- start
pm2 restart morita-dashboard   # after each new build
```

Put the dashboard behind a reverse proxy (Nginx or similar) with HTTPS.

---

## Project structure

```
morita_dashboard/
├── src/
│   ├── pages/            # One file or folder per route (Next.js Pages Router)
│   ├── components/       # UI building blocks: atoms, molecules, organisms, page parts
│   ├── controllers/      # API calls grouped by domain (orders, wallets, referralReward, ...)
│   ├── constant/         # Axios client (getData / postData / putData / patchData)
│   ├── const/            # API base URL
│   ├── context/ hooks/   # Shared React state and hooks
│   ├── utils/            # Helpers (auth storage, formatting, ...)
│   └── styles/           # Global styles
├── public/               # Static assets
├── next.config.js        # Next.js configuration
└── .env.example          # Environment variable template
```

---

## Conventions

- **Pages call the API through `src/controllers/<domain>`**, not through Axios directly.
  A controller function returns `{ success, data }` or `{ success: false, error: { message } }`.
- **Always check `success`.** The Axios helpers do not throw: `getData` resolves to `false` on failure,
  and `postData` / `putData` resolve to the Axios error on an HTTP error.
  New controllers must turn both into `{ success: false }` (see `src/controllers/referralReward`),
  so a failed call is never shown as a success.
- Styles live next to the page as `*.module.scss`.

---

## License

Private project. All rights reserved.
