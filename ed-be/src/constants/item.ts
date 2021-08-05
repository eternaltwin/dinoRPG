import { ItemFiche } from '../models';

// Note:
// Price is for the players' market. If 0 the item cannot be sold.
export const listOfAllItems = ({
	// Irma's Potion: new action
	POTION_IRMA: {
		itemId: 1,
		name: 'potion_irma',
		canBeEquipped: false,
		canBeUsedNow: true,
		quantity: 0,
		maxQuantity: 80,
		price: 450,
	},
	// Angel potion: resurrects a dino
	POTION_ANGEL: {
		itemId: 2,
		name: 'potion_angel',
		canBeEquipped: false,
		canBeUsedNow: true,
		quantity: 0,
		maxQuantity: 8,
		price: 1000,
	},
	// Cloud burger: heals 10
	CLOUD_BURGER: {
		itemId: 3,
		name: 'cloud_burger',
		canBeEquipped: true,
		canBeUsedNow: true,
		quantity: 0,
		maxQuantity: 24,
		price: 350,
	},
	// Authentic hot bread: heals 100
	HOT_BREAD: {
		itemId: 4,
		name: 'hot_bread',
		canBeEquipped: false,
		canBeUsedNow: true,
		quantity: 0,
		maxQuantity: 8,
		price: 3000,
	},
	// Meat pie: heals 30
	MEAT_PIE: {
		itemId: 5,
		name: 'meat_pie',
		canBeEquipped: false,
		canBeUsedNow: true,
		quantity: 0,
		maxQuantity: 16,
		price: 1000,
	},
	// Fight ration: heals up to 20 during a fight
	FIGHT_RATION: {
		itemId: 6,
		name: 'fight_ration',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 8,
		price: 500,
	},
	// Surviving ration: heals between 10 and 40 during a fight
	SURVIVING_RATION: {
		itemId: 7,
		name: 'surviving_ration',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 8,
		price: 500, // TODO double check
	},
	// Goblin's Merguez: heals ?? during a fight
	GLOBIN_MERGUEZ: {
		itemId: 8,
		name: 'globin_merguez',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 4,
		price: 500, // TODO double check
	},
	// Pampleboum: heals 15
	PAMPLEBOUM: {
		itemId: 9,
		name: 'pampleboum',
		canBeEquipped: false,
		canBeUsedNow: true,
		quantity: 0,
		maxQuantity: 8,
		price: 500, // TODO double check
	},
	// SOS Helmet: increases armor by 1 in a fight
	SOS_HELMET: {
		itemId: 10,
		name: 'sos_helmet',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 12,
		price: 150,
	},
	// Little pepper: increases next assault value by 10
	LITTLE_PEPPER: {
		itemId: 11,
		name: 'little_pepper',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 12,
		price: 150,
	},
	// Zippo: Set dino on fire during a fight
	ZIPPO: {
		itemId: 12,
		name: 'zippo',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 12,
		price: 150,
	},
	// SOS flame: summons a flame to fight with you
	SOS_FLAME: {
		itemId: 12,
		name: 'sos_flame',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 80,
		price: 150,
	},
	// Refrigerated Shield: Increases fire defense by 20 during a fight
	REFRIGERATED_SHIELD: {
		itemId: 13,
		name: 'refrigerated_shield',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 12,
		price: 150,
	},
	// Fuca Pill: increases attack speed by 50% during a fight
	FUCA_PILL: {
		itemId: 14,
		name: 'fuca_pill',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 4,
		price: 150, // TODO double check
	},
	// Monochromatic: all standards assault hit of the highest element of the dino during a fight (but speed follows normal rotation)
	MONOCHROMATIC: {
		itemId: 15,
		name: 'monochromatic',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 4,
		price: 150, // TODO double check
	},
	// Poisonite Shot: heals poison during a fight / prevents to be poisoned during a fight??
	POISONITE_SHOT: {
		itemId: 16,
		name: 'poisonite_shot',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 8,
		price: 150, // TODO double check
	},
	// Loris's Costume: makes an enemy attack someone else on his side during a fight
	LORIS_COSTUME: {
		itemId: 17,
		name: 'loris_costume',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 8,
		price: 1234, // TODO double check
	},
	// Vegetox Guard's Costume: Disguise a dino into a vegetox guard
	VEGETOX_COSTUME: {
		itemId: 18,
		name: 'vegetox_costume',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 4,
		price: 1234, // TODO double check
	},
	// Goblin's Costume: Disguise a dino into a gobelin
	GOBLIN_COSTUME: {
		itemId: 19,
		name: 'goblin_costume',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 4,
		price: 1234, // TODO double check
	},
	// Pampleboum Pit: give a bonus to an assault (%, fixed valued??)
	PAMPLEBOUM_PIT: {
		itemId: 20,
		name: 'pampleboum_pit',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 12,
		price: 1234, // TODO double check
	},
	// Example to copy paste to add objects
	EXAMPLE: {
		itemId: 999,
		name: 'example',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 123,
		price: 1234, // TODO double check
	},
} as unknown) as { [name: string]: ItemFiche };
