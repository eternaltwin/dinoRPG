# CDC — Lot 1 : lancement, inscriptions, calendrier — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin launch a Clan Championship (CDC) as a `ClanEvent` of type `championship`, let clan leaders / war officers register their clan for two weeks, then freeze the list and generate the round-robin calendar (or cancel when fewer than 2 clans registered).

**Architecture:** `ClanEvent` becomes a real multi-type container: a new `ClanEventType.championship`, a discriminated-union config, and every war query filtered on war types so a CDC is never mistaken for a war. War and CDC are mutually exclusive: only one clan event (any type) may be ongoing or scheduled at a time. CDC registrations and matches are child tables of `ClanEvent`. Pure date / pairing logic lives in `ed-be/src/utils/clanChampionship/` (unit-tested without mocks); the business service orchestrates Prisma + `node-schedule` jobs re-armed at boot (same pattern as `scheduleWarExpiration`, `ed-be/src/business/clanWar.ts:601`). Lots 2–4 (match engine, board UI, standings) build on this.

**Tech Stack:** Prisma/PostgreSQL, Express, dayjs (UTC), node-schedule, Vitest, Vue 3.

**Spec:** `docs/superpowers/specs/2026-11-02-championnat-des-clans-design.md`

## Global Constraints

- All CDC times are **UTC** (no timezone handling): use `dayjs.utc` (`dayjs/plugin/utc`) or plain UTC `Date` arithmetic.
- A CDC starts on a Monday; registration: start Monday 00:00 UTC → start Monday + 14 days 00:00 UTC.
- Match slots: Monday 18:00 UTC → Wednesday 18:00 UTC, Thursday 18:00 UTC → Saturday 18:00 UTC; first slot = the Monday registration closes.
- **War and CDC are exclusive**: creating any clan event (war, mana_war or championship) is refused while another clan event is ongoing or scheduled (its `endDate` is after the requested start, or it is a championship not yet closed).
- War code must only ever see war events: `WAR_EVENT_TYPES = [ClanEventType.war, ClanEventType.mana_war]`.
- Register/unregister: clan leader or `ClanMemberRight.WAR_OFFICER` only (`playerHasRightRequest` already accepts the leader, `ed-be/src/dao/clansDao.ts:708`).
- Registration refused while the clan still has a war in progress (attacker or defender, `winnerClanId: null`) — a war declared at the end of a previous war event can outlive it.
- A clan registered in a CDC that is in `registration` or `running` phase cannot be dissolved.
- < 2 registered clans at closing → CDC `cancelled`.
- Round robin, circle method: N even → N−1 rounds; N odd → N rounds with one bye per round (no match row for the bye).
- Tournaments are untouched by a CDC (keep `tournamentManager.ts:713` filtering on `war` only).
- Prettier: tabs, single quotes, no trailing commas, 120 cols. Backend imports enums from `@drpg/prisma`, frontend from `@drpg/prisma/enums`.
- Every user-facing string goes through i18n in fr/en/es/de (backend `ed-be/i18n/*.json`, frontend `ed-ui/src/i18n/locales/*.json`).

## Review Focus

1. **A CDC leaking into war code** — while a CDC is ongoing, `GET /api/v1/clan/war/` must report no event, the dinoz war actions must not appear, and `scheduleWarExpiration` must ignore it. Tests in Task 2.
2. **Server restart around closing** — if the server is down at `registrationEnd`, the boot scheduler must close registrations immediately, and closing twice must be a no-op (phase guard). Test in Task 5.
3. **Registration at the deadline** — a register/unregister request at or after `registrationEnd` is refused even if the closing job hasn't run yet. Test in Task 4.
4. **Admin start date not a Monday / in the past / no places** — rejected with an `ExpectedError`, nothing created. Test in Task 4.
5. **Overlapping events** — creating a war event while a CDC is in registration (its `endDate` not yet extended), or a CDC while a future war event is scheduled, is refused. Tests in Task 2 and Task 4.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `ed-be/prisma/schema.prisma` (modify) | `ClanEventType.championship`, `ClanChampionshipRegistration`, `ClanChampionshipMatch` |
| `core/src/models/clan/clanEventConfig.mts` (modify) | Config discriminated union |
| `core/src/models/clan/clanChampionship.mts` (create) | CDC constants + DTO types |
| `ed-be/src/business/clanEventService.ts` (create) | Typed event lookups + exclusivity check shared by war and CDC |
| `ed-be/src/utils/clanChampionship/schedule.ts`, `roundRobin.ts` (create) | Pure date / pairing logic |
| `ed-be/src/business/clanChampionshipService.ts` (create) | Start, register, unregister, close, boot scheduling, dissolution guard |
| `ed-be/src/routes/clan.championship.routes.ts` (create) | Player endpoints |
| `ed-be/src/routes/admin.routes.ts`, `ed-be/src/routes/index.ts`, `ed-be/src/constants/index.ts`, `ed-be/src/server.ts` (modify) | Wiring |
| `ed-ui/src/services/ClanChampionshipService.ts`, `ed-ui/src/components/clans/ClanChampionship.vue`, `ed-ui/src/components/admin/ChampionshipCreation.vue` (create) | UI |

