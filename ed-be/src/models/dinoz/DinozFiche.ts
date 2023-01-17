import { DinozRace } from './DinozRace.js';

// This is the model to use to communicate with the front
export interface DinozFiche {
	id?: number;
	name?: string;
	display?: string;
	isFrozen?: boolean;
	isSacrificed?: boolean;
	level?: number;
	missionId?: number;
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
	missions?: string;
	items?: Array<number>;
	skills?: Array<number>;
	status?: Array<number>;
	borderPlace?: Array<number>;
	nbrUpFire?: number;
	nbrUpWood?: number;
	nbrUpWater?: number;
	nbrUpLightning?: number;
	nbrUpAir?: number;
}

export interface ActionFiche {
	name: string;
	imgName: string;
	prop?: number | string;
}
