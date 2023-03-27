import { http } from '../utils';
import { Dinoz, FightResult, Skill, DinozSkillOwnAndUnlockable, missionRewards } from '../models';

export const DinozService = {
	buyDinoz(id: number): Promise<Dinoz> {
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
	getDinozFiche(id: number): Promise<Dinoz> {
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
	setSkillState(id: number, skillId: number, skillState: boolean): Promise<void> {
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
	levelUp(dinozId: number, tryNumber: string): Promise<Partial<DinozSkillOwnAndUnlockable>> {
		return http()
			.get(`/level/learnableskills/${dinozId}/${tryNumber}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	learnSkill(dinozId: number, skillIdList: Array<number>, tryNumber: number): Promise<number | undefined> {
		return http()
			.post(`/level/learnskill/${dinozId}`, {
				skillIdList: skillIdList,
				tryNumber: tryNumber
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	resurrectDinoz(dinozId: number): Promise<void> {
		return http()
			.put(`/dinoz/resurrect/${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	dig(dinozId: number): Promise<missionRewards> {
		return http()
			.get(`/dinoz/dig/${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
