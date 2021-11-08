import { AssPlayerReward, Dinoz, Player } from '../models/index.js';

const getCommonDataRequest = (playerId: number): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['money'],
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
		attributes: ['quetzuBought'],
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

export {
	getPlayerId,
	getEternalTwinId,
	createPlayer,
	getCommonDataRequest,
	getPlayerRewardsRequest,
	setPlayerMoneyRequest
};
