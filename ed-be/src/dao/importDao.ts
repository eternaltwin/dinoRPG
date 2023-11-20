import { ImportedPlayer, ImportedTwinoidAchievement, ImportedTwinoidSite, ImportedTwinoidStat } from "@drpg/prisma";
import { prisma } from "../prisma.js";

export async function saveImport(player: ImportedPlayer) {
	const object = await prisma.importedPlayer.upsert({
		where: {
			id: player.id
		},
		create: player,
		update: player,
		include: {
			player: { select: { id: true } },
		}
	});

	return object;
}

export async function saveSite(sites: ImportedTwinoidSite[]) {
	await prisma.importedTwinoidSite.createMany({
		data: sites
	});
}

export async function saveStats(stats: ImportedTwinoidStat[]) {
	await prisma.importedTwinoidStat.createMany({
		data: stats
	});
}

export async function saveAchievements(achievements: ImportedTwinoidAchievement[]) {
	await prisma.importedTwinoidAchievement.createMany({
		data: achievements
	});
}

export async function searchImportedPlayer(dinoRPGId: number) {
	const importedPlayer = await prisma.importedPlayer.findFirst({
		where: {
			twinId: dinoRPGId
		},
		select: {
			id: true,
			twinId: true
		}
	});

	return importedPlayer;
}

export async function deleteImportedPlayer(playerId: number) {
	await prisma.importedPlayer.delete({
		where: {
			id: playerId
		}
	});
}

export async function getImportedPlayerSite(playerId: number) {
	const playerSite = await prisma.importedTwinoidSite.findMany({
		where: {
			playerId
		},
	});

	return playerSite;
}

export async function getImportedPlayerSpecificSiteStat(playerId: number, siteId: number) {
	const playerStats = await prisma.importedTwinoidStat.findMany({
		where: {
			playerId,
			siteId
		},
	});

	return playerStats;
}

export async function getImportedPlayerSpecificSiteAchievements(playerId: number, siteId: number) {
	const playerAchievements = await prisma.importedTwinoidAchievement.findMany({
		where: {
			playerId,
			siteId
		},
	});

	return playerAchievements;
}
