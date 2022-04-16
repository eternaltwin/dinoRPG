import { Player } from '../../models';
import { rewardList } from '../../constants/index.js';
import { dinozId, player } from '../utils/constants';

export const BasicPlayer = {
	playerId: player.id_1
} as Player;

export const BasicNotImportedPlayer = {
	playerId: player.id_1,
	hasImported: false,
	eternalTwinId: '6b60f9d9-74fb-42f7-9e34-73961b407c00'
} as Player;

export const BasicImportedPlayer = {
	playerId: player.id_1,
	hasImported: true,
	eternalTwinId: '6b60f9d9-74fb-42f7-9e34-73961b407c00'
} as Player;

export const PlayerWithRewards = ({
	playerId: player.id_1,
	quetzuBought: 0,
	reward: [
		{
			rewardId: 13214,
			name: rewardList.TROPHEE_HIPPOCLAMP
		},
		{
			rewardId: 9845,
			name: rewardList.TROPHEE_PTEROZ
		},
		{
			rewardId: 79456,
			name: rewardList.TROPHEE_ROCKY
		},
		{
			rewardId: 7974,
			name: rewardList.TROPHEE_QUETZU
		}
	]
} as unknown) as Player;

export const PlayerData = ({
	createdAt: '08/01/2021',
	name: 'Jolujolu',
	reward: [{ rewardId: 1 }, { rewardId: 13 }],
	customText: '',
	playerId: player.id_1,
	money: 50000,
	shopkeeper: false,
	merchant: false,
	itemOwn: [],
	dinoz: [
		{
			dinozId: dinozId,
			status: [{ statusId: 1 }],
			setDataValue: jest.fn()
		}
	]
} as unknown) as Player;

export const playerList = [
	{
		name: 'Biosha',
		playerId: 2
	},
	{
		name: 'biocat',
		playerId: 1
	}
] as Array<Player>;

export const playerMoney = ({
	playerId: player.id_1,
	money: 50000
} as unknown) as Player;

export const playerMoneyPlus = ({
	playerId: player.id_1,
	money: 60000
} as unknown) as Player;

export const playerMoneyLess = ({
	playerId: player.id_1,
	money: 40000
} as unknown) as Player;

export const PlayerAllData = ({
	playerId: 1,
	hasImported: false,
	customText: 'test',
	name: 'biocat',
	eternalTwinId: '8e429bed-d99c-40d6-b018-b8f82aff1e60',
	money: 85910,
	quetzuBought: 1,
	leader: false,
	engineer: false,
	cooker: false,
	shopKeeper: false,
	merchant: false,
	priest: false,
	teacher: false,
	itemOwn: [
		{
			itemId: 6,
			quantity: 1
		},
		{
			itemId: 3,
			quantity: 1
		}
	],
	ingredientOwn: [
		{
			ingredientId: 5,
			quantity: 10
		}
	],
	reward: [
		{
			rewardId: 13
		},
		{
			rewardId: 16
		},
		{
			rewardId: 100
		}
	]
} as unknown) as Player;
