import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/playerIngredientDao.js', () => ({ getAllIngredientsDataRequest: vi.fn() }));

import { auth } from '../../dao/playerDao.js';
import { getAllIngredientsDataRequest } from '../../dao/playerIngredientDao.js';
import { getAllIngredientsData } from '../../business/ingredientService.js';

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(auth).mockResolvedValue({ id: 'p1' } as never);
});

describe('getAllIngredientsData', () => {
	it('maps player ingredients with shopkeeper bonus', async () => {
		vi.mocked(getAllIngredientsDataRequest).mockResolvedValue({
			shopKeeper: true,
			ingredients: [{ ingredientId: 1, quantity: 5 }]
		} as never);
		const result = await getAllIngredientsData(makeRequest());
		expect(result[0].ingredientId).toBe(1);
		expect(result[0].quantity).toBe(5);
	});
	it('throws when player missing', async () => {
		vi.mocked(getAllIngredientsDataRequest).mockResolvedValue(null as never);
		await expect(getAllIngredientsData(makeRequest())).rejects.toThrow('playerNotFound');
	});
	it('throws when an ingredient is unknown', async () => {
		vi.mocked(getAllIngredientsDataRequest).mockResolvedValue({
			shopKeeper: false,
			ingredients: [{ ingredientId: 999999, quantity: 1 }]
		} as never);
		await expect(getAllIngredientsData(makeRequest())).rejects.toThrow('Ingredient not found');
	});
});
