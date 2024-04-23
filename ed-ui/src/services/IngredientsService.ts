import { http } from '../utils/index.js';
import { IngredientFiche } from '@drpg/core/models/ingredient/IngredientFiche';
import { ShopDTO } from '@drpg/core/models/shop/shopDTO';

export const IngredientsService = {
	getAllIngredients(): Promise<Array<IngredientFiche>> {
		return http()
			.get(`/ingredients/all`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getIngredientsFromIngredientsShop(dinozId: number): Promise<Array<IngredientFiche>> {
		return http()
			.get(`/shop/getItinerantShop/${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	sellIngredient(dinozId: number, ingredients: ShopDTO[]): Promise<{ gold: number }> {
		return http()
			.put(`/shop/sellIngredient/${dinozId}`, {
				ingredients: ingredients
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
