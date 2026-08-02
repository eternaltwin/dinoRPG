import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../dao/playerDao.js', () => ({
	auth: vi.fn(),
	getPlayerShopItemsDataRequest: vi.fn(),
	getPlayerShopOneItemDataRequest: vi.fn(),
	removeMoney: vi.fn()
}));
vi.mock('../../dao/playerItemDao.js', () => ({
	decreaseItemQuantity: vi.fn(),
	increaseItemQuantity: vi.fn(),
	insertItem: vi.fn()
}));
vi.mock('../../dao/trackingDao.js', () => ({ setSpecificStat: vi.fn() }));
vi.mock('../../dao/playerIngredientDao.js', () => ({
	decreaseIngredientQuantity: vi.fn(),
	getIngredientsDataRequest: vi.fn()
}));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));

import * as playerDao from '../../dao/playerDao.js';
import * as playerItemDao from '../../dao/playerItemDao.js';
import { getIngredientsDataRequest } from '../../dao/playerIngredientDao.js';
import { getItemsFromShop, buyItem } from '../../business/itemShopService.js';

const req = (params = {}, body = {}) => makeRequest({ params, body });

// FLYING_SHOP (id 1) is accessible anywhere; FORGE_SHOP (id 2) requires a dinoz at place 44; FILOU is id 20.
const playerData = (overrides = {}) => ({
	money: 100000,
	shopKeeper: false,
	merchant: false,
	items: [],
	ingredients: [],
	dinoz: [{ placeId: 44, status: [] }],
	...overrides
});

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(playerDao.auth).mockResolvedValue({ id: 'p1' } as never);
});

describe('getItemsFromShop', () => {
	it('lists items for a valid shop', async () => {
		vi.mocked(playerDao.getPlayerShopItemsDataRequest).mockResolvedValue(playerData() as never);
		const result = await getItemsFromShop(req({ shopId: '1' }));
		expect(result.length).toBeGreaterThan(0);
	});
	it('applies merchant discount in the flying shop', async () => {
		vi.mocked(playerDao.getPlayerShopItemsDataRequest).mockResolvedValue(playerData({ merchant: true }) as never);
		const result = await getItemsFromShop(req({ shopId: '1' }));
		expect(result[0].price).toBeLessThan(900);
	});
	it('throws when shop does not exist', async () => {
		await expect(getItemsFromShop(req({ shopId: '9999' }))).rejects.toThrow('does not exist');
	});
	it('throws when player does not exist', async () => {
		vi.mocked(playerDao.getPlayerShopItemsDataRequest).mockResolvedValue(null as never);
		await expect(getItemsFromShop(req({ shopId: '1' }))).rejects.toThrow("doesn't exist");
	});
	it('throws when no dinoz at a placed shop', async () => {
		vi.mocked(playerDao.getPlayerShopItemsDataRequest).mockResolvedValue(
			playerData({ dinoz: [{ placeId: 1, status: [] }] }) as never
		);
		await expect(getItemsFromShop(req({ shopId: '2' }))).rejects.toThrow('shop');
	});
});

describe('buyItem', () => {
	it('buys a classic item (new entry)', async () => {
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue(playerData() as never);
		const result = await buyItem(req({ shopId: '1' }, { itemId: '3', quantity: '2' }));
		expect(playerDao.removeMoney).toHaveBeenCalled();
		expect(playerItemDao.insertItem).toHaveBeenCalled();
		expect(result.itemId).toBe(3);
	});
	it('buys a classic item (increment existing)', async () => {
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue(
			playerData({ items: [{ itemId: 3, quantity: 1 }] }) as never
		);
		await buyItem(req({ shopId: '1' }, { itemId: '3', quantity: '2' }));
		expect(playerItemDao.increaseItemQuantity).toHaveBeenCalled();
	});
	it('throws on zero quantity', async () => {
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue(playerData() as never);
		await expect(buyItem(req({ shopId: '1' }, { itemId: '3', quantity: '0' }))).rejects.toThrow('wrongQuantity');
	});
	it('throws when player missing', async () => {
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue(null as never);
		await expect(buyItem(req({ shopId: '1' }, { itemId: '3', quantity: '1' }))).rejects.toThrow('playerNotFound');
	});
	it('throws when shop missing', async () => {
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue(playerData() as never);
		await expect(buyItem(req({ shopId: '9999' }, { itemId: '3', quantity: '1' }))).rejects.toThrow('does not exist');
	});
	it('throws when item not sold in shop', async () => {
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue(playerData() as never);
		await expect(buyItem(req({ shopId: '1' }, { itemId: '999', quantity: '1' }))).rejects.toThrow(
			'does not exist in the shop'
		);
	});
	it('throws when not enough money', async () => {
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue(playerData({ money: 0 }) as never);
		await expect(buyItem(req({ shopId: '1' }, { itemId: '3', quantity: '1' }))).rejects.toThrow('notEnoughMoney');
	});
	it('throws when not enough storage', async () => {
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue(
			playerData({ items: [{ itemId: 3, quantity: 299 }] }) as never
		);
		await expect(buyItem(req({ shopId: '1' }, { itemId: '3', quantity: '50' }))).rejects.toThrow('notEnoughStorage');
	});
	it('buys via the FILOU coupon shop', async () => {
		vi.mocked(playerDao.getPlayerShopOneItemDataRequest).mockResolvedValue(
			playerData({ dinoz: [{ placeId: 2, status: [] }] }) as never
		);
		vi.mocked(getIngredientsDataRequest).mockResolvedValue({ quantity: 1000 } as never);
		const result = await buyItem(req({ shopId: '20' }, { itemId: '1', quantity: '2' }));
		expect(result.quantity).toBe(2);
	});
});
