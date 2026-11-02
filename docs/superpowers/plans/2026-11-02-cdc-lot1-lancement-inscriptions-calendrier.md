# CDC — Lot 1 : lancement, inscriptions, calendrier — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin launch a Clan Championship (CDC), let clan leaders / war officers register their clan for two weeks, then freeze the list and generate the round-robin calendar (or cancel when fewer than 2 clans registered).

**Architecture:** A dedicated Prisma model `ClanChampionship` (NOT a `ClanEvent`: `eventState()`/`currentWar()` in `ed-be/src/business/clanWar.ts:52-100` pick up *any* active `ClanEvent` regardless of type, so a CDC stored there would be mistaken for a war). Pure date / pairing logic lives in `ed-be/src/utils/clanChampionship/` and is unit-tested without mocks; the business service orchestrates Prisma + `node-schedule` jobs re-armed at boot from DB state (same pattern as `scheduleWarExpiration`, `clanWar.ts:601`). Lots 2–4 (match engine, board UI, standings) build on this.

**Tech Stack:** Prisma/PostgreSQL, Express, dayjs (+ `utc`/`timezone` plugins, bundled with dayjs), node-schedule, Vitest, Vue 3.

**Spec:** `docs/superpowers/specs/2026-11-02-championnat-des-clans-design.md`

## Global Constraints

- All CDC times are computed in `Europe/Paris` (`CHAMPIONSHIP_TIMEZONE`), stored as UTC `DateTime`.
- A CDC starts on a Monday; registration lasts 2 weeks: from start Monday 00:00 to start Monday + 14 days 00:00 (Paris).
- Match slots: Monday 20:00 → Wednesday 20:00 and Thursday 20:00 → Saturday 20:00 (Paris); first slot = the Monday registration closes.
- Only one CDC in state `registration` or `running` at a time.
- Register/unregister: clan leader or `ClanMemberRight.WAR_OFFICER` only (`playerHasRightRequest` already accepts the leader, `ed-be/src/dao/clansDao.ts:708`).
- Registration refused while the clan has a war in progress (as attacker or defender, `winnerClanId: null`).
- A registered clan (CDC in `registration` or `running`) cannot declare or receive a war, and cannot be dissolved.
- < 2 registered clans at closing → CDC `cancelled`.
- Round robin, circle method; odd N → one bye per round (no match row for the bye).
- Prettier: tabs, single quotes, no trailing commas, 120 cols. Backend imports enums from `@drpg/prisma`, frontend from `@drpg/prisma/enums`.
- Every user-facing string goes through i18n in fr/en/es/de (backend `ed-be/i18n/*.json`, frontend `ed-ui/src/i18n/locales/*.json`).

## Review Focus

1. **DST boundary** — a CDC whose slots straddle the last Sunday of March/October must still start at 20:00 Paris local time (UTC hour changes). Test in Task 2.
2. **Server restart around closing** — if the server is down at `registrationEnd`, the boot scheduler must close registrations immediately, and closing twice must be a no-op (state guard). Test in Task 4.
3. **Registration at the deadline** — a register/unregister request at or after `registrationEnd` must be refused even if the closing job hasn't run yet. Test in Task 3.
4. **Admin start date not a Monday / in the past / no places** — rejected with an `ExpectedError`, nothing created. Test in Task 3.
5. **War declared against a registered clan** (not only by it) — must be refused. Test in Task 5.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `ed-be/prisma/schema.prisma` (modify) | `ClanChampionship`, `ClanChampionshipRegistration`, `ClanChampionshipMatch`, enum `ClanChampionshipState` |
| `core/src/models/clan/clanChampionship.mts` (create) | Shared constants + DTO types |
| `ed-be/src/utils/clanChampionship/schedule.ts` (create) | Pure: registration window, match slots (Paris tz) |
| `ed-be/src/utils/clanChampionship/roundRobin.ts` (create) | Pure: circle-method pairings |
| `ed-be/src/business/clanChampionshipService.ts` (create) | Start, register, unregister, close, finish, boot scheduling, `isClanInActiveChampionship` |
| `ed-be/src/routes/clan.championship.routes.ts` (create) | Player endpoints |
| `ed-be/src/routes/admin.routes.ts`, `ed-be/src/routes/index.ts`, `ed-be/src/constants/index.ts`, `ed-be/src/server.ts` (modify) | Wiring |
| `ed-be/src/business/clanWar.ts`, `ed-be/src/business/clanService.ts` (modify) | War / dissolution guards |
| `ed-ui/src/services/ClanChampionshipService.ts`, `ed-ui/src/components/clans/ClanChampionship.vue`, `ed-ui/src/components/admin/ChampionshipCreation.vue` (create) | UI |

