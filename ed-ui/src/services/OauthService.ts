import { http } from '@/utils';

export const OauthService = {
	getRedirectUri(): Promise<string> {
		return http()
			.post('/oauth/redirect')
			.then(response => response.data)
			.catch(err => Promise.reject(err));
	},
	authenticateUser(code: string): Promise<string> {
		return http()
			.put(`/oauth/authenticate/eternal-twin`, { code: code })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
