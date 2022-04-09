export interface Dinoz {
	dinozId?: string;
	name?: string;
	display?: string;
	isFrozen?: boolean;
	isSacrificed?: boolean;
	level?: number;
	missionId?: number;
	canChangeName?: boolean;
	following?: string;
	life?: number;
	maxLife?: number;
	experience?: number;
	maxExperience?: number;
	canGather?: boolean;
	race?: DinozRace;
	item: Array<Item>;
	status: Status;
	actions: Array<Action>;
	skill: Array<Skill>;
	skillList: Array<number>;
	placeId: number;
	statusList: Array<number>;
	borderPlace: Array<number>;
}

export interface DinozRace {
	name?: string;
	nbrAir?: number;
	nbrFire?: number;
	nbrLight?: number;
	nbrWater?: number;
	nbrWood?: number;
	price?: number;
	raceId?: string;
	skillId?: Array<number>;
}

export interface Skill {
	skillId: number;
	type: string;
	energy: number;
	element: string;
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
	maxQuantity?: number;
}

export interface Status {
	name?: string;
}

export interface Action {
	name: string;
	imgName: string;
}
