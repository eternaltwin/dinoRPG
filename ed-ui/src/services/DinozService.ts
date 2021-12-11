import { http } from '@/utils';
import { Dinoz, Skill } from '@/models';

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
	alphaMove(id: string): Promise<void> {
		//FIXME: rename this function and rework it by adding payload
		return http()
			.put(`/dinoz/alphamove/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
