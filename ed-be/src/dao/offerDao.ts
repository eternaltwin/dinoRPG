import { Offer } from '@drpg/core/returnTypes/Offer';

// const offerRepository = AppDataSource.getRepository(Offer);

export async function getOfferListData(filter?: string) {
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
				{ id: 59, quantity: 5 },
				{ id: 24, quantity: 2 },
				{ id: 13, quantity: 1 }
			],
			bid: {
				user: {
					id: 2,
					name: 'test2'
				},
				value: 100
			}
		},
		{
			id: 2,
			seller: {
				id: 1,
				name: 'test'
			},
			endDate: new Date('2023-12-24').toISOString(),
			dinoz: {
				name: 'test'
			},
			items: [
				{ id: 22, quantity: 4 },
				{ id: 17, quantity: 4 },
				{ id: 13, quantity: 3 },
				{ id: 78, quantity: 1 },
				{ id: 60, quantity: 1 }
			],
			bid: null
		},
		{
			id: 3,
			seller: {
				id: 1,
				name: 'test'
			},
			items: [],
			endDate: new Date('2023-12-01').toISOString(),
			dinoz: {
				name: 'test3'
			},
			bid: null
		}
	];

	if (filter === 'all') {
		return mockOffers;
	}

	if (filter === 'dinoz') {
		return mockOffers.filter(offer => offer.dinoz);
	}

	if (filter === 'items') {
		return mockOffers.filter(offer => offer.items.length);
	}

	return mockOffers;
}

export async function insertOffer(
	dinozId: number | null,
	total: number,
	ingredients: { name: string; count: number }[],
	items: { id: number; count: number }[]
) {
	console.log('insertOffer', dinozId, total, ingredients, items);
}
