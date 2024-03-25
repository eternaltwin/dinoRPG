import { UnavailableReasonFront } from "./UnavailableReasonFront.mjs";

export interface DinozEdit {
	dinozId?: string;
	name?: string;
	unavailableReason?: UnavailableReasonFront;
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
