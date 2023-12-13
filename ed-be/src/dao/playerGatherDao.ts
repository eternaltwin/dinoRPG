import { LogType, Prisma } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import { createLog } from './logDao.js';

export async function getCommonGatherInfo(playerId: number) {
	const gathers = await prisma.playerGather.findMany({
		where: {
			playerId
		},
		select: {
			id: true,
			grid: true,
			place: true,
			type: true,
			player: { select: { id: true } }
		}
	});

	return gathers;
}

export async function createGrid(grid: Prisma.PlayerGatherCreateInput) {
	return prisma.playerGather.create({
		data: grid,
		include: {
			player: { select: { id: true } }
		}
	});
}

export async function updateGrid(
	playerId: number,
	dinozId: number,
	gridId: number,
	grid: Omit<Prisma.PlayerGatherUpdateInput, 'id'>
) {
	const newGrid = prisma.playerGather.update({
		where: {
			id: gridId
		},
		data: grid,
		include: {
			player: { select: { id: true } }
		}
	});

	await createLog(LogType.Gather, playerId, dinozId);

	return newGrid;
}
