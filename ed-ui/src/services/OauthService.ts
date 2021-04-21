import { http } from '@/utils';

export const OauthService = {
	authenticateUser(login: string, password: string): Promise<string> {
		return http()
			.put('/oauth/authenticate/eternal-twin', {
				login: login,
				password: password
			})
			.then(res => {
				return Promise.resolve(res.data);
			})
			.catch(err => {
				return Promise.reject(err);
			});
	}
};
