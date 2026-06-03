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

## Style & Tooling

- **Formatter**: Prettier — tabs, LF, semicolons, single quotes, no trailing commas, 120-char width
- **Package manager**: `yarn` only (not npm or pnpm); Yarn 4.10.3 via `.yarn/releases/`
- **core/ sources**: `.mts` files; package exports built `.mjs` from `dist/`
- **CI** (`.gitlab-ci.yml`): `yarn install` → `yarn build:gitlab` → `yarn lint:test` on MRs and `develop`
