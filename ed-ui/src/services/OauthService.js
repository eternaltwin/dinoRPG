import http from '@/helpers/http-common';

class OauthService {

	authenticateUser(login, password) {
		return http.put('/oauth/authenticate/eternal-twin', { login: login, password: password });
	}
}

export default new OauthService();
