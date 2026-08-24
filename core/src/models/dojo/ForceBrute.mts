import { RaceEnum } from '../enums/RaceEnum.mjs';
import { PublicMetada, TournamentPhase } from './tournament.mjs';
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

export type FBRaceConfig = {
	race: RaceEnum;
	demon?: boolean;
};

export const FBDetails: Readonly<Record<number, FBRaceConfig>> = {
	[10]: {
		race: RaceEnum.WANWAN
	},
	[11]: {
		race: RaceEnum.CASTIVORE
	},
	[12]: {
		race: RaceEnum.MOUEFFE
	},
	[13]: {
		race: RaceEnum.NUAGOZ
	},
	[14]: {
		race: RaceEnum.WINKS
	},
	[15]: {
		race: RaceEnum.GORILLOZ
	},
	[16]: {
		race: RaceEnum.PIGMOU
	},
	[17]: {
		race: RaceEnum.PLANAILLE
	},
	[18]: {
		race: RaceEnum.SIRAIN
	},
	[19]: {
		race: RaceEnum.ROCKY
	},
	[20]: {
		race: RaceEnum.HIPPOCLAMP
	},
	[21]: {
		race: RaceEnum.PTEROZ
	},
	[22]: {
		race: RaceEnum.MOUEFFE
	},
	[23]: {
		race: RaceEnum.WINKS
	},
	[24]: {
		race: RaceEnum.PLANAILLE
	},
	[25]: {
		race: RaceEnum.SANTAZ
	},
	[26]: {
		race: RaceEnum.CASTIVORE
	},
	[27]: {
		race: RaceEnum.NUAGOZ
	},
	[28]: {
		race: RaceEnum.PIGMOU
	},
	[29]: {
		race: RaceEnum.GORILLOZ
	},
	[30]: {
		race: RaceEnum.FEROSS
	},
	[31]: {
		race: RaceEnum.SIRAIN
	},
	[32]: {
		race: RaceEnum.WANWAN
	},
	[33]: {
		race: RaceEnum.TOUFUFU
	},
	[34]: {
		race: RaceEnum.ROCKY
	},
	[35]: {
		race: RaceEnum.TRICERAGNON
	},
	[36]: {
		race: RaceEnum.WINKS,
		demon: true
	},
	[37]: {
		race: RaceEnum.SMOG
	},
	[38]: {
		race: RaceEnum.MOUEFFE
	},
	[39]: {
		race: RaceEnum.PLANAILLE,
		demon: true
	},
	[40]: {
		race: RaceEnum.KABUKI
	},
	[41]: {
		race: RaceEnum.HIPPOCLAMP
	},
	[42]: {
		race: RaceEnum.MAHAMUTI
	},
	[43]: {
		race: RaceEnum.PTEROZ
	},
	[44]: {
		race: RaceEnum.PIGMOU,
		demon: true
	},
	[45]: {
		race: RaceEnum.QUETZU
	},
	[46]: {
		race: RaceEnum.MOUEFFE,
		demon: true
	},
	[47]: {
		race: RaceEnum.SOUFFLET
	},
	[48]: {
		race: RaceEnum.GORILLOZ,
		demon: true
	},
	[49]: {
		race: RaceEnum.WANWAN,
		demon: true
	},
	[50]: {
		race: RaceEnum.KABUKI,
		demon: true
	}
};

export interface FBOpponent {
	name: string;
	level: number;
	display: string;
	stage: number;
}
