# Clan Event War — Developer Reference

A maintainer's guide to the **clan event war**: how it is started, the full lifecycle of a
war, the data model behind it, the REST surface, and the tunable constants and formulas.

> **Scope.** This document covers the `war` event type. A second `mana_war` event type
> exists in the schema (`ClanEventType`) but is not implemented in the war business logic
> and is out of scope here.

---

## 1. Overview

The event war is a **time-boxed, clan-vs-clan event**. During an active event, clans:

1. **Build a castle** in a random war zone.
2. **Declare wars** against rival clans (paid in clan ingredients).
3. **Defend** their own castle with a line of stationed dinoz, and **attack** enemy castles.
4. **Repair** their castle over time.
5. Accumulate **reputation**, which drives the event ranking and reward tier.

A war is won by the **attacker** if it destroys the defender's castle before the war timer
expires; otherwise the **defender** wins (by surviving the timer or by the attacker
forfeiting).

### Layers

The feature follows the standard backend layering described in the root `CLAUDE.md`:

```
routes/clan.war.routes.ts        REST endpoints under /api/v1/clan/war
  → business/clanWar.ts          all war mechanics (the spine of the feature)
      → dao/clansDao.ts          war-aware Prisma queries
          → Prisma → PostgreSQL
```

Supporting pieces:

| Concern                        | File                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| Event creation / config        | `ed-be/src/business/adminService.ts` (`startClanWarEvent`)                              |
| Reputation power math          | `ed-be/src/utils/warCalculation.ts`                                                     |
| Cost math (shared FE/BE)       | `core/src/models/clan/warCalculation.mts`                                               |
| Constants & types              | `core/src/models/clan/clanWar.mts`, `core/src/models/clan/clanEventConfig.mts`          |
| War expiry / repair scheduling | `node-schedule` jobs in `clanWar.ts`; rescheduled on boot via `scheduleWarExpiration()` |

---

## 2. Lifecycle

Each phase below names the controlling function in `ed-be/src/business/clanWar.ts` unless
stated otherwise.

### 2.1 Event start

`startClanWarEvent()` in `adminService.ts` creates a `ClanEvent` row. The admin form
supplies a start date, a `duration` in **weeks**, the list of war `places`, and the three
reward tiers. The event's `config` column stores a serialized `ClanEventConfig`
(`core/src/models/clan/clanEventConfig.mts`):

```ts
type ClanEventConfig = {
	eventType: ClanEventType.war;
	rewards: { winner; podium; participant }; // Reward enum ids
	fight: { attackTime: 100; defenderTotal: 100; defenderActiveMax: 50 };
	warPlaces: PlaceEnum[]; // where castles may spawn
	swampEnable: boolean;
};
```

`eventState()` exposes whether an event is currently ongoing (id + end date) and is what the
frontend polls to decide whether to show the war UI.

### 2.2 Castle build

`buildClanCastle()` — requires `ClanMemberRight.CLAN_BUILD_CASTLE`.

- Castle `placeId` is a **random pick** from `config.warPlaces`.
- **First build only**: the clan's ingredients and `treasureValue` are reset to 0.
- A castle cannot be (re)built while one already exists with `currentLife > 0`.
- Seeds a `ClanWarRanking` row (reputation `100`) for the clan/event if absent.
- History: `CASTLE_BUILD` or `CASTLE_REBUILD`.

### 2.3 Declare war

`declareWar()` — requires `ClanMemberRight.WAR_OFFICER`.

- Both attacker and defender must have a standing castle (`currentLife > 0`).
- An attacker may only run **one** war at a time; a defender has a cap on simultaneous
  incoming attacks.
