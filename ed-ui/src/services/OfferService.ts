import { ClaimOfferData, OfferGetList } from '@drpg/core/returnTypes/Offer';
import { http } from '../utils/index.js';
import { Player } from '@drpg/prisma';

export const OfferService = {
	getList(
		filter: string,
		sellerId: Player['id'] | null = null,
		bidderId: Player['id'] | null = null,
		expired: boolean = false,
		page: number = 1,
		onlyMines: boolean = false
	) {
		return http()
			.get(`/offer/list/${filter}`, {
				params: {
					sellerId,
					bidderId,
					expired,
					page,
					onlyMines
				}
			})
			.then(res => Promise.resolve<OfferGetList>(res.data))
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
	},
	claimOffer(offerId: number) {
		return http()
			.post(`/offer/${offerId}/claim`)
			.then(res => Promise.resolve<ClaimOfferData>(res.data))
			.catch(err => Promise.reject(err));
	}
};
