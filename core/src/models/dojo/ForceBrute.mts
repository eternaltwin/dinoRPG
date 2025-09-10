import { RaceEnum } from '../enums/RaceEnum.mjs';
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

export const FBDetails: Readonly<Record<number, RaceEnum>> = {
	[10]: RaceEnum.WANWAN,
	[11]: RaceEnum.CASTIVORE,
	[12]: RaceEnum.MOUEFFE,
	[13]: RaceEnum.NUAGOZ,
	[14]: RaceEnum.WINKS,
	[15]: RaceEnum.GORILLOZ,
	[16]: RaceEnum.PIGMOU,
	[17]: RaceEnum.PLANAILLE,
	[18]: RaceEnum.SIRAIN,
	[19]: RaceEnum.ROCKY,
	[20]: RaceEnum.HIPPOCLAMP,
	[21]: RaceEnum.PTEROZ,
	[22]: RaceEnum.MOUEFFE,
	[23]: RaceEnum.WINKS,
	[24]: RaceEnum.PLANAILLE,
	[25]: RaceEnum.SANTAZ,
	[26]: RaceEnum.CASTIVORE,
	[27]: RaceEnum.NUAGOZ,
	[28]: RaceEnum.PIGMOU,
	[29]: RaceEnum.GORILLOZ,
	[30]: RaceEnum.FEROSS,
	[31]: RaceEnum.SIRAIN,
	[32]: RaceEnum.WANWAN,
	[33]: RaceEnum.TOUFUFU,
	[34]: RaceEnum.ROCKY,
	[35]: RaceEnum.TRICERAGNON,
	[36]: RaceEnum.WINKS_DEMON,
	[37]: RaceEnum.SMOG,
	[38]: RaceEnum.MOUEFFE,
	[39]: RaceEnum.PLANAILLE_DEMON,
	[40]: RaceEnum.KABUKI,
	[41]: RaceEnum.HIPPOCLAMP,
	[42]: RaceEnum.MAHAMUTI,
	[43]: RaceEnum.PTEROZ,
	[44]: RaceEnum.PIGMOU_DEMON,
	[45]: RaceEnum.QUETZU,
	[46]: RaceEnum.MOUEFFE_DEMON,
	[47]: RaceEnum.SOUFFLET,
	[48]: RaceEnum.GORILLOZ_DEMON,
	[49]: RaceEnum.WANWAN_DEMON,
	[50]: RaceEnum.KABUKI_DEMON
};

export interface FBOpponent {
	name: string;
	level: number;
	display: string;
	stage: number;
}
