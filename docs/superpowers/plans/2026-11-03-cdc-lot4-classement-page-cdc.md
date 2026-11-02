# CDC lot 4 — Classement, page du CDC et journal paginé — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finir le Championnat Des Clans côté joueurs : classement, prochain match (lieu et coup d'envoi) sur la page du CDC, calendrier enrichi (lieu, score, statut) et journal des combats paginé sur le damier.

**Architecture:** Le classement est calculé côté serveur par une fonction pure (`computeStandings`) et ajouté au `ClanChampionshipDTO` renvoyé par `GET /api/v1/clan/championship`. Le journal du damier garde les 50 derniers combats dans `MatchBoardDTO`. Une nouvelle route renvoie les pages plus anciennes, avec un curseur sur l'id du combat. L'UI (`ClanChampionship.vue`, `ChampionshipTabs.vue`) consomme ces données sans nouvel état global.

**Tech Stack:** Express + Prisma + Vitest (ed-be), Vue 3 `<script setup>` / Options API existante + vue-i18n (ed-ui), modèles partagés `.mts` (core), Playwright (e2e).

**Spec:** `docs/superpowers/specs/2026-11-02-championnat-des-clans-design.md` (sections « Classement », « Lieu », « Ce que voit un joueur », « Laissé au builder »).

## Global Constraints

- Classement : 3 points pour une victoire, 1 pour un nul, 0 pour une défaite ; à égalité de points, on départage par la différence de score cumulée, puis par le score total marqué.
- Seuls les matchs `finished` comptent. Un clan exempt ne marque rien, et l'exemption ne compte pas comme un match joué.
- Victoire ou nul se déduisent **des scores** (`homeScore` / `awayScore`), pas de `winnerClanId`, qui vaut `null` aussi quand le clan gagnant a été supprimé.
- Un clan supprimé reste dans le classement avec son nom figé (`homeClanName` / `awayClanName`). Clé d'un clan dans le classement : son nom figé. Les noms sont uniques entre clans inscrits, car un clan inscrit ne peut pas être dissous pendant le CDC.
- `round` est 0-based (affichage `round + 1`).
- Le lieu d'un match est révélé **aux deux clans** dès son tirage. Un lecteur dont le clan ne joue pas un match `scheduled` reçoit `placeId: null` pour ce match.
- Page du journal : `JOURNAL_PAGE_SIZE = 50` (constante dans `core/src/models/clan/clanChampionship.mts`), du plus récent au plus ancien.
- Les règles existantes restent vraies : seuls les membres des deux clans lisent le journal d'un match, et `archiveId` n'est renseigné que si le lecteur a participé au combat.
- i18n : toute nouvelle clé est ajoutée dans les 4 locales `ed-ui/src/i18n/locales/{fr,en,es,de}.json`, sous `clanChampionship`.
- Style : Prettier (tabs, single quotes, pas de virgules finales, 120 colonnes). `yarn lint:test`, `yarn build` et `yarn test:ci` doivent rester verts.
- Branche `feat/clan-championship` : commits locaux uniquement, pas de push.

## Review Focus

1. **Égalité parfaite au classement** (mêmes points, même différence, même total) : les deux clans partagent le même rang, et l'affichage les trie par nom pour rester stable. Test dans Task 1.
2. **Classement en début de championnat** (aucun match terminé) : tous les clans du calendrier apparaissent avec 0 partout, plutôt qu'un tableau vide. Test dans Task 1.
3. **Lecteur d'un autre clan** sur la page du CDC : il ne doit pas voir le lieu d'un match à venir qui ne le concerne pas. Test dans Task 1.
4. **Nouveaux combats pendant qu'on pagine** : le journal ne doit ni dupliquer ni sauter d'entrée quand le damier est rechargé après « Voir plus ». La fusion côté UI se fait par id. Le curseur `before` est un id, pas un offset. Tests dans Tasks 2 et 4.
5. **Pagination d'un match d'un autre clan** : `GET …/match/:matchId/fights` est refusé si le clan du lecteur ne joue pas ce match. Test dans Task 2.

---

### Task 1: Classement et masquage du lieu (backend)

**Files:**
- Create: `ed-be/src/utils/clanChampionship/standings.ts`
- Modify: `core/src/models/clan/clanChampionship.mts` (types)
- Modify: `ed-be/src/business/clanChampionshipService.ts:265-311` (`getCurrentChampionship`)
- Test: `ed-be/src/test/utils/clanChampionshipStandings.test.ts` (new), `ed-be/src/test/business/clanChampionshipService.test.ts` (`describe('getCurrentChampionship')`)

