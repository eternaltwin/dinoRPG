import { http } from '@/utils';
import { IngredientFiche } from '@/models';

export const IngredientsService = {
	getAllIngredients(): Promise<Array<IngredientFiche>> {
		return http()
			.get(`/ingredients/all`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
