import { http } from '../utils/index.js';
import { Offer } from '@drpg/core/returnTypes/Offer';

export const OfferService = {
	getList(filter: string): Promise<Offer[]> {
		return http()
			.get(`/offer/list/${filter}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	createOffer(
		total: number,
		ingredients: { name: string; count: number }[],
		items: { name: string; count: number }[],
		dinoz?: number
	): Promise<void> {
		return http()
			.put('/offer', {
				dinoz,
				total,
				ingredients,
				items
			})
			.then(() => Promise.resolve())
			.catch(err => Promise.reject(err));
	}
};