---

### Task 1: Schema + shared models

**Files:**
- Modify: `ed-be/prisma/schema.prisma`, `core/src/models/clan/clanEventConfig.mts`
- Create: `core/src/models/clan/clanChampionship.mts`

**Interfaces:**
- Produces (Prisma):
  ```prisma
  enum ClanEventType { war mana_war championship }

  model ClanChampionshipRegistration {
    id             Int       @id @default(autoincrement())
    eventId        String    @db.Uuid    // -> ClanEvent, onDelete: Cascade
    clanId         Int                   // -> Clan, onDelete: Cascade
    registeredById String    @db.Uuid
    registeredAt   DateTime  @default(now()) @db.Timestamp(6)
    @@unique([eventId, clanId])
    @@map("clan_championship_registration")
  }
  model ClanChampionshipMatch {
    id         String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
    eventId    String   @db.Uuid         // -> ClanEvent, onDelete: Cascade
    round      Int                       // 0-based = slot index
    homeClanId Int                       // -> Clan (named relation)
    awayClanId Int                       // -> Clan (named relation)
    startsAt   DateTime @db.Timestamp(6)
    endsAt     DateTime @db.Timestamp(6)
    @@index([eventId, round])
    @@map("clan_championship_match")
  }
  ```
  Back-relations: `ClanEvent.championshipRegistrations`, `ClanEvent.championshipMatches`, and on `Clan`. Lot 2 adds place / score / board fields to the match.
- Produces (core, `clanEventConfig.mts`): rename today's `ClanEventConfig` type to `ClanWarEventConfig` (`eventType: ClanEventType.war | ClanEventType.mana_war`), add
  ```ts
  export type ChampionshipPhase = 'registration' | 'running' | 'cancelled' | 'finished';
  export type ClanChampionshipEventConfig = {
  	eventType: ClanEventType.championship;
  	places: PlaceEnum[];
  	registrationEnd: string; // ISO UTC
  	phase: ChampionshipPhase;
  };
  export type ClanEventConfig = ClanWarEventConfig | ClanChampionshipEventConfig;
  ```
  and update existing imports (`adminService.ts:37`, `clanWar.ts:18`) to `ClanWarEventConfig`.
- Produces (core, `clanChampionship.mts`): `CHAMPIONSHIP_REGISTRATION_WEEKS = 2`, `CHAMPIONSHIP_MATCH_UTC_HOUR = 18`, `ClanChampionshipDTO { id: string; phase: ChampionshipPhase; registrationStart: Date; registrationEnd: Date; endDate: Date; places: number[]; registrations: { clanId: number; clanName: string }[]; matches: ClanChampionshipMatchDTO[]; myClanRegistered: boolean; canManageRegistration: boolean }`, `ClanChampionshipMatchDTO { id: string; round: number; homeClan: { id: number; name: string }; awayClan: { id: number; name: string }; startsAt: Date; endsAt: Date }`, `ChampionshipForm { start: string /* YYYY-MM-DD */; places: number[] }`.
- Event dates convention for a championship `ClanEvent`: `startDate` = registration start; `endDate` = `registrationEnd` until closing, then the last match `endsAt` (or the closing time when cancelled).

- [ ] **Step 1:** Edit schema + core files.
- [ ] **Step 2:** `yarn db:migrate:manual` (name `clan_championship`), then `yarn db:sync:dev`. Expected: migration under `ed-be/prisma/migrations/`, client regenerated, `ClanEventType.championship` available from `@drpg/prisma/enums`.
- [ ] **Step 3:** `yarn build:core && yarn build:back` → success (renamed type compiles everywhere).
- [ ] **Step 4:** Commit `feat(cdc): ClanEvent multi-type et tables du championnat`.

### Task 2: ClanEvent typed lookups + exclusivity, war code fixed

