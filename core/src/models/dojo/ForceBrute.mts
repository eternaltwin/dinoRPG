import { RaceList } from '../dinoz/RaceList.mjs';
import { PublicMetada, TeamLeader, TournamentPhase } from './tournament.mjs';
import { FighterRecap } from '../fight/FightResult.mjs';

export type FBMetaData = {
	phase: TournamentPhase;
	round: number;
	poolNumber: number;
	matchNumber: number;
	dinoz1: number;
	dinoz2: number;
	winner: 'left' | 'right';
};

export type RawMatch = {
	dinoz: number;
	poolNumber: number;
	matchNumber: number;
};

export type FBPool = {
	match: number;
	right: number;
	left: number;
};

export type FBPools = {
	poolId: number;
	matches: FBPool[];
};

export type PublicFBTournament = {
	id: string;
	date: string;
	level: number;
	dinoz: number;
	state: 'qualif' | 'fights';
};

export interface PublicFBTournamentFight {
	id: string;
	left: FighterRecap;
	right: FighterRecap;
	metadata: PublicMetada;
	result: boolean;
	watched: boolean;
}

export type FBParticipation = {
	id: number;
	name: string;
	level: number;
	display: string;
	skills: number[];
};

export type PublicEvent = {
	levelLimit: number;
	id: string;
	teamRace: string;
	date: Date;
	participantCount: number;
};

export const FBDetails: Readonly<Record<number, RaceList>> = {
	[10]: RaceList.WANWAN,
	[11]: RaceList.CASTIVORE,
	[12]: RaceList.MOUEFFE,
	[13]: RaceList.NUAGOZ,
	[14]: RaceList.WINKS,
	[15]: RaceList.GORILLOZ,
	[16]: RaceList.PIGMOU,
	[17]: RaceList.PLANAILLE,
	[18]: RaceList.SIRAIN,
	[19]: RaceList.ROCKY,
	[20]: RaceList.HIPPOCLAMP,
	[21]: RaceList.PTEROZ,
	[22]: RaceList.MOUEFFE,
	[23]: RaceList.WINKS,
	[24]: RaceList.PLANAILLE,
	[25]: RaceList.SANTAZ,
	[26]: RaceList.CASTIVORE,
	[27]: RaceList.NUAGOZ,
	[28]: RaceList.PIGMOU,
	[29]: RaceList.GORILLOZ,
	[30]: RaceList.FEROSS,
	[31]: RaceList.SIRAIN,
	[32]: RaceList.WANWAN,
	[33]: RaceList.TOUFUFU,
	[34]: RaceList.ROCKY,
	[35]: RaceList.TRICERAGNON,
	[36]: RaceList.WINKS_DEMON,
	[37]: RaceList.SMOG,
	[38]: RaceList.MOUEFFE,
	[39]: RaceList.PLANAILLE_DEMON,
	[40]: RaceList.KABUKI,
	[41]: RaceList.HIPPOCLAMP,
	[42]: RaceList.MAHAMUTI,
	[43]: RaceList.PTEROZ,
	[44]: RaceList.PIGMOU_DEMON,
	[45]: RaceList.QUETZU,
	[46]: RaceList.MOUEFFE_DEMON,
	[47]: RaceList.SOUFFLET,
	[48]: RaceList.GORILLOZ_DEMON,
	[49]: RaceList.WANWAN_DEMON,
	[50]: RaceList.KABUKI_DEMON
};

export interface FBOpponent {
	name: string;
	level: number;
	display: string;
	stage: number;
}
