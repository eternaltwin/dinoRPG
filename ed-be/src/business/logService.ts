import { LogType } from '@drpg/prisma';
import { Request } from 'express';
import { getLogList } from '../dao/logDao.js';

export async function getLogs(req: Request) {
	const page = req.params.page ? +req.params.page : 1;
	const type = req.params.type === 'null' ? undefined : (req.params.type as LogType);
	const playerId = req.params.playerId === 'null' ? undefined : +req.params.playerId;
	const dinozId = req.params.dinozId === 'null' ? undefined : +req.params.dinozId;

	const logs = await getLogList(page, type, playerId, dinozId);

	return logs;
}
