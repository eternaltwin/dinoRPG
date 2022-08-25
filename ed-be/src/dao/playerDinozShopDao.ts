import { DeleteResult } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { PlayerDinozShop } from '../entity/index.js';

const dinozShopRepository = AppDataSource.getRepository(PlayerDinozShop);

const getDinozFromDinozShopRequest = (playerId: number): Promise<Array<PlayerDinozShop>> => {
	return dinozShopRepository
		.createQueryBuilder('dinozShop')
		.select(['dinozShop.display', 'dinozShop.display', 'dinozShop.player'])
		.innerJoin('dinozShop.player', 'player', 'player.id = :pId', { pId: playerId })
		.getMany();
};

const createMultipleDinoz = (dinozArray: Array<PlayerDinozShop>): Promise<Array<PlayerDinozShop>> => {
	return dinozShopRepository.save(dinozArray);
};

const getDinozShopDetailsRequest = (dinozId: number): Promise<PlayerDinozShop> => {
	return dinozShopRepository
		.createQueryBuilder('dinozShop')
		.select(['dinozShop.display', 'dinozShop.raceId', 'dinozShop.id'])
		.addSelect(['player.id', 'player.money'])
		.addSelect([
			'rank.dinozCount',
			'rank.sumPointsDisplayed',
			'rank.sumPoints',
			'rank.averagePoints',
			'rank.averagePointsDisplayed'
		])
		.innerJoin('dinozShop.player', 'player')
		.leftJoin('player.rank', 'rank')
		.where('dinozShop.id = :dId', { dId: dinozId })
		.getOneOrFail();
};

const deleteDinozInShopRequest = (playerId: number): Promise<DeleteResult> => {
	return dinozShopRepository
		.createQueryBuilder()
		.delete()
		.from(PlayerDinozShop)
		.where('player.id = :pId', { pId: playerId })
		.execute();
};

export { getDinozFromDinozShopRequest, createMultipleDinoz, getDinozShopDetailsRequest, deleteDinozInShopRequest };