**Files:**
- Create: `ed-be/src/business/clanEventService.ts`
- Modify: `ed-be/src/business/clanWar.ts` (`eventState` :52, `currentWar` :78, `scheduleWarExpiration` :601), `ed-be/src/business/dinozService.ts:189`, `ed-be/src/business/adminService.ts` (`startClanWarEvent` :1109, `getOngoingEvent` :1147)
- Test: `ed-be/src/test/business/clanEventService.test.ts`, existing `ed-be/src/test/business/clanWar.test.ts`, `dinozService.test.ts`

**Interfaces:**
- Produces:
  - `WAR_EVENT_TYPES: ClanEventType[]` = `[war, mana_war]`.
  - `findActiveWarEvent(tx = prisma)` — `startDate < now < endDate` **and** `eventType in WAR_EVENT_TYPES`; replaces the three untyped `findFirst` in `clanWar.ts` and the one in `dinozService.ts` (that one keeps its `endDate > now` only semantics + type filter).
  - `findActiveChampionshipEvent(tx = prisma)` — latest `championship` event whose parsed `config.phase` is `registration` or `running` (query `eventType: championship`, `orderBy: { startDate: 'desc' }`, `take: 1`, then check phase).
  - `assertNoClanEventOverlap(start: Date, tx = prisma): Promise<void>` — throws `ExpectedError('clanEvent.overlap')` if any `ClanEvent` has `endDate > start`, or `findActiveChampionshipEvent` returns one.
  - `parseEventConfig(event: { config: string }): ClanEventConfig`.
- `startClanWarEvent` calls `assertNoClanEventOverlap(startTime)` before creating.

- [ ] **Step 1: Failing tests** (`clanEventService.test.ts`, prisma mocked): `findActiveWarEvent` passes `eventType: { in: [war, mana_war] }` in its `where`; `assertNoClanEventOverlap` throws when `clanEvent.findFirst` returns an event ending after `start`, throws when the latest championship has phase `registration` even if its `endDate` is past, passes otherwise. In `clanWar.test.ts`: `eventState()` returns `undefined` when only a championship exists (assert on the `where` passed to the mock including the war types filter).
- [ ] **Step 2:** `cd ed-be && yarn vitest run src/test/business/clanEventService.test.ts src/test/business/clanWar.test.ts` → FAIL.
- [ ] **Step 3:** Implement and replace the call sites; add `clanEvent.overlap` to `ed-be/i18n/{fr,en,es,de}.json`.
- [ ] **Step 4:** Re-run those files plus `dinozService.test.ts` → PASS (fix existing mocks if they assert the old `where`).
- [ ] **Step 5:** Commit `feat(cdc): ClanEvent filtré par type et événements exclusifs`.

### Task 3: Pure scheduling utils

**Files:**
- Create: `ed-be/src/utils/clanChampionship/schedule.ts`, `ed-be/src/utils/clanChampionship/roundRobin.ts`
- Test: `ed-be/src/test/utils/clanChampionshipSchedule.test.ts`

**Interfaces:**
- Produces:
  - `isMonday(date: string): boolean` — `date` is `YYYY-MM-DD`, evaluated in UTC.
  - `computeRegistrationWindow(start: string): { registrationStart: Date; registrationEnd: Date }`
  - `computeMatchSlots(registrationEnd: Date, count: number): { startsAt: Date; endsAt: Date }[]` — slot `k`: week `⌊k/2⌋` after `registrationEnd`; even `k` → Mon 18:00→Wed 18:00 UTC, odd `k` → Thu 18:00→Sat 18:00 UTC.
  - `roundRobin(clanIds: number[]): [home: number, away: number][][]`

- [ ] **Step 1: Write the failing tests**

