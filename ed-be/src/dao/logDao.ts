import { LogType } from '@drpg/prisma';
import { prisma } from '../prisma.js';

const createLog = async (type: LogType, playerId: string, dinozId?: number, ...values: (string | number)[]) => {
	await prisma.log.create({
		data: {
			player: { connect: { id: playerId } },
			dinoz: dinozId ? { connect: { id: dinozId } } : undefined,
			type,
			values: values.map(value => value.toString()),
			playerOldId: playerId
		},
		select: { id: true }
	});
};

const createLogForMultipleDinoz = async (
	type: LogType,
	playerId: string,
	dinozIds: number[],
	...values: (string | number)[]
) => {
	await prisma.log.createMany({
		data: dinozIds.map(dinozId => ({
			playerId,
			dinozId,
			type,
			values: values.map(value => value.toString()),
			playerOldId: playerId
		}))
	});
};

async function getLogListAll() {
	return prisma.log.findMany({
		orderBy: { createdAt: 'desc' },
		include: {
			player: { select: { id: true, name: true } },
			dinoz: { select: { id: true, name: true } }
		}
	});
}

const getLogList = async (page: number, type?: LogType, playerId?: string, dinozId?: number) => {
	return await prisma.log.findMany({
		where: {
			type,
			playerId,
			dinozId
		},
		orderBy: { createdAt: 'desc' },
		skip: (page - 1) * 20,
		take: 20,
		include: {
			player: { select: { id: true, name: true } },
			dinoz: { select: { id: true, name: true } }
		}
	});
};

const getLogListByDate = async (type?: LogType, fromDate?: Date) => {
	const now = new Date();
	return await prisma.log.findMany({
		where: {
			type,
			createdAt: { gte: fromDate, lte: now }
		},
		orderBy: { createdAt: 'asc' }
	});
};

export { createLog, createLogForMultipleDinoz, getLogList, getLogListAll, getLogListByDate };
