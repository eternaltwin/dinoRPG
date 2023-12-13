import { LogType } from '@drpg/prisma';
import { prisma } from '../prisma.js';

const createLog = async (type: LogType, playerId: number, dinozId?: number, ...values: (string | number)[]) => {
	await prisma.log.create({
		data: {
			player: { connect: { id: playerId } },
			dinoz: dinozId ? { connect: { id: dinozId } } : undefined,
			type,
			values: values.map(value => value.toString())
		},
		select: { id: true }
	});
};

const createLogForMultipleDinoz = async (
	type: LogType,
	playerId: number,
	dinozIds: number[],
	...values: (string | number)[]
) => {
	await prisma.log.createMany({
		data: dinozIds.map(dinozId => ({
			playerId,
			dinozId,
			type,
			values: values.map(value => value.toString())
		}))
	});
};

const getLogList = async (page: number, type?: LogType, playerId?: number, dinozId?: number) => {
	return await prisma.log.findMany({
		where: {
			type,
			playerId,
			dinozId
		},
		orderBy: { createdAt: 'desc' },
		skip: (page - 1) * 100,
		take: 100,
		include: {
			player: { select: { id: true, name: true } },
			dinoz: { select: { id: true, name: true } }
		}
	});
};

export { createLog, createLogForMultipleDinoz, getLogList };
