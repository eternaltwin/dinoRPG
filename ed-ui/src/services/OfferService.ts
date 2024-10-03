import { http } from '../utils/index.js';
import { Offer } from '@drpg/core/returnTypes/Offer';

export const OfferService = {
	getList(
		filter: string,
		sellerId: number | null = null,
		bidderId: number | null = null,
		expired: boolean = false,
		page: number
	) {
		return http()
			.get(`/offer/list/${filter}`, {
				params: {
					sellerId,
					bidderId,
					expired,
					page
				}
			})
			.then(res => Promise.resolve<Offer[]>(res.data))
			.catch(err => Promise.reject(err));
	},
	getTotal(): Promise<string> {
		return http()
			.get('/offer/getTotal')
			.then(res => Promise.resolve(res.data))
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
	},
	bidOffer(offerId: number, value: number) {
		return http()
			.post(`/offer/${offerId}/bid`, {
				value
			})
			.then(() => Promise.resolve())
			.catch(err => Promise.reject(err));
	}
};
