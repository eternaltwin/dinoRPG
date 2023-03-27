import { MissionEnum } from '../../enums/index.js';

export interface missionRequirement {
	actionType: MissionEnum;
	target: string;
	value?: number;
	progress?: number;
}
