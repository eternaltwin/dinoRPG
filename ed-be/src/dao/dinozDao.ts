import { UpdateResult } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { Dinoz } from '../entity/index.js';

const dinozRepository = AppDataSource.getRepository(Dinoz);

// Getters

const getDinozPlaceRequest = (dinozId: number): Promise<Dinoz> => {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id', 'dinoz.placeId'])
		.addSelect(['player.id'])
		.addSelect(['status.statusId'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('dinoz.status', 'status')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
};

const getAllDinozFromAccount = (playerId: number): Promise<Array<Dinoz>> => {
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
};

const getCanDinozChangeName = (dinozId: number): Promise<Dinoz> => {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.canChangeName'])
		.addSelect(['player.id'])
		.innerJoin('dinoz.player', 'player')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
};

const getDinozFicheRequest = (dinozId: number): Promise<Dinoz> => {
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
			'dinoz.placeId'
		])
		.addSelect(['player.id'])
		.addSelect(['items.itemId'])
		.addSelect(['status.statusId'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('dinoz.items', 'items')
		.leftJoin('dinoz.status', 'status')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
};

const getDinozSkillRequest = (dinozId: number): Promise<Dinoz> => {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select(['dinoz.id'])
		.addSelect(['player.id'])
		.addSelect(['skills.skillId', 'skills.state'])
		.innerJoin('dinoz.player', 'player')
		.leftJoin('dinoz.skills', 'skills')
		.where('dinoz.id = :dId', { dId: dinozId })
		.getOneOrFail();
};

const getDinozSkillAndStatusRequest = (dinozId: number): Promise<Dinoz> => {
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
};

const getDinozSkillAndUnlockablesRequest = (dinozId: number): Promise<Dinoz> => {
	return dinozRepository
		.createQueryBuilder('dinoz')
		.select([
			'dinoz.id',
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
};

const getDinozTotalCount = (): Promise<number> => {
	return dinozRepository.count();
};

// Setters
//TODO
const setDinoz = (dinoz: Partial<Dinoz>): Promise<Dinoz> => {
	return dinozRepository.save(dinoz);
};

//TODO
const setDinozPlaceRequest = (dinoz: Dinoz, placeId: number): Promise<Dinoz> => {
	dinoz.placeId = placeId;
	return dinozRepository.save(dinoz);
};

//TODO
const setDinozNameRequest = (olddinoz: Dinoz, canChangeName: boolean): Promise<Dinoz> => {
	olddinoz.canChangeName = canChangeName;
	return dinozRepository.save(olddinoz);
};

const addExperience = (dinozId: number, experience: number): Promise<UpdateResult> => {
	return dinozRepository
		.createQueryBuilder()
		.update(Dinoz)
		.set({ experience: () => 'experience + :addExperience' })
		.setParameter('addExperience', experience)
		.where('dinoz.id = :dId', { dId: dinozId })
		.execute();
};

export {
	getAllDinozFromAccount,
	getCanDinozChangeName,
	getDinozFicheRequest,
	getDinozPlaceRequest,
	getDinozTotalCount,
	getDinozSkillRequest,
	getDinozSkillAndUnlockablesRequest,
	getDinozSkillAndStatusRequest,
	setDinoz,
	setDinozNameRequest,
	setDinozPlaceRequest,
	addExperience
};
