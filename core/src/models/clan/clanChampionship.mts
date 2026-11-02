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

export interface ClanChampionshipDTO {
	id: string;
	phase: ChampionshipPhase;
	registrationStart: Date;
	registrationEnd: Date;
	endDate: Date;
	places: number[];
	registrations: { clanId: number | null; clanName: string }[];
	matches: ClanChampionshipMatchDTO[];
	myClanRegistered: boolean;
	canManageRegistration: boolean;
}

export interface ChampionshipForm {
	start: string; // YYYY-MM-DD
	places: number[];
}
