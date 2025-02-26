import { UnavailableReasonFront } from './UnavailableReasonFront.mjs';

export interface DinozEdit {
	dinozId?: string;
	name?: string;
	unavailableReason?: UnavailableReasonFront;
	level?: number;
	canChangeName?: boolean;
	life?: number;
	maxLife?: number;
	nbrUpFire?: number;
	nbrUpWood?: number;
	nbrUpWater?: number;
	nbrUpLightning?: number;
	nbrUpAir?: number;
	experience?: number;
	maxExperience?: number;
	status?: number[];
	skillList: string[];
	unlockableSkillList: string[];
	placeId?: number;
	statusList: string[];
	borderPlace?: number[];
}
