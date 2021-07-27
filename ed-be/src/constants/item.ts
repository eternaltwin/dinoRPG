import { ItemFiche } from '../models';

export const listOfAllItems: Array<ItemFiche> = [
	// Irma's Potion: new action
	{
		itemId: 1,
		name: 'irma',
		canBeEquipped: false,
		canBeUsedNow: true,
		quantity: 0,
		maxQuantity: 80,
		price: 450,
	},
	// Angel potion: resurrects a dino
	{
		itemId: 2,
		name: 'angel',
		canBeEquipped: false,
		canBeUsedNow: true,
		quantity: 0,
		maxQuantity: 8,
		price: 1000,
	},
	// Cloud burger: heals 10
	{
		itemId: 3,
		name: 'burger',
		canBeEquipped: true,
		canBeUsedNow: true,
		quantity: 0,
		maxQuantity: 24,
		price: 350,
	},
	// Authentic hot bread: heals 100
	{
		itemId: 4,
		name: 'hotpan',
		canBeEquipped: false,
		canBeUsedNow: true,
		quantity: 0,
		maxQuantity: 8,
		price: 3000,
	},
	// Meat pie: heals 30
	{
		itemId: 5,
		name: 'tartev',
		canBeEquipped: false,
		canBeUsedNow: true,
		quantity: 0,
		maxQuantity: 16,
		price: 1000,
	},
	// Fight ration: heals up to 20 during a fight
	{
		itemId: 6,
		name: 'ration',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 8,
		price: 500,
	},
	// Surviving ration: heals between 10 and 40 during a fight
	{
		itemId: 7,
		name: 'surviv',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 8,
		price: 500, // TODO double check
	},
	// Goblin's Sausage: heals ?? during a fight
	{
		itemId: 7,
		name: 'mergz',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 4,
		price: 500, // TODO double check
	},
	// Pampleboum: heals 15
	{
		itemId: 8,
		name: 'fruit',
		canBeEquipped: false,
		canBeUsedNow: true,
		quantity: 0,
		maxQuantity: 8,
		price: 500, // TODO double check
	},
	// SOS Helmet: increases armor by 1 in a fight
	{
		itemId: 10,
		name: 'hlmsos',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 12,
		price: 150,
	},
	// Little pepper: increases next assault value by 10
	{
		itemId: 11,
		name: 'ppoiv',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 12,
		price: 150,
	},
	// Lighter: Set dino on fire during a fight
	{
		itemId: 12,
		name: 'zippo',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 12,
		price: 150,
	},
	// SOS flame: summons a flame to fight with you
	{
		itemId: 12,
		name: 'flamch',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 80,
		price: 150,
	},
	// Refrigerated Shield: Increases fire defense by 20 during a fight
	{
		itemId: 13,
		name: 'combi',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 12,
		price: 150,
	},
	// Fuca Pill: increases attack speed by 50% during a fight
	{
		itemId: 14,
		name: 'fuca',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 4,
		price: 150, // TODO double check
	},
	// Monochromatic: all standards assault hit of the highest element of the dino during a fight (but speed follows normal rotation)
	{
		itemId: 15,
		name: 'monoch',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 4,
		price: 150, // TODO double check
	},
	// Poisonite Sting: heals poison during a fight / prevents to be poisoned during a fight??
	{
		itemId: 16,
		name: 'antip',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 8,
		price: 150, // TODO double check
	},
	// Loris's Costume: makes an enemy attack someone else on his side during a fight
	{
		itemId: 17,
		name: 'confus',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 8,
		price: 1234, // TODO double check
	},
	// Vegetox Guard's Costume: Disguise a dino into a vegetox guard
	{
		itemId: 18,
		name: 'costve',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 4,
		price: 1234, // TODO double check
	},
	// Goblin's Costume: Disguise a dino into a gobelin
	{
		itemId: 19,
		name: 'costgb',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 4,
		price: 1234, // TODO double check
	},
	// Pampleboum Pit: give a bonus to an assault (%, fixed valued??)
	{
		itemId: 20,
		name: 'noyau',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 12,
		price: 1234, // TODO double check
	},
	//
	{
		itemId: 999,
		name: 'example',
		canBeEquipped: true,
		canBeUsedNow: false,
		quantity: 0,
		maxQuantity: 123,
		price: 1234, // TODO double check
	},
];
