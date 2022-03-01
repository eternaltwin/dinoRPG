import { ShopFiche } from '../models';
import { itemList, placeList } from './index.js';

// Prices are as they were before the abandon of Twinoid (they were lowered to half the price after the game became free)
// listItemSold is filled with a copy of each item from itemList with the price changed.
// There is probably a better way to do that.
export const shopList: { [name: string]: ShopFiche } = {
	// Flying Shop
	FLYING_SHOP: {
		shopId: 1,
		placeId: placeList.ANYWHERE.placeId,
		listItemsSold: [
			// Irma's potion sold for 900 gold
			{
				itemId: itemList.POTION_IRMA.itemId,
				canBeEquipped: itemList.POTION_IRMA.canBeEquipped,
				canBeUsedNow: itemList.POTION_IRMA.canBeUsedNow,
				maxQuantity: itemList.POTION_IRMA.maxQuantity,
				price: 900
			},
			// Angel's potion sold for 2000 gold
			{
				itemId: itemList.POTION_ANGEL.itemId,
				canBeEquipped: itemList.POTION_ANGEL.canBeEquipped,
				canBeUsedNow: itemList.POTION_ANGEL.canBeUsedNow,
				maxQuantity: itemList.POTION_ANGEL.maxQuantity,
				price: 2000
			},
			// Cloud burger sold for 700 gold
			{
				itemId: itemList.CLOUD_BURGER.itemId,
				canBeEquipped: itemList.CLOUD_BURGER.canBeEquipped,
				canBeUsedNow: itemList.CLOUD_BURGER.canBeUsedNow,
				maxQuantity: itemList.CLOUD_BURGER.maxQuantity,
				price: 700
			},
			// Meat pie sold for 2000 gold
			{
				itemId: itemList.MEAT_PIE.itemId,
				canBeEquipped: itemList.MEAT_PIE.canBeEquipped,
				canBeUsedNow: itemList.MEAT_PIE.canBeUsedNow,
				maxQuantity: itemList.MEAT_PIE.maxQuantity,
				price: 2000
			},
			// Authentic hot bread sold for 6000 gold
			{
				itemId: itemList.HOT_BREAD.itemId,
				canBeEquipped: itemList.HOT_BREAD.canBeEquipped,
				canBeUsedNow: itemList.HOT_BREAD.canBeUsedNow,
				maxQuantity: itemList.HOT_BREAD.maxQuantity,
				price: 6000
			},
			// Fighting ration sold for 1000 gold
			{
				itemId: itemList.FIGHT_RATION.itemId,
				canBeEquipped: itemList.FIGHT_RATION.canBeEquipped,
				canBeUsedNow: itemList.FIGHT_RATION.canBeUsedNow,
				maxQuantity: itemList.FIGHT_RATION.maxQuantity,
				price: 1000
			}
		]
	},
	FORGE_SHOP: {
		shopId: 2,
		placeId: placeList.FORGES_DU_GTC.placeId,
		listItemsSold: [
			// TODO
			{
				//TODO: finish
				itemId: itemList.GLOBIN_MERGUEZ.itemId,
				canBeEquipped: itemList.GLOBIN_MERGUEZ.canBeEquipped,
				canBeUsedNow: itemList.GLOBIN_MERGUEZ.canBeUsedNow,
				maxQuantity: itemList.GLOBIN_MERGUEZ.maxQuantity,
				price: 1234
			},
			{
				//TODO
				itemId: itemList.EXAMPLE.itemId,
				canBeEquipped: itemList.EXAMPLE.canBeEquipped,
				canBeUsedNow: itemList.EXAMPLE.canBeUsedNow,
				maxQuantity: itemList.EXAMPLE.maxQuantity,
				price: 1234
			}
		]
	}
};
