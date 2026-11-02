# CDC — Lot 2 : moteur de match — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run CDC matches server-side: place draw, board generation, entering/leaving/moving dinoz, 10-minute scoring ticks, board fights, match results, and the REST API the board UI (lot 3) will use.

**Architecture:** Pure board rules live in `ed-be/src/utils/clanChampionship/board.ts` (unit-tested, no DB). Match state is persisted per match (`ClanChampionshipMatch`) and per dinoz (`ClanChampionshipPiece`). One idempotent `championshipTick(now)` driven by a UTC cron every 10 minutes (and once at boot) performs every time-based transition (place draws, kick-offs, scoring ticks with catch-up, match ends, championship end), so restarts never lose state. Every player action and every tick on a match runs in one transaction holding a `FOR UPDATE` lock on that match row. Fights reuse `calculateFightBetweenPlayers`; the PvP XP formula is extracted from the clan war into a shared helper used by both.

**Tech Stack:** Prisma/PostgreSQL, Express, `cron` (CronJob, UTC), Vitest.

**Spec:** `docs/superpowers/specs/2026-11-02-championnat-des-clans-design.md` (section 2 + "Dissolution" in section 1). Lot 1 plan: `docs/superpowers/plans/2026-11-02-cdc-lot1-lancement-inscriptions-calendrier.md`.

## Global Constraints

