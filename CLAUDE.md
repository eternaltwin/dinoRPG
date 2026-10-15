# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DinoRPG is a Yarn 4 monorepo RPG web application. Workspaces:
- **ed-be/** — Express.js backend (TypeScript, Node 22+)
- **ed-ui/** — Vue 3 frontend (Vite, Pinia, Vue Router)
- **core/** — Shared `.mts` models/utilities (exports `.mjs`)
- **prisma/** — Generated Prisma client package (do not hand-edit)
- **dino-renderer/** — Puppeteer PNG renderer for dinoz
- **Eternaltwin/** — Local OAuth/community service (separate PostgreSQL DB)

## Setup

```sh
cp ed-be/.env.sample ed-be/.env
cp Eternaltwin/eternaltwin.local.example Eternaltwin/eternaltwin.local.toml
# ed-ui/.env.development.example → ed-ui/.env.development
yarn install
```

Requires Node >= 22 and PostgreSQL 17 with `dinorpg` and `eternaltwin` databases.

## Common Commands

| Task | Command |
|------|---------|
| Run all services (dev) | `yarn dev:windows` |
| Backend only | `yarn start:back` |
| Frontend only | `yarn start:front` |
| Eternaltwin service | `yarn etwin:run` |
| Full build | `yarn build` |
| Backend build only | `yarn build:back` |
| Frontend build only | `yarn build:front` |
| Format + lint (writes files) | `yarn lint` |
| Lint check only (no write) | `yarn lint:test` |
| Lint autofix | `yarn lint:fix` |
| Backend tests | `yarn test:ci` |
| Front e2e tests (Playwright) | `yarn test:e2e` (`yarn test:e2e:ui` for the UI mode) |
| DB sync (dev) | `yarn db:sync:dev` |
| Create migration only | `yarn db:migrate:manual` |
| Apply migration | `yarn migration` |

**Ports**: Frontend 8080 (Vite), Backend 8081 (Express), WebSocket 8082, Eternaltwin 50320.

## Architecture

### Backend Layers (ed-be/src/)
```
Routes (routes/*.routes.ts)
  → Business Logic (business/*.ts)
    → DAOs (dao/*.ts)
      → Prisma Client → PostgreSQL
```
- `main.ts` initializes OpenTelemetry + global context → `server.ts` starts Express
- `context.ts` holds `GLOBAL: ServerContext` (Prisma, logger, Discord client, config)
- Cron jobs run background tasks (offer expiry, tournament rotation, war expiry)
- WebSocket server runs on a separate port for real-time events

### Frontend Layers (ed-ui/src/)
```
Pages → Components → Services (Axios) → Backend REST /api/v1
                   → Pinia Stores (session-persisted)
```
- HTTP client: `utils/http-common.ts` (Axios with auth interceptors)
- Auth cookies: `x-drpg-{channel}-user` and `x-drpg-{channel}-token`
- State: player, dinoz, clan, dojo, menu, loading stores in `store/`

### Shared (core/)
- TypeScript interfaces for FE/BE contract: models in `core/src/models/`
- `ExpectedError` wrapper for expected domain errors
- Game utilities: `DinozUtils`, formatters, constants

## Database

- Schema source: `ed-be/prisma/schema.prisma` — Prisma generates output to root `prisma/`
- Run `yarn db:sync:dev` after schema changes (migrate + seed + regenerate enum wrapper)
- **Frontend**: import enums from `@drpg/prisma/enums` (Vite cannot use Prisma's CommonJS export)
- **Backend**: import from `@drpg/prisma`
- Generated files under `prisma/` are auto-generated — do not hand-edit (except `prisma/generate-enums-wrapper.js` and `prisma/package.reference.json`)

## E2E tests (e2e/)

- Playwright drives the real stack: it starts ed-be (`prisma migrate deploy` + `dist/main.js`, so run `yarn build:core && yarn build:back` first) and Vite on the usual ports, against the `dinorpg_e2e` database. Stop `yarn dev` before running them.
- Database URL: `E2E_DATABASE_URL`, else `DATABASE_URL` from `ed-be/.env` with the database swapped for `dinorpg_e2e`. First run: `yarn --cwd e2e playwright install chromium`.
- No Eternaltwin: the `player` fixture (`e2e/support/fixtures.ts`) inserts a fresh player per test and sets the `x-drpg-e2e-*` cookies. Pin backend env in `e2e/support/env.ts`, which overrides `ed-be/.env`.

## Style & Tooling

- **Formatter**: Prettier — tabs, LF, semicolons, single quotes, no trailing commas, 120-char width
- **Package manager**: `yarn` only (not npm or pnpm); Yarn 4.10.3 via `.yarn/releases/`
- **core/ sources**: `.mts` files; package exports built `.mjs` from `dist/`
- **CI** (`.github/workflows/`): `ci.yml` runs `yarn build:ci` → `yarn lint:test` + backend coverage + Playwright e2e (Postgres service) on PRs, `develop` and `staging`; `staging-channel.yml` points the `eternaltwin/config` (GitLab server-config) staging channel to each `staging` push; `tag.yml` on a tag merges `staging` into `develop` (if the tag is on staging) through the `DEPLOY_KEY` deploy key secret, creates the GitHub release (if the tag is on develop) and calls `production-channel.yml`, which points the production channel to the released commit (also runs on manually published releases)
