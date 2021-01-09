import http from '@/helpers/http-common';

class ShopService {

	getDinozFromDinozShop() {
		return http().get(`/shop/dinoz`);
	}

}

export default new ShopService();
