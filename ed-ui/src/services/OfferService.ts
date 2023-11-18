import { http } from '../utils/index.js';
import { Offer } from '@drpg/core/returnTypes/Offer';

export const OfferService = {
	getList(filter: string): Promise<Offer[]> {
		return http()
			.get(`/offer/list/${filter}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
