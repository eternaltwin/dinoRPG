import { MissionSteps } from './missionSteps.js';

export interface Mission {
	missionId: number;
	missionName: string;
	condition?: string;
	rewards: Array<string>;
	steps: Array<MissionSteps>;
}
