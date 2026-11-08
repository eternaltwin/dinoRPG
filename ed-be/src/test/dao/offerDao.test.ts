import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfferStatus, UnavailableReason } from '@drpg/prisma';
import { Item, itemList } from '@drpg/core/models/item/ItemList';

const tx = {
	$queryRaw: vi.fn(),
	offerBid: { findFirst: vi.fn(), create: vi.fn() },
	offer: { update: vi.fn(), updateMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
	offerItem: { deleteMany: vi.fn() },
	dinoz: { updateMany: vi.fn() },
	player: { findUniqueOrThrow: vi.fn() }
};

vi.mock('../../prisma.js', () => ({
	prisma: {
		$transaction: vi.fn((fn: (client: unknown) => unknown) => fn(tx)),
		offer: { updateMany: vi.fn() }
	}
}));
vi.mock('../../context.js', () => ({ GLOBAL: { config: { isProduction: false } } }));
vi.mock('../../dao/playerItemDao.js', () => ({ consumeItem: vi.fn(), increaseItemQuantity: vi.fn() }));
vi.mock('../../dao/playerIngredientDao.js', () => ({
	consumeIngredient: vi.fn(),
	increaseIngredientQuantity: vi.fn()
}));

import { prisma } from '../../prisma.js';
import { consumeItem, increaseItemQuantity } from '../../dao/playerItemDao.js';
import { cancelOngoingOffer, createOfferWithStock, endOngoingOffer, placeBid } from '../../dao/offerDao.js';

const COUPON = itemList[Item.TREASURE_COUPON].itemId;
const future = () => new Date(Date.now() + 60_000);

beforeEach(() => {
	vi.clearAllMocks();
	tx.$queryRaw.mockResolvedValue([
		{ id: 5, status: OfferStatus.ONGOING, endDate: future(), total: 1000, sellerId: 'seller' }
	]);
	tx.offerBid.findFirst.mockResolvedValue({ userId: 'previous', value: 3 });
	vi.mocked(consumeItem).mockResolvedValue(true);
});

describe('placeBid', () => {
	it('repays the leading bidder, takes the coupons and extends the offer', async () => {
		const result = await placeBid(5, { id: 'bidder', name: 'Bob' }, 4);
		expect(result).toHaveProperty('endDate');
		expect(increaseItemQuantity).toHaveBeenCalledWith('previous', COUPON, 3, tx);
		expect(consumeItem).toHaveBeenCalledWith('bidder', COUPON, 4, tx);
		expect(tx.offerBid.create).toHaveBeenCalled();
	});

	it('creates no bid when the coupons were spent meanwhile (the repayment is rolled back with it)', async () => {
		vi.mocked(consumeItem).mockResolvedValue(false);
		expect(await placeBid(5, { id: 'bidder', name: 'Bob' }, 4)).toEqual({ refused: 'notEnoughTickets' });
		expect(tx.offerBid.create).not.toHaveBeenCalled();
	});

	it('compares with the bid that leads under the lock, not the one read before', async () => {
		tx.offerBid.findFirst.mockResolvedValue({ userId: 'faster', value: 10 });
		expect(await placeBid(5, { id: 'bidder', name: 'Bob' }, 4)).toEqual({ refused: 'bidIsLower' });
		expect(consumeItem).not.toHaveBeenCalled();
	});

	it('refuses an offer that ended, or the seller bidding on it', async () => {
		tx.$queryRaw.mockResolvedValue([{ id: 5, status: OfferStatus.ENDED, endDate: future(), total: 1, sellerId: 's' }]);
		expect(await placeBid(5, { id: 'bidder', name: 'Bob' }, 4)).toEqual({ refused: 'invalidOffer' });
		tx.$queryRaw.mockResolvedValue([
			{ id: 5, status: OfferStatus.ONGOING, endDate: future(), total: 1, sellerId: 'b' }
		]);
		expect(await placeBid(5, { id: 'b', name: 'Bob' }, 4)).toEqual({ refused: 'invalidOffer' });
	});
});

describe('createOfferWithStock', () => {
	it('creates no offer when an item is missing at write time', async () => {
		vi.mocked(consumeItem).mockResolvedValue(false);
		const result = await createOfferWithStock(null, 1000, [{ itemId: 9, quantity: 2, isIngredient: false }], 'p1');
		expect(result).toEqual({ refused: 'notEnoughItems' });
		expect(tx.offer.create).not.toHaveBeenCalled();
	});

	it('creates no offer when the dinoz is no longer available', async () => {
		tx.dinoz.updateMany.mockResolvedValue({ count: 0 });
		const result = await createOfferWithStock(7, 1000, [], 'p1');
		expect(result).toEqual({ refused: 'error.dinozNotAvailable' });
		expect(tx.dinoz.updateMany).toHaveBeenCalledWith({
			where: { id: 7, playerId: 'p1', unavailableReason: null },
			data: { unavailableReason: UnavailableReason.selling }
		});
		expect(tx.offer.create).not.toHaveBeenCalled();
	});
});

describe('cancelOngoingOffer', () => {
	const offer = { id: 5, dinozId: null, items: [{ itemId: 9, quantity: 1, isIngredient: false }] };

	it('gives nothing back when the offer is no longer ongoing without bid', async () => {
		tx.offer.updateMany.mockResolvedValue({ count: 0 });
		expect(await cancelOngoingOffer(offer, 'p1')).toBe(false);
		expect(increaseItemQuantity).not.toHaveBeenCalled();
		expect(tx.offer.delete).not.toHaveBeenCalled();
	});

	it('gives the content back once', async () => {
		tx.offer.updateMany.mockResolvedValue({ count: 1 });
		expect(await cancelOngoingOffer(offer, 'p1')).toBe(true);
		expect(tx.offer.updateMany).toHaveBeenCalledWith({
			where: { id: 5, sellerId: 'p1', status: OfferStatus.ONGOING, bids: { none: {} } },
			data: { status: OfferStatus.CLAIMED }
		});
		expect(increaseItemQuantity).toHaveBeenCalledWith('p1', 9, 1, tx);
	});
});

describe('endOngoingOffer', () => {
	it('ends the offer only once', async () => {
		vi.mocked(prisma.offer.updateMany).mockResolvedValueOnce({ count: 1 } as never);
		vi.mocked(prisma.offer.updateMany).mockResolvedValueOnce({ count: 0 } as never);
		expect(await endOngoingOffer(5)).toBe(true);
		expect(await endOngoingOffer(5)).toBe(false);
	});
});
