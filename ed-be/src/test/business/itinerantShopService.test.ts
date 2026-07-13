import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({ addMoney: vi.fn(), auth: vi.fn() }));
vi.mock('../../dao/playerIngredientDao.js', () => ({
	decreaseIngredientQuantity: vi.fn(),
	getAllIngredientsDataRequest: vi.fn()
}));
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

import { addMoney, auth } from '../../dao/playerDao.js';
import { decreaseIngredientQuantity, getAllIngredientsDataRequest } from '../../dao/playerIngredientDao.js';
import { getDinozItinerantShop } from '../../dao/dinozDao.js';
import { getSpecificSecret } from '../../dao/secretDao.js';
import { ShopType } from '@drpg/core/models/enums/ShopType';
import { getIngredientsFromItinerantShop, sellIngredient } from '../../business/itinerantShopService.js';

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
		dinoz: [{ placeId: 5 }],
		ingredients: [{ ingredientId: 1, quantity: 10 }]
	} as never);
});

describe('getIngredientsFromItinerantShop', () => {
	it('returns the shop ingredients', async () => {
		const result = await getIngredientsFromItinerantShop(req({ dinozId: '1' }));
		expect(result[0].ingredientId).toBe(1);
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
	it('sells ingredients and credits gold', async () => {
		vi.mocked(getAllIngredientsDataRequest).mockResolvedValue({
			ingredients: [{ ingredientId: 1, quantity: 10 }]
		} as never);
		const result = await sellIngredient(req({ dinozId: '1' }, { ingredients: [{ itemId: 1, quantity: 2 }] }));
		expect(decreaseIngredientQuantity).toHaveBeenCalled();
		expect(addMoney).toHaveBeenCalledWith('p1', 20);
		expect(result.gold).toBe(20);
	});
	it('throws on negative quantity', async () => {
		vi.mocked(getAllIngredientsDataRequest).mockResolvedValue({ ingredients: [] } as never);
		await expect(sellIngredient(req({ dinozId: '1' }, { ingredients: [{ itemId: 1, quantity: 0 }] }))).rejects.toThrow(
			'wrongQuantity'
		);
	});
	it('throws when player has no ingredients data', async () => {
		vi.mocked(getAllIngredientsDataRequest).mockResolvedValue(null as never);
		await expect(sellIngredient(req({ dinozId: '1' }, { ingredients: [{ itemId: 1, quantity: 1 }] }))).rejects.toThrow(
			"doesn't exist"
		);
	});
});
