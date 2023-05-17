import { missionRequirement } from './missionRequirement.mjs';

export type MissionHUD = missionRequirement & {
	progress?: number;
};
