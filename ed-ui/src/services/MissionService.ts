import { http } from '@/utils';
import { MissionList } from '@/models';

export const MissionService = {
	getMissions(id: string, npc: string): Promise<Array<MissionList>> {
		return http()
			.get(`/missions/${id}/${npc}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	updateMissions(dinozId: string, missionId: number, status: string): Promise<boolean> {
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
	}
};
