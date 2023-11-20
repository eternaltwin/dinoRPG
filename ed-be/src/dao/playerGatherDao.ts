import { Prisma } from "@drpg/prisma";
import { prisma } from "../prisma.js";

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

export async function setGrid(grid: Prisma.PlayerGatherCreateInput) {
	return prisma.playerGather.create({
		data: grid
	});
}
