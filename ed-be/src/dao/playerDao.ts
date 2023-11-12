import {
	Dinoz,
	Player,
	PlayerDinozShop,
	PlayerIngredient,
	PlayerItem,
	PlayerQuest,
	PlayerReward
} from '../entity/index.js';
import { AppDataSource } from '../data-source.js';
import { DeleteResult, UpdateResult } from 'typeorm';
import { itemList } from '@drpg/core/models/item/ItemList';

const playerRepository = AppDataSource.getRepository(Player);

const createPlayer = (newPlayer: Player): Promise<Player> => {
	return playerRepository.save(newPlayer);
};

//TODO : Check if it work and maybe remove some query because of the Ondelete Cascade enabled (or at least add some await)
const resetUser = (playerId: number): Promise<DeleteResult> => {
	const dinozRepository = AppDataSource.getRepository(Dinoz);
	const dinozShopRepository = AppDataSource.getRepository(PlayerDinozShop);
	const ingredientRepository = AppDataSource.getRepository(PlayerIngredient);
	const itemRepository = AppDataSource.getRepository(PlayerItem);
	const questRepository = AppDataSource.getRepository(PlayerQuest);
	const rewardRepository = AppDataSource.getRepository(PlayerReward);

	dinozRepository.createQueryBuilder().delete().from(Dinoz).where('player.id = :pId', { pId: playerId }).execute();

	dinozShopRepository
		.createQueryBuilder()
		.delete()
		.from(PlayerDinozShop)
		.where('player.id = :pId', { pId: playerId })
		.execute();

	ingredientRepository
		.createQueryBuilder()
		.delete()
		.from(PlayerIngredient)
		.where('player.id = :pId', { pId: playerId })
		.execute();

	itemRepository.createQueryBuilder().delete().from(PlayerItem).where('player.id = :pId', { pId: playerId }).execute();

	questRepository
		.createQueryBuilder()
		.delete()
		.from(PlayerQuest)
		.where('player.id = :pId', { pId: playerId })
		.execute();

	return rewardRepository
		.createQueryBuilder()
		.delete()
		.from(PlayerReward)
		.where('player.id = :pId', { pId: playerId })
		.execute();
};

// Getters

const getPlayerId = (eternalTwinId: string): Promise<Player | null> => {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.id'])
		.where('player.eternalTwinId = :eId', { eId: eternalTwinId })
		.getOne();
};

const getEternalTwinId = (playerId: number): Promise<Player | null> => {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.eternalTwinId'])
		.where('player.id = :pId', { pId: playerId })
		.getOne();
};

const getCommonDataRequest = (playerId: number): Promise<Player | null> => {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.id', 'player.money'])
		.addSelect([
			'dinoz.id',
			'dinoz.following',
			'dinoz.display',
			'dinoz.name',
			'dinoz.life',
			'dinoz.maxLife',
			'dinoz.experience',
			'dinoz.placeId',
			'dinoz.level',
			'dinoz.order'
		])
		.leftJoin('player.dinoz', 'dinoz', 'dinoz.isFrozen = false')
		.leftJoinAndSelect('player.rewards', 'rewards')
		.where('player.id = :pId', { pId: playerId })
		.getOne();
};

const getAllInformationFromPlayer = (playerId: number): Promise<Player | null> => {
	return playerRepository
		.createQueryBuilder('player')
		.select()
		.leftJoinAndSelect('player.items', 'items')
		.leftJoinAndSelect('player.ingredients', 'ingredient')
		.leftJoinAndSelect('player.rewards', 'rewards')
		.where('player.id = :pId', { pId: playerId })
		.getOne();
};

const getImportedData = (playerId: number): Promise<Player | null> => {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.hasImported', 'player.eternalTwinId', 'player.id'])
		.where('player.id = :pId', { pId: playerId })
		.getOne();
};

