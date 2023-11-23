import { MissionHUD } from '../missions/missionHUD.mjs';
import { ActionFiche } from './ActionList.mjs';
import { DinozRace } from './DinozRace.mjs';

// This is the model to use to communicate with the front
export interface DinozFiche {
	id: number;
	name: string;
	display: string;
	isFrozen: boolean;
	isSelling: boolean;
	level: number;
	missionId: number | undefined;
	missionHUD: MissionHUD | null;
	following: number | null;
	life: number;
	maxLife: number;
	experience: number;
	maxExperience: number;
	race: DinozRace;
	placeId: number;
	actions: ActionFiche[];
	items: number[];
	maxItems: number;
	skills: number[];
	status: number[];
	borderPlace: number[];
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	order: number | null;
}
