export interface Dinoz {
	id?: number;
	name?: string;
	display?: string;
	isFrozen?: boolean;
	isSacrificed?: boolean;
	level?: number;
	missionId?: number;
	missions?: string;
	canChangeName?: boolean;
	following?: number;
	life?: number;
	maxLife?: number;
	experience?: number;
	maxExperience?: number;
	canGather?: boolean;
	race?: DinozRace;
	placeId?: number;
	actions?: Array<Action>;
	items?: Array<number>;
	skills?: Array<number>;
	status?: Array<number>;
	borderPlace?: Array<number>;
	nbrUpFire?: number;
	nbrUpWood?: number;
	nbrUpWater?: number;
	nbrUpLightning?: number;
	nbrUpAir?: number;
	order: number | null;
}

export interface DinozRace {
	raceId?: string;
	name?: string;
	nbrAir?: number;
	nbrFire?: number;
	nbrLightning?: number;
	nbrWater?: number;
	nbrWood?: number;
	price?: number;
	skillId?: Array<number>;
}

export interface Skill {
	skillId: number;
	type: string;
	energy: number;
	element: number;
	state: boolean;
	activatable?: boolean;
}

export interface Item {
	itemId: number;
	canBeEquipped?: boolean;
	canBeUsedNow?: boolean;
	name?: string;
	price?: number;
	quantity?: number;
	isRare?: boolean;
	itemType?: string;
	maxQuantity?: number;
}

export interface Status {
	name?: string;
}

export interface Action {
	name: string;
	imgName: string;
	prop?: number | string;
}
