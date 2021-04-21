import { Place } from '@/models';

export interface Dinoz {
	dinozId?: string;
	name?: string;
	display?: string;
	following?: string;
	life?: string;
	canGather?: boolean;
	place?: Place;
	race?: DinozRace;
	assDinozObject: Array<Objet>;
	status: Status;
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
	name: string;
}

export interface Objet {
	canBeEquiped?: boolean;
	canBeUsedNow?: boolean;
	name?: string;
	price?: number;
}

export interface Status {
	name?: string;
}