**Interfaces:**
- Produces (core):
  ```ts
  export interface ClanChampionshipStandingDTO {
  	rank: number; // 1-based, shared on a full tie
  	clanId: number | null;
  	clanName: string;
  	played: number;
  	won: number;
  	drawn: number;
  	lost: number;
  	points: number;
  	scoreFor: number;
  	scoreAgainst: number;
  	scoreDiff: number;
  }
  // ClanChampionshipDTO gains: standings: ClanChampionshipStandingDTO[];
  ```
- Produces (ed-be): `computeStandings(matches: StandingMatch[]): ClanChampionshipStandingDTO[]`, where `StandingMatch = { homeClanId: number | null; awayClanId: number | null; homeClanName: string; awayClanName: string; homeScore: number; awayScore: number; status: ClanChampionshipMatchStatus }`.

- [ ] **Step 1: Write the failing tests for `computeStandings`** (`clanChampionshipStandings.test.ts`)
  - `it('lists every clan of the calendar with zeros before any finished match')` : 2 `scheduled` matches between A/B/C. Expect 3 rows, all at `points: 0`, `played: 0`, `rank: 1`, sorted by name.
  - `it('gives 3/1/0 points from the scores')` : A–B 10–4 finished, B–C 5–5 finished, A–C 0–0 `live`. Expect A `{points: 3, won: 1, played: 1, scoreFor: 10, scoreAgainst: 4, scoreDiff: 6}`, B `{points: 1, won: 0, drawn: 1, lost: 1, played: 2, scoreFor: 9, scoreAgainst: 15, scoreDiff: -6}`, C `{points: 1, drawn: 1, played: 1, scoreDiff: 0}`. The live match does not count.
  - `it('breaks ties on score difference then on total scored')` : build data where B and C both have 3 points, B with diff +5 and C with diff +2 → B before C. Then D and E with equal points and diff, D total 20 and E total 12 → D before E.
  - `it('shares the rank on a full tie and orders by name')` : X and Y identical → both `rank: 1`, X before Y, next clan `rank: 3`.
  - `it('keeps a deleted clan under its snapshot name')` : `homeClanId: null, homeClanName: 'Gone'`, finished and won → row `{ clanId: null, clanName: 'Gone', points: 3 }`.
- [ ] **Step 2: Run** `yarn --cwd ed-be vitest run src/test/utils/clanChampionshipStandings.test.ts` — expected FAIL (module missing).
- [ ] **Step 3: Implement `computeStandings`** in `standings.ts`. Rows keyed by snapshot name, one per clan seen in any match. Use the `clanId` of the clan's first non-null occurrence. Sort by points desc, scoreDiff desc, scoreFor desc, then name asc (`localeCompare`). A row's rank is the rank of the first row it fully ties with on (points, scoreDiff, scoreFor); otherwise its 1-based index.
- [ ] **Step 4: Run** the test above — PASS.
- [ ] **Step 5: Write the failing `getCurrentChampionship` tests** in `clanChampionshipService.test.ts`:
  - `it('returns the standings computed from the matches')` : one finished match 'Seven' 6–2 'Eight' → `dto.standings[0]` matches `{ clanName: 'Seven', points: 3, rank: 1 }`.
  - `it('hides the place of a scheduled match the reader's clan does not play')` : reader clan 7. Matches: (7 vs 8, scheduled, placeId 5), (9 vs 10, scheduled, placeId 6), (9 vs 10, finished, placeId 6). Expect placeIds `[5, null, 6]`.
- [ ] **Step 6: Wire it** : `standings: computeStandings(matches)`, and `placeId: m.status === 'scheduled' && !isReaderClan(m) ? null : m.placeId`, where the reader's clan is `authed.clanId`. Run the service test file — PASS.
- [ ] **Step 7: Commit** — `feat(cdc): classement du championnat et lieu masqué aux autres clans`

### Task 2: Pagination du journal (backend)

**Files:**
- Modify: `core/src/models/clan/clanChampionship.mts` (`FightJournalEntryDTO.id`, `JOURNAL_PAGE_SIZE`)
- Modify: `ed-be/src/business/clanChampionshipMatchService.ts:697-711` (journal block of `getMyMatchBoard`) + new `getMatchFights`
- Modify: `ed-be/src/routes/clan.championship.routes.ts`
- Test: `ed-be/src/test/business/clanChampionshipBoardRead.test.ts`

