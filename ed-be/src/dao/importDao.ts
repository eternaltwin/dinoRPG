import { AppDataSource } from '../data-source.js';
import {
	ImportedDinoz,
	ImportedPlayer,
	ImportedTwinoidAchievements,
	ImportedTwinoidSite,
	ImportedTwinoidStats
} from '../entity/index.js';

const importedPlayerRepository = AppDataSource.getRepository(ImportedPlayer);
const importedDinozRepository = AppDataSource.getRepository(ImportedDinoz);
const importedAchievementRepository = AppDataSource.getRepository(ImportedTwinoidAchievements);
const importedStatsRepository = AppDataSource.getRepository(ImportedTwinoidStats);
const importedSiteRepository = AppDataSource.getRepository(ImportedTwinoidSite);

export async function saveImport(player: ImportedPlayer) {
	return importedPlayerRepository.save(player);
}

export async function saveSite(player: Array<Partial<ImportedTwinoidSite>>) {
	return importedSiteRepository.save(player);
}

export async function saveStats(player: Array<Partial<ImportedTwinoidStats>>) {
	return importedStatsRepository.save(player);
}

export async function saveAchievements(player: Array<Partial<ImportedTwinoidAchievements>>) {
	return importedAchievementRepository.save(player);
}

export async function saveImportedDinoz(dinoz: ImportedDinoz) {
	return importedDinozRepository.save(dinoz);
}

export async function searchImportedPlayer(dinoRPGId: number) {
	return importedPlayerRepository
		.createQueryBuilder('imported')
		.select(['imported.twinId', 'imported.id'])
		.where('imported.twinId = :dId', { dId: dinoRPGId })
		.getOne();
}

export async function deleteImportedPlayer(playerId: number) {
	return importedPlayerRepository
		.createQueryBuilder('imported')
		.delete()
		.from(ImportedPlayer)
		.where('id = :pId', { pId: playerId })
		.execute();
}

export async function getImportedPlayerDinoz(dinoRPGId: number) {
	return importedPlayerRepository
		.createQueryBuilder('imported')
		.select(['imported.twinId'])
		.leftJoinAndSelect('imported.dinoz', 'dinoz')
		.where('imported.twinId = :dId', { dId: dinoRPGId })
		.getOne();
}

export async function getImportedPlayerSite(playerId: number) {
	return importedSiteRepository.createQueryBuilder('site').where('site.playerId = :pId', { pId: playerId }).getMany();
}

export async function getImportedPlayerSpecificSiteStat(playerId: number, siteId: number) {
	return importedStatsRepository
		.createQueryBuilder('stat')
		.where('stat.playerId = :pId', { pId: playerId })
		.andWhere('stat.siteId = :sId', { sId: siteId })
		.getMany();
}

export async function getImportedPlayerSpecificSiteAchievements(playerId: number, siteId: number) {
	return importedAchievementRepository
		.createQueryBuilder('achiev')
		.where('achiev.playerId = :pId', { pId: playerId })
		.andWhere('achiev.siteId = :sId', { sId: siteId })
		.getMany();
}
