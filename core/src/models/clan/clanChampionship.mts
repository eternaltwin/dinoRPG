import { ChampionshipPhase } from './clanEventConfig.mjs';

export const CHAMPIONSHIP_REGISTRATION_WEEKS = 2;
export const CHAMPIONSHIP_MATCH_UTC_HOUR = 18;

export interface ClanChampionshipMatchDTO {
	id: string;
	round: number;
	homeClan: { id: number; name: string };
	awayClan: { id: number; name: string };
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
	registrations: { clanId: number; clanName: string }[];
	matches: ClanChampionshipMatchDTO[];
	myClanRegistered: boolean;
	canManageRegistration: boolean;
}

export interface ChampionshipForm {
	start: string; // YYYY-MM-DD
	places: number[];
}
