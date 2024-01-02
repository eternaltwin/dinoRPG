import { raceList } from '../dinoz/RaceList.mjs';
import { ElementType } from '../enums/ElementType.mjs';
import { ItemEffect } from '../enums/ItemEffect.mjs';
import { ItemType } from '../enums/ItemType.mjs';
import { ItemFiche } from './ItemFiche.mjs';

export const itemNames = [
	'POTION_IRMA',
	'POTION_ANGEL',
	'CLOUD_BURGER',
	'HOT_BREAD',
	'MEAT_PIE',
	'FIGHT_RATION',
	'SURVIVING_RATION',
	'GOBLIN_MERGUEZ',
	'PAMPLEBOUM',
	'SOS_HELMET',
	'LITTLE_PEPPER',
	'ZIPPO',
	'SOS_FLAME',
	'REFRIGERATED_SHIELD',
	'FUCA_PILL',
	'MONOCHROMATIC',
	'POISONITE_SHOT',
	'LORIS_COSTUME',
	'VEGETOX_COSTUME',
	'GOBLIN_COSTUME',
	'PAMPLEBOUM_PIT',
	'PORTABLE_LOVE',
	'DANGER_DETECTOR',
	'PIRHANOZ_IN_BAG',
	'DEVIL_OINTMENT',
	'LAND_OF_ASHES',
	'ABYSS',
	'AMAZON',
	'ST_ELMAS_FIRE',
	'UVAVU',
	'STRONG_TEA',
	'TEMPORAL_STABILISER',
	'ELIXIR',
	'ELIXIR_OF_LIFE',
	'BANISHMENT',
	'BATTERING_RAM',
	'EMBER',
	'SCALE',
	'BEER',
	'ENCYCLOPEDIA',
	'ANTICHROMATIC',
	'ANTIDOTE',
	'TIME_MANIPULATOR',
	'DIMENSIONAL_POWDER',
	'SORCERERS_STICK',
	'FRIENDLY_WHISTLE',
	'DINOZ_CUBE',
	'TEMPORAL_REDUCTION',
	'TEAR_OF_LIFE',
	'CUZCUSSIAN_MASK',
	'ANTI_GRAVE_SUIT',
	'ENCHANTED_STEROID',
	'CURSE_LOCKER',
	'FEAR_FACTOR',
	'LIFE_STEALER',
	'FIRE_SPHERE',
	'WOOD_SPHERE',
	'WATER_SPHERE',
	'LIGHTNING_SPHERE',
	'AIR_SPHERE',
	'DEMON_TICKET',
	'TREASURE_COUPON',
	'MOUEFFE_EGG',
	'MOUEFFE_EGG_RARE',
	'PIGMOU_EGG',
	'PIGMOU_EGG_RARE',
	'WINKS_EGG',
	'WINKS_EGG_RARE',
	'PLANAILLE_EGG',
	'PLANAILLE_EGG_RARE',
	'CASTIVORE_EGG',
	'CASTIVORE_EGG_RARE',
	'ROCKY_EGG',
	'ROCKY_EGG_RARE',
	'PTEROZ_EGG',
	'PTEROZ_EGG_RARE',
	'NUAGOZ_EGG',
	'NUAGOZ_EGG_RARE',
	'SIRAIN_EGG',
	'SIRAIN_EGG_RARE',
	'HIPPOCLAMP_EGG',
	'HIPPOCLAMP_EGG_RARE',
	'GORILLOZ_EGG',
	'GORILLOZ_EGG_RARE',
	'WANWAN_EGG',
	'WANWAN_EGG_RARE',
	'WANWAN_BABY_RARE',
	'SANTAZ_EGG',
	'SANTAZ_EGG_RARE',
	'FEROSS_EGG',
	'FEROSS_EGG_RARE',
	'FEROSS_EGG_CHRISTMAS',
	'KABUKI_EGG',
	'RARE_KABUKI_EGG',
	'MAHAMUTI_EGG',
	'RARE_MAHAMUTI_EGG',
	'SOUFFLET_EGG',
	'SOUFFLET_EGG_RARE',
	'TOUFUFU_BABY',
	'TOUFUFU_BABY_RARE',
	'QUETZU_EGG',
	'QUETZU_EGG_RARE',
	'SMOG_EGG',
	'SMOG_EGG_ANNIVERSARY',
	'SMOG_EGG_CHRISTMAS_BLUE',
	'SMOG_EGG_CHRISTMAS_GREEN',
	'TRICERAGNON_BABY',
	'TRICERAGNON_EGG_BABY',
	'AMNESIC_RICE',
	'TIK_BRACELET',
	'MAGIC_STAR',
	'GOLDEN_NAPODINO',
	'BAMBOO_FRIEND',
	'CANDLE_CARD',
	'CHRISTMAS_TICKET',
	'TICTAC_TICKET',
	'DOUBLE_NOT_USED',
	'EASTER_EGG',
	'FIRE_CRACKER',
	'SPECIAL_IRMA_POTION',
	'GOLD100',
	'GOLD500',
	'GOLD1000',
	'GOLD2000',
	'GOLD2500',
	'GOLD3000',
	'GOLD5000',
	'GOLD10000',
	'GOLD20000',
	'CHRISTMAS_EGG',
	'GODFATHER_TICKET',
	'SAGE_POINT',
	'FRAGMENT_A',
	'FRAGMENT_B',
	'FRAGMENT_C',
	'FRAGMENT_D',
	'FRAGMENT_E',
	'FRAGMENT_F',
	'FRAGMENT_G',
	'STEPPE_METAL',
	'ICE_SHRED',
	'BATTERY',
	'DAILY_TICKET',
	'EMPTY',
	'UNDEFINED'
] as const;

