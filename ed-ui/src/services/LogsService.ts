import { Log, LogType } from '@drpg/prisma';
import { http } from '../utils/index.js';

export const LogsService = {
	async list(type: LogType | null, playerId: number | null, dinozId: number | null): Promise<Log[]> {
		return http()
			.get(`/log/list/${type}/${playerId}/${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
