import { AppDataSource } from '../data-source.js';
import { Dinoz } from '../entity/index.js';
import { ManagePageData } from '@drpg/core/returnTypes/Dinoz';
import { MissionID } from '@drpg/core/models/missions/missionList';
import { UpdateResult } from 'typeorm';

const dinozRepository = AppDataSource.getRepository(Dinoz);

// Getters

export async function getActiveDinoz(playerId: number): Promise<Array<Dinoz>> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.isFrozen', 'dinoz.isSacrificed'])
		.addSelect(['player.id', 'player.leader'])
		.innerJoin('dinoz.player', 'player')
		.where('player.id = :pId AND dinoz.isFrozen = FALSE AND dinoz.isSacrificed = FALSE', { pId: playerId })
		.getMany();
}

export async function getAllDinozFromAccount(playerId: number): Promise<Array<Dinoz>> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select([
			'dinoz.id',
			'dinoz.following',
			'dinoz.name',
			'dinoz.isFrozen',
			'dinoz.isSacrificed',
			'dinoz.level',
			'dinoz.missionId',
			'dinoz.placeId',
			'dinoz.canChangeName',
			'dinoz.life',
			'dinoz.maxLife',
			'dinoz.experience'
		])
		.leftJoinAndSelect('dinoz.status', 'status')
		.leftJoinAndSelect('dinoz.skills', 'skill')
		.innerJoin('dinoz.player', 'player', 'player.id = :pId', { pId: playerId })
		.getMany();
}

export async function getAllDinozFicheLite(playerId: number): Promise<Array<Dinoz>> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select([
			'dinoz.id',
			'dinoz.name',
			'dinoz.display',
			'dinoz.following',
			'dinoz.life',
			'dinoz.level',
			'dinoz.maxLife',
			'dinoz.experience',
			'dinoz.placeId',
			'dinoz.order',
			'dinoz.isFrozen'
		])
		.innerJoin('dinoz.player', 'player', 'player.id = :pId', { pId: playerId })
		.getMany();
}

