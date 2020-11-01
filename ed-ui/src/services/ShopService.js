import http from '@/helpers/http-common';

class ShopService {

	getDinozFromDinozShop(id) {
		return http.get(`/shop/dinoz/${id}`);
	}

}

export default new ShopService();
