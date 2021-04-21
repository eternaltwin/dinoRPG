import { Dinoz, EpicReward, Place, Player } from '../models';

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
			],
			where: { isFrozen: false },
			required: false,
			include: [
				{
					model: Place,
					attributes: ['name'],
					required: false,
				},
			],
		},
		where: { playerId: playerId },
	});
};

const getPlayerId = (eternalTwinId: string): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['playerId'],
		where: { eternalTwinId: eternalTwinId },
	});
};

const createPlayer = (newPlayer: Player): Promise<Player> => {
	return Player.create(newPlayer);
};

const getPlayerRewardsRequest = (
	playerId: number,
	rewardArray: Array<string>
): Promise<Player | null> => {
	return Player.findOne({
		attributes: ['quetzuBought'],
		include: {
			model: EpicReward,
			attributes: ['name'],
			where: { name: rewardArray },
			through: {
				attributes: [],
			},
			required: false,
		},
		where: { playerId: playerId },
	});
};

const setPlayerMoneyRequest = (
	playerId: number,
	newMoney: number
): Promise<[number, Array<Player>]> => {
	return Player.update(
		{
			money: newMoney,
		},
		{
			where: { playerId: playerId },
		}
	);
};

export {
	getPlayerId,
	createPlayer,
	getCommonDataRequest,
	getPlayerRewardsRequest,
	setPlayerMoneyRequest,
};
