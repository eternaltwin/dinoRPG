import { http } from '@/utils';

export const DataService = {
	getAccountData(cookie: string): Promise<void> {
		return http()
			.get(`/data/${cookie}`)
			.then(response => response.data)
			.catch(err => Promise.reject(err));
	},

	getRedirectUri(): Promise<string> {
		return http()
			.post('/oauth/redirect')
			.then(response => response.data)
			.catch(err => Promise.reject(err));
	}
};
