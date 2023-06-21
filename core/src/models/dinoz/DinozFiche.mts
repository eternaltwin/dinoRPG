import { DinozRace } from './DinozRace.mjs';
import { MissionHUD } from '../missions/missionHUD.mjs';

// This is the model to use to communicate with the front
export interface DinozFiche {
	id?: number;
	name?: string;
	display?: string;
	isFrozen?: boolean;
	isSacrificed?: boolean;
	level?: number;
	missionId?: number;
	missions?: MissionHUD;
	canChangeName?: boolean;
	following?: number;
	life?: number;
	maxLife?: number;
	experience?: number;
	maxExperience?: number;
	canGather?: boolean;
	race?: DinozRace;
	placeId?: number;
	actions?: Array<ActionFiche>;
	items?: Array<number>;
	skills?: Array<number>;
	status?: Array<number>;
	borderPlace?: Array<number>;
	nbrUpFire?: number;
	nbrUpWood?: number;
	nbrUpWater?: number;
	nbrUpLightning?: number;
	nbrUpAir?: number;
	order?: number | null;
}

export interface ActionFiche {
	name: string;
	imgName: string;
	prop?: number | string;
}
