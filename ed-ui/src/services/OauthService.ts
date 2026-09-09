import { http } from '../utils/index.js';
import { PlayerLoginData } from '@drpg/core/models/player/PlayerCommonData';

/**
 * Key under which the request-forgery-protection value waits for the callback.
 *
 * `sessionStorage` and not a cookie: it is scoped to the tab that started the flow, which is
 * exactly the binding the check needs, and it is gone when the tab is.
 */
const RFP_STORAGE_KEY = 'drpg-oauth-rfp';

export const OauthService = {
	async getRedirectUri(): Promise<{ url: string }> {
		const res = await http().get('/oauth/redirect');
		// Held until the callback, where the backend matches it against the `state` Eternaltwin
		// echoes back. Without it a callback cannot be told apart from one an attacker triggered.
		sessionStorage.setItem(RFP_STORAGE_KEY, res.data.rfp);
		return res.data;
	},
	async authenticateUser(code: string, state: string): Promise<PlayerLoginData> {
		const rfp = sessionStorage.getItem(RFP_STORAGE_KEY) ?? '';
		const query = new URLSearchParams({ code, state, rfp });
		try {
			const res = await http().get(`/oauth/authenticate/eternal-twin?${query.toString()}`);
			return res.data;
		} finally {
			// One code, one callback: the value is spent either way.
			sessionStorage.removeItem(RFP_STORAGE_KEY);
		}
	}
};
