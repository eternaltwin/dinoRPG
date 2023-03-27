import { Condition, MissionSteps, Rewarder } from '../index.js';

export interface Mission {
	missionId: number;
	missionName: string;
	condition?: Condition;
	rewards: Array<Rewarder>;
	steps: Array<MissionSteps>;
}
