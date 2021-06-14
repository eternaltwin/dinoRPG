import { http } from '@/utils';

export const OauthService = {
	authenticateUser(code: string): Promise<string> {
		return http()
			.put(`/oauth/authenticate/eternal-twin`, { code: code })
			.then(res => {
				return Promise.resolve(res.data);
			})
			.catch(err => {
				return Promise.reject(err);
			});
	}
};
