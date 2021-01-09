import http from '@/helpers/http-common';

class DinozService {

	create(data) {
		return http().post('/dinoz', data);
	}

	getDinozFiche(id) {
		return http().get(`/dinoz/fiche/${id}`);
	}

	getDinozPlayer() {
		return http().get(`/dinoz/player`);
	}

	buyDinoz(dinozId) {
		return http().post('/dinoz/buydinoz', { dinozId: dinozId });
	}

	setDinozName(dinoz) {
		return http().put('/dinoz/setname', { dinoz: dinoz });
	}
}

export default new DinozService();
