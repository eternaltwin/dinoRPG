import { Concentration, Dinoz, DinozMission, DinozSkill, DinozStatus, UnavailableReason } from '@drpg/prisma';
import { MissionHUD } from '../missions/missionHUD.mjs';
import { ActionFiche } from './ActionList.mjs';
import { DinozRace } from './DinozRace.mjs';

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
	followers: Pick<Dinoz, 'id' | 'fight' | 'remaining'>[];
	life: number;
	maxLife: number;
	experience: number;
	maxExperience: number;
	race: DinozRace;
	placeId: number;
	actions: ActionFiche[];
	items: number[];
	maxItems: number;
	skills: Pick<DinozSkill, 'skillId'>[];
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
	npcAwait?: {
		npcSpeech: string;
		npcName: string;
	};
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
}
