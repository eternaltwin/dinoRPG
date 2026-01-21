import { http } from '../utils/index.js';
import { PlayerLoginData } from '@drpg/core/models/player/PlayerCommonData';

export const OauthService = {
	getRedirectUri(): Promise<{ url: string }> {
		return http()
			.get('/oauth/redirect')
			.then(response => response.data)
			.catch(err => Promise.reject(err));
	},
	authenticateUser(code: string): Promise<PlayerLoginData> {
		return http()
			.get(`/oauth/authenticate/eternal-twin?code=${code}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
