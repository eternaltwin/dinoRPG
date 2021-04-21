import { http } from '@/utils';
import { Dinoz } from '@/models';

export const DinozService = {
	buyDinoz(id: string): Promise<Dinoz> {
		return http()
			.post(`/dinoz/buydinoz/${id}`)
			.then(res => {
				return Promise.resolve(res.data);
			})
			.catch(err => {
				return Promise.reject(err);
			});
	},

	setDinozName(id: string, newName: string): Promise<void> {
		return http()
			.put(`/dinoz/setname/${id}`, { newName: newName })
			.then(res => {
				return Promise.resolve(res.data);
			})
			.catch(err => {
				return Promise.reject(err);
			});
	},

	getDinozFiche(id: string): Promise<Dinoz> {
		return http()
			.get(`/dinoz/fiche/${id}`)
			.then(res => {
				return Promise.resolve(res.data);
			})
			.catch(err => {
				return Promise.reject(err);
			});
	}
};
