import { FightOutcome } from '../fight/FightResult.mjs';
import { ChampionshipPhase } from './clanEventConfig.mjs';

export const CHAMPIONSHIP_REGISTRATION_WEEKS = 2;
export const CHAMPIONSHIP_MATCH_UTC_HOUR = 18;

export const BOARD_SIZE = 20;
export const BOARD_TICK_MINUTES = 10;
export const BOARD_TICK_AP = 2;
export const BOARD_MATCH_QUOTA = 100;
export const PLACE_REVEAL_HOURS = 24;

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

export interface ChampionshipForm {
	start: string; // YYYY-MM-DD
	places: number[];
}

/** The only message pushed over the match channel: the client refetches the board when its version is older. */
export type BoardChangedMessage = { type: 'boardChanged'; matchId: string; version: number };

/** Result of a board move: the fight it triggered, if any. */
export type BoardMoveResult = {
	fight: { archiveId: string; outcome: FightOutcome; deadDinozIds: number[] } | null;
};
