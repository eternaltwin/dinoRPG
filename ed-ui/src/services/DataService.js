import http from '@/helpers/http-common';

class DataService {

	getApiData(code) {
		return http.get(`/data/${code}`);
	}
}

export default new DataService();