---

### Task 1: Schema + shared model

**Files:**
- Modify: `ed-be/prisma/schema.prisma`
- Create: `core/src/models/clan/clanChampionship.mts`

**Interfaces:**
- Produces (Prisma):
  ```prisma
  enum ClanChampionshipState { registration running finished cancelled }

  model ClanChampionship {
    id                String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
    state             ClanChampionshipState @default(registration)
    registrationStart DateTime @db.Timestamp(6)
    registrationEnd   DateTime @db.Timestamp(6)
    places            Int[]
    createdAt         DateTime @default(now()) @db.Timestamp(6)
    registrations     ClanChampionshipRegistration[]
    matches           ClanChampionshipMatch[]
    @@index([state])
    @@map("clan_championship")
  }
  model ClanChampionshipRegistration {
    id             Int      @id @default(autoincrement())
    championshipId String   @db.Uuid   // relation onDelete: Cascade
    clanId         Int                 // relation to Clan
    registeredById String   @db.Uuid
    registeredAt   DateTime @default(now()) @db.Timestamp(6)
    @@unique([championshipId, clanId])
    @@map("clan_championship_registration")
  }
  model ClanChampionshipMatch {
    id             String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
    championshipId String   @db.Uuid
    round          Int      // 0-based, = slot index
    homeClanId     Int
    awayClanId     Int
    startsAt       DateTime @db.Timestamp(6)
    endsAt         DateTime @db.Timestamp(6)
    @@index([championshipId, round])
    @@map("clan_championship_match")
  }
  ```
  Add the back-relations on `Clan` (`championshipRegistrations`, `championshipHomeMatches` / `championshipAwayMatches` with named relations). Lot 2 will add place / score / board fields to `ClanChampionshipMatch`.
- Produces (core): `CHAMPIONSHIP_TIMEZONE = 'Europe/Paris'`, `CHAMPIONSHIP_REGISTRATION_WEEKS = 2`, `CHAMPIONSHIP_MATCH_HOUR = 20`, types `ClanChampionshipDTO { id; state; registrationStart; registrationEnd; places: number[]; registrations: { clanId: number; clanName: string }[]; matches: ClanChampionshipMatchDTO[]; myClanRegistered: boolean; canManageRegistration: boolean }`, `ClanChampionshipMatchDTO { id; round; homeClan: { id; name }; awayClan: { id; name }; startsAt; endsAt }`, `ChampionshipForm { start: string /* YYYY-MM-DD */; places: number[] }`.

- [ ] **Step 1:** Add the models/enum above to the schema.
- [ ] **Step 2:** Run `yarn db:migrate:manual` (name it `clan_championship`), then `yarn db:sync:dev`. Expected: migration created under `ed-be/prisma/migrations/`, client regenerated, `ClanChampionshipState` exported from `@drpg/prisma/enums`.
- [ ] **Step 3:** Create `core/src/models/clan/clanChampionship.mts`; run `yarn build:core`. Expected: success.
- [ ] **Step 4:** Commit `feat(cdc): schéma et modèle partagé du championnat des clans`.

### Task 2: Pure scheduling utils

**Files:**
- Create: `ed-be/src/utils/clanChampionship/schedule.ts`, `ed-be/src/utils/clanChampionship/roundRobin.ts`
- Test: `ed-be/src/test/utils/clanChampionshipSchedule.test.ts`

**Interfaces:**
- Produces:
  - `isParisMonday(date: string): boolean` — `date` is `YYYY-MM-DD`.
  - `computeRegistrationWindow(start: string): { registrationStart: Date; registrationEnd: Date }`
  - `computeMatchSlots(registrationEnd: Date, count: number): { startsAt: Date; endsAt: Date }[]` — slot `k`: week `⌊k/2⌋` after the `registrationEnd` Monday; even `k` → Mon 20:00→Wed 20:00, odd `k` → Thu 20:00→Sat 20:00 (Paris).
  - `roundRobin(clanIds: number[]): [home: number, away: number][][]` — one array per round; N even → N−1 rounds of N/2 matches; N odd → N rounds of (N−1)/2 matches (bye = phantom, dropped).

