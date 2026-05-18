import { ItemType } from "../models/enums/ItemType.mjs";
import { ItemFiche } from "../models/item/ItemFiche.mjs";
import { Item } from "../models/item/ItemList.mjs";

export const getMaxQuantity = (item: ItemFiche, hasShopKeeper: boolean, hasMerguezCard: boolean): number => {
    if (item.itemId === Item.GOBLIN_MERGUEZ && hasMerguezCard) {
		return hasShopKeeper ? 150 : 100;
	}

	if (hasShopKeeper && item.itemType !== ItemType.MAGICAL) {
		return Math.round(item.maxQuantity * 1.5);
	}

	return item.maxQuantity;
}
