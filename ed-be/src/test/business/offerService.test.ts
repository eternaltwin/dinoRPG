import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';
import { OfferStatus, UnavailableReason } from '@drpg/prisma';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';

vi.mock('../../dao/offerDao.js', () => ({
	addBid: vi.fn(),
	deleteOffer: vi.fn(),
	extendTimer: vi.fn(),
	getEndedOffers: vi.fn(),
	getEndedOffersType: vi.fn(),
	getOffer: vi.fn(),
	getOffers: vi.fn(),
	getOngoingOffers: vi.fn(),
	insertOffer: vi.fn(),
	prepareRefund: vi.fn(),
	updateOfferDinoz: vi.fn(),
	updateOfferStatus: vi.fn()
}));
vi.mock('../../dao/dinozDao.js', () => ({
	getDinozEquipItemRequest: vi.fn(),
	getDinozPlace: vi.fn(),
	getDinozPlaces: vi.fn(),
	isDinozInTournament: vi.fn(),
	isDinozSelling: vi.fn(),
	updateDinoz: vi.fn()
}));
vi.mock('../../dao/playerItemDao.js', () => ({
	decreaseItemQuantity: vi.fn(),
	getPlayerItems: vi.fn(),
	increaseItemQuantity: vi.fn()
}));
vi.mock('../../dao/playerIngredientDao.js', () => ({
	decreaseIngredientQuantity: vi.fn(),
	getAllIngredientsDataRequest: vi.fn(),
	increaseIngredientQuantity: vi.fn()
}));
vi.mock('../../dao/playerDao.js', () => ({
	addMoney: vi.fn(),
	auth: vi.fn(),
	getPlayerDiscoveredSkills: vi.fn(),
	ownsDinoz: vi.fn(),
	setPlayer: vi.fn()
}));
vi.mock('../../dao/rankingDao.js', () => ({ updateDinozCount: vi.fn(), updatePoints: vi.fn() }));
vi.mock('../../dao/trackingDao.js', () => ({ setSpecificStat: vi.fn() }));
vi.mock('../../dao/logDao.js', () => ({ createLog: vi.fn() }));
vi.mock('../../dao/notificationDao.js', () => ({ createNotification: vi.fn() }));
vi.mock('../../business/skillService.js', () => ({ computeUSkillsForPlayer: vi.fn() }));
vi.mock('../../context.js', () => ({ LOGGER: { log: vi.fn(), error: vi.fn() }, GLOBAL: { config: {} } }));
vi.mock('../../utils/server/translate.js', () => ({ default: (k: string) => k }));
vi.mock('node-schedule', () => {
	const job = { cancel: vi.fn(), schedule: vi.fn() };
	return { scheduleJob: vi.fn(), scheduledJobs: new Proxy({}, { get: () => job }) };
});

import * as offerDao from '../../dao/offerDao.js';
import * as dinozDao from '../../dao/dinozDao.js';
import * as playerItemDao from '../../dao/playerItemDao.js';
import { getAllIngredientsDataRequest } from '../../dao/playerIngredientDao.js';
import * as playerDao from '../../dao/playerDao.js';
import { createNotification } from '../../dao/notificationDao.js';
import { scheduleJob } from 'node-schedule';
import {
	getOfferList,
	createOffer,
	cancelOffer,
	bidOffer,
	expireOffer,
	claimOffer,
	checkRefund,
	scheduleOffersExpiration,
	scheduleEndedOffersExpiration,
	refundEndedOffers
} from '../../business/offerService.js';

const req = (params = {}, body = {}, query = {}) => makeRequest({ params, body, query });
const atMarket = () => ({ dinoz: [{ placeId: PlaceEnum.PLACE_DU_MARCHE }] });

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(playerDao.auth).mockResolvedValue({ id: 'p1', name: 'Bob' } as never);
	vi.mocked(dinozDao.getDinozPlaces).mockResolvedValue(atMarket() as never);
});