**Interfaces:**
- Produces (core): `FightJournalEntryDTO` gains `id: number`; `export const JOURNAL_PAGE_SIZE = 50;`.
- Produces (ed-be): `getMatchFights(req: Request, matchId: string, before: number): Promise<FightJournalEntryDTO[]>` — returns at most `JOURNAL_PAGE_SIZE` entries with `id < before`, ordered `id desc`.
- Produces (route): `GET /api/v1/clan/championship/match/:matchId/fights?before=<int>`. `matchId` must be a UUID and `before` a positive int, both checked with express-validator like the existing routes. Responds with `FightJournalEntryDTO[]`.
- Refactor: a private `toJournalEntry(f, readerId)` used by both `getMyMatchBoard` and `getMatchFights`. `getMyMatchBoard` orders by `id desc` with `take: JOURNAL_PAGE_SIZE`.

- [ ] **Step 1: Write the failing tests** (in `clanChampionshipBoardRead.test.ts`, new `describe('getMatchFights')`; add `clanChampionshipMatch.findUnique` to the prisma mock if needed):
  - `it('returns the page before the cursor with ids')` : asserts `findMany` was called with `where: { matchId, id: { lt: 120 } }`, `orderBy: { id: 'desc' }`, `take: 50`, and that each entry carries its `id`.
  - `it('hides the archive of a fight the reader did not take part in')` : same rule as the board.
  - `it('refuses a match the reader's clan does not play')` : reader clan 3, match 1 vs 2 → rejects with an `ExpectedError` (same message key as other board refusals).
  - `it('refuses a match outside the visible championship')` : the match `eventId` differs from `findVisibleChampionshipEvent()` id → rejects.
  - Update the existing board journal assertion so it expects `id` on entries and `orderBy: { id: 'desc' }`.
- [ ] **Step 2: Run** `yarn --cwd ed-be vitest run src/test/business/clanChampionshipBoardRead.test.ts` — FAIL.
- [ ] **Step 3: Implement** `getMatchFights` (auth → clan required → match by id → visible event and clan is home/away → page query) and the route.
- [ ] **Step 4: Run** the test file, then `yarn test:ci` — PASS.
- [ ] **Step 5: Commit** — `feat(cdc): pagination du journal des combats`

### Task 3: Page du CDC — classement, prochain match, calendrier (frontend + e2e)

**Files:**
- Create: `ed-ui/src/components/clans/championship/ChampionshipStandings.vue`
- Create: `ed-ui/src/components/clans/championship/ChampionshipNextMatch.vue`
- Modify: `ed-ui/src/components/clans/ClanChampionship.vue`
- Modify: `ed-ui/src/i18n/locales/{fr,en,es,de}.json`
- Test: `e2e/tests/clan-championship.spec.ts`

**Interfaces:**
- Consumes: `ClanChampionshipDTO.standings` (Task 1), `ClanChampionshipMatchDTO.placeId` (may be null), `PLACE_REVEAL_HOURS`, `placeList` from `@drpg/core/models/place/PlaceList`. Resolve the place name the way `ChampionshipTabs.vue:128-131` does.
- `ChampionshipStandings.vue` props: `{ standings: ClanChampionshipStandingDTO[]; highlightClanId: number }`.
- `ChampionshipNextMatch.vue` props: `{ match: ClanChampionshipMatchDTO; clanId: number }`.

Behaviour:
- **Classement** : shown when `phase` is `running` or `finished`, under the heading `clanChampionship.standings`. One `DZTable` with columns rank, clan (RouterLink when `clanId !== null`), `played`, `won`, `drawn`, `lost`, `scoreDiff` (signed, `+6` / `-6` / `0`), `scoreFor`, `points`. The row of `highlightClanId` uses the existing `tr.mine` style.
- **Prochain match** : shown only when the viewed clan is the player's clan (`playerStore.clanId === viewedClanId`). Target match: the clan's first match by `startsAt` whose status is not `finished`. Display:
  - the opponent;
  - the kick-off date (`formatDate(startsAt)`);
  - the place name when `placeId !== null`, else `clanChampionship.placeRevealAt` with the date `startsAt − PLACE_REVEAL_HOURS h`;
  - when the match is `live`, the « Voir le damier » button.
  
  The existing `canViewBoard` button stays for the `finished` phase.
