import { Offer } from '@drpg/core/returnTypes/Offer';

// const offerRepository = AppDataSource.getRepository(Offer);

const mockOffers: Offer[] = [
	{
		id: 1,
		seller: {
			id: 1,
			name: 'test'
		},
		endDate: new Date('2023-12-12').toISOString(),
		dinoz: null,
		items: [
			{ id: 59, quantity: 5, isIngredient: false },
			{ id: 24, quantity: 2, isIngredient: false },
			{ id: 2, quantity: 1, isIngredient: true }
		],
		total: 5900,
		bids: [
			{
				user: {
					id: 2,
					name: 'test2'
				},
				value: 100
			}
		]
	},
	{
		id: 2,
		seller: {
			id: 2,
			name: 'tes2'
		},
		endDate: new Date('2023-12-24').toISOString(),
		dinoz: {
			name: 'test'
		},
		items: [
			{ id: 22, quantity: 4, isIngredient: false },
			{ id: 17, quantity: 4, isIngredient: false },
			{ id: 13, quantity: 3, isIngredient: false },
			{ id: 78, quantity: 1, isIngredient: false },
			{ id: 60, quantity: 1, isIngredient: false },
		],
		total: 7900,
		bids: [
			{
				user: {
					id: 1,
					name: 'test'
				},
				value: 100
			}
		]
	},
	{
		id: 3,
		seller: {
			id: 3,
			name: 'test3'
		},
		items: [],
		endDate: new Date('2023-12-01').toISOString(),
		dinoz: {
			name: 'test3'
		},
		total: 6000,
		bids: []
	},
	{
		id: 4,
		seller: {
			id: 3,
			name: 'test3'
		},
		items: [],
		endDate: new Date('2023-10-01').toISOString(),
		dinoz: {
			name: 'test3'
		},
		total: 5000,
		bids: []
	},
	{
		id: 5,
		seller: {
			id: 2,
			name: 'tes2'
		},
		endDate: new Date('2023-10-08').toISOString(),
		dinoz: {
			name: 'test'
		},
		total: 6000,
		items: [
			{ id: 22, quantity: 4, isIngredient: false },
			{ id: 17, quantity: 4, isIngredient: false },
			{ id: 13, quantity: 3, isIngredient: false },
			{ id: 78, quantity: 1, isIngredient: false },
			{ id: 60, quantity: 1, isIngredient: false },
		],
		bids: [
			{
				user: {
					id: 1,
					name: 'test'
				},
				value: 100
			}
		]
	},
];

export async function getOffers(
	userId: number,
	filter: string,
	sellerId: number | null,
	bidderId: number | null,
	expired: boolean
) {
	let offers = [...mockOffers];

	if (filter === 'dinoz') {
		offers = offers.filter(offer => offer.dinoz);
	} else if (filter === 'items') {
		offers = offers.filter(offer => offer.items.length);
	} else if (filter === 'own') {
		offers = offers.filter(offer => offer.seller.id === userId || offer.bids.find(bid => bid.user.id === userId));
	}

	if (sellerId) {
		offers = offers.filter(offer => offer.seller.id === sellerId);
	}

	if (bidderId) {
		offers = offers.filter(offer => offer.bids.find(bid => bid.user.id === bidderId));
	}

	if (expired) {
		offers = offers.filter(offer => new Date(offer.endDate) < new Date());
	} else {
		offers = offers.filter(offer => new Date(offer.endDate) > new Date());
	}

	return offers;
}

export async function insertOffer(
	dinozId: number | null,
	total: number,
	ingredients: { name: string; count: number }[],
	items: { id: number; count: number }[]
) {
	console.log('insertOffer', dinozId, total, ingredients, items);
	// TODO: Insert offer
}

export async function deleteOffer(offerId: number) {
	console.log('deleteOffer', offerId);
	// TODO: Cancel offer
}

export async function getOffer(offerId: number) {
	console.log('getOffer', offerId);

	return mockOffers.find(offer => offer.id === offerId);
}

export async function addBid(offerId: number, userId: number, value: number) {
	console.log('addBid', offerId, userId, value);
	// TODO: Add bid
}
