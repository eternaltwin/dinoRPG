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

const getCommonDataRequest = (playerId: number): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['money', 'playerId'],
		include: {
			model: Dinoz,
			attributes: [
				'dinozId',
				'following',
				'display',
				'name',
				'life',
				'experience',
				'placeId'
			],
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

const setPlayerMoneyRequest = (
	playerId: number,
	newMoney: number
): Promise<[number, Array<Player>]> => {
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
				attributes: ['dinozId', 'display', 'name', 'level', 'raceId'],
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

const getPlayerShopItemsDataRequest = (
	playerId: number
): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['playerId', 'money', 'shopKeeper', 'merchant'],
		include: [
			{
				model: Dinoz,
				attributes: ['dinozId', 'placeId'],
				where: { isFrozen: false, isSacrificed: false },
				required: false
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
 * and the item and its quantity
 * @return Array<ItemFiche>
 */

const getPlayerShopOneItemDataRequest = (
	playerId: number,
	itemId: number
): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['playerId', 'money', 'shopKeeper', 'merchant'],
		include: [
			{
				model: Dinoz,
				attributes: ['dinozId', 'placeId'],
				where: { isFrozen: false, isSacrificed: false },
				required: false
			},
			{
				model: ItemOwn,
				required: false,
				attributes: ['itemId', 'quantity'],
				where: { itemId: itemId }
			}
		],
		where: { playerId: playerId }
	});
};

const getPlayerInventoryDataRequest = (
	playerId: number
): Promise<Player | null> => {
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

const setHasImported = (
	playerId: number,
	state: boolean
): Promise<[number, Array<Player>]> => {
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

const editCustomText = (
	playerId: number,
	text: string
): Promise<[number, Array<Player>]> => {
	return Player.update(
		{
			customText: text
		},
		{
			where: { playerId: playerId }
		}
	);
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
	editCustomText
};
