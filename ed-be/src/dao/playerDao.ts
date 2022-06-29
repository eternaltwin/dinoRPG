import pkg from 'sequelize';
const { Op } = pkg;
import {
	AssDinozStatus,
	AssPlayerReward,
	Dinoz,
	DinozShop,
	IngredientOwn,
	ItemOwn,
	Player,
	Quest
} from '../models/index.js';
import { itemList } from '../constants/index.js';

const getCommonDataRequest = (playerId: number): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['money', 'playerId'],
		include: {
			model: Dinoz,
			attributes: ['dinozId', 'following', 'display', 'name', 'life', 'experience', 'placeId'],
			where: { isFrozen: false },
			required: false
		},
		where: { playerId: playerId }
	});
};

const getPlayerId = (eternalTwinId: string): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['playerId'],
		where: { eternalTwinId: eternalTwinId }
	});
};

const getEternalTwinId = (playerId: number): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['eternalTwinId'],
		where: { playerId: playerId }
	});
};

const createPlayer = (newPlayer: Player): Promise<Player> => {
	return Player.create(newPlayer);
};

const getPlayerRewardsRequest = (playerId: number): Promise<Player | null> => {
	return Player.findOne({
		attributes: [],
		include: {
			model: AssPlayerReward,
			attributes: ['rewardId']
		},
		where: { playerId: playerId }
	});
};

const setPlayerMoneyRequest = (playerId: number, newMoney: number): Promise<[number, Array<Player>]> => {
	return Player.update(
		{
			money: newMoney
		},
		{
			where: { playerId: playerId }
		}
	);
};

const getPlayerDataRequest = (playerId: number): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['createdAt', 'name', 'customText'],
		include: [
			{
				model: AssPlayerReward,
				attributes: ['rewardId']
			},
			{
				model: Dinoz,
				attributes: ['dinozId', 'display', 'name', 'level', 'raceId', 'life'],
				include: [
					{
						model: AssDinozStatus,
						attributes: ['statusId']
					}
				]
			}
		],
		where: { playerId: playerId }
	});
};

/**
 * Get all the necessary data from the player for itemShopService getItemsFromShop function
 * That includes: money, shopkeeper, merchant, all its dinoz that are not frozen or sacrificed and their placeId,
 * all its items and their quantity
 * @return Array<ItemFiche>
 */

const getPlayerShopItemsDataRequest = (playerId: number): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['playerId', 'money', 'shopKeeper', 'merchant'],
		include: [
			{
				model: Dinoz,
				attributes: ['placeId'],
				where: { isFrozen: false, isSacrificed: false },
				required: false,
				include: [
					{
						model: AssDinozStatus,
						attributes: ['statusId']
					}
				]
			},
			{
				model: ItemOwn,
				attributes: ['itemId', 'quantity']
			}
		],
		where: { playerId: playerId }
	});
};

/**
 * Get all the necessary data from the player for itemShopService buyItem function
 * That includes: money, shopkeeper, merchant, all its dinoz that are not frozen or sacrificed and their placeId,
 * the item and its quantity, finally the number of owned golden napodinos
 * @return Array<ItemFiche>
 */

const getPlayerShopOneItemDataRequest = (playerId: number, itemId: number): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['playerId', 'money', 'shopKeeper', 'merchant'],
		include: [
			{
				model: Dinoz,
				attributes: ['placeId'],
				where: { isFrozen: false, isSacrificed: false },
				required: false,
				include: [
					{
						model: AssDinozStatus,
						attributes: ['statusId']
					}
				]
			},
			{
				model: ItemOwn,
				required: false,
				attributes: ['itemId', 'quantity'],
				where: {
					[Op.or]: [{ itemId: itemId }, { itemId: itemList.GOLDEN_NAPODINO.itemId }]
				}
			}
		],
		where: { playerId: playerId }
	});
};

const getPlayerInventoryDataRequest = (playerId: number): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['playerId', 'shopKeeper'],
		include: [
			{
				model: ItemOwn,
				required: false,
				attributes: ['itemId', 'quantity'],
				where: {
					quantity: {
						[Op.gt]: 0
					}
				}
			}
		],
		where: { playerId: playerId }
	});
};

const getImportedData = (playerId: number): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['hasImported', 'eternalTwinId'],
		where: { playerId: playerId }
	});
};

const setHasImported = (playerId: number, state: boolean): Promise<[number, Array<Player>]> => {
	return Player.update(
		{
			hasImported: state
		},
		{
			where: { playerId: playerId }
		}
	);
};

const resetUser = (playerId: number): Promise<number> => {
	DinozShop.destroy({
		where: { playerId: playerId }
	});
	Dinoz.destroy({
		where: { playerId: playerId }
	});
	IngredientOwn.destroy({
		where: { playerId: playerId }
	});
	ItemOwn.destroy({
		where: { playerId: playerId }
	});
	return Quest.destroy({
		where: { playerId: playerId }
	});
};

const editCustomText = (playerId: number, text: string): Promise<[number, Array<Player>]> => {
	return Player.update(
		{
			customText: text
		},
		{
			where: { playerId: playerId }
		}
	);
};

