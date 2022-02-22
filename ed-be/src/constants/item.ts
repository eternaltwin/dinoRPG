import { ItemFiche } from '../models';

// Note:
// Price is for the players' market. If 0 the item cannot be sold.
export const itemList: { [name: string]: ItemFiche } = {
	// Irma's Potion: new action
	POTION_IRMA: {
		itemId: 1,
		canBeEquipped: false,
		canBeUsedNow: true,
		maxQuantity: 80,
		price: 450
	},
	// Angel potion: resurrects a dino
	POTION_ANGEL: {
		itemId: 2,
		canBeEquipped: false,
		canBeUsedNow: true,
		maxQuantity: 8,
		price: 1000
	},
	// Cloud burger: heals 10
	CLOUD_BURGER: {
		itemId: 3,
		canBeEquipped: true,
		canBeUsedNow: true,
		maxQuantity: 24,
		price: 350
	},
	// Authentic hot bread: heals 100
	HOT_BREAD: {
		itemId: 4,
		canBeEquipped: false,
		canBeUsedNow: true,
		maxQuantity: 8,
		price: 3000
	},
	// Meat pie: heals 30
	MEAT_PIE: {
		itemId: 5,
		canBeEquipped: false,
		canBeUsedNow: true,
		maxQuantity: 16,
		price: 1000
	},
	// Fight ration: heals up to 20 during a fight
	FIGHT_RATION: {
		itemId: 6,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 8,
		price: 500
	},
	// Surviving ration: heals between 10 and 40 during a fight
	SURVIVING_RATION: {
		itemId: 7,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 8,
		price: 500 // TODO double check
	},
	// Goblin's Merguez: heals ?? during a fight
	GLOBIN_MERGUEZ: {
		itemId: 8,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 4,
		price: 500 // TODO double check
	},
	// Pampleboum: heals 15
	PAMPLEBOUM: {
		itemId: 9,
		canBeEquipped: false,
		canBeUsedNow: true,
		maxQuantity: 8,
		price: 500 // TODO double check
	},
	// SOS Helmet: increases armor by 1 in a fight
	SOS_HELMET: {
		itemId: 10,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 12,
		price: 150
	},
	// Little pepper: increases next assault value by 10
	LITTLE_PEPPER: {
		itemId: 11,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 12,
		price: 150
	},
	// Zippo: Set dino on fire during a fight
	ZIPPO: {
		itemId: 12,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 12,
		price: 150
	},
	// SOS flame: summons a flame to fight with you
	SOS_FLAME: {
		itemId: 13,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 80,
		price: 150
	},
	// Refrigerated Shield: Increases fire defense by 20 during a fight
	REFRIGERATED_SHIELD: {
		itemId: 14,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 12,
		price: 150
	},
	// Fuca Pill: increases attack speed by 50% during a fight
	FUCA_PILL: {
		itemId: 15,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 4,
		price: 150 // TODO double check
	},
	// Monochromatic: all standards assault hit of the highest element of the dino during a fight (but speed follows normal rotation)
	MONOCHROMATIC: {
		itemId: 16,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 4,
		price: 150 // TODO double check
	},
	// Poisonite Shot: heals poison during a fight / prevents to be poisoned during a fight??
	POISONITE_SHOT: {
		itemId: 17,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 8,
		price: 150 // TODO double check
	},
	// Loris's Costume: makes an enemy attack someone else on his side during a fight
	LORIS_COSTUME: {
		itemId: 18,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 8,
		price: 1234 // TODO double check
	},
	// Vegetox Guard's Costume: Disguise a dino into a vegetox guard
	VEGETOX_COSTUME: {
		itemId: 19,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 4,
		price: 1234 // TODO double check
	},
	// Goblin's Costume: Disguise a dino into a gobelin
	GOBLIN_COSTUME: {
		itemId: 20,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 4,
		price: 1234 // TODO double check
	},
	// Pampleboum Pit: give a bonus to an assault (%, fixed valued??)
	PAMPLEBOUM_PIT: {
		itemId: 21,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 12,
		price: 1234 // TODO double check
	},
	// Example to copy paste to add objects
	EXAMPLE: {
		itemId: 999,
		canBeEquipped: true,
		canBeUsedNow: false,
		maxQuantity: 123,
		price: 1234 // TODO double check
	}
};
