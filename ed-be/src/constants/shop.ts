import { itemList, placeList } from './index.js';
import { ShopFiche } from '@drpg/core/models/shop/ShopFiche';
import { ShopType } from '@drpg/core/models/enums/ShopType';

// Prices are as they were before the abandon of Twinoid (they were lowered to half the price after the game became free)
// listItemSold is filled with a copy of each item from itemList with the price changed.
// There is probably a better way to do that.
export const shopList: Readonly<Record<string, ShopFiche>> = {
	// Flying Shop
	FLYING_SHOP: {
		shopId: 1,
		placeId: placeList.ANYWHERE.placeId,
		type: ShopType.CLASSIC,
		listItemsSold: [
			// Irma's potion sold for 900 gold
			{
				itemId: itemList.POTION_IRMA.itemId,
				price: 900
			},
			// Angel's potion sold for 2000 gold
			{
				itemId: itemList.POTION_ANGEL.itemId,
				price: 2000
			},
			// Cloud burger sold for 700 gold
			{
				itemId: itemList.CLOUD_BURGER.itemId,
				price: 700
			},
			// Meat pie sold for 2000 gold
			{
				itemId: itemList.MEAT_PIE.itemId,
				price: 2000
			},
			// Authentic hot bread sold for 6000 gold
			{
				itemId: itemList.HOT_BREAD.itemId,
				price: 6000
			},
			// Fighting ration sold for 1000 gold
			{
				itemId: itemList.FIGHT_RATION.itemId,
				price: 1000
			}
		]
	},
	// Forges Shop
	FORGE_SHOP: {
		shopId: 2,
		placeId: placeList.FORGES_DU_GTC.placeId,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				itemId: itemList.REFRIGERATED_SHIELD.itemId,
				price: 300
			},
			{
				itemId: itemList.ZIPPO.itemId,
				price: 300
			},
			{
				itemId: itemList.LITTLE_PEPPER.itemId,
				price: 300
			},
			{
				itemId: itemList.SOS_FLAME.itemId,
				price: 300
			},
			{
				itemId: itemList.SOS_HELMET.itemId,
				price: 300
			}
		]
	},
	// Magic Shop, price is in golden napodino instead of gold
	MAGIC_SHOP: {
		shopId: 3,
		placeId: placeList.DINOVILLE.placeId,
		type: ShopType.MAGICAL,
		listItemsSold: [
			{
				itemId: itemList.BANISHMENT.itemId,
				price: 3
			},
			{
				itemId: itemList.BATTERING_RAM.itemId,
				price: 3
			},
			{
				itemId: itemList.EMBER.itemId,
				price: 5
			},
			{
				itemId: itemList.SCALE.itemId,
				price: 7
			},
			{
				itemId: itemList.BEER.itemId,
				price: 3
			},
			{
				itemId: itemList.ENCYCLOPEDIA.itemId,
				price: 6
			},
			{
				itemId: itemList.ANTICHROMATIC.itemId,
				price: 4
			},
			{
				itemId: itemList.ANTIDOTE.itemId,
				price: 5
			},
			{
				itemId: itemList.TIME_MANIPULATOR.itemId,
				price: 5
			},
			{
				itemId: itemList.DIMENSIONAL_POWDER.itemId,
				price: 6
			},
			{
				itemId: itemList.SORCERERS_STICK.itemId,
				price: 7
			},
			{
				itemId: itemList.FRIENDLY_WHISTLE.itemId,
				price: 8
			},
			{
				itemId: itemList.DINOZ_CUBE.itemId,
				price: 9
			},
			{
				itemId: itemList.TEMPORAL_REDUCTION.itemId,
				price: 5
			},
			{
				itemId: itemList.TEAR_OF_LIFE.itemId,
				price: 6
			},
			{
				itemId: itemList.CUZCUSSIAN_MASK.itemId,
				price: 8
			},
			{
				itemId: itemList.ANTI_GRAVE_SUIT.itemId,
				price: 6
			},
			{
				itemId: itemList.ENCHANTED_STEROID.itemId,
				price: 6
			},
			{
				itemId: itemList.CURSE_LOCKER.itemId,
				price: 4
			},
			{
				itemId: itemList.FEAR_FACTOR.itemId,
				price: 8
			}
		]
	},
	// Cursed Shop, only accessible by cursed dinoz
	CURSED_SHOP: {
		shopId: 4,
		placeId: placeList.RUINES_ASHPOUK.placeId,
		type: ShopType.CURSED,
		listItemsSold: [
			{
				itemId: itemList.DEVIL_OINTMENT.itemId,
				price: 6000
			},
			{
				itemId: itemList.PIRHANOZ_IN_BAG.itemId,
				price: 1200
			}
		]
	},
	// Fruity Shop
	FRUITY_SHOP: {
		shopId: 5,
		placeId: placeList.PORTE_DE_SYLVENOIRE.placeId,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				itemId: itemList.PAMPLEBOUM.itemId,
				price: 1800
			}
		]
	},
	// Razad's Shop
	RAZADS_SHOP: {
		shopId: 6,
		placeId: placeList.AVANT_POSTE_ROCKY.placeId,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				itemId: itemList.PORTABLE_LOVE.itemId,
				price: 300
			},
			{
				itemId: itemList.POISONITE_SHOT.itemId,
				price: 900
			}
		]
	},
	// Souk Lightning Sales
	SOUK_LIGHTNING_SALES: {
		shopId: 7,
		placeId: placeList.PYLONES_DE_MAGNETITES.placeId,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				itemId: itemList.FUCA_PILL.itemId,
				price: 1000
			},
			{
				itemId: itemList.MONOCHROMATIC.itemId,
				price: 15000
			}
		]
	},
	// Purveyor of Neerhel
	PURVEYOR_OF_NEERHEL: {
		shopId: 8,
		placeId: placeList.SENTIER_DE_TOUTEMBA.placeId,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				itemId: itemList.POISONITE_SHOT.itemId,
				price: 300
			},
			{
				itemId: itemList.FUCA_PILL.itemId,
				price: 3000
			}
		]
	},
	// Barbarian Trader
	BARBARIAN_TRADER: {
		shopId: 9,
		placeId: placeList.CAMP_DES_EMMEMMA.placeId,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				itemId: itemList.LORIS_COSTUME.itemId,
				price: 400
			},
			{
				itemId: itemList.PORTABLE_LOVE.itemId,
				price: 900
			}
		]
	},
	// Steps Secret Shop
	STEPS_SECRET_SHOP: {
		shopId: 10,
		placeId: placeList.REPAIRE_DE_LA_TEAM_W.placeId,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				itemId: itemList.PORTABLE_LOVE.itemId,
				price: 320
			},
			{
				itemId: itemList.POISONITE_SHOT.itemId,
				price: 320
			},
			{
				itemId: itemList.LORIS_COSTUME.itemId,
				price: 450
			},
			{
				itemId: itemList.FUCA_PILL.itemId,
				price: 1100
			},
			{
				itemId: itemList.MONOCHROMATIC.itemId,
				price: 5200
			}
		]
	},
	// Elite Camp
	ELITE_CAMP: {
		shopId: 11,
		placeId: placeList.CAMP_D_ELIT.placeId,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				itemId: itemList.VEGETOX_COSTUME.itemId,
				price: 1000
			},
			{
				itemId: itemList.GOBLIN_COSTUME.itemId,
				price: 1000
			},
			{
				itemId: itemList.DANGER_DETECTOR.itemId,
				price: 2000
			},
			{
				itemId: itemList.SURVIVING_RATION.itemId,
				price: 2500
			}
		]
	},
	// Chen's Skillshack
	CHENS_SKILLSHACK: {
		shopId: 12,
		placeId: placeList.CITE_ARBORIS.placeId,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				itemId: itemList.LAND_OF_ASHES.itemId,
				price: 3000
			},
			{
				itemId: itemList.ABYSS.itemId,
				price: 3000
			},
			{
				itemId: itemList.AMAZON.itemId,
				price: 3000
			},
			{
				itemId: itemList.ST_ELMAS_FIRE.itemId,
				price: 3000
			},
			{
				itemId: itemList.UVAVU.itemId,
				price: 3000
			},
			{
				itemId: itemList.STRONG_TEA.itemId,
				price: 3000
			},
			{
				itemId: itemList.TEMPORAL_STABILISER.itemId,
				price: 4000
			}
		]
	}
};
