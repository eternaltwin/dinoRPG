import { LogListResponse } from '@drpg/core/returnTypes/log';
import { LogType } from '@drpg/prisma';
import { http } from '../utils/index.js';

export const LogsService = {
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
	}
};