```ts
describe('computeRegistrationWindow', () => {
	it('spans two weeks from Monday 00:00 UTC', () => {
		const w = computeRegistrationWindow('2026-11-09');
		expect(w.registrationStart.toISOString()).toBe('2026-11-09T00:00:00.000Z');
		expect(w.registrationEnd.toISOString()).toBe('2026-11-23T00:00:00.000Z');
	});
});
describe('isMonday', () => {
	it('accepts a Monday and rejects a Sunday', () => {
		expect(isMonday('2026-11-09')).toBe(true);
		expect(isMonday('2026-11-08')).toBe(false);
	});
});
describe('computeMatchSlots', () => {
	it('alternates Mon→Wed and Thu→Sat at 18:00 UTC', () => {
		const end = computeRegistrationWindow('2026-11-09').registrationEnd;
		const s = computeMatchSlots(end, 3).map(x => [x.startsAt.toISOString(), x.endsAt.toISOString()]);
		expect(s).toEqual([
			['2026-11-23T18:00:00.000Z', '2026-11-25T18:00:00.000Z'],
			['2026-11-26T18:00:00.000Z', '2026-11-28T18:00:00.000Z'],
			['2026-11-30T18:00:00.000Z', '2026-12-02T18:00:00.000Z']
		]);
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

- [ ] **Step 2:** `cd ed-be && yarn vitest run src/test/utils/clanChampionshipSchedule.test.ts` → FAIL.
- [ ] **Step 3:** Implement. Round robin: fix the first element, rotate the others; alternate the fixed element's home/away each round.
- [ ] **Step 4:** Re-run → PASS.
- [ ] **Step 5:** Commit `feat(cdc): calcul des créneaux et du round-robin`.

### Task 4: Service — start, register, unregister, read

**Files:**
- Create: `ed-be/src/business/clanChampionshipService.ts`
- Test: `ed-be/src/test/business/clanChampionshipService.test.ts` (mock `../../prisma.js`, `../../dao/playerDao.js` `auth`, `../../dao/clansDao.js` `playerHasRightRequest`, `node-schedule`, translate → identity; style of `ed-be/src/test/business/dojoService.test.ts`)

**Interfaces:**
- Consumes: Task 2 `assertNoClanEventOverlap`, `findActiveChampionshipEvent`, `parseEventConfig`; Task 3 utils.
- Produces:
  - `startClanChampionship(req: Request): Promise<{ id: string }>` — body `ChampionshipForm`; creates `ClanEvent { eventType: championship, startDate: registrationStart, endDate: registrationEnd, config: { eventType, places, registrationEnd, phase: 'registration' } }`; schedules `championshipClose_${id}` at `registrationEnd` (calls `closeRegistrations`, Task 5).
  - `registerClan(req: Request): Promise<void>` / `unregisterClan(req: Request): Promise<void>` — on `authed.clanId`.
  - `getCurrentChampionship(req: Request): Promise<ClanChampionshipDTO | null>` — `findActiveChampionshipEvent`, else the latest `championship` event if it ended < 7 days ago, else `null`; fills `myClanRegistered` and `canManageRegistration` for the caller.
- Error keys (`ExpectedError(translate(key, authed))`, under `clanChampionship` in `ed-be/i18n/{fr,en,es,de}.json`): `notMonday`, `startInPast`, `noPlaces`, `notInRegistration`, `alreadyRegistered`, `notRegistered`, `clanAtWar`; reuse `noClan`, `noRight`; overlap uses `clanEvent.overlap` from Task 2.

- [ ] **Step 1: Failing tests** (one `it` each):
  - `startClanChampionship` rejects `'2026-11-08'` (`notMonday`), a past Monday (`startInPast`, with `vi.setSystemTime`), `places: []` or only invalid ids (`noPlaces`), and propagates `clanEvent.overlap`; on success calls `prisma.clanEvent.create` with the dates from `computeRegistrationWindow`, filtered places and `phase: 'registration'`, and `scheduleJob` with `registrationEnd`.
  - `registerClan` rejects without clan (`noClan`), without right (`noRight`), when no active championship or `now >= registrationEnd` (`notInRegistration`), when a `clanWar` with `winnerClanId: null` has the clan as attacker or defender (`clanAtWar`), when already registered (`alreadyRegistered`); on success creates the registration with `registeredById: authed.id`.
  - `unregisterClan` rejects after `registrationEnd` and when not registered; on success deletes the row.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement (war check + insert in one `prisma.$transaction`). **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(cdc): lancement admin et inscriptions des clans`.

### Task 5: Service — closing, boot scheduling, dissolution guard

**Files:**
- Modify: `ed-be/src/business/clanChampionshipService.ts`, `ed-be/src/server.ts:96-108`, `ed-be/src/business/clanService.ts` (`deleteClan` :297)
- Test: `ed-be/src/test/business/clanChampionshipService.test.ts`, `ed-be/src/test/business/clanService.test.ts`

**Interfaces:**
- Produces:
  - `closeRegistrations(eventId: string): Promise<void>` — no-op unless `phase === 'registration'`; < 2 registrations → `phase: 'cancelled'`, `endDate = now`; else shuffle clan ids, `roundRobin` + `computeMatchSlots(registrationEnd, rounds.length)` → `createMany` matches (`round` = index), `phase: 'running'`, `endDate` = last slot `endsAt`; schedule `championshipFinish_${id}` at that date → `finishChampionship`. All writes in one transaction.
  - `finishChampionship(eventId: string): Promise<void>` — `running` → `finished` (Lot 2 will resolve matches before this).
  - `scheduleClanChampionship(): Promise<void>` — at boot (in `server.ts`, next to `scheduleWarExpiration()`): for `findActiveChampionshipEvent`, re-arm close or finish job, or run it now if its date is past.
  - `isClanInActiveChampionship(clanId: number, tx = prisma): Promise<boolean>`.
