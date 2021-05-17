import { http } from '@/utils';

export const DataService = {
	getAccountData(code: string, cookie: string): Promise<void> {
		return http()
			.get(`/data/${code}/${cookie}`)
			.then(response => response.data)
			.catch(err => Promise.reject(err));
	},

	authentication(): Promise<string> {
		return http()
			.post('/oauth/redirect')
			.then(response => response.data)
			.catch(err => Promise.reject(err));
	}
};