describe('getOfferList', () => {
	it('returns offers', async () => {
		vi.mocked(offerDao.getOffers).mockResolvedValue({ offers: [{ id: 1, bids: [], status: OfferStatus.ONGOING }], total: 1 } as never);
		const result = await getOfferList(req({ filter: 'all' }));
		expect(result.total).toBe(1);
	});
	it('filters onlyMines ended offers and parses expired dinoz', async () => {
		vi.mocked(offerDao.getOffers).mockResolvedValue({
			offers: [
				{ id: 1, sellerId: 'p1', bids: [], status: OfferStatus.ENDED, dinozDetails: JSON.stringify({ id: 9 }) },
				{ id: 2, sellerId: 'x', bids: [{ user: { id: 'p1' } }], status: OfferStatus.ENDED, dinozDetails: null }
			],
			total: 2
		} as never);
		const result = await getOfferList(req({ filter: 'all' }, {}, { onlyMines: 'true', expired: 'true', page: '1' }));
		expect(result.offers.length).toBe(2);
	});
	it('throws when no dinoz at market', async () => {
		vi.mocked(dinozDao.getDinozPlaces).mockResolvedValue({ dinoz: [{ placeId: 1 }] } as never);
		await expect(getOfferList(req({ filter: 'all' }))).rejects.toThrow('noDinozAtMarket');
	});
});

describe('createOffer', () => {
	beforeEach(() => {
		vi.mocked(offerDao.getOffers).mockResolvedValue({ offers: [] } as never);
		vi.mocked(playerItemDao.getPlayerItems).mockResolvedValue([{ itemId: 9, quantity: 10 }] as never);
		vi.mocked(getAllIngredientsDataRequest).mockResolvedValue({ ingredients: [{ ingredientId: 1, quantity: 10 }] } as never);
		vi.mocked(offerDao.insertOffer).mockResolvedValue({ id: 5, total: 1000, endDate: new Date() } as never);
	});
	it('creates an offer with items and ingredients', async () => {
		await createOffer(
			req({}, { total: 1000, ingredients: [{ name: 'merou_lujidane', count: 1 }], items: [{ name: 'pampleboum', count: 1 }] })
		);
		expect(offerDao.insertOffer).toHaveBeenCalled();
		expect(scheduleJob).toHaveBeenCalled();
	});
	it('creates an offer with a dinoz', async () => {
		vi.mocked(playerDao.ownsDinoz).mockResolvedValue(true as never);
		vi.mocked(dinozDao.getDinozPlace).mockResolvedValue({ placeId: PlaceEnum.PLACE_DU_MARCHE } as never);
		vi.mocked(dinozDao.getDinozEquipItemRequest).mockResolvedValue({ items: [] } as never);
		vi.mocked(dinozDao.isDinozInTournament).mockResolvedValue(false as never);
		vi.mocked(dinozDao.isDinozSelling).mockResolvedValue(false as never);
		await createOffer(req({}, { dinoz: '7', total: 1000, ingredients: [], items: [] }));
		expect(dinozDao.updateDinoz).toHaveBeenCalledWith(7, { unavailableReason: UnavailableReason.selling });
	});
	it('throws when already has an offer', async () => {
		vi.mocked(offerDao.getOffers).mockResolvedValue({ offers: [{ id: 1 }] } as never);
		await expect(createOffer(req({}, { total: 1, ingredients: [], items: [] }))).rejects.toThrow('alreadyOffer');
	});
	it('throws when ingredient not found', async () => {
		await expect(
			createOffer(req({}, { total: 1, ingredients: [{ name: 'nope', count: 1 }], items: [] }))
		).rejects.toThrow('Ingredient not found');
	});
	it('throws when not enough items', async () => {
		vi.mocked(playerItemDao.getPlayerItems).mockResolvedValue([] as never);
		await expect(
			createOffer(req({}, { total: 1, ingredients: [], items: [{ name: 'pampleboum', count: 5 }] }))
		).rejects.toThrow('notEnoughItems');
	});
});

