import { http } from '../utils/index.js';
import { MissionList } from '@drpg/core/models/missions/missionList';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { MissionsPageData } from '@drpg/core/returnTypes/Dinoz';

export const MissionService = {
	getMissions(id: string, npc: string): Promise<Array<MissionList>> {
		return http()
			.get(`/missions/${id}/${npc}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	updateMissions(dinozId: number, missionId: number, status: string): Promise<boolean> {
		return http()
			.put(`/missions/update/${dinozId}/${missionId}`, { status: status })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	interactMission(dinozId: string, missionId: number, task: string): Promise<string> {
		return http()
			.put(`/missions/step/${dinozId}/`, { missionId: missionId, task: task })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	finishMission(dinozId: string, missionId: number): Promise<Array<Rewarder>> {
		return http()
			.put(`/missions/finish/${dinozId}/`, { missionId: missionId })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getGlobalMissions(): Promise<MissionsPageData> {
		return http()
			.get('/missions/global')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
