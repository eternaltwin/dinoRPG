import { LogType } from '@drpg/prisma';
import { Request } from 'express';
import { getLogList, getLogListAll, getLogListByDate } from '../dao/logDao.js';

const getAllLogs = async () => {
	return await getLogListAll();
}

const getLogs = async (req: Request) => {
	const page = req.params.page ? +req.params.page : 1;
	const type = req.params.type === 'null' ? undefined : (req.params.type as LogType);
	const playerId = req.params.playerId === 'null' ? undefined : +req.params.playerId;
	const dinozId = req.params.dinozId === 'null' ? undefined : +req.params.dinozId;
	return await getLogList(page, type, playerId, dinozId);
}	

const getLogsByDate = async (req: Request) => {
	const type = req.params.type === 'null' ? undefined : (req.params.type as LogType);
	const fromDate = req.params.fromDate === 'null' ? undefined : new Date(req.params.fromDate);
	const toDate = req.params.toDate === 'null' ? undefined : new Date(req.params.toDate);
	return await getLogListByDate(type, fromDate, toDate);
}

export { getLogs, getAllLogs, getLogsByDate };