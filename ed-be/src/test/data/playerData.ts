import { Player } from '../../entity/index.js';

import { rewardList } from '../../constants/index.js';
import { dinozId, player } from '../utils/constants.js';
import { DinozShopArray } from './dinozShopData.js';
import { PlayerTypeToSend } from '@drpg/core/models/player/PlayerTypeToSend';

export const PlayerAllData = {
	id: player.id_1,
	hasImported: false,
	createdDate: '08/01/2021',
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
	dinoz: [
		{
			id: dinozId,
			display: '63cvi4d1fs',
			experience: 0,
			life: 100,
			name: '?',
			placeId: 1,
			level: 1,
			status: [{ statusId: 1 }],
			following: 0
		}
	],
	items: [
		{
			itemId: 6,
			quantity: 1
		},
		{
			itemId: 3,
			quantity: 1
		}
	],
	ingredients: [
		{
			ingredientId: 5,
			quantity: 10
		}
	],
	rewards: [
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
	],
	rank: {
		dinozCount: 2,
		sumPointsDisplayed: 5,
		sumPoints: 5,
		averagePointsDisplayed: 4,
		averagePoints: 4
	}
} as unknown as Player;

export const PlayerAdminData = {
	id: player.id_1,
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
	rewards: [
		{
			rewardId: 13214
		},
		{
			rewardId: 9845
		},
		{
			rewardId: 79456
		},
		{
			rewardId: 7974
		}
	]
} as unknown as Player;

export const PlayerTypeToSendAllData = {
	id: player.id_1,
	hasImported: false,
	createdDate: undefined,
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
	rewards: [13214, 9845, 79456, 7974]
} as unknown as PlayerTypeToSend;

export const BasicPlayer = PlayerAllData;

export const PlayerWithDinoz = {
	id: player.id_1,
	dinoz: [
		{
			id: dinozId,
			level: 1,
			setDataValue: jest.fn()
		}
	]
} as unknown as Player;

export const BasicNotImportedPlayer = {
	id: player.id_1,
	hasImported: false,
	eternalTwinId: '6b60f9d9-74fb-42f7-9e34-73961b407c00'
} as unknown as Player;

export const BasicImportedPlayer = {
	id: player.id_1,
	hasImported: true,
	eternalTwinId: '6b60f9d9-74fb-42f7-9e34-73961b407c00'
} as unknown as Player;

export const PlayerWithRewards = {
	id: player.id_1,
	quetzuBought: 0,
	rewards: [
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
} as unknown as Player;

export const PlayerWithoutDinozShop = {
	id: player.id_1,
	quetzuBought: 0,
	dinozShop: []
} as unknown as Player;

export const PlayerWithDinozShop = {
	id: player.id_1,
	quetzuBought: 1,
	dinozShop: DinozShopArray
} as unknown as Player;

export const PlayerData = {
	createdDate: '08/01/2021',
	name: 'Jolujolu',
	rewards: [{ rewardId: 1 }, { rewardId: 13 }],
	customText: '',
	id: player.id_1,
	money: 50000,
	shopKeeper: false,
	merchant: false,
	items: [],
	dinoz: [
		{
			dinozId: dinozId,
			status: [{ statusId: 1 }],
			setDataValue: jest.fn()
		}
	]
} as unknown as Player;

export const playerList = [
	{
		name: 'Biosha',
		id: 2
	},
	{
		name: 'biocat',
		id: 1
	}
] as Array<Player>;

export const playerMoney = {
	id: player.id_1,
	money: 50000
} as unknown as Player;

export const playerMoneyPlus = {
	id: player.id_1,
	money: 60000
} as unknown as Player;

export const playerMoneyLess = {
	id: player.id_1,
	money: 40000
} as unknown as Player;

export const BasicPlayerWithRank = {
	id: player.id_1,
	rank: {
		dinozCount: 2,
		sumPoints: 5
	}
} as unknown as Player;