- **Calendrier** : each row gains the status (`clanChampionship.status.*`) and, for `live` / `finished`, the score `home – away`. Rows of the viewed clan show the place when known.
- New i18n keys in the 4 locales:
  - `standings`
  - `nextMatch`
  - `placeRevealAt` (« Lieu révélé le {date} »)
  - `kickOff` (« Coup d'envoi : {date} »)
  - `opponent` (« Adversaire : {clan} »)
  - `standingsCol.{rank,clan,played,won,drawn,lost,diff,scoreFor,points}`
  - `noNextMatch`

  French values: Classement, Prochain match, Rang, Clan, J, V, N, D, Diff., Score, Pts, « Plus de match à jouer ».

- [ ] **Step 1: Write the failing e2e test** in `clan-championship.spec.ts`. Add `test('the championship page shows the standings and the next match')`. Seed it like the existing test: two clans and a `running` championship event, with one `finished` match A 12–3 B (round 0) and one `scheduled` match A–B (round 1, `placeId: PLACE_ID`, starting tomorrow). Open `/clan/<A>/championship` and expect:
  - a standings row containing the A name and `3`;
  - the text of the next match (opponent B name and the place name for `PLACE_ID`);
  - the calendar status `Terminé` (or the active locale's equivalent; read how the existing spec handles the locale).
- [ ] **Step 2: Run** `yarn build:core && yarn build:back && yarn test:e2e -- clan-championship` — new test FAIL.
- [ ] **Step 3: Implement** the two components, the page changes and the i18n keys.
- [ ] **Step 4: Run** the e2e again — PASS. Run `yarn lint:test` and `yarn build:front` — clean.
- [ ] **Step 5: Commit** — `feat(cdc): classement et prochain match sur la page du championnat`

### Task 4: « Voir plus » dans le journal du damier (frontend)

**Files:**
- Modify: `ed-ui/src/services/ClanChampionshipService.ts` (`getFights(matchId: string, before: number): Promise<FightJournalEntryDTO[]>`)
- Modify: `ed-ui/src/components/clans/championship/ChampionshipTabs.vue` (journal tab, ~l.73-92)
- Modify: `ed-ui/src/i18n/locales/{fr,en,es,de}.json` (`clanChampionship.moreFights`: « Voir plus »)

- Modify: `core/src/models/clan/clanChampionship.mts` (`mergeFightJournal`)
- Test: `ed-be/src/test/utils/clanChampionshipJournal.test.ts` (ed-ui has no unit test runner; ed-be's vitest already imports core)

**Interfaces:**
- Produces (core): `mergeFightJournal(newest: FightJournalEntryDTO[], older: FightJournalEntryDTO[]): FightJournalEntryDTO[]`. It returns `newest` followed by the `older` entries whose `id` is lower than the smallest id in `newest`, deduped by `id`, in `id` desc order. When `newest` is empty, it returns `older` deduped.

Behaviour:
- Local state `older: FightJournalEntryDTO[]`, `exhausted: boolean`, `loadingMore: boolean`. Reset all three when `board.matchId` changes.
- Displayed list: `mergeFightJournal(board.fights, older)`, with `id` as the `v-for` key.
- **« Voir plus »**:
  - It is visible when the displayed list is non-empty, `!exhausted`, and `board.fights.length === JOURNAL_PAGE_SIZE`.
  - On click, call `getFights(board.matchId, <smallest displayed id>)` and append the result to `older`.
  - When a page comes back shorter than `JOURNAL_PAGE_SIZE`, set `exhausted = true`.
  - Errors go through `errorHandler.handle(e, $toast)`, the same as the rest of the tab.

- [ ] **Step 1: Write the failing tests** for `mergeFightJournal`:
  - `it('appends older pages after the newest ones')` : newest ids [60..11], older [10..1] → ids [60..1].
  - `it('drops older entries now covered by a refreshed board')` : 3 new fights arrived. Newest is [63..14], older is [13..1] plus the stale [10..1] page loaded twice → [63..1] with no duplicates.
  - `it('returns the older entries when the board has no fights')`.
  
  Run `yarn build:core && yarn --cwd ed-be vitest run src/test/utils/clanChampionshipJournal.test.ts` — FAIL.
- [ ] **Step 2: Implement** `mergeFightJournal`, the service method, the tab changes and the i18n key. Re-run the test — PASS.
- [ ] **Step 3: Verify** with `yarn lint:test` and `yarn build:front`, then `yarn test:e2e -- clan-championship` to check the existing board test still passes.
- [ ] **Step 4: Commit** — `feat(cdc): voir plus de combats dans le journal du damier`
