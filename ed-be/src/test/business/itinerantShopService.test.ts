import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/playerIngredientDao.js', () => ({ sellIngredients: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({ getDinozItinerantShop: vi.fn() }));
vi.mock('../../dao/secretDao.js', () => ({ getSpecificSecret: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('@drpg/core/utils/checkCondition', () => ({ checkCondition: vi.fn().mockReturnValue(true) }));

let shopFixture: unknown;
vi.mock('@drpg/core/models/shop/ShopList', () => ({
	get shopList() {
		return shopFixture;
	}
}));

import { auth } from '../../dao/playerDao.js';
import { sellIngredients } from '../../dao/playerIngredientDao.js';
import { getDinozItinerantShop } from '../../dao/dinozDao.js';
import { getSpecificSecret } from '../../dao/secretDao.js';
import { ShopType } from '@drpg/core/models/enums/ShopType';
import { getIngredientsFromItinerantShop, sellIngredient } from '../../business/itinerantShopService.js';
import { Ingredient, ingredientList } from '@drpg/core/models/ingredient/ingredientList';

const req = (params = {}, body = {}) => makeRequest({ params, body });

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(auth).mockResolvedValue({ id: 'p1' } as never);
	// Ingredient id 1 exists in ingredientList with a price.
	shopFixture = {
		ITIN: { type: ShopType.ITINERANT, condition: {}, listItemsSold: [{ id: 1, price: 10 }] }
	};
	vi.mocked(getSpecificSecret).mockResolvedValue({ value: '5' } as never);
	vi.mocked(getDinozItinerantShop).mockResolvedValue({
		shopkeeper: false,
		dinoz: [{ placeId: 5 }],
		ingredients: [{ ingredientId: 1, quantity: 10 }]
	} as never);
});

describe('getIngredientsFromItinerantShop', () => {
	it('returns the shop ingredients', async () => {
		const result = await getIngredientsFromItinerantShop(req({ dinozId: '1' }));
		expect(result[0].ingredientId).toBe(1);
	});
	it('returns the shop ingredients with correct max quantity if player has shopkeeper', async () => {
		vi.mocked(getDinozItinerantShop).mockResolvedValue({
			shopKeeper: true,
			dinoz: [{ placeId: 5 }],
			ingredients: [{ ingredientId: Ingredient.MEROU_LUJIDANE, quantity: 10 }]
		} as never);
		const result = await getIngredientsFromItinerantShop(req({ dinozId: '1' }));
		expect(result[0].maxQuantity).toBe(Math.round(ingredientList[Ingredient.MEROU_LUJIDANE].maxQuantity * 1.5));
	});
	it('throws when player missing', async () => {
		vi.mocked(getDinozItinerantShop).mockResolvedValue(null as never);
		await expect(getIngredientsFromItinerantShop(req({ dinozId: '1' }))).rejects.toThrow("doesn't exist");
	});
	it('throws when no itinerant secret', async () => {
		vi.mocked(getSpecificSecret).mockResolvedValue(null as never);
		await expect(getIngredientsFromItinerantShop(req({ dinozId: '1' }))).rejects.toThrow('itinerant merchant');
	});
	it('throws when dinoz not at the shop place', async () => {
		vi.mocked(getDinozItinerantShop).mockResolvedValue({ dinoz: [{ placeId: 99 }], ingredients: [] } as never);
		await expect(getIngredientsFromItinerantShop(req({ dinozId: '1' }))).rejects.toThrow('cannot access');
	});
});

describe('sellIngredient', () => {
	it('sells ingredients and credits gold in one transaction', async () => {
		vi.mocked(sellIngredients).mockResolvedValue(true);
		const result = await sellIngredient(req({ dinozId: '1' }, { ingredients: [{ itemId: 1, quantity: 2 }] }));
		expect(sellIngredients).toHaveBeenCalledWith('p1', [{ ingredientId: 1, quantity: 2 }], 20);
		expect(result.gold).toBe(20);
	});
	it('pays a repeated line once, against the whole stock', async () => {
		vi.mocked(sellIngredients).mockResolvedValue(true);
		await expect(
			sellIngredient(
				req(
					{ dinozId: '1' },
					{
						ingredients: [
							{ itemId: 1, quantity: 6 },
							{ itemId: 1, quantity: 6 }
						]
					}
				)
			)
		).rejects.toThrow('less than 0');
		expect(sellIngredients).not.toHaveBeenCalled();
	});
	it('credits nothing when the ingredients were spent meanwhile', async () => {
		vi.mocked(sellIngredients).mockResolvedValue(false);
		await expect(sellIngredient(req({ dinozId: '1' }, { ingredients: [{ itemId: 1, quantity: 2 }] }))).rejects.toThrow(
			'less than 0'
		);
	});
	it.each([
		['zero', 0],
		['string', '2'],
		['fractional', 0.5]
	])('throws on a %s quantity', async (_label, quantity) => {
		await expect(sellIngredient(req({ dinozId: '1' }, { ingredients: [{ itemId: 1, quantity }] }))).rejects.toThrow(
			'wrongQuantity'
		);
		expect(sellIngredients).not.toHaveBeenCalled();
	});
});
