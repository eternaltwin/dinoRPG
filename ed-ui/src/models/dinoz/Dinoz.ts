export interface Dinoz {
	dinozId?: string;
	name?: string;
	display?: string;
	following?: string;
	life?: string;
	maxLife?: number;
	experience?: number;
	maxExperience?: number;
	canGather?: boolean;
	race?: DinozRace;
	item: Array<Item>;
	status: Status;
	actions: Array<Action>;
	skill: Array<Skill>;
	placeId: number;
	statusList: Array<number>;
	borderPlace: Array<number>;
}

export interface DinozRace {
	name?: string;
	nbrAirCase?: number;
	nbrFireCase?: number;
	nbrLightCase?: number;
	nbrWaterCase?: number;
	nbrWoodCase?: number;
	price?: number;
	raceId?: string;
	skill?: Skill;
}

export interface Skill {
	skillId: number;
	name: string;
	type: string;
	energy: number;
	element: string;
	state: boolean;
	activable?: boolean;
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

export interface ItemShop {
	id: number;
	display?: string;
	price?: number;
}

export interface Status {
	name?: string;
}

export interface Action {
	name: string;
	imgName: string;
}