export type ItemName = typeof itemNames[number];

// Note:
// Price is for the players' market. If 0 the item cannot be sold.
export const itemList: Readonly<Record<ItemName, ItemFiche>> = {
	// Irma's Potion: new action
	POTION_IRMA: {
		itemId: 1,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 100,
		price: 450, // TODO double check
		effect: {
			category: ItemEffect.ACTION,
			value: 1
		}
	},
	// Angel potion: resurrects a dino
	POTION_ANGEL: {
		itemId: 2,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		price: 1000, // TODO double check
		effect: {
			category: ItemEffect.RESURRECT,
			value: 1
		}
	},
	// Cloud burger: heals 10
	CLOUD_BURGER: {
		itemId: 3,
		canBeEquipped: true,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 30,
		price: 350, // TODO double check
		effect: {
			category: ItemEffect.HEAL,
			value: 10
		}
	},
	// Authentic hot bread: heals 100
	HOT_BREAD: {
		itemId: 4,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		price: 3000, // TODO double check
		effect: {
			category: ItemEffect.HEAL,
			value: 100
		}
	},
	// Meat pie: heals 30
	MEAT_PIE: {
		itemId: 5,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 20,
		price: 1000, // TODO double check
		effect: {
			category: ItemEffect.HEAL,
			value: 30
		}
	},
	// Fight ration: heals up to 20 during a fight
	FIGHT_RATION: {
		itemId: 6,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		price: 500 // TODO double check
	},
	// Surviving ration: heals between 10 and 40 during a fight
	SURVIVING_RATION: {
		itemId: 7,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		price: 500 // TODO double check
	},
	// Goblin's Merguez: heals ?? during a fight
	GOBLIN_MERGUEZ: {
		itemId: 8,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		price: 500 // TODO double check
	},
	// Pampleboum: heals 15
	PAMPLEBOUM: {
		itemId: 9,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		effect: {
			category: ItemEffect.SPECIAL,
			value: 'pampleboum'
		},
		price: 500 // TODO double check
	},
	// SOS Helmet: increases armor by 1 in a fight
	SOS_HELMET: {
		itemId: 10,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 15,
		price: 150 // TODO double check
	},
	// Little pepper: increases next assault value by 10
	LITTLE_PEPPER: {
		itemId: 11,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 15,
		price: 150 // TODO double check
	},
	// Zippo: Set dino on fire during a fight
	ZIPPO: {
		itemId: 12,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 15,
		price: 150 // TODO double check
	},
	// SOS flame: summons a flame to fight with you
	SOS_FLAME: {
		itemId: 13,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 15,
		price: 150 // TODO double check
	},
	// Refrigerated Shield: Increases fire defense by 20 during a fight
	REFRIGERATED_SHIELD: {
		itemId: 14,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 15,
		price: 150 // TODO double check
	},
	// Fuca Pill: increases attack speed by 50% during a fight
	FUCA_PILL: {
		itemId: 15,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		price: 150 // TODO double check
	},
	// Monochromatic: all standards assault hit of the highest element of the dino during a fight (but speed follows normal rotation)
	MONOCHROMATIC: {
		itemId: 16,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		price: 5000
	},
	// Poisonite Shot: heals poison during a fight / prevents to be poisoned during a fight??
	POISONITE_SHOT: {
		itemId: 17,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		price: 300
	},
	// Loris's Costume: makes an enemy attack someone else on his side during a fight
	LORIS_COSTUME: {
		itemId: 18,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		price: 400
	},
	// Vegetox Guard's Costume: Disguise a dino into a vegetox guard
	VEGETOX_COSTUME: {
		itemId: 19,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		price: 1000
	},
	// Goblin's Costume: Disguise a dino into a gobelin
	GOBLIN_COSTUME: {
		itemId: 20,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		price: 1000
	},
	// Pampleboum Pit: give a bonus to an assault (%, fixed valued??)
	PAMPLEBOUM_PIT: {
		itemId: 21,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 15,
		price: 1234 // TODO double check
	},
	// Portable Love: can attack flying dinoz
	PORTABLE_LOVE: {
		itemId: 22,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		price: 300
	},
	// Danger Detector: protects against an attack that inflicts more than 25 hp
	DANGER_DETECTOR: {
		itemId: 23,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		price: 4000
	},
	// Pirhanoz in bag: summons a pirhanoz
	PIRHANOZ_IN_BAG: {
		itemId: 24,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CURSED,
		isRare: false,
		maxQuantity: 10,
		price: 1234 // TODO double check
	},
	// Devil Ointment: removes the curse from a dino, and restoring its ability
	// to gain XP during fights.
	DEVIL_OINTMENT: {
		itemId: 25,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CURSED,
		isRare: true,
		maxQuantity: 5, // TODO double check
		price: 5000,
		effect: {
			category: ItemEffect.SPECIAL,
			value: 'ointment'
		}
	},
	// Land of Ashes (Ember): turns the combat zone into a suffocating furnace.
	// All Dinoz with a Fire element of less than 10 points will no longer use elements
	// A or E for the next three turns.
	LAND_OF_ASHES: {
		itemId: 26,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 1,
		price: 2000
	},
	// Abyss: plunges the combat zone into an abyss.
	// All Dinoz with a Water element of less than 10 points will see the strength
	// of their attacks and assaults drop by 25% for the next three turns.
	ABYSS: {
		itemId: 27,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 1,
		price: 2000
	},
	// Amazon: transports the combat zone into the middle of a tropical jungle.
	// All Dinoz with a Wood element of less than 10 points will sleep for the
	// next three turns unless they are subjected to an attack which causes them to lose 10 HP.
	AMAZON: {
		itemId: 28,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 1,
		price: 2000
	},
	// St Elma's Fire: surrounds the combat zone with a powerful magnetic field.
	// All Dinoz with a Lightning element of less than 10 points will lose 5% of
	// their HP for the next three turns.
	ST_ELMAS_FIRE: {
		itemId: 29,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 1,
		price: 2000
	},
	// Uvavu: plunges the combat zone into the middle of a devastating storm.
	// All Dinoz with an Air element of less than 10 points will lose 50% of
	// their speed for the next three turns.
	UVAVU: {
		itemId: 30,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 1,
		price: 2000
	},
	// Strong Tea: allows you to cancel the effects of beer on the opposing team.
	STRONG_TEA: {
		itemId: 31,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		price: 2000
	},
	// Temporal Stabiliser: ??
	TEMPORAL_STABILISER: {
		itemId: 32,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 10,
		price: 3000
	},
	// Elixir: heals 200, Chen's shop
	ELIXIR: {
		itemId: 33,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5,
		effect: {
			category: ItemEffect.HEAL,
			value: 200
		},
		price: 1234 // TODO double check
	},

	// Elixir of Life: quest item to heal the Venerable Dragon
	ELIXIR_OF_LIFE: {
		itemId: 34,
		canBeEquipped: false, // TODO double check
		canBeUsedNow: false, // TODO double check
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 1, // TODO double check
		price: 1234 // TODO double check
	},
	// Banishement: prevents a dinoz from calling reinforcements during a battle
	BANISHMENT: {
		itemId: 35,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 3 // TODO double check
	},
	// Battering Ram: dinoz attacks castle twice if victorious
	BATTERING_RAM: {
		itemId: 36,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 5 // TODO double check
	},
	// Ember (braise): increases fire assault of all fighters by 30%
	EMBER: {
		itemId: 37,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 5 // TODO double check
	},
	// Scale: an enemy dinoz will be killed if your dinoz dies during a fight
	SCALE: {
		itemId: 38,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 7 // TODO double check
	},
	// Beer: prevents all dinoz from healing during a fight
	BEER: {
		itemId: 39,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 3 // TODO double check
	},
	// Encyclopedia: increases experience gain by 15%
	ENCYCLOPEDIA: {
		itemId: 40,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 6 // TODO double check
	},
	// Antichromatic: cancels the effect of monochromatics used by the enemy
	ANTICHROMATIC: {
		itemId: 41,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 4 // TODO double check
	},
	// Antidote: permanently immunize against poisons
	ANTIDOTE: {
		itemId: 42,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 5 // TODO double check
	},
	// Time Manipulator (Temporary Manipulator?): prevents all dinoz from using E skills in a fight
	TIME_MANIPULATOR: {
		itemId: 43,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 5 // TODO double check
	},
	// Dimensional Powder (Parallel Dimension?): if the dinoz HP falls below 10%, it will be engulfed in a black hole
	// and leave the fight
	DIMENSIONAL_POWDER: {
		itemId: 44,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 6 // TODO double check
	},
	// Sorcerer's Stick: reduces the hp of a random (enemy?) dinoz by 30% (It replaces an attack)
	SORCERERS_STICK: {
		itemId: 45,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 7 // TODO double check
	},
	// Friendly Whistle: when the dinoz launches an assault on another dinoz, the other friendly dinoz (without whistle) will
	// attack it too
	FRIENDLY_WHISTLE: {
		itemId: 46,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 8 // TODO double check
	},
	// Dinoz Cube: allows the dinoz to redraw from the element grid when it levels up until level 10. Like Career Plan
	// (Does not cumulate though with Career Plan though)
	DINOZ_CUBE: {
		itemId: 47,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 9 // TODO double check
	},
	// Temporal Reduction: reduces initiative bonuses and penalties by 50% on the equipped dinoz
	TEMPORAL_REDUCTION: {
		itemId: 48,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 5 // TODO double check
	},
	// Tear of Life: gives clones 10% of the life of the casting Dinoz
	TEAR_OF_LIFE: {
		itemId: 49,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 6 // TODO double check
	},
	// Cuzcussian Mask: makes the wearer's teammates immune to Hypnosis
	CUZCUSSIAN_MASK: {
		itemId: 50,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 8 // TODO double check
	},
	// Anti-grave Suit: makes the wearer's teammates immune to Black Hole
	ANTI_GRAVE_SUIT: {
		itemId: 51,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 6 // TODO double check
	},
	// Enchanted Steroid: makes the equipped dinoz immune to penalties to max endurance
	ENCHANTED_STEROID: {
		itemId: 52,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 6 // TODO double check
	},
	// Curse Locker: restricts a random enemy to using their weakest element for 3 turns
	CURSE_LOCKER: {
		itemId: 53,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 4 // TODO double check
	},
	// Fear Factor (Trouillomètre): a dinoz with the Brave skill but which carries this\
	// object can now form groups with dinoz with the same key element as they do
	FEAR_FACTOR: {
		itemId: 54,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 8 // TODO double check
	},
	// Life Stealer: when the wearer's hp falls below 20, it steals 30 hp to a random enemy
	LIFE_STEALER: {
		itemId: 55,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 5,
		price: 0 // TODO double check
	},
	// Fire Sphere
	FIRE_SPHERE: {
		itemId: 56,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		effect: {
			category: ItemEffect.SPHERE,
			value: ElementType.FIRE
		},
		price: 0 // TODO double check
	},
	// Wood Sphere
	WOOD_SPHERE: {
		itemId: 57,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		effect: {
			category: ItemEffect.SPHERE,
			value: ElementType.WOOD
		},
		price: 0 // TODO double check
	},
	// Water Sphere
	WATER_SPHERE: {
		itemId: 58,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		effect: {
			category: ItemEffect.SPHERE,
			value: ElementType.WATER
		},
		price: 0 // TODO double check
	},
	// Lightning Sphere
	LIGHTNING_SPHERE: {
		itemId: 59,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		effect: {
			category: ItemEffect.SPHERE,
			value: ElementType.LIGHTNING
		},
		price: 0 // TODO double check
	},
	// Air Sphere
	AIR_SPHERE: {
		itemId: 60,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		maxQuantity: 100,
		effect: {
			category: ItemEffect.SPHERE,
			value: ElementType.AIR
		},
		price: 0 // TODO double check
	},
	// Demon Ticket
	DEMON_TICKET: {
		itemId: 61,
		canBeEquipped: false,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 8000,
		price: 0
	},
	// Treasure Coupon
	TREASURE_COUPON: {
		itemId: 62,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 9999,
		effect: {
			category: ItemEffect.GOLD,
			value: 1000
		},
		price: 0
	},
	// Some of those eggs may not exist, yet they should be added for consistency
	// The order matches the order in constants/race.ts
	// Moueffe Egg
	MOUEFFE_EGG: {
		itemId: 63,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.MOUEFFE,
			rare: false
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rare Moueffe Egg
	MOUEFFE_EGG_RARE: {
		itemId: 64,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.MOUEFFE,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Pigmou Egg
	PIGMOU_EGG: {
		itemId: 65,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.PIGMOU,
			rare: false
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rare Pigmou Egg
	PIGMOU_EGG_RARE: {
		itemId: 66,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.PIGMOU,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Winks Egg
	WINKS_EGG: {
		itemId: 67,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.WINKS,
			rare: false
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rare Winks Egg
	WINKS_EGG_RARE: {
		itemId: 68,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.WINKS,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Planaille Egg
	PLANAILLE_EGG: {
		itemId: 69,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.PLANAILLE,
			rare: false
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rare Planaille Egg
	PLANAILLE_EGG_RARE: {
		itemId: 70,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.PLANAILLE,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Castivore Egg
	CASTIVORE_EGG: {
		itemId: 71,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.CASTIVORE,
			rare: false
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rare Castivore Egg
	CASTIVORE_EGG_RARE: {
		itemId: 72,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.CASTIVORE,
			rare: true
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rocky Egg
	ROCKY_EGG: {
		itemId: 73,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.ROCKY,
			rare: false
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rare Rocky Egg
	ROCKY_EGG_RARE: {
		itemId: 74,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.ROCKY,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Pteroz Egg
	PTEROZ_EGG: {
		itemId: 75,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.PTEROZ,
			rare: false
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rare Pteroz Egg
	PTEROZ_EGG_RARE: {
		itemId: 76,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.PTEROZ,
			rare: true
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Nuagoz Egg
	NUAGOZ_EGG: {
		itemId: 77,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.NUAGOZ,
			rare: false
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rare Nuagoz Egg
	NUAGOZ_EGG_RARE: {
		itemId: 78,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.NUAGOZ,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Sirain Egg
	SIRAIN_EGG: {
		itemId: 79,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.SIRAIN,
			rare: false
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rare Sirain Egg
	SIRAIN_EGG_RARE: {
		itemId: 80,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.SIRAIN,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Hippoclamp Egg
	HIPPOCLAMP_EGG: {
		itemId: 81,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.HIPPOCLAMP,
			rare: false
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rare Hippoclamp Egg
	HIPPOCLAMP_EGG_RARE: {
		itemId: 82,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.HIPPOCLAMP,
			rare: true
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Gorilloz Egg
	GORILLOZ_EGG: {
		itemId: 83,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.GORILLOZ,
			rare: false
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rare Gorilloz Egg
	GORILLOZ_EGG_RARE: {
		itemId: 84,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.GORILLOZ,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Wanwan Egg
	WANWAN_EGG: {
		itemId: 85,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.WANWAN,
			rare: false
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rare Wanwan Egg
	WANWAN_EGG_RARE: {
		itemId: 86,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.WANWAN,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Rare Wanwan Baby
	WANWAN_BABY_RARE: {
		itemId: 87,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.WANWAN,
			rare: true
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Santaz Egg
	SANTAZ_EGG: {
		itemId: 88,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.SANTAZ,
			rare: false
		},
		maxQuantity: 10,
		price: 30000
	},
	// Rare Santaz Egg
	SANTAZ_EGG_RARE: {
		itemId: 89,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.SANTAZ,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Feross Egg
	FEROSS_EGG: {
		itemId: 90,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.FEROSS,
			rare: false
		},
		maxQuantity: 10,
		price: 30000
	},
	// Rare Feross Egg
	FEROSS_EGG_RARE: {
		itemId: 91,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.FEROSS,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Christmas Feross Egg
	FEROSS_EGG_CHRISTMAS: {
		itemId: 92,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.FEROSS,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Kabuki Egg
	KABUKI_EGG: {
		itemId: 93,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.KABUKI,
			rare: false
		},
		maxQuantity: 10,
		price: 30000
	},
	// Rare Kabuki Egg
	RARE_KABUKI_EGG: {
		itemId: 94,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.KABUKI,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Mahamuti Egg
	MAHAMUTI_EGG: {
		itemId: 95,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.MAHAMUTI,
			rare: false
		},
		maxQuantity: 10,
		price: 30000
	},
	// Rare Mahamuti Egg
	RARE_MAHAMUTI_EGG: {
		itemId: 96,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.MAHAMUTI,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Soufflet Egg
	SOUFFLET_EGG: {
		itemId: 97,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.SOUFFLET,
			rare: false
		},
		maxQuantity: 10,
		price: 30000
	},
	// Rare Soufflet Egg
	SOUFFLET_EGG_RARE: {
		itemId: 98,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.SOUFFLET,
			rare: true
		},
		maxQuantity: 8,
		price: 0 // TODO double check
	},
	// Toufufu Baby
	TOUFUFU_BABY: {
		itemId: 99,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.TOUFUFU,
			rare: false
		},
		maxQuantity: 2, // yes it's 2 in game
		price: 30000
	},
	// Rare Toufufu Baby
	TOUFUFU_BABY_RARE: {
		itemId: 100,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.TOUFUFU,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Quetzu Egg
	QUETZU_EGG: {
		itemId: 101,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.QUETZU,
			rare: false
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Rare Quetzu Egg
	QUETZU_EGG_RARE: {
		itemId: 102,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.QUETZU,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Smog Egg
	SMOG_EGG: {
		itemId: 103,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.SMOG,
			rare: false
		},
		maxQuantity: 10,
		price: 30000
	},
	// Anniversary Smog Egg
	SMOG_EGG_ANNIVERSARY: {
		itemId: 104,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.SMOG,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Christmas Blue Smog Egg
	SMOG_EGG_CHRISTMAS_BLUE: {
		itemId: 105,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.SMOG,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Christmas Blue Smog Egg
	SMOG_EGG_CHRISTMAS_GREEN: {
		itemId: 106,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.SMOG,
			rare: true
		},
		maxQuantity: 10,
		price: 30000
	},
	// Triceragnon Baby
	TRICERAGNON_BABY: {
		itemId: 107,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.TRICERAGNON,
			rare: false
		},
		maxQuantity: 10,
		price: 30000
	},
	// Rare Triceragnon Baby
	TRICERAGNON_EGG_BABY: {
		itemId: 108,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.EGG,
			race: raceList.TRICERAGNON,
			rare: true
		},
		maxQuantity: 8, // TODO double check
		price: 0 // TODO double check
	},
	// Amnesic Rice
	AMNESIC_RICE: {
		itemId: 109,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: true,
		effect: {
			category: ItemEffect.SPECIAL,
			value: 'rice'
		},
		maxQuantity: 5,
		price: 5000
	},
	// Tik Bracelet: heals 10 to the wearer each day
	TIK_BRACELET: {
		itemId: 110,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 1,
		price: 0
	},
	// Magic Star: used for the Strange Creature quest
	MAGIC_STAR: {
		itemId: 111,
		canBeEquipped: false,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 7,
		price: 0
	},
	// Golden Napodino: currency at the Magic Shop
	GOLDEN_NAPODINO: {
		itemId: 112,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 100,
		price: 0
	},
	// Brings a little bamboo with you in each fight
	BAMBOO_FRIEND: {
		itemId: 113,
		canBeEquipped: true,
		canBeUsedNow: false,
		itemType: ItemType.MAGICAL,
		isRare: false,
		maxQuantity: 1,
		price: 0 // TODO double check
	},
	// Anniversary tickets
	CANDLE_CARD: {
		itemId: 114,
		canBeEquipped: false,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 5000
	},
	// Tickets to use at the Christmas grid event
	CHRISTMAS_TICKET: {
		itemId: 115,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 0 // TODO double check
	},
	// Tickets to use at ??
	TICTAC_TICKET: {
		itemId: 116,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 36,
		price: 0 // TODO double check
	},
	// Error
	DOUBLE_NOT_USED: {
		itemId: 117,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 999, // TODO double check
		price: 0 // TODO double check
	},
	// Use to obtain ??, obtained during Easter event
	EASTER_EGG: {
		itemId: 118,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 999, // TODO double check
		price: 0 // TODO double check
	},
	// Ticket for Batide day
	FIRE_CRACKER: {
		itemId: 119,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 5000
	},
	// Like an irma potion, would be obtained daily from the monthly subscription
	SPECIAL_IRMA_POTION: {
		itemId: 120,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		price: 0 // TODO double check
	},
	//Used for special gather
	GOLD100: {
		itemId: 121,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		price: 100 // TODO double check
	},
	//Used for special gather
	GOLD500: {
		itemId: 122,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		price: 500 // TODO double check
	},
	//Used for special gather
	GOLD1000: {
		itemId: 123,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		price: 1000 // TODO double check
	},
	//Used for special gather
	GOLD2000: {
		itemId: 124,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		price: 2000 // TODO double check
	},
	//Used for special gather
	GOLD2500: {
		itemId: 125,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		price: 2500 // TODO double check
	},
	//Used for special gather
	GOLD3000: {
		itemId: 126,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		price: 3000 // TODO double check
	},
	//Used for special gather
	GOLD5000: {
		itemId: 127,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		price: 5000 // TODO double check
	},
	//Used for special gather
	GOLD10000: {
		itemId: 128,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		price: 10000 // TODO double check
	},
	//Used for special gather
	GOLD20000: {
		itemId: 129,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 3,
		price: 20000 // TODO double check
	},
	// Use to obtain Santaz or Trice, obtained during Christmas event
	CHRISTMAS_EGG: {
		itemId: 130,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 999, // TODO double check
		price: 0 // TODO double check
	},
	// Ticket for Batide day
	GODFATHER_TICKET: {
		itemId: 131,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 5000
	},
	// Quest item
	SAGE_POINT: {
		itemId: 132,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 0
	},
	// Quest item
	FRAGMENT_A: {
		itemId: 133,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 0
	},
	// Quest item
	FRAGMENT_B: {
		itemId: 134,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 0
	},
	// Quest item
	FRAGMENT_C: {
		itemId: 135,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 0
	},
	// Quest item
	FRAGMENT_D: {
		itemId: 136,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 0
	},
	// Quest item
	FRAGMENT_E: {
		itemId: 137,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 0
	},
	// Quest item
	FRAGMENT_F: {
		itemId: 138,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 0
	},
	// Quest item
	FRAGMENT_G: {
		itemId: 139,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 0
	},
	// Quest item
	STEPPE_METAL: {
		itemId: 140,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 0
	},
	// Quest item
	ICE_SHRED: {
		itemId: 141,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 0
	},
	// Quest item
	BATTERY: {
		itemId: 142,
		canBeEquipped: false,
		canBeUsedNow: false, // disabled for now
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 5000,
		price: 0
	},
	// Daily ticket
	DAILY_TICKET: {
		itemId: 997,
		canBeEquipped: false,
		canBeUsedNow: true,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 9999,
		price: 0
	},
	// Empty item
	EMPTY: {
		itemId: 998,
		canBeEquipped: false,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 123,
		price: 1234 // TODO double check
	},
	// Undefined item
	UNDEFINED: {
		itemId: 999,
		canBeEquipped: false,
		canBeUsedNow: false,
		itemType: ItemType.CLASSIC,
		isRare: false,
		maxQuantity: 123,
		price: 1234 // TODO double check
	}
};
