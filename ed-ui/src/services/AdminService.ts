import { http } from '@/utils';

export const AdminService = {
	getDashBoard(): Promise<any> {
		return http()
			.get(`/admin/dashboard`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	givePlayerMoney(id: number, gold: number): Promise<any> {
		return http()
			.put(`/admin/gold/${id}`, {
				gold: gold
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
