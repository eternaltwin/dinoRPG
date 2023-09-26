import { UpdateResult } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { Dinoz } from '../entity/index.js';

const dinozRepository = AppDataSource.getRepository(Dinoz);

// Getters

export async function getDinozPlaceRequest(dinozId: number): Promise<Dinoz> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id', 'dinoz.placeId'])
		.addSelect(['player.id'])
		.addSelect(['status.statusId'])
		.addSelect(['missions.missionId', 'missions.step', 'missions.isFinished', 'missions.progress'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('dinoz.status', 'status')
		.leftJoin('dinoz.missions', 'missions')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
}

export async function getActiveDinoz(playerId: number): Promise<Array<Dinoz>> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.isFrozen'])
		.addSelect(['player.id', 'player.leader'])
		.innerJoin('dinoz.player', 'player')
		.where('player.id = :pId AND dinoz.isFrozen = FALSE', { pId: playerId })
		.getMany();
}

/*export async function prepareConcentration(dinozId: number): Promise<Dinoz> {
  return dinozRepository
    .createQueryBuilder('dinoz')
    .select(['dinoz.id', 'dinoz.placeId'])
    .addSelect(['player.id'])
    .innerJoin('dinoz.player', 'player')
    .leftJoinAndSelect('dinoz.status', 'status')
    .leftJoinAndSelect('dinoz.concentration', 'concentration')
    .where('dinoz.id = :dId', { dId: dinozId })
    .getOneOrFail();
}*/

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

export async function getCanDinozChangeName(dinozId: number): Promise<Dinoz> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.canChangeName'])
		.addSelect(['player.id'])
		.innerJoin('dinoz.player', 'player')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
}

export async function getDinozFicheRequest(dinozId: number): Promise<Dinoz> {
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
		.addSelect(['player.id'])
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
		.getOneOrFail();
}

export async function getDinozMissionsInfo(dinozId: number): Promise<Dinoz> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id', 'dinoz.level', 'dinoz.placeId'])
		.addSelect(['player.id'])
		.addSelect(['status.statusId'])
		.addSelect(['missions.missionId', 'missions.step', 'missions.isFinished', 'missions.progress'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('dinoz.status', 'status')
		.leftJoin('dinoz.missions', 'missions')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
}

export async function getDinozConcentrationRequest(dinozId: number): Promise<Dinoz> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id'])
		.addSelect(['player.id'])
		.innerJoin('dinoz.player', 'player')
		.leftJoinAndSelect('dinoz.concentration', 'concentration')
		.leftJoin('concentration.dinoz', 'concentrationDinoz')
		.addSelect(['concentrationDinoz.id'])
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
}

export async function getDinozFicheLiteRequest(dinozId: number): Promise<Dinoz> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id', 'dinoz.life', 'dinoz.experience', 'dinoz.name'])
		.addSelect(['player.id'])
		.innerJoin('dinoz.player', 'player')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
}

