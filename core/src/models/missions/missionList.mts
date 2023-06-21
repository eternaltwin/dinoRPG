import { MissionsStatus } from '../enums/MissionsStatus.mjs';

export interface MissionList {
	missionId: number;
	status: MissionsStatus;
}
