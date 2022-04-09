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