export async function getDinozFicheItemRequest(dinozId: number): Promise<Dinoz> {
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
		.addSelect(['player.id'])
		.addSelect(['playerItems.itemId', 'playerItems.quantity'])
		.addSelect(['status.statusId'])
		.addSelect(['skills.skillId'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('player.items', 'playerItems')
		.leftJoin('dinoz.status', 'status')
		.leftJoin('dinoz.skills', 'skills')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
}

export async function getDinozEquipItemRequest(dinozId: number): Promise<Dinoz> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id'])
		.addSelect(['player.id', 'player.engineer'])
		.addSelect(['playerItems.itemId', 'playerItems.quantity'])
		.addSelect(['dinozItems.itemId', 'dinozItems.id'])
		.addSelect(['status.statusId'])
		.addSelect(['skills.skillId'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('player.items', 'playerItems')
		.leftJoin('dinoz.items', 'dinozItems')
		.leftJoin('dinoz.status', 'status')
		.leftJoin('dinoz.skills', 'skills')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
}

export async function getDinozFightDataRequest(dinozId: number): Promise<Dinoz> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select([
			'dinoz.id',
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
		.addSelect(['player.id'])
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
		.getOneOrFail();
}

export async function getDinozNPCRequest(dinozId: number): Promise<Dinoz> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id', 'dinoz.life', 'dinoz.experience', 'dinoz.name', 'dinoz.level', 'dinoz.placeId'])
		.addSelect(['player.id'])
		.addSelect(['skills.skillId'])
		.addSelect(['items.itemId'])
		.addSelect(['status.statusId'])
		.addSelect(['npc.npcId', 'npc.step'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('dinoz.skills', 'skills')
		.leftJoin('dinoz.items', 'items')
		.leftJoin('dinoz.status', 'status')
		.leftJoin('dinoz.NPC', 'npc')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
}

export async function getDinozSkillRequest(dinozId: number): Promise<Dinoz> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id'])
		.addSelect(['player.id'])
		.addSelect(['skills.skillId', 'skills.state'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('dinoz.skills', 'skills')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
}

export async function getDinozSkillAndStatusRequest(dinozId: number): Promise<Dinoz> {
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
		.getOneOrFail();
}

export async function getDinozForLevelUp(dinozId: number): Promise<Dinoz> {
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
		.getOneOrFail();
}

export async function getDinozSkillsLearnableAndUnlockable(dinozId: number): Promise<Dinoz> {
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
		.getOneOrFail();
}

export async function getDinozTotalCount(): Promise<number> {
	return dinozRepository.count();
}

export async function getDinozGatherData(dinozId: number): Promise<Dinoz> {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id', 'dinoz.placeId'])
		.addSelect(['player.id'])
		.addSelect(['skills.skillId'])
		.addSelect(['playerItems.itemId', 'playerItems.quantity'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('dinoz.skills', 'skills')
		.leftJoin('player.items', 'playerItems')
		.leftJoinAndSelect('player.ingredients', 'ingredient')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
}

// Setters
//TODO
export async function setDinoz(dinoz: Partial<Dinoz>): Promise<Dinoz> {
	return dinozRepository.save(dinoz);
}

export async function setMultipleDinoz(dinoz: Array<Partial<Dinoz>>): Promise<Array<Dinoz>> {
	return dinozRepository.save(dinoz);
}

export async function setDinozPlaceRequest(dinozId: number, newPlaceId: number): Promise<UpdateResult> {
	return dinozRepository
		.createQueryBuilder()
		.update(Dinoz)
		.set({ placeId: newPlaceId })
		.where('dinoz.id = :dId', { dId: dinozId })
		.execute();
}

export async function setDinozNameRequest(dinozId: number, canChangeName: boolean): Promise<UpdateResult> {
	return dinozRepository
		.createQueryBuilder()
		.update(Dinoz)
		.set({ canChangeName: canChangeName })
		.where('dinoz.id = :dId', { dId: dinozId })
		.execute();
}

export async function setDinozNextElement(dinozId: number, elementIdd: number): Promise<UpdateResult> {
	return dinozRepository
		.createQueryBuilder()
		.update(Dinoz)
		.set({ nextUpElementId: elementIdd })
		.where('dinoz.id = :dId', { dId: dinozId })
		.execute();
}

export async function addExperience(dinozId: number, experience: number): Promise<UpdateResult> {
	return dinozRepository
		.createQueryBuilder()
		.update(Dinoz)
		.set({ experience: () => 'experience + :addExperience' })
		.setParameter('addExperience', experience)
		.where('dinoz.id = :dId', { dId: dinozId })
		.execute();
}

export async function addLife(dinozId: number, life: number): Promise<UpdateResult> {
	return dinozRepository
		.createQueryBuilder()
		.update(Dinoz)
		.set({ life: () => 'life + :addLife' })
		.setParameter('addLife', life)
		.where('dinoz.id = :dId', { dId: dinozId })
		.execute();
}
