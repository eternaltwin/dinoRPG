import { missionRequirement } from './missionRequirement.mjs';

export interface MissionSteps {
	stepId: number;
	place: string;
	hidePlace?: boolean;
	displayedAction: string;
	displayedText?: string;
	requirement: missionRequirement;
	progress?: number;
}
