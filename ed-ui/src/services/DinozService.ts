import { http } from '@/utils';
import {
	Dinoz,
	FightResult,
	Skill,
	DinozSkillOwnAndUnlockable
} from '@/models';

export const DinozService = {
	buyDinoz(id: string): Promise<Dinoz> {
		return http()
			.post(`/dinoz/buydinoz/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	setDinozName(id: string, newName: string): Promise<void> {
		return http()
			.put(`/dinoz/setname/${id}`, { newName: newName })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getDinozFiche(id: string): Promise<Dinoz> {
		return http()
			.get(`/dinoz/fiche/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getDinozSkill(id: string): Promise<Array<Skill>> {
		return http()
			.get(`/dinoz/skill/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	setSkillState(
		id: string,
		skillId: number,
		skillState: boolean
	): Promise<void> {
		return http()
			.put(`/dinoz/setskillstate/${id}`, {
				skillId: skillId,
				skillState: skillState
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	betaMove(dinozId: string, placeId: number): Promise<FightResult> {
		return http()
			.put(`/dinoz/betamove/${dinozId}`, {
				placeId: placeId
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	betaFight(dinozId: string, placeId: number): Promise<FightResult> {
		return http()
			.put(`/dinoz/betafight/${dinozId}`, {
				placeId: placeId
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	levelUp(
		dinozId: string,
		tryNumber: string
	): Promise<Partial<DinozSkillOwnAndUnlockable>> {
		return http()
			.get(`/level/learnableskills/${dinozId}/${tryNumber}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	learnSkill(
		dinozId: string,
		skillIdList: Array<number>,
		tryNumber: number
	): Promise<number | undefined> {
		return http()
			.post(`/level/learnskill/${dinozId}`, {
				skillIdList: skillIdList,
				tryNumber: tryNumber
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
