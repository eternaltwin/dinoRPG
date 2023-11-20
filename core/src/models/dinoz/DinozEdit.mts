export interface DinozEdit {
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
	status?: number[];
	skillList: string[];
	placeId?: number;
	statusList: string[];
	borderPlace?: number[];
}