describe('cancelOffer', () => {
	beforeEach(() => {
		vi.mocked(offerDao.prepareRefund).mockResolvedValue({
			leader: false, messie: false, _count: { dinoz: 0 }, shopKeeper: false, ingredients: [], items: []
		} as never);
	});
	it('cancels an ongoing offer with no bids', async () => {
		vi.mocked(offerDao.getOffer).mockResolvedValue({
			seller: { id: 'p1' }, status: OfferStatus.ONGOING, bids: [], dinoz: null, items: []
		} as never);
		await cancelOffer(req({ offerId: '5' }));
		expect(offerDao.deleteOffer).toHaveBeenCalledWith(5);
	});
	it('throws when not the seller', async () => {
		vi.mocked(offerDao.getOffer).mockResolvedValue({ seller: { id: 'x' }, status: OfferStatus.ONGOING, bids: [], items: [] } as never);
		await expect(cancelOffer(req({ offerId: '5' }))).rejects.toThrow('invalidOffer');
	});
	it('throws when bids exist', async () => {
		vi.mocked(offerDao.getOffer).mockResolvedValue({ seller: { id: 'p1' }, status: OfferStatus.ONGOING, bids: [{ value: 1 }], items: [] } as never);
		await expect(cancelOffer(req({ offerId: '5' }))).rejects.toThrow('offerInProgress');
	});
});

describe('bidOffer', () => {
	beforeEach(() => {
		vi.mocked(offerDao.getOffer).mockResolvedValue({ id: 5, seller: { id: 'x' }, status: OfferStatus.ONGOING, total: 1000, bids: [] } as never);
		vi.mocked(playerItemDao.getPlayerItems).mockResolvedValue([{ quantity: 100 }] as never);
		vi.mocked(offerDao.extendTimer).mockResolvedValue({ endDate: new Date() } as never);
	});
	it('places a bid', async () => {
		await bidOffer(req({ offerId: '5' }, { value: 5 }));
		expect(offerDao.addBid).toHaveBeenCalled();
	});
	it('throws when bidding own offer', async () => {
		vi.mocked(offerDao.getOffer).mockResolvedValue({ seller: { id: 'p1' }, status: OfferStatus.ONGOING, total: 1000, bids: [] } as never);
		await expect(bidOffer(req({ offerId: '5' }, { value: 5 }))).rejects.toThrow('invalidOffer');
	});
	it('throws when bid below minimum', async () => {
		await expect(bidOffer(req({ offerId: '5' }, { value: 0 }))).rejects.toThrow('bidIsLower');
	});
	it('throws when not enough tickets', async () => {
		vi.mocked(playerItemDao.getPlayerItems).mockResolvedValue([{ quantity: 0 }] as never);
		await expect(bidOffer(req({ offerId: '5' }, { value: 5 }))).rejects.toThrow('notEnoughTickets');
	});
});

describe('expireOffer', () => {
	it('awards the winner', async () => {
		vi.mocked(offerDao.getOffer).mockResolvedValue({
			id: 5, seller: { id: 's' }, bids: [{ userId: 'w', value: 10 }], dinoz: null
		} as never);
		await expireOffer(5);
		expect(createNotification).toHaveBeenCalled();
		expect(playerDao.addMoney).toHaveBeenCalledWith('s', 10000);
	});
	it('notifies seller when no bids', async () => {
		vi.mocked(offerDao.getOffer).mockResolvedValue({ id: 5, seller: { id: 's' }, bids: [], dinoz: { id: 9 } } as never);
		await expireOffer(5);
		expect(createNotification).toHaveBeenCalled();
	});
	it('throws when offer missing', async () => {
		vi.mocked(offerDao.getOffer).mockResolvedValue(null as never);
		await expect(expireOffer(5)).rejects.toThrow('Offer not found');
	});
});

