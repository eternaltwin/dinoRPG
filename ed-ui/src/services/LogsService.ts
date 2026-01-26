import { LogListResponse } from '@drpg/core/returnTypes/Log';
import { LogType } from '@drpg/prisma';
import { http } from '../utils/index.js';

export const LogsService = {
	async listAll(): Promise<LogListResponse> {
		const res = await http().get('/log/list/all');
		return res.data;
	},
	async list(
		page: number,
		type: LogType | null,
		playerId: string | null,
		dinozId: number | null
	): Promise<LogListResponse> {
		const res = await http().get(`/log/list/${page}/${type}/${playerId}/${dinozId}`);
		return res.data;
	},
	async listByDate(type: LogType | null, fromDate: Date | null): Promise<LogListResponse> {
		const res = await http().get(`/log/list/${type}/${fromDate}`);
		return res.data;
	}
};
