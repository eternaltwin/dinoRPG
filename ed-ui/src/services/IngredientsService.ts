import { http } from '../utils/index.js';
import { IngredientFiche } from '@drpg/core/models/ingredient/IngredientFiche';

export const IngredientsService = {
	getAllIngredients(): Promise<Array<IngredientFiche>> {
		return http()
			.get(`/ingredients/all`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};

export const IngredientShopService = {
	getIngredientsFromIngredientsShop(itinerantId: number): Promise<Array<IngredientFiche>> {
		return http()
			.get(`/shop/getItinerantShop/${itinerantId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	sellIngredient(itinerantId: number, ingredientId: number, quantity: number): Promise<void> {
		return http()
			.put(`/shop/sellIngredient/${itinerantId}`, {
				ingredientId: ingredientId,
				quantity: quantity
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};