- [ ] **Step 1: Write the failing tests**

```ts
describe('computeRegistrationWindow', () => {
	it('spans two weeks from Monday 00:00 Paris', () => {
		const w = computeRegistrationWindow('2026-11-09');
		expect(w.registrationStart.toISOString()).toBe('2026-11-08T23:00:00.000Z');
		expect(w.registrationEnd.toISOString()).toBe('2026-11-22T23:00:00.000Z');
	});
	it('handles the March DST switch', () => {
		const w = computeRegistrationWindow('2027-03-15');
		expect(w.registrationStart.toISOString()).toBe('2027-03-14T23:00:00.000Z');
		expect(w.registrationEnd.toISOString()).toBe('2027-03-28T22:00:00.000Z');
	});
});
describe('isParisMonday', () => {
	it('accepts a Monday and rejects a Sunday', () => {
		expect(isParisMonday('2026-11-09')).toBe(true);
		expect(isParisMonday('2026-11-08')).toBe(false);
	});
});
describe('computeMatchSlots', () => {
	it('alternates Mon→Wed and Thu→Sat at 20:00 Paris', () => {
		const end = computeRegistrationWindow('2026-11-09').registrationEnd;
		const s = computeMatchSlots(end, 3).map(x => [x.startsAt.toISOString(), x.endsAt.toISOString()]);
		expect(s).toEqual([
			['2026-11-23T19:00:00.000Z', '2026-11-25T19:00:00.000Z'],
			['2026-11-26T19:00:00.000Z', '2026-11-28T19:00:00.000Z'],
			['2026-11-30T19:00:00.000Z', '2026-12-02T19:00:00.000Z']
		]);
	});
	it('keeps 20:00 local after DST', () => {
		const end = computeRegistrationWindow('2027-03-15').registrationEnd;
		expect(computeMatchSlots(end, 1)[0].startsAt.toISOString()).toBe('2027-03-29T18:00:00.000Z');
	});
});
describe('roundRobin', () => {
	const pairKey = ([a, b]: [number, number]) => [a, b].sort().join('-');
	it('4 clans: 3 rounds, every pair once, each clan once per round', () => {
		const rounds = roundRobin([1, 2, 3, 4]);
		expect(rounds).toHaveLength(3);
		rounds.forEach(r => expect(new Set(r.flat()).size).toBe(4));
		expect(new Set(rounds.flat().map(pairKey)).size).toBe(6);
	});
	it('5 clans: 5 rounds of 2 matches, each clan has exactly one bye', () => {
		const rounds = roundRobin([1, 2, 3, 4, 5]);
		expect(rounds).toHaveLength(5);
		rounds.forEach(r => expect(r).toHaveLength(2));
		expect(new Set(rounds.flat().map(pairKey)).size).toBe(10);
		[1, 2, 3, 4, 5].forEach(id => expect(rounds.filter(r => !r.flat().includes(id))).toHaveLength(1));
	});
	it('2 clans: a single match', () => {
		expect(roundRobin([7, 9])).toEqual([[[7, 9]]]);
	});
});
```

- [ ] **Step 2:** `cd ed-be && yarn vitest run src/test/utils/clanChampionshipSchedule.test.ts` → FAIL (modules missing).
- [ ] **Step 3:** Implement. Use `dayjs.extend(utc); dayjs.extend(timezone)` locally in `schedule.ts` and `dayjs.tz(..., CHAMPIONSHIP_TIMEZONE)`. Round robin: fix the first element, rotate the others; alternate home/away of the fixed element each round so home/away are balanced.
- [ ] **Step 4:** Re-run → PASS.
- [ ] **Step 5:** Commit `feat(cdc): calcul des créneaux et du round-robin`.

### Task 3: Service — start, register, unregister

**Files:**
- Create: `ed-be/src/business/clanChampionshipService.ts`
- Test: `ed-be/src/test/business/clanChampionshipService.test.ts` (mock `../../prisma.js`, `../../dao/playerDao.js` `auth`, `../../dao/clansDao.js` `playerHasRightRequest`, `node-schedule`, translate → identity; same style as `ed-be/src/test/business/dojoService.test.ts`)

