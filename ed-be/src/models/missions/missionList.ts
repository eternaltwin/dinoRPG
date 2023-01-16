import { MissionsStatus } from '../enums/index.js';

export interface MissionList {
	missionId: number;
	status: MissionsStatus;
}
