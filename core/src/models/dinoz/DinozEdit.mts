export class DinozEdit {
	dinozId?: string;
	name?: string;
	isFrozen?: boolean;
	isSacrificed?: boolean;
	level?: number;
	canChangeName?: boolean;
	life?: number;
	maxLife?: number;
	experience?: number;
	maxExperience?: number;
	status?: Array<number>;
	skillList: Array<string>;
	placeId?: number;
	statusList: Array<string>;
	borderPlace?: Array<number>;
}