export async function getImportedTwinoidData(playerId: number): Promise<Player | null> {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.eternalTwinId', 'player.id'])
		.leftJoinAndSelect('player.twinosite', 'twinosite')
		.where('player.id = :pId', { pId: playerId })
		.getOne();
}

const getPlayerMoney = (playerId: number): Promise<Player | null> => {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.id', 'player.money'])
		.where('player.id = :pId', { pId: playerId })
		.getOne();
};

const getPlayerDataRequest = (playerId: number): Promise<Player | null> => {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.createdDate', 'player.name', 'player.customText'])
		.addSelect(['rewards.rewardId'])
		.addSelect([
			'dinoz.id',
			'dinoz.display',
			'dinoz.name',
			'dinoz.level',
			'dinoz.raceId',
			'dinoz.life',
			'dinoz.isFrozen'
		])
		.addSelect(['status.statusId'])
		.addSelect(['rank.dinozCountDisplayed', 'rank.sumPosition', 'rank.sumPointsDisplayed'])
		.leftJoin('player.rewards', 'rewards')
		.leftJoin('player.dinoz', 'dinoz')
		.leftJoin('dinoz.status', 'status')
		.leftJoin('player.rank', 'rank')
		.where('player.id = :pId', { pId: playerId })
		.getOne();
};

export async function prepareConcentration(playerId: number) {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.id'])
		.addSelect(['dinoz.id', 'dinoz.placeId', 'dinoz.name', 'dinoz.concentration'])
		.leftJoin('player.dinoz', 'dinoz')
		.leftJoinAndSelect('dinoz.status', 'status')
		.leftJoinAndSelect('dinoz.concentration', 'concentration')
		.where('player.id = :pId', { pId: playerId })
		.getOne();
}

const searchPlayersByName = (playerName: string): Promise<Array<Player>> => {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.id', 'player.eternalTwinId', 'player.name'])
		.where('player.name iLike :playerId')
		.setParameter('playerId', `%${playerName}%`)
		.getMany();
};

/**
 * Get all the necessary data from the player for inventoryService getAllItemsData function
 * That includes:  merchant, all its items and their quantity (if above 0)
 * Throws an error if the player does not exist.
 * @return Player
 */
const getPlayerInventoryDataRequest = (playerId: number): Promise<Player | null> => {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.id', 'player.shopKeeper'])
		.addSelect(['items.itemId', 'items.quantity'])
		.leftJoin('player.items', 'items', 'items.quantity > 0')
		.where('player.id = :pId', { pId: playerId })
		.getOne();
};

/**
 * Get all the necessary data from the player for dinozShopService getDinozFromDinozShop function
 * That includes:  platerId and its list of dinoz in the shop
 * Throws an error if the player does not exist.
 * @return Player
 */
const getPlayerDinozShopRequest = (playerId: number): Promise<Player | null> => {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.id'])
		.addSelect(['dinozShop.id', 'dinozShop.raceId', 'dinozShop.display'])
		.leftJoin('player.dinozShop', 'dinozShop')
		.leftJoinAndSelect('player.rewards', 'rewards')
		.where('player.id = :pId', { pId: playerId })
		.getOne();
};

const getPlayerRewardsRequest = (playerId: number): Promise<Player | null> => {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.id'])
		.addSelect(['rewards.rewardId'])
		.leftJoin('player.rewards', 'rewards')
		.where('player.id = :pId', { pId: playerId })
		.getOne();
};

/**
 * Get all the necessary data from the player for dinozService buyDinoz function
 * That includes:  platerId and the dinoz from the shop that it is trying to buy
 * @return Player
 */
const getPlayerSpecificDinozShopRequest = (playerId: number, dinozId: number): Promise<Player | null> => {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.id', 'player.money'])
		.addSelect(['dinozShop.id', 'dinozShop.raceId', 'dinozShop.display'])
		.leftJoin('player.dinozShop', 'dinozShop', 'dinozShop.id = :dId', { dId: dinozId })
		.where('player.id = :pId', { pId: playerId })
		.getOne();
};

