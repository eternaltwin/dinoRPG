import { FightResult } from '@drpg/core/models/fight/FightResult';
import { MissionList } from '@drpg/core/models/missions/missionList';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { MissionsPageData } from '@drpg/core/returnTypes/Dinoz';
import { http } from '../utils/index.js';

export const MissionService = {
	async getMissions(id: string, npc: string): Promise<Array<MissionList>> {
		const res = await http().get(`/missions/${id}/${npc}`);
		return res.data;
	},
	async updateMissions(dinozId: number, missionId: number, status: string): Promise<boolean> {
		const res = await http().put(`/missions/update/${dinozId}/${missionId}`, { status: status });
		return res.data;
	},
	async interactMission(dinozId: string, missionId: number, task: string): Promise<string> {
		const res = await http().put(`/missions/step/${dinozId}/`, { missionId: missionId, task: task });
		return res.data;
	},
	async startFightMission(dinozId: string, missionId: number, task: string): Promise<FightResult> {
		const res = await http().put(`/missions/fight/${dinozId}/`, { missionId: missionId, task: task });
		return res.data;
	},
	async finishMission(dinozId: string, missionId: number): Promise<Array<Rewarder>> {
		const res = await http().put(`/missions/finish/${dinozId}/`, { missionId: missionId });
		return res.data;
	},
	async getGlobalMissions(): Promise<MissionsPageData> {
		const res = await http().get('/missions/global');
		return res.data;
	}
};