**Interfaces:**
- Consumes: Task 2 utils; `auth` (`ed-be/src/dao/playerDao.ts`), `playerHasRightRequest` (`ed-be/src/dao/clansDao.ts:708`), `PlaceEnum`.
- Produces:
  - `startClanChampionship(req: Request): Promise<{ id: string }>` — body `ChampionshipForm`.
  - `registerClan(req: Request): Promise<void>` / `unregisterClan(req: Request): Promise<void>` — uses `authed.clanId`.
  - `getCurrentChampionship(req: Request): Promise<ClanChampionshipDTO | null>` — latest CDC in `registration`/`running`, else the latest `finished` one, else `null`; computes `myClanRegistered` and `canManageRegistration` for the caller.
  - `getActiveChampionship(tx = prisma)` — the CDC in `registration`/`running` or `null`.
  - `scheduleClosing(championshipId: string, at: Date): void` — `scheduleJob(\`championshipClose_${id}\`, at, () => closeRegistrations(id))` (implemented in Task 4; stub-safe import).
- Error keys (`ExpectedError(translate(key, authed))`, add to `ed-be/i18n/{fr,en,es,de}.json` under `clanChampionship`): `alreadyActive`, `notMonday`, `startInPast`, `noPlaces`, `notInRegistration`, `alreadyRegistered`, `notRegistered`, `clanAtWar`; reuse existing `noClan`, `noRight`.

- [ ] **Step 1: Write failing tests** (one `it` each):
  - `startClanChampionship` rejects `start: '2026-11-08'` with `clanChampionship.notMonday`, rejects a past Monday with `startInPast`, rejects `places: []` or only invalid ids with `noPlaces`, rejects when `getActiveChampionship` returns a row with `alreadyActive`; on success calls `prisma.clanChampionship.create` with `registrationStart`/`registrationEnd` from `computeRegistrationWindow` and filtered `places`, and calls `scheduleJob` with `registrationEnd`.
  - `registerClan` rejects without clan (`noClan`), without right (`noRight`), when `now >= registrationEnd` (`notInRegistration`, with `vi.setSystemTime`), when a `clanWar` with `winnerClanId: null` and `attackerClanId` or `defenderClanId` = clan exists (`clanAtWar`), when already registered (`alreadyRegistered`); on success creates the registration with `registeredById: authed.id`.
  - `unregisterClan` rejects after `registrationEnd` and when not registered; on success deletes the row.
- [ ] **Step 2:** `cd ed-be && yarn vitest run src/test/business/clanChampionshipService.test.ts` → FAIL.
- [ ] **Step 3:** Implement. Do the war check + insert inside one `prisma.$transaction`.
- [ ] **Step 4:** Re-run → PASS.
- [ ] **Step 5:** Commit `feat(cdc): lancement admin et inscriptions des clans`.

### Task 4: Service — closing, finishing, boot scheduling

**Files:**
- Modify: `ed-be/src/business/clanChampionshipService.ts`, `ed-be/src/server.ts:96-108`
- Test: `ed-be/src/test/business/clanChampionshipService.test.ts`

**Interfaces:**
- Produces:
  - `closeRegistrations(championshipId: string): Promise<void>` — no-op unless state is `registration`; < 2 registrations → `cancelled`; else `roundRobin` (clan ids shuffled first) + `computeMatchSlots(registrationEnd, rounds.length)` → `createMany` matches (`round` = index), state `running`, then `scheduleJob(\`championshipFinish_${id}\`, lastSlot.endsAt, () => finishChampionship(id))`. All DB writes in one transaction.
  - `finishChampionship(championshipId: string): Promise<void>` — `running` → `finished` (Lot 2 will hook match resolution before this).
  - `scheduleClanChampionship(): Promise<void>` — called at boot in `server.ts` next to `scheduleWarExpiration()`: for the active CDC, re-arm the close or finish job, or run it immediately if its date is past.

