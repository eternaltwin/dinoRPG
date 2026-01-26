import { http } from '../utils/index.js';
import { IngredientFiche } from '@drpg/core/models/ingredient/IngredientFiche';
import { ShopDTO } from '@drpg/core/models/shop/shopDTO';

export const IngredientsService = {
	async getAllIngredients(): Promise<Array<IngredientFiche>> {
		const res = await http().get(`/ingredients/all`);
		return res.data;
	},
	async getIngredientsFromIngredientsShop(dinozId: number): Promise<Array<IngredientFiche>> {
		const res = await http().get(`/shop/getItinerantShop/${dinozId}`);
		return res.data;
	},
	async sellIngredient(dinozId: number, ingredients: ShopDTO[]): Promise<{ gold: number }> {
		const res = await http().put(`/shop/sellIngredient/${dinozId}`, {
			ingredients: ingredients
		});
		return res.data;
	}
};
