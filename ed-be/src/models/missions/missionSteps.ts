import { missionRequirement } from './missionRequirement.js';

export interface MissionSteps {
	stepId: number;
	place: string;
	hidePlace?: boolean;
	displayedAction?: string;
	displayedText?: string;
	requirement: missionRequirement;
	progress?: number;
}
