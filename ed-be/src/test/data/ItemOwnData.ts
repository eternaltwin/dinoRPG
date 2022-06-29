import { ItemOwn } from '../../models';
import { item, itemId, itemQuantity, player } from '../utils/constants';

export const BasicItem = ({
	id: itemId,
	itemId: item.id_1,
	playerId: player.id_1,
	quantity: itemQuantity
} as unknown) as ItemOwn;

export const playerFlyingShopInventory = [
	{
		itemId: 1,
		quantity: 12
	},
	{
		itemId: 2,
		quantity: 8
	}
] as Array<ItemOwn>;

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
] as Array<ItemOwn>;