describe('claimOffer', () => {
	beforeEach(() => {
		vi.mocked(offerDao.prepareRefund).mockResolvedValue({
			leader: false, messie: false, _count: { dinoz: 0 }, shopKeeper: false, ingredients: [], items: []
		} as never);
	});
	it('throws when offer missing', async () => {
		vi.mocked(offerDao.getOffer).mockResolvedValue(null as never);
		await expect(claimOffer(req({ offerId: '5' }))).rejects.toThrow('Offer not found');
	});
	it('transfers a dinoz to the winner', async () => {
		vi.mocked(offerDao.getOffer).mockResolvedValue({
			sellerId: 's', seller: { id: 's' }, items: [], bids: [{ userId: 'w', value: 10 }],
			dinoz: { id: 9, level: 5, skills: [{ skillId: 1 }] }
		} as never);
		vi.mocked(playerDao.getPlayerDiscoveredSkills).mockResolvedValue({ discoveredSkills: [] } as never);
		const result = await claimOffer(req({ offerId: '5' }));
		expect(result.discoveredSkills).toContain(1);
	});
	it('refunds the seller when no bids', async () => {
		vi.mocked(offerDao.getOffer).mockResolvedValue({
			sellerId: 's', seller: { id: 's' }, items: [], bids: [], dinoz: { id: 9 }
		} as never);
		await claimOffer(req({ offerId: '5' }));
		expect(offerDao.updateOfferStatus).toHaveBeenCalledWith(5, OfferStatus.CLAIMED);
	});
});

describe('checkRefund', () => {
	it('returns true when there is room', async () => {
		vi.mocked(offerDao.prepareRefund).mockResolvedValue({
			leader: false, messie: false, _count: { dinoz: 0 }, shopKeeper: false, ingredients: [], items: []
		} as never);
		expect(await checkRefund('p1', [], [], null, 5)).toBe(true);
	});
	it('returns tooMuchDinoz when over the dinoz limit', async () => {
		vi.mocked(offerDao.prepareRefund).mockResolvedValue({
			leader: false, messie: false, _count: { dinoz: 9999 }, shopKeeper: false, ingredients: [], items: []
		} as never);
		expect(await checkRefund('p1', [], [], { playerId: 'x' }, 5)).toBe('tooMuchDinoz');
	});
	it('returns tooMuchIngredient when an ingredient would overflow', async () => {
		vi.mocked(offerDao.prepareRefund).mockResolvedValue({
			leader: false, messie: false, _count: { dinoz: 0 }, shopKeeper: false,
			ingredients: [{ ingredientId: 1, quantity: 49 }], items: []
		} as never);
		const result = await checkRefund('p1', [{ itemId: 1, quantity: 5, isIngredient: true }], [], null, 5);
		expect(result).toBe('tooMuchIngredient');
	});
	it('returns tooMuchItem when an item would overflow', async () => {
		vi.mocked(offerDao.prepareRefund).mockResolvedValue({
			leader: false, messie: false, _count: { dinoz: 0 }, shopKeeper: false,
			ingredients: [], items: [{ itemId: 9, quantity: 19 }]
		} as never);
		const result = await checkRefund('p1', [], [{ itemId: 9, quantity: 5, isIngredient: false }], null, 5);
		expect(result).toBe('tooMuchItem');
	});
});

describe('scheduling helpers', () => {
	it('scheduleOffersExpiration expires past and schedules future', async () => {
		vi.mocked(offerDao.getOffer).mockResolvedValue({ id: 1, seller: { id: 's' }, bids: [], dinoz: null } as never);
		vi.mocked(offerDao.getOngoingOffers).mockResolvedValue([
			{ id: 1, endDate: new Date(Date.now() - 1000) },
			{ id: 2, endDate: new Date(Date.now() + 100000000) }
		] as never);
		await scheduleOffersExpiration();
		expect(scheduleJob).toHaveBeenCalled();
	});
	it('scheduleEndedOffersExpiration refunds old and schedules others', async () => {
		vi.mocked(offerDao.getEndedOffers).mockResolvedValue([
			{ id: 1, endDate: new Date(Date.now() - 14 * 24 * 3600 * 1000), items: [], bids: [], sellerId: 's', dinozId: null },
			{ id: 2, endDate: new Date(Date.now() + 14 * 24 * 3600 * 1000), items: [], bids: [] }
		] as never);
		await scheduleEndedOffersExpiration();
		expect(scheduleJob).toHaveBeenCalled();
	});
	it('refundEndedOffers refunds seller and bidder', async () => {
		await refundEndedOffers({
			id: 1, sellerId: 's', dinozId: 9, endDate: new Date(),
			items: [{ itemId: 9, quantity: 1, isIngredient: false }],
			bids: [{ userId: 'w', value: 5 }]
		} as never);
		expect(offerDao.deleteOffer).toHaveBeenCalledWith(1);
	});
});
