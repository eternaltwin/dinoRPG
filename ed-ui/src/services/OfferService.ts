import { ClaimOfferData } from '@drpg/core/returnTypes/Offer';
import { http } from '../utils/index.js';
import { Player } from '@drpg/prisma';

export const OfferService = {
	async getList(
		filter: string,
		sellerId: Player['id'] | null = null,
		bidderId: Player['id'] | null = null,
		expired: boolean = false,
		page: number = 1,
		onlyMines: boolean = false
	) {
		const res = await http().get(`/offer/list/${filter}`, {
			params: {
				sellerId,
				bidderId,
				expired,
				page,
				onlyMines
			}
		});
		return res.data;
	},
	async createOffer(
		total: number,
		ingredients: { name: string; count: number }[],
		items: { name: string; count: number }[],
		dinoz?: number
	) {
		const res = await http().put('/offer', {
			dinoz,
			total,
			ingredients,
			items
		});
		return res.data;
	},
	async cancelOffer(offerId: number) {
		const res = await http().delete(`/offer/${offerId}`);
		return res.data;
	},
	async bidOffer(offerId: number, value: number) {
		const res = await http().post(`/offer/${offerId}/bid`, {
			value
		});
		return res.data;
	},
	async claimOffer(offerId: number): Promise<ClaimOfferData> {
		const res = await http().post(`/offer/${offerId}/claim`);
		return res.data;
	}
};