- Cost is computed by `computeWarCost(reputation, ingredients)` and consumed from the clan
  treasury, **cheapest ingredients first** (see [§5](#5-constants--formulas)).
- War duration is **2 days** — `dayjs().add(2, 'day')`, hardcoded at `clanWar.ts:205`
  (a known magic number; not driven by config).
- The transaction runs at `Serializable` isolation; a concurrent declare collision
  (Prisma `P2034`) is surfaced as `ExpectedError('alreadyAtWar')`.
- Schedules `resolveClanWar` for `endsAt` (job key `war_<warId>`).
- History: `WAR_START` (attacker) / `WAR_ATTACKED` (defender); notifies clan members.

### 2.4 Defense management

- `addDefender()` — stations an owned, alive dinoz that is **at the castle's place**. Capped
  at `config.fight.defenderActiveMax` (50). The dinoz gets `unavailableReason = defending`
  and is appended to `defenseOrder[]`.
- `removeDefender()` — un-stations a dinoz and clears its `unavailableReason`.
- `updateDefenseOrder()` — reorders `defenseOrder[]`; requires `WAR_OFFICER`.
- `castleStatus()` — returns HP, defender list, and in-progress repairs.

### 2.5 Castle attack

`attackCastle()` — the attacker leads a team of its own dinoz located at the enemy castle.

- The defending team is chosen by `computeDefenderTeam()`: it walks `defenseOrder[]` adding
  defenders until their combined level **≥** the attacker team level, **max 6** defenders;
  a dinoz with `Skill.BRAVE` counts as **2×** its level. Dead defenders are skipped/removed.
- The fight runs through `calculateFightBetweenPlayers` with `CLAN_WAR_PVP_RULES`.
- **Damage applies on attacker victory only**: each surviving attacker deals
  `max(1, ceil(level / 6))`, capped at the castle's remaining HP.
- If castle HP reaches **0**: `isCastleDestroyed = true` and the war resolves immediately.
- Attackers enter a cooldown (`unavailableReason = restingAttack`) cleared after
  `RESTING_ATTACK_TIMER` (10 min) via a scheduled job.
- XP is awarded to attackers; defenders earn XP only when the attack is repelled.

### 2.6 Repairs

`repairCastle()` — requires `WAR_OFFICER`; castle must satisfy `0 < currentLife < maxLife`.

- Parameters: `hpPerTick` (1–10), `frequency` (`RepairFrequency`: 1/5/15/30 min),
  `ticks` (1–`REPAIR_MAX_TICKS`).
- Cost from `computeRepairCost(...)` (cheapest ingredients first).
- A cron job (`*/<frequency> * * * *`, key `repair_<repairId>`) applies HP each tick,
  incrementing `appliedTicks`. It stops when ticks are exhausted, the castle is destroyed,
  or HP is full.
- Caps: at most `REPAIR_MAX_STACK` (2) concurrent repairs; total restored HP per repair is
  capped at `REPAIR_MAX_HP` (75).

### 2.7 Resolution

`resolveClanWar(warId, forfeit?)` — triggered by castle destruction, timer expiry, or
`forfeitWar()`.

Winner:

| Trigger           | Winner   |
| ----------------- | -------- |
| Castle destroyed  | Attacker |
| Timer expired     | Defender |
| Attacker forfeits | Defender |

- `computeWarRankingUpdates()` (`utils/warCalculation.ts`) builds the per-clan ranking deltas —
  new `totalPWin`/`totalPLost`, `downtimeCount`, and recomputed `reputation` — and
  `updateWarRankings()` (`dao/clansDao.ts`) persists them in a typed Prisma transaction
  (see [§5](#5-constants--formulas)).
- **Stolen wars**: if a castle is destroyed, every other unresolved war where that clan was
  the defender is auto-resolved in the defender's favor, the attackers are notified
  (`WAR_STOLEN`), and their scheduled jobs are cancelled.
- History: `WAR_WON` / `WAR_LOSED` / `WAR_DEFENDED` / `WAR_LOSE` / `WAR_FORFEIT`; clan members
  notified.
- On server boot, `scheduleWarExpiration()` reschedules resolution jobs for any wars still
  open.

---

### 2.8 The Prospector

`prospector()` (`ed-be/src/cron/clanWarProspector.ts`) is a recurring upkeep visit that runs
**twice a day at random times** — once in a morning window, once in an evening window — and only
while a war event is active (it no-ops when `eventState()` returns nothing). Per visit, for every
`ClanWarRanking` row of the active event (joined to its clan's castle):

- **Castle standing** (`currentLife > 0`): `castleStandingStreak += 1`, `castleDownStreak = 0`,
  and an escalating reward is added to `totalPWin`.
- **Castle destroyed** (`currentLife <= 0`): `castleDownStreak += 1`, `castleStandingStreak = 0`,
  and (after a short grace window) an escalating penalty is added to `totalPLost`.
- `reputation` is recomputed with the **unchanged** `computeReputation()` (see
  [§5](#5-constants--formulas)). `downtimeCount` is **not** touched — it is owned by resolution,
  and `applyProspectorUpdates()` deliberately omits it to avoid clobbering a concurrent
  `updateWarRankings()`.

The reward/penalty math is `computeProspectorUpdate()` (`utils/warCalculation.ts`); reads/writes
go through `getProspectorRankings()` / `applyProspectorUpdates()` (`dao/clansDao.ts`). Affected
clan members receive a real-time SSE `CLAN_PROSPECTOR` toast (see [§7](#7-observability)).

Scheduling reuses the self-rescheduling `node-schedule` + `ServerState` pattern: each visit
persists its next time in `ServerState[prospector]` and re-arms via `scheduleJob`. On boot
`scheduleProspector()` (registered in `server.ts`) runs it immediately if the stored visit is
missing or overdue, otherwise reschedules for the stored time.

---

## 3. Data model

Source of truth: `ed-be/prisma/schema.prisma`. The generated client lives in the root
`prisma/` package and is **not** hand-edited.

| Model              | Key fields                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `ClanEvent`        | `id` (uuid), `eventType` (`war` \| `mana_war`), `startDate`, `endDate`, `config` (JSON text of `ClanEventConfig`)                         |
| `ClanWar`          | `id` (uuid), `eventId`, `attackerClanId`, `defenderClanId`, `startedAt`, `endsAt`, `isCastleDestroyed` (default `false`), `winnerClanId?` |
| `ClanWarRanking`   | `clanId` + `eventId` (unique together), `reputation` (default `100`), `downtimeCount`, `castleStandingStreak`, `castleDownStreak`, `totalPWin`, `totalPLost` |
| `ClanCastle`       | `clanId` (unique), `placeId`, `maxLife`/`currentLife` (default `300`), `defender` (Dinoz[]), `defenseOrder` (Int[]), `repairs`            |
| `ClanCastleRepair` | `castleId`, `startedAt`, `endsAt`, `hpPerTick`, `frequency` (minutes), `totalTicks`, `appliedTicks`                                       |

War-relevant `Dinoz.unavailableReason` values: `defending` (stationed at castle),
`restingAttack` (post-attack cooldown).

The `castleStandingStreak` / `castleDownStreak` counters (default `0`) track the Prospector's
consecutive standing/destroyed streak per clan (see [§2.8](#28-the-prospector)). The Prospector's
next visit time is persisted in `ServerState` under the `prospector` `ServerAction`.

---

## 4. REST API

All routes are registered in `ed-be/src/routes/clan.war.routes.ts` under the
`apiRoutes.clanWarRoutes` base (`/api/v1/clan/war`). Endpoint-level authorization was
hardened in commit `217bb11db` ("fix: clan war secure endpoints"); the permission column
below reflects the `playerHasRightRequest` / membership checks inside each business call.

| Method   | Path               | Business fn          | Required right           |
| -------- | ------------------ | -------------------- | ------------------------ |
| `GET`    | `/`                | `eventState`         | — (public)               |
| `PUT`    | `/castle`          | `buildClanCastle`    | `CLAN_BUILD_CASTLE`      |
| `GET`    | `/castle`          | `castleStatus`       | clan member              |
| `GET`    | `/:clanId`         | `warStatus`          | — (public)               |
| `POST`   | `/:clanId`         | `declareWar`         | `WAR_OFFICER`            |
| `DELETE` | `/:warId`          | `forfeitWar`         | `WAR_OFFICER` (attacker) |
| `PUT`    | `/dinoz/:dinozId`  | `addDefender`        | clan member (owns dinoz) |
| `DELETE` | `/dinoz/:dinozId`  | `removeDefender`     | clan member (owns dinoz) |
| `PATCH`  | `/dinoz`           | `updateDefenseOrder` | `WAR_OFFICER`            |
| `PUT`    | `/attack/:dinozId` | `attackCastle`       | clan member (owns dinoz) |
| `PUT`    | `/repair`          | `repairCastle`       | `WAR_OFFICER`            |

---

## 5. Constants & formulas

Constants live in `core/src/models/clan/clanWar.mts`:

| Constant                   | Value                      | Use                             |
| -------------------------- | -------------------------- | ------------------------------- |
| `WAR_BASE_VALUE`           | `11250`                    | flat cost to declare war        |
| `WAR_SCALE_PER_100_POINTS` | `2250`                     | added cost per 100 reputation   |
| `REPAIR_BASE_VALUE`        | `500`                      | repair cost base                |
| `REPAIR_SCALE_FACTOR`      | `1.2`                      | repair cost exponent on HP/hour |
| `REPAIR_MAX_TICKS`         | `15`                       | max ticks per repair            |
| `REPAIR_MAX_STACK`         | `2`                        | max concurrent repairs          |
| `REPAIR_MAX_HP`            | `75`                       | max HP restored per repair      |
| `RESTING_ATTACK_TIMER`     | `600000` (10 min)          | attacker cooldown               |
| `RepairFrequency`          | `1 \| 5 \| 15 \| 30` (min) | tick cadence                    |
| `PROSPECTOR_STANDING_REWARD_BASE`  | `20`               | pWin on the first standing visit         |
| `PROSPECTOR_STANDING_REWARD_GROWTH`| `0.4`              | +pWin per extra consecutive standing visit (uncapped) |
| `PROSPECTOR_DESTROYED_PENALTY_BASE`| `3`                | pLost per destroyed-streak step past grace (uncapped) |
| `PROSPECTOR_DESTROYED_GRACE_VISITS`| `1`                | free destroyed visits (~12h) before the penalty bites |
| `PROSPECTOR_MORNING_WINDOW`        | `{6, 11}` (hours)  | random morning visit window              |
| `PROSPECTOR_EVENING_WINDOW`        | `{18, 23}` (hours) | random evening visit window              |

### War cost — `computeWarCost` (`core/.../warCalculation.mts`)

```
trueValue = WAR_BASE_VALUE + floor(reputation / 100) * WAR_SCALE_PER_100_POINTS
```

Paid by consuming ingredients sorted by price ascending until `trueValue` is covered;
`canAfford` is false if the treasury cannot cover it.

### Repair cost — `computeRepairCost`

```
hpPerHour   = hpPerTick * 60 / frequency
totalValue  = round(REPAIR_BASE_VALUE * hpPerHour ^ REPAIR_SCALE_FACTOR)
cost        = round(totalValue * ticks / REPAIR_MAX_TICKS)
totalHp     = min(hpPerTick * ticks, REPAIR_MAX_HP)
```

### Reputation — `computePWin` / `computePLost` (`ed-be/src/utils/warCalculation.ts`)

```
pWin (you, enemy)  = clamp( 100 * (100 + enemy) / (100 + you), 10, 300 )
pLost(you, enemy)  = clamp( 100 * (100 + you)   / (100 + enemy), 10, 300 )
```

On resolution `computeWarRankingUpdates()` accrues `pWin` into the winner's `totalPWin` and
`pLost` into the loser's `totalPLost`, then `computeReputation()` recomputes `reputation`:

```
reputation = max( 0, round( 100 * ((500 + totalPWin) / (500 + totalPLost)) ^ 0.8
                            - downtime * (downtime - 1) / 2 ) )
```

`downtimeCount` increments each time the defender's castle is destroyed and resets to 0 on a
successful defense (the attacker's count never changes); the `downtime * (downtime - 1) / 2`
term is a compounding penalty for repeated castle losses. The resulting `WarRankingUpdate[]`
is written by `updateWarRankings()` via typed `clanWarRanking.update` calls in one
transaction — no raw SQL.

### Prospector upkeep — `computeProspectorUpdate` (`ed-be/src/utils/warCalculation.ts`)

Each Prospector visit ([§2.8](#28-the-prospector)) feeds an escalating delta into the same point
pools and reuses `computeReputation()` unchanged:

```
standing  : castleStandingStreak += 1; castleDownStreak = 0
            totalPWin  += round(PROSPECTOR_STANDING_REWARD_BASE + PROSPECTOR_STANDING_REWARD_GROWTH * (castleStandingStreak - 1))
destroyed : castleDownStreak     += 1; castleStandingStreak = 0
            steps = max(0, castleDownStreak - PROSPECTOR_DESTROYED_GRACE_VISITS)
            totalPLost += PROSPECTOR_DESTROYED_PENALTY_BASE * steps
reputation = computeReputation(totalPWin, totalPLost, downtimeCount)   // downtimeCount unchanged
```

Both sides are **uncapped** and escalate with the consecutive-visit streak. The reward grows each
standing visit (a full-event holder, ~86 visits, reaches reputation ~495 — an intentional,
near-impossible flex, since ~85% of wars end in destruction). The penalty side grants a
`PROSPECTOR_DESTROYED_GRACE_VISITS`-visit grace window (~12h) so a clan that rebuilds quickly pays
nothing; past that it compounds every visit (cumulative loss is quadratic), so camping a ruined
castle becomes ruinous. The reward intentionally outweighs the penalty. `computeReputation` is
clamped at `0` so the uncapped penalty can never produce negative reputation. The next visit time is
`computeNextProspectorRun()` (`ed-be/src/utils/date.ts`): a random minute inside the next
un-fired daily window (morning, then evening), chosen by window-start boundary so exactly one
visit fires per window per day.

---

## 6. Frontend touchpoints

| Concern                                         | File                                                                                      |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Main war UI (castle, defense line, repair form) | `ed-ui/src/components/clans/ClanWar.vue`                                                  |
| API client                                      | `ed-ui/src/services/ClanService.ts`                                                       |
| Event state (`clanEvent`, `getOngoingEvent`)    | `ed-ui/src/store/clanStore.ts`                                                            |
| War ranking tab                                 | `ed-ui/src/components/rankings/ClansRanking.vue`                                          |
| Admin event creation / logs                     | `ed-ui/src/components/admin/EventCreation.vue`, `WarLogsView.vue`                         |
| i18n                                            | `ed-ui/src/i18n/locales/{en,fr}.json` — keys under `clan.war.*`, `notification.clanWar.*` |

The war tab and ranking tab are only rendered while `clanStore.clanEvent` is active. Enum
imports on the frontend come from `@drpg/prisma/enums` (e.g. `ClanEventType`), per the
project's Vite/Prisma rule.

---

## 7. Observability

- **Player-facing history** — `ClanHistoryType`: `CASTLE_BUILD`, `CASTLE_REBUILD`,
  `WAR_START`, `WAR_ATTACKED`, `WAR_WON`, `WAR_LOSED`, `WAR_DEFENDED`, `WAR_LOSE`,
  `WAR_FORFEIT`, `WAR_STOLEN`.
- **Admin audit log** — `LogType` `ClanWar*` entries (`ClanWarCastleBuilt`,
  `ClanWarDeclared`, `ClanWarForfeited`, `ClanWarDefenderAdded`/`Removed`,
  `ClanWarDefenseOrderUpdated`, `ClanWarCastleAttacked`, `ClanWarCastleRepaired`,
  `ClanWarResolved`), surfaced in `WarLogsView.vue`.
- **Real-time** — when a castle is attacked, defending clan members receive an SSE
  `SseDataEnum.CLAN_WAR` notification `{ attacker, hpLost }`. On each Prospector visit
  ([§2.8](#28-the-prospector)), the affected clan's members receive an SSE
  `SseDataEnum.CLAN_PROSPECTOR` notification `{ standing, reputation }`, shown as a success
  (reward) or warning (penalty) toast on the war page.
