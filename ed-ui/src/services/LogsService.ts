import { LogListResponse } from '@drpg/core/returnTypes/log';
import { LogType } from '@drpg/prisma';
import { http } from '../utils/index.js';

export const LogsService = {
	listAll(): Promise<LogListResponse> {
		return http()
			.get('/log/list/all')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	list(page: number, type: LogType | null, playerId: string | null, dinozId: number | null): Promise<LogListResponse> {
		return http()
			.get(`/log/list/${page}/${type}/${playerId}/${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	listByDate(type: LogType | null, fromDate: Date | null): Promise<LogListResponse> {
		return http()
			.get(`/log/list/${type}/${fromDate}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
