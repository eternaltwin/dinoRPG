import { PlayerItem } from '../../entity/index.js';
import { item, itemId, itemQuantity, player } from '../utils/constants.js';

export const BasicItem = {
	id: itemId,
	itemId: item.id_1,
	playerId: player.id_1,
	quantity: itemQuantity
} as unknown as PlayerItem;

export const playerFlyingShopInventory = [
	{
		itemId: 1,
		quantity: 12
	},
	{
		itemId: 2,
		quantity: 8
	}
] as Array<PlayerItem>;

export const playerMagicShopInventory = [
	{
		itemId: 49,
		quantity: 2
	},
	// Golden Napodino
	{
		itemId: 112,
		quantity: 999
	}
] as Array<PlayerItem>;
