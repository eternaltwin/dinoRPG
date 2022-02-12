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
	getPlayerId,
	getEternalTwinId,
	createPlayer,
	getCommonDataRequest,
	getPlayerRewardsRequest,
	setPlayerMoneyRequest,
	getPlayerDataRequest,
	getImportedData,
	setHasImported,
	resetUser,
	editCustomText
};