export async function getCanDinozChangeName(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.canChangeName'])
		.addSelect(['player.id'])
		.innerJoin('dinoz.player', 'player')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

export async function getDinozFicheRequest(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select([
			'dinoz.id',
			'dinoz.display',
			'dinoz.life',
			'dinoz.maxLife',
			'dinoz.experience',
			'dinoz.nbrUpAir',
			'dinoz.nbrUpFire',
			'dinoz.nbrUpLightning',
			'dinoz.nbrUpWater',
			'dinoz.nbrUpWood',
			'dinoz.name',
			'dinoz.level',
			'dinoz.placeId',
			'dinoz.raceId'
		])
		.addSelect(['player.id', 'player.money'])
		.addSelect(['playerItems.itemId', 'playerItems.quantity'])
		.addSelect(['items.itemId'])
		.addSelect(['status.statusId'])
		.addSelect(['missions.missionId', 'missions.step', 'missions.isFinished', 'missions.progress'])
		.addSelect(['skills.skillId'])
		.innerJoin('dinoz.player', 'player')
		.leftJoinAndSelect('dinoz.concentration', 'concentration')
		.leftJoin('player.items', 'playerItems')
		.leftJoin('dinoz.items', 'items')
		.leftJoin('dinoz.status', 'status')
		.leftJoin('dinoz.missions', 'missions')
		.leftJoin('dinoz.skills', 'skills')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

export async function getDinozMissionsInfo(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id', 'dinoz.level', 'dinoz.placeId', 'dinoz.experience'])
		.addSelect(['player.id', 'player.money'])
		.addSelect(['status.statusId'])
		.addSelect(['missions.missionId', 'missions.step', 'missions.isFinished', 'missions.progress'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('dinoz.status', 'status')
		.leftJoin('dinoz.missions', 'missions')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

export async function getDinozConcentrationRequest(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id'])
		.addSelect(['player.id'])
		.innerJoin('dinoz.player', 'player')
		.leftJoinAndSelect('dinoz.concentration', 'concentration')
		.leftJoin('concentration.dinoz', 'concentrationDinoz')
		.addSelect(['concentrationDinoz.id'])
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

export async function getDinozFicheLiteRequest(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id', 'dinoz.life', 'dinoz.experience', 'dinoz.name'])
		.addSelect(['player.id'])
		.innerJoin('dinoz.player', 'player')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

export async function getDinozFicheItemRequest(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select([
			'dinoz.id',
			'dinoz.life',
			'dinoz.maxLife',
			'dinoz.experience',
			'dinoz.name',
			'dinoz.level',
			'dinoz.placeId'
		])
		.addSelect(['player.id', 'player.money'])
		.addSelect(['playerItems.itemId', 'playerItems.quantity', 'playerItems.id'])
		.addSelect(['status.statusId'])
		.addSelect(['skills.skillId'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('player.items', 'playerItems')
		.leftJoin('dinoz.status', 'status')
		.leftJoin('dinoz.skills', 'skills')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

export async function getDinozEquipItemRequest(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id'])
		.addSelect(['player.id', 'player.engineer'])
		.addSelect(['playerItems.itemId', 'playerItems.quantity', 'playerItems.id'])
		.addSelect(['dinozItems.itemId', 'dinozItems.id'])
		.addSelect(['status.statusId'])
		.addSelect(['skills.skillId'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('player.items', 'playerItems')
		.leftJoin('dinoz.items', 'dinozItems')
		.leftJoin('dinoz.status', 'status')
		.leftJoin('dinoz.skills', 'skills')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

export async function getDinozFightDataRequest(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select([
			'dinoz.id',
			'dinoz.name',
			'dinoz.display',
			'dinoz.level',
			'dinoz.life',
			'dinoz.maxLife',
			'dinoz.experience',
			'dinoz.nbrUpFire',
			'dinoz.nbrUpWood',
			'dinoz.nbrUpWater',
			'dinoz.nbrUpLightning',
			'dinoz.nbrUpAir',
			'dinoz.placeId'
		])
		.addSelect(['player.id', 'player.money'])
		.addSelect(['items.itemId'])
		.addSelect(['skills.skillId'])
		.addSelect(['status.statusId'])
		.addSelect(['missions.missionId', 'missions.step', 'missions.isFinished', 'missions.progress'])
		.leftJoinAndSelect('dinoz.concentration', 'concentration')
		.innerJoin('dinoz.player', 'player')
		.leftJoin('dinoz.items', 'items')
		.leftJoin('dinoz.skills', 'skills')
		.leftJoin('dinoz.status', 'status')
		.leftJoin('dinoz.missions', 'missions')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

export async function getDinozNPCRequest(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id', 'dinoz.life', 'dinoz.experience', 'dinoz.name', 'dinoz.level', 'dinoz.placeId'])
		.addSelect(['skills.skillId'])
		.addSelect(['items.itemId'])
		.addSelect(['status.statusId'])
		.addSelect(['npc.npcId', 'npc.step'])
		.leftJoinAndSelect('dinoz.missions', 'missions')
		.leftJoin('dinoz.skills', 'skills')
		.leftJoin('dinoz.items', 'items')
		.leftJoin('dinoz.status', 'status')
		.leftJoin('dinoz.NPC', 'npc')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

export async function getDinozSkillRequest(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id'])
		.addSelect(['player.id'])
		.addSelect(['skills.skillId', 'skills.state'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('dinoz.skills', 'skills')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

export async function getDinozSkillAndStatusRequest(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id'])
		.addSelect(['player.id'])
		.addSelect(['skills.skillId'])
		.addSelect(['status.statusId'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('dinoz.skills', 'skills')
		.leftJoin('dinoz.status', 'status')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

export async function getDinozForLevelUp(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select([
			'dinoz.id',
			'dinoz.maxLife',
			'dinoz.raceId',
			'dinoz.display',
			'dinoz.experience',
			'dinoz.level',
			'dinoz.nextUpElementId',
			'dinoz.nextUpAltElementId',
			'dinoz.nbrUpFire',
			'dinoz.nbrUpWood',
			'dinoz.nbrUpWater',
			'dinoz.nbrUpLightning',
			'dinoz.nbrUpAir'
		])
		.addSelect(['player.id'])
		.addSelect(['ranking.sumPoints', 'ranking.averagePoints', 'ranking.dinozCount'])
		.addSelect(['items.itemId'])
		.addSelect(['skills.skillId'])
		.addSelect(['skillsUnlockable.skillId'])
		.addSelect(['status.statusId'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('player.rank', 'ranking')
		.leftJoin('dinoz.items', 'items')
		.leftJoin('dinoz.skills', 'skills')
		.leftJoin('dinoz.skillsUnlockable', 'skillsUnlockable')
		.leftJoin('dinoz.status', 'status')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

export async function getDinozSkillsLearnableAndUnlockable(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.raceId'])
		.addSelect(['skills.skillId'])
		.addSelect(['skillsUnlockable.skillId'])
		.addSelect(['status.statusId'])
		.leftJoin('dinoz.skills', 'skills')
		.leftJoin('dinoz.skillsUnlockable', 'skillsUnlockable')
		.leftJoin('dinoz.status', 'status')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

export async function getDinozTotalCount(): Promise<number> {
	return dinozRepository.count();
}

export async function getDinozGatherData(dinozId: number): Promise<Dinoz | null> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id', 'dinoz.placeId'])
		.addSelect(['player.id', 'player.money'])
		.addSelect(['skills.skillId'])
		.addSelect(['playerItems.itemId', 'playerItems.quantity', 'playerItems.id'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('dinoz.skills', 'skills')
		.leftJoin('player.items', 'playerItems')
		.leftJoinAndSelect('player.ingredients', 'ingredient')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOne();
}

// Setters
//TODO
export async function setDinoz(dinoz: Partial<Dinoz>): Promise<Dinoz> {
	return dinozRepository.save(dinoz);
}

export async function setMultipleDinoz(dinoz: Array<Partial<Dinoz>>): Promise<Array<Dinoz>> {
	return dinozRepository.save(dinoz);
}

export async function getGlobalMissionsData(playerId: number): Promise<
	{
		id: number;
		name: string;
		display: string;
		missions: {
			missionId: MissionID;
			isFinished: boolean;
		}[];
	}[]
> {
	return dinozRepository.find({
		where: {
			player: { id: playerId },
			isSacrificed: false
		},
		select: {
			id: true,
			name: true,
			display: true,
			missions: {
				missionId: true,
				isFinished: true
			}
		},
		relations: ['missions']
	});
}

export async function getManageData(userID: number): Promise<ManagePageData> {
	return dinozRepository.find({
		where: {
			player: { id: userID },
			isSacrificed: false,
			isFrozen: false
		},
		select: {
			id: true,
			name: true,
			level: true,
			status: {
				statusId: true
			},
			life: true,
			maxLife: true,
			experience: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			order: true,
			display: true
		},
		relations: ['status'],
		order: {
			order: 'ASC',
			name: 'ASC'
		}
	});
}

export async function updateOrderData(dinozList: { id: number; order: number }[]) {
	const updates: Promise<UpdateResult>[] = [];

	for (const dinoz of dinozList) {
		updates.push(dinozRepository.update(dinoz.id, { order: dinoz.order }));
	}

	await Promise.all(updates);
}
