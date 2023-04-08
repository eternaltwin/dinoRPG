import { http } from '../utils/index.js';
import { IngredientFiche } from '@drpg/core/dist/models/ingredient/IngredientFiche.mjs';

export const IngredientsService = {
	getAllIngredients(): Promise<Array<IngredientFiche>> {
		return http()
			.get(`/ingredients/all`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
