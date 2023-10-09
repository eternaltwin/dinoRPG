import { missionRequirement } from './missionRequirement.mjs';

export interface MissionSteps {
	stepId: number;
	place: string;
	hidePlace?: boolean;
	displayedAction: string;
	displayedText?: string;
	displayedHUD?: string; //Used to overwrite
	requirement: missionRequirement;
	progress?: number;
}
