# CDC — Lot 3 : damier et temps réel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let clan members play a CDC match from the browser: a full-width 20×20 board updated in real time, entering/moving/leaving dinoz by clicking, watching their fights, and a per-match fight journal — with replays restricted to participants.

**Architecture:** Backend first: a per-match fight journal table written inside the fight transaction, replay authorization for CDC archives, a `version` counter on the match bumped by every mutation, and a WebSocket channel per match that only pushes a `boardChanged {matchId, version}` signal after commit; clients refetch `GET /match` (which already filters enemy HP/AP per viewer), so no per-viewer payloads go over the socket. Frontend: a new clan child page with a CSS-grid board of static mini-dinoz images, a score bar and three tabs (my dinoz / selection / journal); attacks open the fight animation, then return to the board.

**Tech Stack:** Express, Prisma, `ws`, Vitest; Vue 3 (`<script setup>` like `ClanDiscussion.vue`), vue-i18n, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-02-championnat-des-clans-design.md` (section 2 "Ce que voit un joueur"). Previous plans: lot 1 and lot 2 in `docs/superpowers/plans/`.

## Global Constraints

- Only members of the two clans of a match can read its board, subscribe to its channel, or replay its fights; a player can replay only fights where one of their dinoz took part.
- Enemy pieces never expose HP, max HP or AP — to any client, over REST or WS.
- WS messages for the board carry no game data beyond `{ type: 'boardChanged', matchId, version }`.
- A player who leaves or is excluded from a clan is disconnected from that clan's match channel immediately.
- UI decisions (user): full-width board with a score bar above (clan names, scores, score lines, time left) and tabs below (**Mes dinoz** / **Sélection** / **Journal**); move by clicking an own piece, reachable cells and attackable enemies are highlighted, click the target (arrow keys also move the selected piece); after an attack the fight animation opens, then a button returns to the board; pieces are **static** mini dinoz images with a clan-coloured border and an HP bar for own/allied pieces.
- Board geometry: west entry column `x = 0`, east `x = 19`; obstacles from `MatchBoardDTO.obstacles` (cell index `y * 20 + x`). A dinoz cannot stop on the enemy entry column (server error `clanChampionship.enemyEntryColumn`); the UI doesn't highlight those cells as reachable.
- Eligible to enter (UI filter, server stays authoritative): own dinoz, alive, `placeId === match.placeId`, no leader and no followers, `unavailableReason === null`, not in `deadDinozIds`.
- All user-facing strings in `ed-ui/src/i18n/locales/{fr,en,es,de}.json` (and `ed-be/i18n/*.json` for backend errors). Prettier: tabs, single quotes, no trailing commas, 120 cols.

## Review Focus

1. **Stale board after a missed WS message or reconnect** — the client refetches on (re)connect and whenever a received `version` is greater than its own; on a refetch failure it keeps the last board and retries. Covered by the composable in Task 4, the page in Task 5 and the e2e test in Task 7.
2. **Replay leak** — a non-participant (or anonymous user) requesting a CDC archive id gets an error, non-CDC archives stay public. Test in Task 2.
3. **Player leaves the clan while watching** — socket closed by the server, board view stops updating, next REST call fails cleanly. Test in Task 3.
4. **Double-click / concurrent actions** — buttons and board clicks are disabled while an action request is pending; server errors are shown as toasts and the board is refetched. Task 5.
5. **Small screens** — the board scales to the container width (square cells, min ~16 px) without horizontal page scroll; tabs stack below. Tasks 5 and 6.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `ed-be/prisma/schema.prisma` | `ClanChampionshipFight` journal, `ClanChampionshipMatch.version` |
| `ed-be/src/business/clanChampionshipMatchService.ts` | Journal writes, version bumps, publish after commit, journal in the read model |
| `ed-be/src/business/fightService.ts` (`replayFight`) | CDC replay authorization |
| `ed-be/src/business/serverEventService.ts` | Global `wss`, CDC channel tickets/naming, `publishToWsChannel`, `kickPlayerFromWsChannels` |
| `core/src/models/clan/clanChampionship.mts`, `core/src/models/serverEvents/*` | DTOs, `WsChannel.CLAN_CHAMPIONSHIP`, board message type |
| `ed-ui/src/services/ClanChampionshipService.ts` | REST calls for the match |
| `ed-ui/src/composables/useChampionshipSocket.ts` | WS connect, reconnect, version tracking |
| `ed-ui/src/components/clans/championship/*.vue` | Board page, score bar, board grid, tabs, mini dinoz icon |
| `ed-ui/src/pages/ReplayFight.vue` | Optional "back to board" button |
| `e2e/tests/clan-championship.spec.ts` | End-to-end match flow |

---

### Task 1: Fight journal + archive metadata

**Files:**
- Modify: `ed-be/prisma/schema.prisma`, `ed-be/src/business/clanChampionshipMatchService.ts` (`resolveBoardAttack`, `getMyMatchBoard`), `core/src/models/clan/clanChampionship.mts`
- Test: `ed-be/src/test/business/clanChampionshipFight.test.ts`, `clanChampionshipBoardRead.test.ts`

**Interfaces:**
- Produces (Prisma):
  ```prisma
  model ClanChampionshipFight {
    id                   Int      @id @default(autoincrement())
    matchId              String   @db.Uuid      // -> ClanChampionshipMatch, onDelete: Cascade
    archiveId            String   @unique @db.Uuid
    attackerClanId       Int
    attackerWon          Boolean
    participantDinozIds  Int[]
    participantPlayerIds String[] @db.Uuid
    deadDinozIds         Int[]
    createdAt            DateTime @default(now()) @db.Timestamp(6)
    @@index([matchId, createdAt])
    @@map("clan_championship_fight")
  }
  ```
- Archive metadata of a board fight becomes `{ kind: 'clanChampionship', matchId, placeId: match.placeId, rightClanName: <defender clan snapshot name> }` (`ReplayFight.vue` reads `metadata.placeId`).
- Core: `FightJournalEntryDTO { createdAt: Date; attackerClanId: number; attackerWon: boolean; participantCount: number; deadDinozIds: number[]; archiveId: string | null }` — `archiveId` only when the reader is in `participantPlayerIds`; `MatchBoardDTO.fights: FightJournalEntryDTO[]` (latest 50, newest first).
- `resolveBoardAttack` writes the journal row with `tx` right after the archive.

- [ ] **Step 1: Failing tests:** a board fight creates one journal row with all participants' dinoz and player ids (deduplicated players), dead ids and `attackerWon`; archive metadata contains `placeId` and `rightClanName`; the read model returns `archiveId` for a participant reader and `null` for a non-participant clan member, newest first, at most 50.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Schema + migration (`yarn db:migrate:manual` name `clan_championship_fight_journal`, `yarn db:sync:dev`; rerun `prisma generate` + `prisma:postgenerate` if the wrapper is stale; revert `prisma/package.json` if bumped) + code. **Step 4:** PASS + full suite.
- [ ] **Step 5:** Commit `feat(cdc): journal des combats du damier`.

### Task 2: Replay authorization for CDC fights

**Files:**
- Modify: `ed-be/src/business/fightService.ts` (`replayFight` ~775), `ed-be/src/routes/fight.routes.ts` (~25-36)
- Test: `ed-be/src/test/business/fightService.test.ts`

**Interfaces:**
- `replayFight(req)`: after loading the archive, if `metadata.kind === 'clanChampionship'`: `auth(req)` (unauthenticated → `ExpectedError('No replay found.')`), then the journal row with this `archiveId` must exist and contain the reader's id in `participantPlayerIds`, else the same `'No replay found.'` error (don't reveal existence). Other archives unchanged (public).

- [ ] **Step 1: Failing tests:** CDC archive + participant → replay returned; CDC archive + non-participant → `No replay found.`; CDC archive + no auth → `No replay found.`; non-CDC archive without auth → returned as before.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement (the route must still work without auth for non-CDC archives: call `auth` only in the CDC branch and map its failure). **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(cdc): revoir un combat du damier réservé aux participants`.

### Task 3: Board version + WebSocket channel per match

**Files:**
- Modify: `ed-be/prisma/schema.prisma` (`ClanChampionshipMatch.version Int @default(0)`), `ed-be/src/business/serverEventService.ts`, `ed-be/src/server.ts` (~81-82, 128-162), `ed-be/src/business/clanChampionshipMatchService.ts`, `ed-be/src/business/clanService.ts` (`removeFromBoardsIfLeft`), `core/src/models/serverEvents/WsChannel.mts`, `core/src/models/clan/clanChampionship.mts`
- Test: `ed-be/src/test/business/serverEventService.test.ts`, `clanChampionshipBoardActions.test.ts`, `clanChampionshipTick.test.ts`

**Interfaces:**
- Core: `WsChannel.CLAN_CHAMPIONSHIP = 'WsClanChampionship'`; `BoardChangedMessage = { type: 'boardChanged'; matchId: string; version: number }`; `MatchBoardDTO.version: number`.
- `serverEventService`:
  - `setWebSocketServer(wss)` / module-level holder, called in `server.ts` after creation.
  - Ticket for `CLAN_CHAMPIONSHIP`: `doSpecificVerificationsForWs` requires the player to be in a clan with a live (or latest finished) match — reuse `findLiveMatchOfClan`; `getChannelName` → `${channel}.${matchId}`.
  - `publishToWsChannel(channelName: string, message: object): void` — sends to every open member connection of that channel.
  - `kickPlayerFromWsChannels(playerId: string, channelPrefixes: string[]): void` — closes that player's connections whose channel name starts with one of the prefixes (`WsClanForum.<clanId>`, `WsClanChampionship.`) and removes them from the map.
  - `processWsIncomingMessage` ignores messages on `WsClanChampionship.*` channels (no clan-forum handling).
- Match service: every mutation of a match (enter, leave, move, fight, tick that changed something, kick-off, end, clan-exit removal) does `version: { increment: 1 }` in its transaction and, **after commit**, `publishToWsChannel(\`${WsChannel.CLAN_CHAMPIONSHIP}.${matchId}\`, { type: 'boardChanged', matchId, version })`. Publishing failures are logged, never thrown.
- `removeFromBoardsIfLeft` also calls `kickPlayerFromWsChannels(playerId, [\`${WsChannel.CLAN_FORUM}.${clanId}\`, \`${WsChannel.CLAN_CHAMPIONSHIP}.\`])`.
- Migration name: `clan_championship_match_version`.

- [ ] **Step 1: Failing tests:** each action and a scoring tick increments `version` in the transaction and publishes once after commit with the new version; a rolled-back action (e.g. thrown error) publishes nothing; a tick that changed nothing (already applied) doesn't bump; ticket for the championship channel refused for a player without a live/finished match; channel name contains the match id; `publishToWsChannel` sends only to that channel's open connections; `kickPlayerFromWsChannels` closes only that player's matching connections; incoming WS message on a championship channel creates no clan message; clan exit kicks.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** PASS + full suite + `yarn build:back`.
- [ ] **Step 5:** Commit `feat(cdc): version du damier et canal temps réel par match`.

### Task 4: Frontend data layer — service + socket composable

**Files:**
- Modify: `ed-ui/src/services/ClanChampionshipService.ts`
- Create: `ed-ui/src/composables/useChampionshipSocket.ts`

**Interfaces:**
- Service: `getMatch(): Promise<MatchBoardDTO | null>`, `enter(dinozId: number): Promise<void>`, `leave(dinozId: number): Promise<void>`, `move(dinozId: number, direction: BoardDirection): Promise<BoardMoveResult>` (`BoardMoveResult` type exported from core if not already — move it to `core/src/models/clan/clanChampionship.mts` if it only lives in the backend).
- `useChampionshipSocket(onChanged: (version: number) => void): { connected: Ref<boolean>; close(): void }` — gets a ticket via `ServerEventsService.getWsTicket(WsChannel.CLAN_CHAMPIONSHIP)`, connects with the same URL logic as `ServerEventsService.connectToWs`, calls `onChanged(version)` for every `boardChanged`, and on close/error reconnects with exponential backoff (1 s → 30 s max, unlimited attempts while mounted) calling `onChanged(-1)` after each successful (re)connect so the page refetches. `close()` stops reconnecting.

- [ ] **Step 1:** Implement. **Step 2:** `yarn build:front` and `yarn lint:test` → clean. (No front unit-test setup exists; behavior is covered by the e2e test in Task 7.)
- [ ] **Step 3:** Commit `feat(cdc): service et socket du damier côté front`.

### Task 5: Board page — score bar, grid, interactions

**Files:**
- Create: `ed-ui/src/components/clans/championship/ChampionshipMatch.vue` (page), `ChampionshipScoreBar.vue`, `ChampionshipBoard.vue`, `DinozIcon.vue`
- Modify: `ed-ui/src/router/index.ts` (clan child route `championship/match`, name `ClanChampionshipMatch`), `ed-ui/src/components/clans/ClanChampionship.vue` (link "Voir le damier" when the reader's clan has a live or finished match), i18n (4 locales)

**Interfaces:**
- `ChampionshipMatch.vue` (`<script setup>`): loads `getMatch()`; keeps `board` and `version`; `useChampionshipSocket(v => { if (v === -1 || v > version) refetch() })`; owns `selectedDinozId` and `pending` (blocks actions while a request runs); after any action: refetch the board and `useDinozStore().refreshDinozFiche(dinozId)`; errors → `errorHandler.handle(e, toast)` then refetch. Null board → message "Aucun match en cours".
- `ChampionshipScoreBar.vue` props `{ west, east, endsAt, status }`: names, scores, score lines, quota used (x/100), countdown to `endsAt` (updates every second, local timer), status label.
- `ChampionshipBoard.vue` props `{ board: MatchBoardDTO, selectedDinozId: number | null, disabled: boolean }`, emits `select(dinozId)`, `move(direction)`:
  - CSS grid 20×20, square cells sized from the container width (`aspect-ratio: 1`), entry columns tinted per clan, obstacles drawn as blocked cells.
  - Pieces: `DinozIcon` + border colour (own clan vs enemy; own pieces slightly highlighted), HP bar under own/allied pieces (`life / maxLife`).
  - Clicking an own piece with AP > 0 selects it; adjacent cells are highlighted when: in bounds, not an obstacle, not an own piece, and (enemy piece → attackable) or (empty and not the enemy entry column → reachable). Clicking a highlighted cell emits `move(direction)`. Arrow keys emit `move` for the selected piece (listener on window, removed on unmount; ignored when `disabled`).
- `DinozIcon.vue` props `{ display: string; size: number }`: static image rendered once with the same library as `DinozWithoutFlash.vue` (`toRawImage`) at small size, cached in a module-level `Map<string, string>` keyed by `display + size` so 100 pieces don't re-render.
- Attack result: when `move` returns a `fight`, navigate to `{ name: 'ReplayFight', params: { archive: fight.archiveId }, query: { back: <current route full path> } }`.

- [ ] **Step 1:** Implement. **Step 2:** `yarn build:front`, `yarn lint:test` → clean.
- [ ] **Step 3:** Manual check with `yarn dev:windows` if available (otherwise state it in the report): board renders, selection highlights, keyboard moves.
- [ ] **Step 4:** Commit `feat(cdc): page du damier (score, grille, déplacements)`.

### Task 6: Tabs — my dinoz, selection, journal + replay back button

**Files:**
- Create: `ed-ui/src/components/clans/championship/ChampionshipTabs.vue`
- Modify: `ChampionshipMatch.vue`, `ed-ui/src/pages/ReplayFight.vue`, i18n

**Interfaces:**
- `ChampionshipTabs.vue` props `{ board, selectedDinozId, pending }`, emits `enter(dinozId)`, `leave(dinozId)`, `select(dinozId)`:
  - **Mes dinoz**: the player's dinoz from `useDinozStore().getDinozList` filtered by the eligibility rule of the Global Constraints, each with an "Entrer" button; below, the player's dinoz already on the board (click selects). Ineligible dinoz at the right place are listed greyed with the reason (wrong place / in a group / busy / dead in this match) — reasons from i18n.
  - **Sélection**: selected piece name, level, HP/max, AP, position; "Sortir" button only when it stands on its own entry column.
  - **Journal**: `board.fights` — time, attacker clan, outcome, number of participants, dead count; "Revoir" link (`ReplayFight` with `back` query) only when `archiveId` is not null.
- `ReplayFight.vue`: when `route.query.back` is a string starting with `/clan/`, show a "Retour au damier" button navigating there (no open-redirect: only internal paths starting with `/clan/`).

- [ ] **Step 1:** Implement. **Step 2:** `yarn build:front`, `yarn lint:test` → clean.
- [ ] **Step 3:** Commit `feat(cdc): onglets du damier et retour depuis le combat`.

### Task 7: End-to-end test

**Files:**
- Create: `e2e/tests/clan-championship.spec.ts`
- Modify (only if needed): `e2e/support/fixtures.ts` (helpers to create a clan, a member dinoz at a place, a championship event + live match via `db`)

**Interfaces:**
- Scenario: player (leader of clan A) with one dinoz at place P; a championship `ClanEvent` in phase `running`, a live match A vs B at place P with `westClanId = A`, `obstacles = []`, `endsAt` in 2 days. Steps: open `/clan/<A>/championship/match` → the score bar shows both clan names → "Mes dinoz" lists the dinoz with "Entrer" → click it → a piece appears in column 0 → in DB the piece is `onBoard` and the dinoz `unavailableReason = clanChampionship` → set the piece AP to 2 in DB and trigger a refetch (reload) → select the piece, click the highlighted east neighbour → DB piece `x = 1`, AP 1.
- Prerequisite reminder (CLAUDE.md): `yarn build:core && yarn build:back` before `yarn test:e2e`; stop `yarn dev` first.

- [ ] **Step 1:** Write the test. **Step 2:** `yarn build:core && yarn build:back && yarn test:e2e -- clan-championship` → PASS (if the e2e environment can't run here, report exactly why).
- [ ] **Step 3:** Commit `test(cdc): parcours e2e du damier`.

### Task 8: Final verification

- [ ] `yarn lint:test`, `yarn test:ci`, `yarn build` → green; `yarn test:e2e` (full) → green or the reason it can't run.
