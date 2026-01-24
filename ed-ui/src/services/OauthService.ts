import { http } from '../utils/index.js';
import { PlayerLoginData } from '@drpg/core/models/player/PlayerCommonData';

export const OauthService = {
	async getRedirectUri(): Promise<{ url: string }> {
		const res = await http().get('/oauth/redirect');
		return res.data;
	},
	async authenticateUser(code: string): Promise<PlayerLoginData> {
		const res = await http().get(`/oauth/authenticate/eternal-twin?code=${code}`);
		return res.data;
	}
};
