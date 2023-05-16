import { missionRequirement } from './missionRequirement.mjs';

export class MissionSteps {
	stepId: number;
	place: string;
	hidePlace?: boolean;
	displayedAction: string;
	displayedText?: string;
	requirement: missionRequirement;
	progress?: number;
}