- Error key: `clanChampionship.registeredNoDelete`.

- [ ] **Step 1: Failing tests:** closing with 1 registration → `cancelled`, no match; closing with 4 → 6 matches over rounds 0–2 with Task 3 slot dates and `endDate` = `2026-12-02T18:00:00.000Z` for a CDC started `2026-11-09`; closing a `running` CDC does nothing; boot with a `registration` CDC whose `registrationEnd` is past closes immediately, with a future one calls `scheduleJob` at `registrationEnd`; boot with a `running` CDC whose `endDate` is past → `finished`; `deleteClan` rejects with `registeredNoDelete` when `isClanInActiveChampionship` is true.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement + wire `scheduleClanChampionship()` in `server.ts`. **Step 4:** Run → PASS (existing `clanService.test.ts` still green).
- [ ] **Step 5:** Commit `feat(cdc): clôture des inscriptions et génération du calendrier`.

### Task 6: Routes

**Files:**
- Create: `ed-be/src/routes/clan.championship.routes.ts`
- Modify: `ed-be/src/constants/index.ts` (`clanChampionshipRoutes: '/api/v1/clan/championship'`), `ed-be/src/routes/index.ts` (register **before** `clanRoutes`, like `clanWarRoutes`), `ed-be/src/routes/admin.routes.ts`

**Interfaces:**
- `GET /api/v1/clan/championship` → `ClanChampionshipDTO | null`
- `POST /api/v1/clan/championship/registration` → 200
- `DELETE /api/v1/clan/championship/registration` → 200
- `PUT /api/v1/admin/championship/start` (`checkRole([AdminRole.ADMIN])`, `start` ISO date, `places` int array) → `{ id }`
- Style of `clan.war.routes.ts` (`sendError`, endpoint list comment).

- [ ] **Step 1:** Implement + wiring. **Step 2:** `yarn build:back` → success. **Step 3:** Commit `feat(cdc): routes du championnat`.

### Task 7: Frontend — admin launch + clan tab

**Files:**
- Create: `ed-ui/src/services/ClanChampionshipService.ts` (`getCurrent()`, `register()`, `unregister()`), `ed-ui/src/components/admin/ChampionshipCreation.vue`, `ed-ui/src/components/clans/ClanChampionship.vue`
- Modify: `ed-ui/src/services/AdminService.ts` (`startClanChampionship(form: ChampionshipForm)`), `ed-ui/src/services/index.ts`, `ed-ui/src/router/index.ts` (admin route next to the event one ~187-224; clan child route `championship` / name `ClanChampionship` next to `ClanWar` ~462), `ed-ui/src/pages/Clan/Clan.vue` (tab shown when `getCurrent()` is non-null), `ed-ui/src/components/admin/EventCreation.vue` (config display copes with the union), `ed-ui/src/i18n/locales/{fr,en,es,de}.json` (`clan.tabs.championship`, `clanChampionship.*`)

**Interfaces:**
- Consumes: Task 6 endpoints, `ClanChampionshipDTO`, `ChampionshipForm`.
- `ChampionshipCreation.vue`: Monday date input + place checkboxes (`placeList.filter(p => p.warPlace)`, as in `EventCreation.vue`); shows current CDC phase and dates.
- `ClanChampionship.vue`: phase + registration deadline; register / unregister button when `canManageRegistration` and phase `registration`; registered clans list; when `running`, calendar grouped by round (dates in player locale, opponent name, own clan's matches highlighted).

- [ ] **Step 1:** Implement. **Step 2:** `yarn build:front` and `yarn lint:test` → no errors.
- [ ] **Step 3:** Commit `feat(cdc): écran admin et onglet championnat du clan`.

### Task 8: Final verification

- [ ] `yarn lint:test` → clean.
- [ ] `yarn test:ci` → all green.
- [ ] `yarn build` → success.
- [ ] Manual (with `yarn dev:windows`, reported to the user if not runnable here): admin launches a CDC on next Monday → creating a war event now fails with the overlap message → clan leader registers from the tab, plain member sees no button → set the event's `config.registrationEnd` and `endDate` in the past in DB and restart the backend: calendar generated and shown.
