import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { ShopType } from '../enums/ShopType.mjs';
import { ShopFiche } from './ShopFiche.mjs';
import { itemList } from '../item/ItemList.mjs';
import { ConditionEnum, Operator } from '../enums/Parser.mjs';
import { DinozStatusId } from '../dinoz/StatusList.mjs';
import { ingredientList } from '../ingredient/ingredientList.mjs';
import { DayEnum } from '../enums/dayEnum.mjs';

export const shopList: Readonly<Record<string, ShopFiche>> = {
	// Flying Shop
	FLYING_SHOP: {
		shopId: 1,
		placeId: PlaceEnum.ANYWHERE,
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
		placeId: PlaceEnum.FORGES_DU_GTC,
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
		placeId: PlaceEnum.DINOVILLE,
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
		],
		condition: {
			[ConditionEnum.POSSESS_OBJECT]: itemList.GOLDEN_NAPODINO.itemId
		}
	},
	// Cursed Shop, only accessible by cursed dinoz
	CURSED_SHOP: {
		shopId: 4,
		placeId: PlaceEnum.RUINES_ASHPOUK,
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
		],
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.CURSED
		}
	},
	// Fruity Shop
	FRUITY_SHOP: {
		shopId: 5,
		placeId: PlaceEnum.PORTE_DE_SYLVENOIRE,
		type: ShopType.CLASSIC,
		listItemsSold: [
			{
				itemId: itemList.PAMPLEBOUM.itemId,
				price: 1800
			}
		],
		condition: {
			[ConditionEnum.STATUS]: DinozStatusId.FLOWERING_BRANCH
		}
	},
	// Razad's Shop
	RAZADS_SHOP: {
		shopId: 6,
		placeId: PlaceEnum.AVANT_POSTE_ROCKY,
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
		placeId: PlaceEnum.PYLONES_DE_MAGNETITES,
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
		placeId: PlaceEnum.SENTIER_DE_TOUTEMBA,
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
		placeId: PlaceEnum.CAMP_DES_EMMEMMA,
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
		placeId: PlaceEnum.REPAIRE_DE_LA_TEAM_W,
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
		placeId: PlaceEnum.CAMP_D_ELITE,
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
		placeId: PlaceEnum.CITE_ARBORIS,
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
	},
	// ITINERANT MERCHANT ---- MONDAY
	ITINERANT_MERCHANT_MONDAY: {
		shopId: 13,
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [
			{
				ingredientId: ingredientList.ENERGIE_FOUDRE.ingredientId,
				price: 300
			},
			{
				ingredientId: ingredientList.ENERGIE_AIR.ingredientId,
				price: 1000
			},
			{
				ingredientId: ingredientList.ENERGIE_EAU.ingredientId,
				price: 4000
			},
			{
				ingredientId: ingredientList.ENERGIE_FEU.ingredientId,
				price: 4000
			},
			{
				ingredientId: ingredientList.ENERGIE_BOIS.ingredientId,
				price: 300
			}
		],
		condition: {
			[ConditionEnum.DAY]: DayEnum.MONDAY
		}
	},
	// ITINERANT MERCHANT ---- TUESDAY
	ITINERANT_MERCHANT_TUESDAY: {
		shopId: 14,
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [
			{
				ingredientId: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
				price: 75
			},
			{
				ingredientId: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
				price: 130
			},
			{
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				price: 230
			},
			{
				ingredientId: ingredientList.RACINE_DE_FIGONICIA.ingredientId,
				price: 230
			},
			{
				ingredientId: ingredientList.SADIQUAE_MORDICUS.ingredientId,
				price: 230
			},
			{
				ingredientId: ingredientList.FLAUREOLE.ingredientId,
				price: 500
			},
			{
				ingredientId: ingredientList.SPORE_ETHERAL.ingredientId,
				price: 150
			},
			{
				ingredientId: ingredientList.POUSSE_SOMBRE.ingredientId,
				price: 300
			}
		],
		condition: {
			[ConditionEnum.DAY]: DayEnum.TUESDAY
		}
	},
	// ITINERANT MERCHANT ---- WEDNESDAY
	ITINERANT_MERCHANT_WEDNESDAY: {
		shopId: 15,
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [
			{
				ingredientId: ingredientList.SILEX_TAILLE.ingredientId,
				price: 150
			},
			{
				ingredientId: ingredientList.FRAGMENT_DE_TEXTE_ANCIEN.ingredientId,
				price: 1000
			},
			{
				ingredientId: ingredientList.VIEIL_ANNEAU_PRECIEUX.ingredientId,
				price: 8000
			},
			{
				ingredientId: ingredientList.CALICE_CISELE.ingredientId,
				price: 8000
			},
			{
				ingredientId: ingredientList.COLLIER_KARAT.ingredientId,
				price: 8000
			},
			{
				ingredientId: ingredientList.BROCHE_EN_PARFAIT_ETAT.ingredientId,
				price: 30000
			},
			{
				ingredientId: ingredientList.SUPERBE_COURONNE_ROYALE.ingredientId,
				price: 40000
			},
			{
				ingredientId: ingredientList.BRAS_MECANIQUE.ingredientId,
				price: 23000
			}
		],
		condition: {
			[ConditionEnum.DAY]: DayEnum.WEDNESDAY
		}
	},
	// ITINERANT MERCHANT ---- THURSDAY
	ITINERANT_MERCHANT_THURSDAY: {
		shopId: 16,
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [
			{
				ingredientId: ingredientList.TOUFFE_DE_FOURRURE.ingredientId,
				price: 350
			},
			{
				ingredientId: ingredientList.ROCHE_RADIO_ACTIVE.ingredientId,
				price: 500
			},
			{
				ingredientId: ingredientList.GRIFFES_ACEREES.ingredientId,
				price: 750
			},
			{
				ingredientId: ingredientList.CORNE_EN_CHOCOLAT.ingredientId,
				price: 1000
			},
			{
				ingredientId: ingredientList.OEIL_VISQUEUX.ingredientId,
				price: 1300
			},
			{
				ingredientId: ingredientList.LANGUE_MONSTRUEUSE.ingredientId,
				price: 10000
			},
			{
				ingredientId: ingredientList.DENT_DE_DOROGON.ingredientId,
				price: 12000
			}
		],
		condition: {
			[ConditionEnum.DAY]: DayEnum.THURSDAY
		}
	},
	// ITINERANT MERCHANT ---- FRIDAY
	ITINERANT_MERCHANT_FRIDAY: {
		shopId: 17,
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [
			{
				ingredientId: ingredientList.MEROU_LUJIDANE.ingredientId,
				price: 100
			},
			{
				ingredientId: ingredientList.POISSON_VENGEUR.ingredientId,
				price: 300
			},
			{
				ingredientId: ingredientList.AN_GUILI_GUILILLE.ingredientId,
				price: 1500
			},
			{
				ingredientId: ingredientList.GLOBULOS.ingredientId,
				price: 1500
			},
			{
				ingredientId: ingredientList.SUPER_POISSON.ingredientId,
				price: 1500
			}
		],
		condition: {
			[ConditionEnum.DAY]: DayEnum.FRIDAY
		}
	},
	// ITINERANT MERCHANT ---- SATURDAY
	ITINERANT_MERCHANT_SATURDAY: {
		shopId: 18,
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [
			{
				ingredientId: ingredientList.MEROU_LUJIDANE.ingredientId,
				price: 100
			},
			{
				ingredientId: ingredientList.POISSON_VENGEUR.ingredientId,
				price: 300
			},
			{
				ingredientId: ingredientList.AN_GUILI_GUILILLE.ingredientId,
				price: 1500
			},
			{
				ingredientId: ingredientList.GLOBULOS.ingredientId,
				price: 1500
			},
			{
				ingredientId: ingredientList.SUPER_POISSON.ingredientId,
				price: 1500
			},
			{
				ingredientId: ingredientList.TOUFFE_DE_FOURRURE.ingredientId,
				price: 350
			},
			{
				ingredientId: ingredientList.ROCHE_RADIO_ACTIVE.ingredientId,
				price: 500
			},
			{
				ingredientId: ingredientList.GRIFFES_ACEREES.ingredientId,
				price: 750
			},
			{
				ingredientId: ingredientList.CORNE_EN_CHOCOLAT.ingredientId,
				price: 1000
			},
			{
				ingredientId: ingredientList.OEIL_VISQUEUX.ingredientId,
				price: 1300
			},
			{
				ingredientId: ingredientList.LANGUE_MONSTRUEUSE.ingredientId,
				price: 10000
			},
			{
				ingredientId: ingredientList.DENT_DE_DOROGON.ingredientId,
				price: 12000
			},
			{
				ingredientId: ingredientList.ENERGIE_FOUDRE.ingredientId,
				price: 300
			},
			{
				ingredientId: ingredientList.ENERGIE_AIR.ingredientId,
				price: 1000
			},
			{
				ingredientId: ingredientList.ENERGIE_EAU.ingredientId,
				price: 4000
			},
			{
				ingredientId: ingredientList.ENERGIE_FEU.ingredientId,
				price: 4000
			},
			{
				ingredientId: ingredientList.ENERGIE_BOIS.ingredientId,
				price: 300
			},
			{
				ingredientId: ingredientList.SILEX_TAILLE.ingredientId,
				price: 150
			},
			{
				ingredientId: ingredientList.FRAGMENT_DE_TEXTE_ANCIEN.ingredientId,
				price: 1000
			},
			{
				ingredientId: ingredientList.VIEIL_ANNEAU_PRECIEUX.ingredientId,
				price: 8000
			},
			{
				ingredientId: ingredientList.CALICE_CISELE.ingredientId,
				price: 8000
			},
			{
				ingredientId: ingredientList.COLLIER_KARAT.ingredientId,
				price: 8000
			},
			{
				ingredientId: ingredientList.BROCHE_EN_PARFAIT_ETAT.ingredientId,
				price: 30000
			},
			{
				ingredientId: ingredientList.SUPERBE_COURONNE_ROYALE.ingredientId,
				price: 40000
			},
			{
				ingredientId: ingredientList.BRAS_MECANIQUE.ingredientId,
				price: 23000
			},
			{
				ingredientId: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
				price: 75
			},
			{
				ingredientId: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
				price: 130
			},
			{
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				price: 230
			},
			{
				ingredientId: ingredientList.RACINE_DE_FIGONICIA.ingredientId,
				price: 230
			},
			{
				ingredientId: ingredientList.SADIQUAE_MORDICUS.ingredientId,
				price: 230
			},
			{
				ingredientId: ingredientList.FLAUREOLE.ingredientId,
				price: 500
			},
			{
				ingredientId: ingredientList.SPORE_ETHERAL.ingredientId,
				price: 150
			},
			{
				ingredientId: ingredientList.POUSSE_SOMBRE.ingredientId,
				price: 300
			},
			{
				ingredientId: ingredientList.GRAINE_DE_DEVOREUSE.ingredientId,
				price: 15000
			}
		],
		condition: {
			[ConditionEnum.DAY]: DayEnum.SUNDAY
		}
	},
	// ITINERANT MERCHANT ---- SUNDAY ---- SHOP CLOSED
	ITINERANT_MERCHANT_SUNDAY: {
		shopId: 19,
		placeId: PlaceEnum.NOWHERE,
		type: ShopType.ITINERANT,
		listItemsSold: [],
		condition: {
			[ConditionEnum.DAY]: DayEnum.SATURDAY
		}
	}
};
