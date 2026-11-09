import { FightOutcome } from '../fight/FightResult.mjs';
import { ChampionshipPhase } from './clanEventConfig.mjs';

export const CHAMPIONSHIP_REGISTRATION_WEEKS = 1;
export const CHAMPIONSHIP_MATCH_UTC_HOUR = 18;

export const BOARD_SIZE = 20;
export const BOARD_TICK_MINUTES = 10;
export const BOARD_TICK_AP = 1;
export const BOARD_MAX_STORED_AP = 20;
export const BOARD_MATCH_QUOTA = 100;
export const PLACE_REVEAL_HOURS = 24;
export const JOURNAL_PAGE_SIZE = 50;

export enum BoardDirection {
	N = 'N',
	S = 'S',
	E = 'E',
	W = 'W'
}

export type ClanChampionshipMatchStatus = 'scheduled' | 'live' | 'finished';

export interface ClanChampionshipMatchDTO {
	id: string;
	round: number;
	homeClan: { id: number | null; name: string };
	awayClan: { id: number | null; name: string };
	placeId: number | null;
	status: ClanChampionshipMatchStatus;
	homeScore: number;
	awayScore: number;
	winnerClanId: number | null;
	startsAt: Date;
	endsAt: Date;
}

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

export interface ClanChampionshipDTO {
	id: string;
	phase: ChampionshipPhase;
	registrationStart: Date;
	registrationEnd: Date;
	endDate: Date;
	places: number[];
	registrations: { clanId: number | null; clanName: string }[];
	matches: ClanChampionshipMatchDTO[];
	standings: ClanChampionshipStandingDTO[];
	myClanRegistered: boolean;
	canManageRegistration: boolean;
}

export interface BoardPieceDTO {
	dinozId: number;
	clanId: number;
	x: number;
	y: number;
	mine: boolean;
	ally: boolean;
	name: string;
	display: string;
	level: number;
	life?: number;
	maxLife?: number;
	actionPoints?: number;
	playerName: string;
}

export interface BoardSideDTO {
	clanId: number | null;
	name: string;
	score: number;
	scoreLine: number;
	quotaUsed: number;
}

export interface FightJournalEntryDTO {
	id: number;
	createdAt: Date;
	attackerClanId: number;
	attackerWon: boolean;
	participantCount: number;
	deadDinozIds: number[];
	/** Only set when the reader took part in the fight. */
	archiveId: string | null;
}

export interface MatchBoardDTO {
	matchId: string;
	/** Board version, bumped on every change; compared with the one pushed over the match channel. */
	version: number;
	round: number;
	placeId: number | null;
	status: ClanChampionshipMatchStatus;
	startsAt: Date;
	endsAt: Date;
	ticksApplied: number;
	west: BoardSideDTO;
	east: BoardSideDTO;
	obstacles: number[];
	pieces: BoardPieceDTO[];
	deadDinozIds: number[];
	fights: FightJournalEntryDTO[];
}

/**
 * Journal shown to the player: the latest page from the board, then the older pages already loaded.
 * Merged by id (the cursor), so a board refresh neither duplicates nor skips entries.
 */
export function mergeFightJournal(
	newest: FightJournalEntryDTO[],
	older: FightJournalEntryDTO[]
): FightJournalEntryDTO[] {
	const ceiling = newest.length ? Math.min(...newest.map(f => f.id)) : Infinity;
	const seen = new Set(newest.map(f => f.id));
	const result = [...newest];
	for (const f of [...older].sort((a, b) => b.id - a.id)) {
		if (f.id >= ceiling || seen.has(f.id)) continue;
		seen.add(f.id);
		result.push(f);
	}
	return result;
}

/**
 * True when a refreshed newest page (full) no longer reaches the previous newest page: fights happened in between,
 * so the older pages already loaded would leave a hole and must be dropped.
 */
export function journalPagesDisconnected(
	prevNewest: FightJournalEntryDTO[],
	nextNewest: FightJournalEntryDTO[]
): boolean {
	if (!prevNewest.length || nextNewest.length < JOURNAL_PAGE_SIZE) return false;
	return Math.min(...nextNewest.map(f => f.id)) > Math.max(...prevNewest.map(f => f.id));
}

export interface ChampionshipForm {
	start: string; // YYYY-MM-DD
	places: number[];
}

/** Pushed to both clans of a match: the client asks for the board again when its version is older. */
export type BoardChangedMessage = { type: 'boardChanged'; matchId: string; version: number };

/** Pushed to every clan: registrations, phase or calendar changed, the championship page is out of date. */
export type ChampionshipChangedMessage = { type: 'championshipChanged' };

/** Result of a board move: the fight it triggered, if any. */
export type BoardMoveResult = {
	fight: { archiveId: string; outcome: FightOutcome; deadDinozIds: number[] } | null;
};
