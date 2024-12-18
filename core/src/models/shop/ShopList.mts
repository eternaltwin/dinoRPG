import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { ShopType } from '../enums/ShopType.mjs';
import { ItemShopType, ShopFiche } from './ShopFiche.mjs';
import { Item, itemList } from '../item/ItemList.mjs';
import { ConditionEnum } from '../enums/Parser.mjs';
import { DinozStatusId } from '../dinoz/StatusList.mjs';
import { ingredientList } from '../ingredient/ingredientList.mjs';
import { DayEnum } from '../enums/dayEnum.mjs';

export const shopList: Readonly<Record<string, ShopFiche>> = {
	// Flying Shop
	FLYING_SHOP: {
		shopId: 1,
		name: 'flying',
		placeId: PlaceEnum.ANYWHERE,
		type: ShopType.CLASSIC,
		listItemsSold: [
			// Irma's potion sold for 900 gold
			{
				id: itemList[Item.POTION_IRMA].itemId,
				price: 900,
				type: ItemShopType.ITEM
			},
			// Angel's potion sold for 2000 gold
			{
				id: itemList[Item.POTION_ANGEL].itemId,
				price: 2000,
				type: ItemShopType.ITEM
			},
			// Cloud burger sold for 700 gold
			{
				id: itemList[Item.CLOUD_BURGER].itemId,
				price: 700,
				type: ItemShopType.ITEM
			},
			// Meat pie sold for 2000 gold
			{
				id: itemList[Item.MEAT_PIE].itemId,
				price: 2000,
				type: ItemShopType.ITEM
			},
			// Authentic hot bread sold for 6000 gold
			{
				id: itemList[Item.HOT_BREAD].itemId,
				price: 6000,
				type: ItemShopType.ITEM
			},
			// Fighting ration sold for 1000 gold
			{
				id: itemList[Item.FIGHT_RATION].itemId,
				price: 1000,
				type: ItemShopType.ITEM
			}
		]
	},
	// Forges Shop
	FORGE_SHOP: {
		name: 'forge',
		shopId: 2,
		placeId: PlaceEnum.FORGES_DU_GTC,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				id: itemList[Item.REFRIGERATED_SHIELD].itemId,
				price: 300,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.ZIPPO].itemId,
				price: 300,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.LITTLE_PEPPER].itemId,
				price: 300,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.SOS_FLAME].itemId,
				price: 300,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.SOS_HELMET].itemId,
				price: 300,
				type: ItemShopType.ITEM
			}
		]
	},
	// Magic Shop, price is in golden napodino instead of gold
	MAGIC_SHOP: {
		shopId: 3,
		name: 'magic',
		placeId: PlaceEnum.DINOVILLE,
		type: ShopType.MAGICAL,
		listItemsSold: [
			{
				id: itemList[Item.BANISHMENT].itemId,
				price: 3,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.BATTERING_RAM].itemId,
				price: 3,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.EMBER].itemId,
				price: 5,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.SCALE].itemId,
				price: 7,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.BEER].itemId,
				price: 3,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.ENCYCLOPEDIA].itemId,
				price: 6,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.ANTICHROMATIC].itemId,
				price: 4,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.ANTIDOTE].itemId,
				price: 5,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.TIME_MANIPULATOR].itemId,
				price: 5,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.DIMENSIONAL_POWDER].itemId,
				price: 6,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.SORCERERS_STICK].itemId,
				price: 7,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.FRIENDLY_WHISTLE].itemId,
				price: 8,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.DINOZ_CUBE].itemId,
				price: 9,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.TEMPORAL_REDUCTION].itemId,
				price: 5,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.TEAR_OF_LIFE].itemId,
				price: 6,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.CUZCUSSIAN_MASK].itemId,
				price: 8,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.ANTI_GRAVE_SUIT].itemId,
				price: 6,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.ENCHANTED_STEROID].itemId,
				price: 6,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.CURSE_LOCKER].itemId,
				price: 4,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.FEAR_FACTOR].itemId,
				price: 8,
				type: ItemShopType.ITEM
			}
		],
		condition: {
			[ConditionEnum.POSSESS_OBJECT]: itemList[Item.GOLDEN_NAPODINO].itemId
		}
	},
	// Cursed Shop, only accessible by cursed dinoz
	CURSED_SHOP: {
		shopId: 4,
		name: 'cursed',
		placeId: PlaceEnum.RUINES_ASHPOUK,
		type: ShopType.CURSED,
		listItemsSold: [
			{
				id: itemList[Item.DEVIL_OINTMENT].itemId,
				price: 6000,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.PIRHANOZ_IN_BAG].itemId,
				price: 1200,
				type: ItemShopType.ITEM
			}
		],
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.CURSED
		}
	},
	// Fruity Shop
	FRUITY_SHOP: {
		shopId: 5,
		name: 'fruity',
		placeId: PlaceEnum.PORTE_DE_SYLVENOIRE,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				id: itemList[Item.PAMPLEBOUM].itemId,
				price: 1800,
				type: ItemShopType.ITEM
			}
		],
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.FLOWERING_BRANCH
		}
	},
	// Razad's Shop
	RAZADS_SHOP: {
		shopId: 6,
		name: 'razad',
		placeId: PlaceEnum.AVANT_POSTE_ROCKY,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				id: itemList[Item.PORTABLE_LOVE].itemId,
				price: 300,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.POISONITE_SHOT].itemId,
				price: 900,
				type: ItemShopType.ITEM
			}
		]
	},
	// Souk Lightning Sales
	SOUK_LIGHTNING_SALES: {
		shopId: 7,
		name: 'souk',
		placeId: PlaceEnum.PYLONES_DE_MAGNETITES,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				id: itemList[Item.FUCA_PILL].itemId,
				price: 1000,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.MONOCHROMATIC].itemId,
				price: 15000,
				type: ItemShopType.ITEM
			}
		]
	},
	// Purveyor of Neerhel
	PURVEYOR_OF_NEERHEL: {
		shopId: 8,
		name: 'neerhel',
		placeId: PlaceEnum.SENTIER_DE_TOUTEMBA,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				id: itemList[Item.POISONITE_SHOT].itemId,
				price: 300,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.FUCA_PILL].itemId,
				price: 3000,
				type: ItemShopType.ITEM
			}
		]
	},
	// Barbarian Trader
	BARBARIAN_TRADER: {
		shopId: 9,
		name: 'barbarian',
		placeId: PlaceEnum.CAMP_DES_EMMEMMA,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				id: itemList[Item.LORIS_COSTUME].itemId,
				price: 400,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.PORTABLE_LOVE].itemId,
				price: 900,
				type: ItemShopType.ITEM
			}
		]
	},
	// Steps Secret Shop
	STEPS_SECRET_SHOP: {
		shopId: 10,
		name: 'secret',
		placeId: PlaceEnum.REPAIRE_DE_LA_TEAM_W,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				id: itemList[Item.PORTABLE_LOVE].itemId,
				price: 320,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.POISONITE_SHOT].itemId,
				price: 320,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.LORIS_COSTUME].itemId,
				price: 450,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.FUCA_PILL].itemId,
				price: 1100,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.MONOCHROMATIC].itemId,
				price: 5200,
				type: ItemShopType.ITEM
			}
		]
	},
	// Elite Camp
	ELITE_CAMP: {
		shopId: 11,
		name: 'elit',
		placeId: PlaceEnum.CAMP_D_ELITE,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				id: itemList[Item.VEGETOX_COSTUME].itemId,
				price: 1000,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.GOBLIN_COSTUME].itemId,
				price: 1000,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.DANGER_DETECTOR].itemId,
				price: 2000,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.SURVIVING_RATION].itemId,
				price: 2500,
				type: ItemShopType.ITEM
			}
		]
	},
	// Chen's Skillshack
	CHENS_SKILLSHACK: {
		shopId: 12,
		name: 'chens',
		placeId: PlaceEnum.CITE_ARBORIS,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				id: itemList[Item.LAND_OF_ASHES].itemId,
				price: 3000,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.ABYSS].itemId,
				price: 3000,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.AMAZON].itemId,
				price: 3000,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.ST_ELMAS_FIRE].itemId,
				price: 3000,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.UVAVU].itemId,
				price: 3000,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.STRONG_TEA].itemId,
				price: 3000,
				type: ItemShopType.ITEM
			},
			{
				id: itemList[Item.TEMPORAL_STABILISER].itemId,
				price: 4000,
				type: ItemShopType.ITEM
			}
		]
	},
	// ITINERANT MERCHANT ---- MONDAY
	ITINERANT_MERCHANT_MONDAY: {
		shopId: 13,
		name: 'merchant',
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [
			{
				id: ingredientList.ENERGIE_FOUDRE.ingredientId,
				price: 300,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ENERGIE_AIR.ingredientId,
				price: 1000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ENERGIE_EAU.ingredientId,
				price: 4000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ENERGIE_FEU.ingredientId,
				price: 4000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ENERGIE_BOIS.ingredientId,
				price: 4000,
				type: ItemShopType.INGREDIENT
			}
		],
		condition: {
			[ConditionEnum.DAY]: DayEnum.MONDAY
		}
	},
	// ITINERANT MERCHANT ---- TUESDAY
	ITINERANT_MERCHANT_TUESDAY: {
		shopId: 14,
		name: 'merchant',
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [
			{
				id: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
				price: 75,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
				price: 130,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				price: 230,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.RACINE_DE_FIGONICIA.ingredientId,
				price: 230,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.SADIQUAE_MORDICUS.ingredientId,
				price: 230,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.FLAUREOLE.ingredientId,
				price: 500,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.SPORE_ETHERAL.ingredientId,
				price: 150,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.POUSSE_SOMBRE.ingredientId,
				price: 300,
				type: ItemShopType.INGREDIENT
			}
		],
		condition: {
			[ConditionEnum.DAY]: DayEnum.TUESDAY
		}
	},
	// ITINERANT MERCHANT ---- WEDNESDAY
	ITINERANT_MERCHANT_WEDNESDAY: {
		shopId: 15,
		name: 'merchant',
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [
			{
				id: ingredientList.SILEX_TAILLE.ingredientId,
				price: 150,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.FRAGMENT_DE_TEXTE_ANCIEN.ingredientId,
				price: 1000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.VIEIL_ANNEAU_PRECIEUX.ingredientId,
				price: 8000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.CALICE_CISELE.ingredientId,
				price: 8000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.COLLIER_KARAT.ingredientId,
				price: 8000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.BROCHE_EN_PARFAIT_ETAT.ingredientId,
				price: 30000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.SUPERBE_COURONNE_ROYALE.ingredientId,
				price: 40000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.BRAS_MECANIQUE.ingredientId,
				price: 23000,
				type: ItemShopType.INGREDIENT
			}
		],
		condition: {
			[ConditionEnum.DAY]: DayEnum.WEDNESDAY
		}
	},
	// ITINERANT MERCHANT ---- THURSDAY
	ITINERANT_MERCHANT_THURSDAY: {
		shopId: 16,
		name: 'merchant',
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [
			{
				id: ingredientList.TOUFFE_DE_FOURRURE.ingredientId,
				price: 350,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ROCHE_RADIO_ACTIVE.ingredientId,
				price: 500,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.GRIFFES_ACEREES.ingredientId,
				price: 750,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.CORNE_EN_CHOCOLAT.ingredientId,
				price: 1000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.OEIL_VISQUEUX.ingredientId,
				price: 1300,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.LANGUE_MONSTRUEUSE.ingredientId,
				price: 10000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.DENT_DE_DOROGON.ingredientId,
				price: 12000,
				type: ItemShopType.INGREDIENT
			}
		],
		condition: {
			[ConditionEnum.DAY]: DayEnum.THURSDAY
		}
	},
	// ITINERANT MERCHANT ---- FRIDAY
	ITINERANT_MERCHANT_FRIDAY: {
		shopId: 17,
		name: 'merchant',
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [
			{
				id: ingredientList.MEROU_LUJIDANE.ingredientId,
				price: 100,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.POISSON_VENGEUR.ingredientId,
				price: 300,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.AN_GUILI_GUILILLE.ingredientId,
				price: 1500,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.GLOBULOS.ingredientId,
				price: 1500,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.SUPER_POISSON.ingredientId,
				price: 1500,
				type: ItemShopType.INGREDIENT
			}
		],
		condition: {
			[ConditionEnum.DAY]: DayEnum.FRIDAY
		}
	},
	// ITINERANT MERCHANT ---- SATURDAY
	ITINERANT_MERCHANT_SATURDAY: {
		shopId: 18,
		name: 'merchant',
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [
			{
				id: ingredientList.MEROU_LUJIDANE.ingredientId,
				price: 100,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.POISSON_VENGEUR.ingredientId,
				price: 300,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.AN_GUILI_GUILILLE.ingredientId,
				price: 1500,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.GLOBULOS.ingredientId,
				price: 1500,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.SUPER_POISSON.ingredientId,
				price: 1500,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.TOUFFE_DE_FOURRURE.ingredientId,
				price: 350,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ROCHE_RADIO_ACTIVE.ingredientId,
				price: 500,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.GRIFFES_ACEREES.ingredientId,
				price: 750,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.CORNE_EN_CHOCOLAT.ingredientId,
				price: 1000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.OEIL_VISQUEUX.ingredientId,
				price: 1300,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.LANGUE_MONSTRUEUSE.ingredientId,
				price: 10000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.DENT_DE_DOROGON.ingredientId,
				price: 12000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ENERGIE_FOUDRE.ingredientId,
				price: 300,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ENERGIE_AIR.ingredientId,
				price: 1000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ENERGIE_EAU.ingredientId,
				price: 4000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ENERGIE_FEU.ingredientId,
				price: 4000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ENERGIE_BOIS.ingredientId,
				price: 4000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.SILEX_TAILLE.ingredientId,
				price: 150,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.FRAGMENT_DE_TEXTE_ANCIEN.ingredientId,
				price: 1000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.VIEIL_ANNEAU_PRECIEUX.ingredientId,
				price: 8000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.CALICE_CISELE.ingredientId,
				price: 8000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.COLLIER_KARAT.ingredientId,
				price: 8000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.BROCHE_EN_PARFAIT_ETAT.ingredientId,
				price: 30000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.SUPERBE_COURONNE_ROYALE.ingredientId,
				price: 40000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.BRAS_MECANIQUE.ingredientId,
				price: 23000,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
				price: 75,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
				price: 130,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				price: 230,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.RACINE_DE_FIGONICIA.ingredientId,
				price: 230,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.SADIQUAE_MORDICUS.ingredientId,
				price: 230,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.FLAUREOLE.ingredientId,
				price: 500,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.SPORE_ETHERAL.ingredientId,
				price: 150,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.POUSSE_SOMBRE.ingredientId,
				price: 300,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.GRAINE_DE_DEVOREUSE.ingredientId,
				price: 15000,
				type: ItemShopType.INGREDIENT
			}
		],
		condition: {
			[ConditionEnum.DAY]: DayEnum.SATURDAY
		}
	},
	// ITINERANT MERCHANT ---- SUNDAY ---- SHOP CLOSED
	ITINERANT_MERCHANT_SUNDAY: {
		shopId: 19,
		name: 'merchant',
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [],
		condition: {
			[ConditionEnum.DAY]: DayEnum.SUNDAY
		}
	},
	FILOU: {
		shopId: 20,
		name: 'filou',
		placeId: PlaceEnum.PLACE_DU_MARCHE,
		type: ShopType.FILOU,
		listItemsSold: [
			{
				id: ingredientList.MEROU_LUJIDANE.ingredientId,
				price: 11,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
				price: 18,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.ENERGIE_FOUDRE.ingredientId,
				price: 4,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.SILEX_TAILLE.ingredientId,
				price: 6,
				type: ItemShopType.INGREDIENT
			},
			{
				id: ingredientList.TOUFFE_DE_FOURRURE.ingredientId,
				price: 4,
				type: ItemShopType.INGREDIENT
			}
		]
	}
};