- [ ] **Step 1: Failing tests:** closing with 1 registration sets `cancelled` and creates no match; closing with 4 creates 6 matches over rounds 0–2 with the Task 2 slot dates; closing a CDC already `running` does nothing; `scheduleClanChampionship` with a `registration` CDC whose `registrationEnd` is past calls the close path immediately, and with a future one calls `scheduleJob` with `registrationEnd`; with a `running` CDC whose last match ended → `finished`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement + call `scheduleClanChampionship()` in `server.ts`. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(cdc): clôture des inscriptions et génération du calendrier`.

### Task 5: Guards on war and clan dissolution

**Files:**
- Modify: `ed-be/src/business/clanChampionshipService.ts`, `ed-be/src/business/clanWar.ts` (`declareWar`, ~line 190), `ed-be/src/business/clanService.ts` (`deleteClan`, line 297)
- Test: `ed-be/src/test/business/clanWar.test.ts`, `ed-be/src/test/business/clanService.test.ts`

**Interfaces:**
- Produces: `isClanInActiveChampionship(clanId: number, tx = prisma): Promise<boolean>` — a registration exists for a CDC in `registration`/`running`.
- Error keys: `clanChampionship.registeredNoWar`, `clanChampionship.registeredNoDelete`.

- [ ] **Step 1: Failing tests:** `declareWar` rejects with `registeredNoWar` when the attacker clan is registered **and** when the target clan is registered (mock `isClanInActiveChampionship`); `deleteClan` rejects with `registeredNoDelete` when the clan is registered.
- [ ] **Step 2:** Run both test files → FAIL. **Step 3:** Add the checks (in `declareWar` before the transaction, for `authed.clanId` and `+req.params.clanId`). **Step 4:** Run → PASS, and the existing tests in both files still pass.
- [ ] **Step 5:** Commit `feat(cdc): pas de guerre ni de dissolution pour un clan inscrit`.

### Task 6: Routes

**Files:**
- Create: `ed-be/src/routes/clan.championship.routes.ts`
- Modify: `ed-be/src/constants/index.ts` (`clanChampionshipRoutes: '/api/v1/clan/championship'`), `ed-be/src/routes/index.ts` (register **before** `clanRoutes`, like `clanWarRoutes`), `ed-be/src/routes/admin.routes.ts`

**Interfaces:**
- Produces:
  - `GET /api/v1/clan/championship` → `ClanChampionshipDTO | null`
  - `POST /api/v1/clan/championship/registration` → 200
  - `DELETE /api/v1/clan/championship/registration` → 200
  - `PUT /api/v1/admin/championship/start` (`checkRole([AdminRole.ADMIN])`, body validated: `start` ISO date, `places` int array) → `{ id }`
- Follow the `clan.war.routes.ts` style (`sendError`, endpoint list comment).

- [ ] **Step 1:** Implement routes + wiring. **Step 2:** `yarn build:back` → success. **Step 3:** `yarn start:back`, then `curl -s localhost:8081/api/v1/clan/championship` with a dev session cookie → `null` (no CDC yet). **Step 4:** Commit `feat(cdc): routes du championnat`.

### Task 7: Frontend — admin launch + clan tab

**Files:**
- Create: `ed-ui/src/services/ClanChampionshipService.ts` (`getCurrent()`, `register()`, `unregister()`), `ed-ui/src/components/admin/ChampionshipCreation.vue`, `ed-ui/src/components/clans/ClanChampionship.vue`
- Modify: `ed-ui/src/services/AdminService.ts` (`startClanChampionship(form: ChampionshipForm)`), `ed-ui/src/services/index.ts`, `ed-ui/src/router/index.ts` (admin route next to the event one ~187-224; clan child route `championship` / name `ClanChampionship` next to `ClanWar` ~462), `ed-ui/src/pages/Clan/Clan.vue` (tab shown when `getCurrent()` is non-null, icon reused from the war tab set), `ed-ui/src/i18n/locales/{fr,en,es,de}.json` (`clan.tabs.championship`, `clanChampionship.*`)

**Interfaces:**
- Consumes: Task 6 endpoints, `ClanChampionshipDTO`, `ChampionshipForm`.
- `ChampionshipCreation.vue`: date input (Monday) + place checkboxes, same `placeList.filter(p => p.warPlace)` as `EventCreation.vue`; shows the active CDC (state, dates).
- `ClanChampionship.vue`: state + registration deadline; register / unregister button when `canManageRegistration` and state `registration`; list of registered clans; once `running`, the calendar grouped by round (date range in the player's locale, opponent name, highlight own clan's matches).

- [ ] **Step 1:** Implement. **Step 2:** `yarn build:front` and `yarn lint:test` → no errors.
- [ ] **Step 3:** Manual check with `yarn dev:windows`: as admin launch a CDC on next Monday → as clan leader the tab shows and register works → as a plain member no button → set `registrationEnd` to a past date in DB and restart the backend: the boot path closes registrations and the calendar appears on the tab.
- [ ] **Step 4:** Commit `feat(cdc): écran admin et onglet championnat du clan`.

### Task 8: Final verification

- [ ] `yarn lint:test` → clean.
- [ ] `yarn test:ci` → all green, new files covered.
- [ ] `yarn build` → success.
