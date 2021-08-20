import { http } from '@/utils';

export const OauthService = {
	authenticateUser(code: string): Promise<string> {
		return http()
			.put(`/oauth/authenticate/eternal-twin`, { code: code })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
