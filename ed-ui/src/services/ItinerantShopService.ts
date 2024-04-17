import { http } from '../utils/index.js';
import { IngredientFiche } from '@drpg/core/models/ingredient/IngredientFiche';
export const IngredientShopService = {
	getIngredientsFromIngredientsShop(itinerantId: number): Promise<Array<IngredientFiche>> {
		return http()
			.get(`/shop/getItinerantShop/${itinerantId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
