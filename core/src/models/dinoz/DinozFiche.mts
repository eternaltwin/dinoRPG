import {
	Concentration,
	Dinoz,
	DinozBuild,
	DinozMission,
	DinozSkill,
	DinozStatus,
	UnavailableReason
} from '@drpg/prisma';
import { MissionHUD } from '../missions/missionHUD.mjs';
import { ActionFiche } from './ActionList.mjs';
import { DinozRace } from './DinozRace.mjs';
import { TournamentState } from '../dojo/tournament.mjs';

// This is the model to use to communicate with the front
export interface DinozFiche {
	id: number;
	name: string;
	display: string;
	unavailableReason: UnavailableReason | null;
	level: number;
	missionId: number | undefined | null;
	missionHUD: MissionHUD | null;
	leaderId: number | null;
	followers: Pick<Dinoz, 'id' | 'fight' | 'remaining' | 'gather' | 'name'>[];
	life: number;
	maxLife: number;
	experience: number;
	maxExperience: number;
	race: DinozRace;
	placeId: number;
	actions: ActionFiche[];
	items: number[];
	maxItems: number;
	lastAttack?: Date;
	skills: Pick<DinozSkill, 'skillId' | 'state'>[];
	status: Pick<DinozStatus, 'statusId'>[];
	borderPlace: number[];
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	order: number | null;
	remaining: number;
	fight: boolean;
	gather: boolean;
	missions: DinozMission[];
	concentration: Concentration | null;
	tournament: Pick<TournamentState, 'id' | 'levelLimit'> | null;
	npcAwait?: {
		npcSpeech: string;
		npcName: string;
	};
	build?: DinozBuild;
}

// This is the model to use to communicate with the admin panel
export interface DinozAdminFiche {
	id: number;
	name: string;
	unavailableReason: UnavailableReason | null;
	level: number;
	canChangeName: boolean;
	leaderId: number | null;
	life: number;
	maxLife: number;
	experience: number;
	placeId: number;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	status: number[];
	skills: number[];
	unlockableSkills: number[];
}

export interface DinozPublicFiche {
	id: number;
	name: string;
	display: string;
	isFrozen: boolean;
	life: number;
	level: number;
	race: DinozRace;
	status: number[];
	order: number | null;
}

export interface DinozDojoFiche {
	id: number;
	name: string;
	display: string;
	level: number;
}
