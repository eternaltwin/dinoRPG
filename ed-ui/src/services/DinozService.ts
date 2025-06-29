import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { DinozSkillOwnAndUnlockable } from '@drpg/core/models/dinoz/DinozSkillOwnAndUnlockable';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { GatherPublicGrid } from '@drpg/core/models/gather/gatherPublicGrid';
import { GatherResult } from '@drpg/core/models/gather/gatherResult';
import { ItemFeedBack } from '@drpg/core/models/item/feedBack';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { LearnSkillData, ManagePageData } from '@drpg/core/returnTypes/Dinoz';
import { http } from '../utils/index.js';
import { Skill } from '@drpg/core/models/dinoz/SkillList';

export const DinozService = {
	buyDinoz(id: number): Promise<DinozFiche> {
		return http()
			.post(`/dinoz/buydinoz/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	setDinozName(id: number, newName: string): Promise<void> {
		return http()
			.put(`/dinoz/setname/${id}`, { newName: newName })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getDinozFiche(id: number): Promise<DinozFiche> {
		return http()
			.get(`/dinoz/fiche/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getDinozSkill(id: number): Promise<Array<Skill>> {
		return http()
			.get(`/dinoz/skill/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	setSkillState(id: number, skillId: number, skillState: boolean): Promise<boolean> {
		return http()
			.put(`/dinoz/setskillstate/${id}`, {
				skillId: skillId,
				skillState: skillState
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	betaMove(dinozId: number, placeId: number): Promise<FightResult> {
		return http()
			.put(`/dinoz/betamove`, {
				placeId: placeId,
				dinozId: dinozId
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	levelUp(dinozId: number, tryNumber: string): Promise<DinozSkillOwnAndUnlockable> {
		return http()
			.get(`/level/learnableskills/${dinozId}/${tryNumber}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	learnSkill(dinozId: number, skillIdList: Array<number>, tryNumber: number): Promise<LearnSkillData> {
		return http()
			.post(`/level/learnskill/${dinozId}`, {
				skillIdList: skillIdList,
				tryNumber: tryNumber
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	resurrectDinoz(dinozId: number): Promise<void | ItemFeedBack> {
		return http()
			.put(`/dinoz/resurrect/${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	dig(dinozId: number): Promise<Rewarder> {
		return http()
			.get(`/dinoz/dig/${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getGatherGrid(dinozId: number, gridType: string): Promise<GatherPublicGrid> {
		return http()
			.get(`/dinoz/gather/${dinozId}/${gridType}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	gatherWithDinoz(dinozId: number, gridType: string, box: number[][]): Promise<GatherResult> {
		return http()
			.put(`/dinoz/gather/${dinozId}`, {
				type: gridType,
				box: box
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	concentration(dinozId: number): Promise<void> {
		return http()
			.put(`/dinoz/concentrate/${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	cancelConcentration(dinozId: number): Promise<void> {
		return http()
			.post(`/dinoz/noconcentrate/${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getDinozToManage(): Promise<ManagePageData> {
		return http()
			.get('/dinoz/manage')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	updateOrders(dinozIds: number[]): Promise<{ id: number; order: number }[]> {
		return http()
			.post('/dinoz/manage', { order: dinozIds })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	follow(dinozId: number, targetId: number): Promise<void> {
		return http()
			.post(`/dinoz/${dinozId}/follow/${targetId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	unfollow(dinozId: number): Promise<void> {
		return http()
			.post(`/dinoz/${dinozId}/unfollow`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	changeLeader(followerId: number, currentLeaderId: number): Promise<void> {
		return http()
			.post(`/dinoz/${followerId}/change/${currentLeaderId}`)
			.then(res => {
				return Promise.resolve(res.data);
			})
			.catch(err => {
				return Promise.reject(err);
			});
	},
	disband(dinozId: number): Promise<void> {
		return http()
			.post(`/dinoz/${dinozId}/disband`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	useIrma(dinozId: number): Promise<ItemFeedBack> {
		return http()
			.post(`/dinoz/${dinozId}/irma`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	frozeDinoz(dinozId: number): Promise<void> {
		return http()
			.post(`/dinoz/${dinozId}/froze`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	unfrozeDinoz(dinozId: number): Promise<void> {
		return http()
			.post(`/dinoz/${dinozId}/unfroze`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	restDinoz(dinozId: number, rest: boolean): Promise<void> {
		return http()
			.post(`/dinoz/${dinozId}/rest`, {
				start: rest
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	reincarnate(dinozId: number): Promise<void> {
		return http()
			.post(`/dinoz/${dinozId}/reincarnate`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