/**
 * Get all the necessary data from the player for itemShopService getItemsFromShop function
 * That includes: money, shopKeeper, merchant, all its dinoz that are not frozen or sacrificed and their placeId,
 * all its items and their quantity
 * Throws an error if the player does not exist.
 * @return Player
 */
const getPlayerShopItemsDataRequest = (playerId: number): Promise<Player | null> => {
	return playerRepository
		.createQueryBuilder('player')
		.select(['player.id', 'player.money', 'player.merchant', 'player.shopKeeper'])
		.addSelect(['items.itemId', 'items.quantity'])
		.addSelect(['dinoz.placeId'])
		.addSelect(['status.statusId'])
		.leftJoin('player.items', 'items')
		.leftJoin('player.dinoz', 'dinoz', 'dinoz.isFrozen = false AND dinoz.isSacrificed = false')
		.leftJoin('dinoz.status', 'status')
		.where('player.id = :pId', { pId: playerId })
		.getOne();
};

/**
 * Get all the necessary data from the player for itemShopService buyItem function
 * That includes: money, shopKeeper, merchant, all its dinoz that are not frozen or sacrificed and their placeId,
 * its items and its quantity, finally the number of owned golden napodinos
 * Throws an error if the player does not exist.
 * @return Player
 */
const getPlayerShopOneItemDataRequest = async (playerId: number, itemId: number): Promise<Player | null> => {
	return await playerRepository
		.createQueryBuilder('player')
		.select(['player.id', 'player.money', 'player.merchant', 'player.shopKeeper'])
		.addSelect(['items.itemId', 'items.quantity'])
		.addSelect(['dinoz.placeId'])
		.addSelect(['status.statusId'])
		.leftJoin('player.items', 'items', 'items.itemId = :itemId OR items.itemId = :napoId', {
			itemId: itemId,
			napoId: itemList.GOLDEN_NAPODINO.itemId
		})
		.leftJoin('player.dinoz', 'dinoz', 'dinoz.isFrozen = false AND dinoz.isSacrificed = false')
		.leftJoin('dinoz.status', 'status')
		.where('player.id = :playerId', { playerId: playerId })
		.getOne();
};

// Setters
//TODO
const setPlayer = (player: Partial<Player>): Promise<Player> => {
	return playerRepository.save(player);
};

const addPlayerMoney = (playerId: number, money: number): Promise<UpdateResult> => {
	return playerRepository
		.createQueryBuilder()
		.update(Player)
		.set({ money: () => 'money + :addedMoney' })
		.setParameter('addedMoney', money)
		.where('player.id = :pId', { pId: playerId })
		.execute();
};

const editCustomText = (playerId: number, text: string): Promise<UpdateResult> => {
	return playerRepository
		.createQueryBuilder()
		.update(Player)
		.set({ customText: text })
		.where('player.id = :pId', { pId: playerId })
		.execute();
};

const setPlayerMoneyRequest = (playerId: number, newMoney: number): Promise<UpdateResult> => {
	return playerRepository
		.createQueryBuilder('player')
		.update(Player)
		.set({ money: newMoney })
		.where('player.id = :pId', { pId: playerId })
		.execute();
};

export {
	addPlayerMoney,
	createPlayer,
	editCustomText,
	getAllInformationFromPlayer,
	getCommonDataRequest,
	getEternalTwinId,
	getImportedData,
	getPlayerDataRequest,
	getPlayerDinozShopRequest,
	getPlayerId,
	getPlayerInventoryDataRequest,
	getPlayerMoney,
	setPlayer,
	setPlayerMoneyRequest,
	getPlayerRewardsRequest,
	getPlayerShopItemsDataRequest,
	getPlayerShopOneItemDataRequest,
	getPlayerSpecificDinozShopRequest,
	resetUser,
	searchPlayersByName
};
