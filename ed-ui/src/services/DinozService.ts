import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { DinozSkillOwnAndUnlockable } from '@drpg/core/models/dinoz/DinozSkillOwnAndUnlockable';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { GatherPublicGrid } from '@drpg/core/models/gather/gatherPublicGrid';
import { GatherResult } from '@drpg/core/models/gather/gatherResult';
import { ItemFeedBack } from '@drpg/core/models/item/feedBack';
import { DigResponse, LearnSkillData, ManagePageData } from '@drpg/core/returnTypes/Dinoz';
import { http } from '../utils/index.js';

export const DinozService = {
	async buyDinoz(id: number): Promise<DinozFiche> {
		const res = await http().post(`/dinoz/buydinoz/${id}`);
		return res.data;
	},
	async setDinozName(id: number, newName: string): Promise<void> {
		const res = await http().put(`/dinoz/setname/${id}`, { newName: newName });
		return res.data;
	},
	async getDinozFiche(id: number): Promise<DinozFiche> {
		const res = await http().get(`/dinoz/fiche/${id}`);
		return res.data;
	},
	async getDinozSkill(id: number): Promise<Array<Skill>> {
		const res = await http().get(`/dinoz/skill/${id}`);
		return res.data;
	},
	async setSkillState(id: number, skillId: number, skillState: boolean): Promise<boolean> {
		const res = await http().put(`/dinoz/setskillstate/${id}`, {
			skillId: skillId,
			skillState: skillState
		});
		return res.data;
	},
	async betaMove(dinozId: number, placeId: number): Promise<FightResult> {
		const res = await http().put(`/dinoz/betamove`, {
			placeId: placeId,
			dinozId: dinozId
		});
		return res.data;
	},
	async levelUp(dinozId: number, tryNumber: string): Promise<DinozSkillOwnAndUnlockable> {
		const res = await http().get(`/level/learnableskills/${dinozId}/${tryNumber}`);
		return res.data;
	},
	async learnSkill(dinozId: number, skillIdList: Array<number>, tryNumber: number): Promise<LearnSkillData> {
		const res = await http().post(`/level/learnskill/${dinozId}`, {
			skillIdList: skillIdList,
			tryNumber: tryNumber
		});
		return res.data;
	},
	async resurrectDinoz(dinozId: number): Promise<void | ItemFeedBack> {
		const res = await http().put(`/dinoz/resurrect/${dinozId}`);
		return res.data;
	},
	async dig(dinozId: number): Promise<DigResponse> {
		const res = await http().get(`/dinoz/dig/${dinozId}`);
		return res.data;
	},
	async getGatherGrid(dinozId: number, gridType: string): Promise<GatherPublicGrid> {
		const res = await http().get(`/dinoz/gather/${dinozId}/${gridType}`);
		return res.data;
	},
	async gatherWithDinoz(dinozId: number, gridType: string, box: number[][]): Promise<GatherResult> {
		const res = await http().put(`/dinoz/gather/${dinozId}`, {
			type: gridType,
			box: box
		});
		return res.data;
	},
	async concentration(dinozId: number): Promise<void> {
		const res = await http().put(`/dinoz/concentrate/${dinozId}`);
		return res.data;
	},
	async cancelConcentration(dinozId: number): Promise<void> {
		const res = await http().post(`/dinoz/noconcentrate/${dinozId}`);
		return res.data;
	},
	async getDinozToManage(): Promise<ManagePageData> {
		const res = await http().get('/dinoz/manage');
		return res.data;
	},
	async updateOrders(dinozIds: number[]): Promise<{ id: number; order: number }[]> {
		const res = await http().post('/dinoz/manage', { order: dinozIds });
		return res.data;
	},
	async follow(dinozId: number, targetId: number): Promise<void> {
		const res = await http().post(`/dinoz/${dinozId}/follow/${targetId}`);
		return res.data;
	},
	async unfollow(dinozId: number): Promise<void> {
		const res = await http().post(`/dinoz/${dinozId}/unfollow`);
		return res.data;
	},
	async changeLeader(followerId: number, currentLeaderId: number): Promise<void> {
		const res = await http().post(`/dinoz/${followerId}/change/${currentLeaderId}`);
		return res.data;
	},
	async disband(dinozId: number): Promise<void> {
		const res = await http().post(`/dinoz/${dinozId}/disband`);
		return res.data;
	},
	async useIrma(dinozId: number): Promise<ItemFeedBack> {
		const res = await http().post(`/dinoz/${dinozId}/irma`);
		return res.data;
	},
	async frozeDinoz(dinozId: number): Promise<void> {
		const res = await http().post(`/dinoz/${dinozId}/froze`);
		return res.data;
	},
	async unfrozeDinoz(dinozId: number): Promise<void> {
		const res = await http().post(`/dinoz/${dinozId}/unfroze`);
		return res.data;
	},
	async restDinoz(dinozId: number, rest: boolean): Promise<void> {
		const res = await http().post(`/dinoz/${dinozId}/rest`, {
			start: rest
		});
		return res.data;
	},
	async reincarnate(dinozId: number): Promise<void> {
		const res = await http().post(`/dinoz/${dinozId}/reincarnate`);
		return res.data;
	},
	async assignBuild(dinozId: number, buildId: string | null) {
		await http().put(`/dinoz/${dinozId}/build`, {
			buildId: buildId
		});
	}
};
