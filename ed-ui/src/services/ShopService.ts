import { http } from '@/utils';
import { DinozShop } from '@/models';

export const ShopService = {
	getDinozFromDinozShop(): Promise<Array<DinozShop>> {
		return http()
			.get(`/shop/dinoz`)
			.then(res => {
				return Promise.resolve(res.data);
			})
			.catch(err => {
				return Promise.reject(err);
			});
	}
};
