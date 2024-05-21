import { LogListResponse } from '@drpg/core/returnTypes/log';
import { LogType } from '@drpg/prisma';
import { http } from '../utils/index.js';

export const LogsService = {
	async listAll(): Promise<LogListResponse> {
		return http()
			.get('/log/list/all')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async list(
		page: number,
		type: LogType | null,
		playerId: number | null,
		dinozId: number | null
	): Promise<LogListResponse> {
		return http()
			.get(`/log/list/${page}/${type}/${playerId}/${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async listByDate(type: LogType | null, fromDate: Date | null, toDate: Date | null): Promise<LogListResponse> {
		return http()
			.get(`/log/list/${type}/${fromDate}/${toDate}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