const searchPlayersByName = (playerName: string): Promise<Array<Player>> => {
	return Player.findAll({
		attributes: ['name', 'playerId'],
		where: {
			name: {
				[Op.iLike]: `%${playerName}%`
			}
		}
	});
};

/**
 * @summary Set quetzuBought from a player to a certain value
 * @param playerId {number}
 * @param value {number}
 * @return Promise<[number, Array<Player>]>
 */
const setQuetzuBought = (playerId: number, value: number): Promise<[number, Array<Player>]> => {
	return Player.update(
		{
			quetzuBought: value
		},
		{
			where: { playerId: playerId }
		}
	);
};

/**
 * @summary Set leader from a player to a certain state
 * @param playerId {number}
 * @param state {boolean}
 * @return Promise<[number, Array<Player>]>
 */
const setLeader = (playerId: number, state: boolean): Promise<[number, Array<Player>]> => {
	return Player.update(
		{
			leader: state
		},
		{
			where: { playerId: playerId }
		}
	);
};

/**
 * @summary Set engineer from a player to a certain state
 * @param playerId {number}
 * @param state {boolean}
 * @return Promise<[number, Array<Player>]>
 */
const setEngineer = (playerId: number, state: boolean): Promise<[number, Array<Player>]> => {
	return Player.update(
		{
			engineer: state
		},
		{
			where: { playerId: playerId }
		}
	);
};

/**
 * @summary Set cooker from a player to a certain state
 * @param playerId {number}
 * @param state {boolean}
 * @return Promise<[number, Array<Player>]>
 */
const setCooker = (playerId: number, state: boolean): Promise<[number, Array<Player>]> => {
	return Player.update(
		{
			cooker: state
		},
		{
			where: { playerId: playerId }
		}
	);
};

/**
 * @summary Set shopKeeper from a player to a certain state
 * @param playerId {number}
 * @param state {boolean}
 * @return Promise<[number, Array<Player>]>
 */
const setShopKeeper = (playerId: number, state: boolean): Promise<[number, Array<Player>]> => {
	return Player.update(
		{
			shopKeeper: state
		},
		{
			where: { playerId: playerId }
		}
	);
};

/**
 * @summary Set merchant from a player to a certain state
 * @param playerId {number}
 * @param state {boolean}
 * @return Promise<[number, Array<Player>]>
 */
const setMerchant = (playerId: number, state: boolean): Promise<[number, Array<Player>]> => {
	return Player.update(
		{
			merchant: state
		},
		{
			where: { playerId: playerId }
		}
	);
};

/**
 * @summary Set priest from a player to a certain state
 * @param playerId {number}
 * @param state {boolean}
 * @return Promise<[number, Array<Player>]>
 */
const setPriest = (playerId: number, state: boolean): Promise<[number, Array<Player>]> => {
	return Player.update(
		{
			priest: state
		},
		{
			where: { playerId: playerId }
		}
	);
};

/**
 * @summary Set teacher from a player to a certain state
 * @param playerId {number}
 * @param state {boolean}
 * @return Promise<[number, Array<Player>]>
 */
const setTeacher = (playerId: number, state: boolean): Promise<[number, Array<Player>]> => {
	return Player.update(
		{
			teacher: state
		},
		{
			where: { playerId: playerId }
		}
	);
};

/**
 * @summary List all information from a player
 * @param playerId {number}
 * @return Promise<Player | null>
 */
const getAllInformationFromPlayer = (playerId: number): Promise<Player | null> => {
	return Player.findOne({
		attributes: [
			'playerId',
			'hasImported',
			'customText',
			'name',
			'eternalTwinId',
			'money',
			'quetzuBought',
			'leader',
			'engineer',
			'cooker',
			'shopKeeper',
			'merchant',
			'priest',
			'teacher'
		],
		include: [
			{
				model: ItemOwn,
				required: false,
				attributes: ['itemId', 'quantity'],
				where: {
					quantity: {
						[Op.gt]: 0
					}
				}
			},
			{
				model: IngredientOwn,
				required: false,
				attributes: ['ingredientId', 'quantity'],
				where: {
					quantity: {
						[Op.gt]: 0
					}
				}
			},
			{
				model: AssPlayerReward,
				required: false,
				attributes: ['rewardId']
			}
		],
		where: { playerId: playerId }
	});
};

const getPlayerMoney = (playerId: number): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['money', 'playerId'],
		where: { playerId: playerId }
	});
};

const addPlayerMoney = (playerId: number, money: number): Promise<Player | null> => {
	return Player.increment({ money: money }, { where: { playerId: playerId } });
};

export {
	createPlayer,
	getImportedData,
	getCommonDataRequest,
	getEternalTwinId,
	getPlayerId,
	getPlayerDataRequest,
	getPlayerInventoryDataRequest,
	getPlayerRewardsRequest,
	getPlayerShopItemsDataRequest,
	getPlayerShopOneItemDataRequest,
	setPlayerMoneyRequest,
	setHasImported,
	resetUser,
	editCustomText,
	searchPlayersByName,
	setQuetzuBought,
	setLeader,
	setEngineer,
	setCooker,
	setShopKeeper,
	setMerchant,
	setPriest,
	setTeacher,
	getAllInformationFromPlayer,
	getPlayerMoney,
	addPlayerMoney
};