- Board 20×20. Internal coordinates are **0-based**: `x` 0..19 (0 = west column), `y` 0..19. The west clan enters on `x = 0`, the east clan on `x = 19`.
- Obstacles: point symmetry `(x, y)` ⇔ `(19 − x, 19 − y)`; never on `x = 0` or `x = 19`; 10–15 % of the cells; a 4-neighbour path always exists from column 0 to column 19.
- Advancement of a piece: west `x`, east `19 − x`. A piece is **passed** when an enemy piece on the board is closer to its camp (west piece at `x` is passed if some east piece has `x' < x`; east piece at `x` is passed if some west piece has `x' > x`). Score line of a clan = max advancement of its non-passed pieces on the board, 0 if none.
- Every 10 minutes from `startsAt` (288 ticks, last one at `endsAt`): each clan scores its score line; every piece on the board gains 2 AP (no cap).
- Move to an adjacent free, in-bounds, non-obstacle cell (N/S/E/W) costs 1 AP. Moving onto an enemy = attack, costs 1 AP, attacker stays in place.
- Attack from behind (attacker on the victim's camp side: victim west → attacker at `x − 1`; victim east → attacker at `x + 1`) = 1v1. Otherwise every piece on the board within Chebyshev distance 1 of the attacker or of the defender joins, by clan.
- Dead dinoz (life reaches 0) leave the match forever; survivors keep lost HP; XP is earned; fights do not touch the `fight` flag nor `restingAttack`.
- Quota: at most 100 distinct dinoz per clan per match (pieces in any state count, except pieces deleted when their owner left the clan).
- Entry: owner only; owner's clan is in the match; dinoz alive, `placeId` = match place, no leader and no followers, `unavailableReason` null, not dead in this match; random free cell of the clan's entry column; 0 AP. Exit only from the clan's entry column, free.
- Locked dinoz: new `UnavailableReason.clanChampionship`; can be healed (items), equipped, level up; nothing else.
- Only members of the two clans can read a match board; enemy pieces expose position only (no HP, no AP).
- Place of a match is revealed when drawn: round 0 at registration closing, other rounds 24 h before `startsAt`.
- A deleted clan stays in standings/calendar: registrations and matches keep a snapshotted clan name, clan FKs become `SetNull`.
- Prettier: tabs, single quotes, no trailing commas, 120 cols. Backend enums from `@drpg/prisma`. User-facing errors: `ExpectedError(translate(key, authed))`, keys in all four `ed-be/i18n/*.json`.

## Review Focus

1. **Concurrent actions on one match** (two players moving into the same cell, an attack racing a tick, a tick racing the match end) — every path takes the match row lock first and re-reads state under it. Tests in Task 5 and Task 6 assert the lock query is issued before any read.
2. **Server down across ticks / match end** — the tick catches up all missing ticks before ending a match, and is idempotent when run twice. Tests in Task 3.
3. **Fight participant left in an inconsistent state** — a dead dinoz must leave the board and get `unavailableReason` cleared; a survivor keeps its piece; a piece whose dinoz is not loaded must not crash the fight. Tests in Task 6.
4. **Player leaves the clan with dinoz on the board** — pieces removed, dinoz unlocked, quota freed, dead pieces kept. Test in Task 5.
5. **Board full on entry column** — entry refused with `clanChampionship.entryFull`, nothing written. Test in Task 5.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `ed-be/prisma/schema.prisma` (modify) | Snapshot names + SetNull, match board fields, `ClanChampionshipPiece`, enums |
| `core/src/models/clan/clanChampionship.mts` (modify) | Board constants, board DTOs, `Direction` |
| `ed-be/src/utils/clanChampionship/board.ts` (create) | Pure board rules |
| `ed-be/src/utils/fight/pvpXp.ts` (create) | Shared PvP XP computation (extracted from clan war) |
| `ed-be/src/business/clanChampionshipMatchService.ts` (create) | Tick, place draw, start/end of matches, board actions, fights, board read |
| `ed-be/src/business/clanChampionshipService.ts` (modify) | Close draws round 0 places + snapshots names; finish job replaced by tick |
| `ed-be/src/business/dinozService.ts`, `inventoryService.ts`, `clanService.ts`, `clanWar.ts` (modify) | Lock rules, clan-exit hook, XP helper reuse |
| `ed-be/src/routes/clan.championship.routes.ts` (modify) | Match endpoints |
| `ed-be/src/server.ts` (modify) | Start the tick cron |

---

### Task 1: Schema for match state + deleted clans kept

**Files:**
- Modify: `ed-be/prisma/schema.prisma`, `core/src/models/clan/clanChampionship.mts`, `ed-be/src/business/clanChampionshipService.ts` (writes/reads of names)
- Test: `ed-be/src/test/business/clanChampionshipService.test.ts`

**Interfaces:**
- Produces (Prisma):
  ```prisma
  enum UnavailableReason { ... clanChampionship }
  enum ClanChampionshipMatchStatus { scheduled live finished }
  enum ClanChampionshipPieceState { onBoard left dead }

  // ClanChampionshipRegistration: clanId Int? (onDelete: SetNull), + clanName String
  // ClanChampionshipMatch: homeClanId Int? / awayClanId Int? (onDelete: SetNull), + homeClanName String, awayClanName String,
  //   placeId Int?, westClanId Int?, obstacles Int[] @default([]) /// cell index = y * 20 + x
  //   homeScore Int @default(0), awayScore Int @default(0), ticksApplied Int @default(0),
  //   status ClanChampionshipMatchStatus @default(scheduled), winnerClanId Int?, pieces ClanChampionshipPiece[]
  //   @@unique([eventId, clanId]) on registration stays valid with a nullable clanId.

  model ClanChampionshipPiece {
    id           Int      @id @default(autoincrement())
    matchId      String   @db.Uuid                 // -> ClanChampionshipMatch, onDelete: Cascade
    dinozId      Int                               // -> Dinoz, onDelete: Cascade
    playerId     String   @db.Uuid
    clanId       Int
    state        ClanChampionshipPieceState @default(onBoard)
    x            Int?
    y            Int?
    actionPoints Int      @default(0)
    @@unique([matchId, dinozId])
    @@index([matchId, state])
    @@map("clan_championship_piece")
  }
  ```
- Migration: add the name columns with a temporary default, `UPDATE` them from `"Clan"."name"`, then drop the default (edit the generated SQL by hand before applying).
- Produces (core): `BOARD_SIZE = 20`, `BOARD_TICK_MINUTES = 10`, `BOARD_TICK_AP = 2`, `BOARD_MATCH_QUOTA = 100`, `PLACE_REVEAL_HOURS = 24`, `enum BoardDirection { N = 'N', S = 'S', E = 'E', W = 'W' }`. `ClanChampionshipMatchDTO` gains `placeId: number | null`, `status`, `homeScore`, `awayScore`, `winnerClanId: number | null`; `homeClan`/`awayClan` become `{ id: number | null; name: string }`; registrations become `{ clanId: number | null; clanName: string }`.
- `closeRegistrations` stores the clan names; `getCurrentChampionship` reads the snapshot names (no join needed).

- [ ] **Step 1:** Failing tests: `closeRegistrations` creates matches with `homeClanName`/`awayClanName` from the registrations' `clanName`; `registerClan` stores `clanName`; `getCurrentChampionship` maps a match whose `homeClanId` is null to `{ id: null, name: <snapshot> }`.
- [ ] **Step 2:** Run `cd ed-be && yarn vitest run src/test/business/clanChampionshipService.test.ts` → FAIL.
- [ ] **Step 3:** Schema + migration (`yarn db:migrate:manual`, name `clan_championship_match_state`, edit SQL, `yarn db:sync:dev`; if the enum wrapper is stale, rerun `prisma generate` + `prisma:postgenerate` as in lot 1) + code changes.
- [ ] **Step 4:** Tests PASS; `yarn build:core && yarn build:back` OK.
- [ ] **Step 5:** Commit `feat(cdc): état des matchs et clans supprimés conservés`.

### Task 2: Pure board rules

**Files:**
- Create: `ed-be/src/utils/clanChampionship/board.ts`
- Test: `ed-be/src/test/utils/clanChampionshipBoard.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type Side = 'west' | 'east';
  export interface BoardPiece { id: number; clanId: number; x: number; y: number }
  export const cellIndex = (x: number, y: number) => y * BOARD_SIZE + x;
  export function generateObstacles(rng: seedrandom.PRNG): number[];            // sorted cell indexes
  export function hasCrossingPath(obstacles: number[]): boolean;                // BFS column 0 → 19
  export function advancement(side: Side, x: number): number;                  // west x, east 19 - x
  export function scoreLine(side: Side, own: BoardPiece[], enemies: BoardPiece[]): number;
  export function entryColumn(side: Side): number;                              // 0 | 19
  export function step(x: number, y: number, dir: BoardDirection): { x: number; y: number };
  export function isInBounds(x: number, y: number): boolean;
  export function isBehindAttack(victimSide: Side, attacker: { x: number }, victim: { x: number }): boolean;
  export function fightZone(a: { x: number; y: number }, b: { x: number; y: number }): Set<number>; // cell indexes
  export function pickEntryCell(side: Side, occupied: Set<number>, rng: seedrandom.PRNG): { x: number; y: number } | null;
  ```
  `generateObstacles`: draw cells in the west half (`x` 1..9) plus their symmetric, target density uniformly in [10 %, 15 %] of 400 cells (even count, symmetric pairs), retry until `hasCrossingPath`.

- [ ] **Step 1: Failing tests**

```ts
it('scoreLine follows the spec example (0-based: A at 7 and 11, B at 9)', () => {
	const a = [{ id: 1, clanId: 1, x: 7, y: 3 }, { id: 2, clanId: 1, x: 11, y: 5 }];
	const b = [{ id: 3, clanId: 2, x: 9, y: 0 }];
	expect(scoreLine('west', a, b)).toBe(7);
	expect(scoreLine('east', b, a)).toBe(0); // mutual passing: east 9 is passed by west 11
});
it('scoreLine is 0 without pieces', () => expect(scoreLine('west', [], [])).toBe(0));
it('east pieces are passed by west pieces with a greater x', () => {
	expect(scoreLine('east', [{ id: 1, clanId: 2, x: 5, y: 0 }], [{ id: 2, clanId: 1, x: 6, y: 9 }])).toBe(0);
});
it('obstacles are symmetric, off the entry columns, 10-15 % and crossable', () => {
	for (let seed = 0; seed < 50; seed++) {
		const obs = generateObstacles(seedrandom(String(seed)));
		const set = new Set(obs);
		obs.forEach(c => {
			const x = c % 20, y = Math.floor(c / 20);
			expect(x).not.toBe(0); expect(x).not.toBe(19);
			expect(set.has(cellIndex(19 - x, 19 - y))).toBe(true);
		});
		expect(obs.length).toBeGreaterThanOrEqual(40); expect(obs.length).toBeLessThanOrEqual(60);
		expect(hasCrossingPath(obs)).toBe(true);
	}
});
it('hasCrossingPath is false when a full column is blocked', () => {
	expect(hasCrossingPath(Array.from({ length: 20 }, (_, y) => cellIndex(10, y)))).toBe(false);
});
it('isBehindAttack: west victim attacked from x-1, east victim from x+1', () => {
	expect(isBehindAttack('west', { x: 4 }, { x: 5 })).toBe(true);
	expect(isBehindAttack('west', { x: 6 }, { x: 5 })).toBe(false);
	expect(isBehindAttack('east', { x: 6 }, { x: 5 })).toBe(true);
	expect(isBehindAttack('east', { x: 5 }, { x: 5 })).toBe(false); // vertical attack
});
it('fightZone is 4x3 for a horizontal attack and 3x4 for a vertical one', () => {
	expect(fightZone({ x: 5, y: 5 }, { x: 6, y: 5 }).size).toBe(12);
	expect(fightZone({ x: 5, y: 5 }, { x: 5, y: 6 }).size).toBe(12);
	expect(fightZone({ x: 0, y: 0 }, { x: 1, y: 0 }).size).toBe(6); // clipped at the corner
});
it('pickEntryCell returns null when the entry column is full', () => {
	const full = new Set(Array.from({ length: 20 }, (_, y) => cellIndex(0, y)));
	expect(pickEntryCell('west', full, seedrandom('x'))).toBeNull();
});
```

- [ ] **Step 2:** Run `cd ed-be && yarn vitest run src/test/utils/clanChampionshipBoard.test.ts` → FAIL. **Step 3:** Implement. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(cdc): règles pures du damier`.

### Task 3: Tick — place draws, kick-off, scoring, match end, championship end

**Files:**
- Create: `ed-be/src/business/clanChampionshipMatchService.ts`
- Modify: `ed-be/src/business/clanChampionshipService.ts` (`closeRegistrations` calls `drawMatchPlace` for round 0 inside its transaction; remove the `championshipFinish_` job scheduling from close and boot — the tick now finishes the championship), `ed-be/src/server.ts`
- Test: `ed-be/src/test/business/clanChampionshipTick.test.ts`

**Interfaces:**
- Consumes: Task 2 board rules; lot 1 `findActiveChampionshipEvent`, `parseEventConfig`, `runChampionshipJob`.
- Produces:
  - `lockMatch(tx, matchId): Promise<void>` — `SELECT id FROM "clan_championship_match" WHERE id = ${matchId}::uuid FOR UPDATE` via `tx.$queryRaw` (check the table name in the migration).
  - `drawMatchPlace(tx, match, places: PlaceEnum[]): Promise<void>` — `getRandomArrayElement(places)`.
  - `championshipTick(now = new Date()): Promise<void>` — for the active championship in phase `running`, per match (each in its own transaction with `lockMatch`, state re-read under the lock):
    1. `placeId` null and `now >= startsAt − 24 h` → draw place.
    2. `scheduled` and `now >= startsAt` → `obstacles = generateObstacles(...)`, `westClanId` = home or away at random, `status = live`.
    3. `live` → `expected = min(288, floor((min(now, endsAt) − startsAt) / 10 min))`; apply `expected − ticksApplied` ticks one by one on the current board (scores += score lines; `actionPoints += 2` on `onBoard` pieces); `ticksApplied = expected`.
    4. `live` and `now >= endsAt` (after step 3) → `winnerClanId` (higher score, null on a draw), every `onBoard` piece → `left` with `x`/`y` null, their dinoz `unavailableReason` → null when it is `clanChampionship`, `status = finished`.
    Then, if every match of the championship is `finished`, call `finishChampionship(eventId)`.
  - `startChampionshipTicker(): CronJob` — `new CronJob('*/10 * * * *', () => runChampionshipJob('championshipTick', () => championshipTick()), null, false, 'UTC')`; `server.ts` starts it and runs one `championshipTick()` at boot (wrapped in `runChampionshipJob`).

- [ ] **Step 1: Failing tests** (prisma mocked, fake timers, matches built with `startsAt = 2026-11-23T18:00Z`, `endsAt = 2026-11-25T18:00Z`):
  - round 0 places drawn by `closeRegistrations`; a round-1 match (`startsAt` 2026-11-26T18:00Z) gets its place at `2026-11-25T18:00Z`, not at `2026-11-25T17:50Z`.
  - kick-off at `startsAt` sets `live`, `westClanId` ∈ {home, away}, obstacles from `generateObstacles`.
  - at `startsAt + 25 min` with `ticksApplied 0` → 2 ticks applied: scores += 2 × score line, AP += 4.
  - running the tick twice at the same `now` applies nothing the second time.
  - at `endsAt + 3 h` with `ticksApplied 280` → 8 ticks applied, then finished with the right `winnerClanId`; a draw gives `winnerClanId: null`; `onBoard` pieces become `left` and their dinoz are unlocked.
  - the championship becomes `finished` only when all its matches are `finished`.
  - `lockMatch` is called before the match is re-read.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement; adjust lot 1 tests that asserted the finish job. **Step 4:** PASS + full `yarn vitest run`.
- [ ] **Step 5:** Commit `feat(cdc): tic du championnat (tirage, coup d'envoi, points, fin de match)`.

### Task 4: Locked dinoz rules

**Files:**
- Modify: `ed-be/src/business/inventoryService.ts` (`CAN_STILL_USE_ITEMS` :117 += `clanChampionship`), `ed-be/src/business/dinozService.ts` (`getAvailableActions` :131 returns `[]` for `clanChampionship`, alongside `restingAttack`)
- Test: `ed-be/src/test/business/inventoryService.test.ts`, `ed-be/src/test/business/dinozService.test.ts`

- [ ] **Step 1: Failing tests:** `useItem` on a dinoz with `unavailableReason: clanChampionship` is allowed for a healing item; `getAvailableActions` returns `[]` for it; `betaMove` refuses it (existing generic check — assert it). `equipItem` and `learnSkill` need no change (they don't block) — add one assertion each that they don't throw for this reason if their tests make it cheap; otherwise skip.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(cdc): dinoz verrouillés sur le damier (soins seulement)`.

### Task 5: Board actions — enter, leave, move, clan exit

**Files:**
- Modify: `ed-be/src/business/clanChampionshipMatchService.ts`, `ed-be/src/business/clanService.ts` (`excludeClanMember` :439, `leaveClanSelf` :457 — call the hook after the DAO succeeded and only if the member was actually removed)
- Test: `ed-be/src/test/business/clanChampionshipBoardActions.test.ts`

**Interfaces:**
- Produces:
  - `findLiveMatchOfClan(clanId, tx = prisma)` — the `live` match of the active championship with `homeClanId` or `awayClanId` = clanId.
  - `sideOf(match, clanId): Side` — `west` if `match.westClanId === clanId`.
  - `enterBoard(req: Request): Promise<void>` — body `{ dinozId }`.
  - `leaveBoard(req: Request): Promise<void>` — body `{ dinozId }`.
  - `moveOnBoard(req: Request): Promise<BoardMoveResult>` — body `{ dinozId, direction: BoardDirection }`; `BoardMoveResult = { fight: { archiveId: string; outcome: FightOutcome; deadDinozIds: number[] } | null }` (fight branch filled by Task 6; in this task an enemy target calls `resolveBoardAttack`, declared in Task 6 — implement here as a function that throws `notImplemented` and is replaced in Task 6).
  - `removePlayerFromBoards(playerId: string, clanId: number): Promise<void>` — in the live match of that clan (if any), under `lockMatch`: delete the player's pieces whose state is not `dead`, set their dinoz `unavailableReason` null.
- Every action: `auth(req)` → `findLiveMatchOfClan(authed.clanId)` (none → `clanChampionship.noLiveMatch`) → transaction: `lockMatch`, re-read match (still `live`, `now < endsAt`) and the pieces.
- Errors (keys under `clanChampionship`): `noLiveMatch`, `notYourDinoz`, `wrongPlace`, `dinozDead`, `dinozInGroup`, `dinozBusy`, `deadInMatch`, `quotaReached`, `entryFull`, `notOnBoard`, `notOnEntryColumn`, `noActionPoints`, `outOfBoard`, `obstacle`, `cellOccupied`.
- Enter: checks in that order — owner (`dinoz.playerId === authed.id`), alive, `placeId === match.placeId`, no leader / followers, `unavailableReason === null`, existing piece not `dead`, quota (distinct pieces of the clan in the match < 100 unless the dinoz already has a piece), free entry cell. Upsert the piece (`onBoard`, cell, `actionPoints: 0`), set dinoz `unavailableReason: clanChampionship`.
- Leave: piece `onBoard` and `x === entryColumn(side)` → `left`, `x`/`y` null, `actionPoints: 0`; unlock dinoz.
- Move: piece `onBoard`, `actionPoints >= 1`, target in bounds, not an obstacle, not an own piece; empty → move, `actionPoints − 1`; enemy → `actionPoints − 1` then `resolveBoardAttack`.

- [ ] **Step 1: Failing tests:** one per error above (in the listed order for enter); enter success writes the piece on the entry column with 0 AP and locks the dinoz; re-entry of a `left` piece reuses it without counting quota again; 100 distinct pieces → `quotaReached` for a new dinoz; full entry column → `entryFull`; leave success unlocks; move success decrements AP and moves; `lockMatch` is called before reading pieces; `removePlayerFromBoards` deletes non-dead pieces and unlocks their dinoz, keeps dead ones; `excludeClanMember` and `leaveClanSelf` call it with the removed member's player and clan.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** PASS + full suite.
- [ ] **Step 5:** Commit `feat(cdc): entrer, sortir et se déplacer sur le damier`.

### Task 6: Board fights + shared PvP XP

**Files:**
- Create: `ed-be/src/utils/fight/pvpXp.ts`
- Modify: `ed-be/src/business/clanWar.ts` (~1199-1227 use the helper, behavior unchanged), `ed-be/src/business/clanChampionshipMatchService.ts`, `core/src/models/fight/FightConfiguration.mts` (add `CLAN_CHAMPIONSHIP_PVP_RULES` = `CLAN_WAR_PVP_RULES` with `castleFight: false`)
- Test: `ed-be/src/test/utils/pvpXp.test.ts`, `ed-be/src/test/business/clanChampionshipFight.test.ts`, existing `clanWar.test.ts` must stay green

**Interfaces:**
- Produces:
  - `computePvpXp(dinoz: { level: number }, opponents: { level: number; life: number; maxLife: number; escaped: boolean }[], teamLevel: number): number` — sum over non-escaped opponents of `calculatePvPxp(opp.level, d.level) * levelFactor * (opp.life / opp.maxLife) * (d.level / teamLevel)`, `levelFactor = opp.level >= d.level ? 1 : 4 / (4 + (d.level − opp.level))` (exact formula of `clanWar.ts` 1199-1227; the caller still applies `calculateXPBonus` and `getMaxXp`).
  - `resolveBoardAttack(tx, match, attacker: Piece, defender: Piece, authed): Promise<NonNullable<BoardMoveResult['fight']>>`:
    - participants: behind → `[attacker]` vs `[defender]`; else every `onBoard` piece whose cell is in `fightZone(attacker, defender)`, attacker's clan vs the other.
    - load the dinoz with the fighter select used by `getDinozFightClanDataRequest` (`ed-be/src/dao/dinozDao.ts:671`) — add a DAO `getDinozForChampionshipFight(ids: number[])` returning the same per-dinoz fields plus `player.cooker`; pieces whose dinoz is missing or dead are dropped from the fight.
    - `calculateFightBetweenPlayers(CLAN_CHAMPIONSHIP_PVP_RULES, teamA, teamA.some(d => d.player.cooker), teamB, teamB.some(...), match.placeId)`.
    - apply per participant: `life: { decrement: hpLost }`, `experience: { increment: xp }` for survivors (XP computed against the opposing team with `computePvpXp`, then `calculateXPBonus` + `getMaxXp`, as the war does), logs `HPLost` / `XPEarned` / `Death`; `itemsUsed` removed with `removeItemFromDinoz`; **no** `fight` flag nor `restingAttack` change.
    - dead (`hpLost >= life`) → piece `dead`, `x`/`y` null, `actionPoints: 0`, dinoz `unavailableReason: null`.
    - `archiveFight(fight, outcome === AttackerWin, attackerPlayerId, defenderPlayerId, JSON.stringify({ kind: 'clanChampionship', matchId }))`.
    - the interactive transaction of `moveOnBoard` gets `{ timeout: 15000 }`.

- [ ] **Step 1: Failing tests:** `computePvpXp` returns the war's value on a fixture copied from an existing war XP test (or computed by hand: d level 10, one opponent level 10 full life, team level 10 → `calculatePvPxp(10, 10)`); escaped opponents add 0. Fight: a behind attack passes exactly 1 dinoz per side to the engine (mock `calculateFightBetweenPlayers`); a frontal attack in a crowded zone passes every piece of the zone and none outside it; a dead defender's piece becomes `dead` and its dinoz is unlocked; survivors lose HP and gain XP; `fight`/`restingAttack` are never written; `archiveFight` is called with the meta; a participant whose dinoz isn't returned by the DAO is skipped.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement; refactor the war to use `computePvpXp`. **Step 4:** New tests + `clanWar.test.ts` + full suite PASS.
- [ ] **Step 5:** Commit `feat(cdc): combats sur le damier`.

### Task 7: Board read model + routes

**Files:**
- Modify: `ed-be/src/business/clanChampionshipMatchService.ts`, `ed-be/src/routes/clan.championship.routes.ts`, `core/src/models/clan/clanChampionship.mts`, i18n
- Test: `ed-be/src/test/business/clanChampionshipBoardRead.test.ts`

**Interfaces:**
- Produces (core):
  ```ts
  export interface BoardPieceDTO { dinozId: number; clanId: number; x: number; y: number; mine: boolean; ally: boolean;
  	name: string; display: string; level: number; life?: number; maxLife?: number; actionPoints?: number; playerName: string }
  export interface MatchBoardDTO { matchId: string; round: number; placeId: number | null; status: ClanChampionshipMatchStatus;
  	startsAt: Date; endsAt: Date; ticksApplied: number;
  	west: { clanId: number | null; name: string; score: number; scoreLine: number; quotaUsed: number };
  	east: { clanId: number | null; name: string; score: number; scoreLine: number; quotaUsed: number };
  	obstacles: number[]; pieces: BoardPieceDTO[]; deadDinozIds: number[] }
  ```
  `life`, `maxLife`, `actionPoints` are present only for pieces of the reader's clan.
- `getMyMatchBoard(req): Promise<MatchBoardDTO | null>` — the reader's clan live match, else its latest `finished` match of the active championship, else null; a reader without clan → null.
- Routes (under `/api/v1/clan/championship`): `GET /match`, `POST /match/enter`, `POST /match/leave`, `POST /match/move` (validators: `dinozId` int, `direction` in `BoardDirection`), responses `MatchBoardDTO | null`, 200, 200, `BoardMoveResult`.

- [ ] **Step 1: Failing tests:** enemy pieces have no `life`/`maxLife`/`actionPoints`; own and allied pieces have them; score lines computed from the board; `quotaUsed` counts distinct pieces per clan; reader without clan → null.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement + routes. **Step 4:** PASS, `yarn build:back`.
- [ ] **Step 5:** Commit `feat(cdc): lecture du damier et routes du match`.

### Task 8: Final verification

- [ ] `yarn lint:test`, `yarn test:ci`, `yarn build` → all green.
- [ ] Real-DB read-only smoke (throwaway script, nothing committed, no writes): inside `prisma.$transaction`, run the exact `lockMatch` query with a random uuid → empty result, no error.
