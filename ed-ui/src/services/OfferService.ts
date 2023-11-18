import { http } from '../utils/index.js';
import { Offer } from '@drpg/core/returnTypes/Offer';

export const OfferService = {
	getList(filter: string, sellerId: number | null = null, bidderId: number | null = null) {
		return http()
			.get(`/offer/list/${filter}`, {
				params: {
					sellerId,
					bidderId
				}
			})
			.then(res => Promise.resolve<Offer[]>(res.data))
			.catch(err => Promise.reject(err));
	},
	createOffer(
		total: number,
		ingredients: { name: string; count: number }[],
		items: { name: string; count: number }[],
		dinoz?: number
	) {
		return http()
			.put('/offer', {
				dinoz,
				total,
				ingredients,
				items
			})
			.then(() => Promise.resolve())
			.catch(err => Promise.reject(err));
	},
	cancelOffer(offerId: number) {
		return http()
			.delete(`/offer/${offerId}`)
			.then(() => Promise.resolve())
			.catch(err => Promise.reject(err));
	}
};
