import { missionRequirement } from './missionRequirement.js';

export type MissionHUD = missionRequirement & {
	progress?: number;
};
