import http from '@/helpers/http-common';

class DataService {

	getApiData(code, cookie) {
		return http().get(`/data/${code}/${cookie}`);
	}
}

export default new DataService();
