import http from '@/helpers/http-common';

class PlayerService {

	getMoney(id) {
		return http.get(`/player/money/${id}`);
	}
}

export default new PlayerService();
