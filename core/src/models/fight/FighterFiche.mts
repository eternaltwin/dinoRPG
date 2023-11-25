export enum FighterType {
	Monster = 'Monster',
	Dinoz = 'Dinoz',
}

// This structure needs to be exactly the same as FighterConfiguration in native/src/fight/fighter.rs
export class FighterFiche {
	// ID of the fighter in the DB (if it exists)
	dinoz_id: number;
	//Level of the dinoz (used for calculate monster power)
	level: number;
	// Tells if the fighter is a monster
	ftype: FighterType;
	// Name of the fighter
	name: string;
	// Display code of the fighter
	display: string;
	// Health of the fighter at the start of the fight, it cannot go above it during a fight
	start_life: number;
	// The base elements of the fighter (in the order 0 - Fire, 1 - Wood, 2 - Water, 3 - Lightning, 4 - Air)
	// todo need to handle void
	base_elements: Array<number>;
	// bonus attack for monster
	attack_bonus?: number | undefined;
	// bonus defense for monster
	defense_bonus?: number | undefined;
	// The items equipped by the fighter
	items: Array<number>;
	// The activated skills of the fighter
	skills: Array<number>;
	// The status of the fighter
	status: Array<number>;

	constructor(
		dinozId: number,
		level: number | undefined,
		ftype: FighterType,
		name: string,
		display: string,
		start_life: number,
		base_elements: Array<number>,
		bonus_attack: number | undefined,
		bonus_defense: number | undefined,
		items: Array<number>,
		skills: Array<number>,
		status: Array<number>
	) {
		this.dinoz_id = dinozId;
		this.ftype = ftype;
		this.name = name;
		this.display = display;
		this.start_life = start_life;
		this.items = items;
		this.skills = skills;
		this.status = status;
		this.base_elements = base_elements;

		this.level = level ?? 0;
		this.defense_bonus = bonus_defense ?? 0;
		this.attack_bonus = bonus_attack ?? 0;
	}
}

// This structure needs to be exactly the same as FighterResult in native/src/fight/fighter.rs
export interface FighterResultFiche {
	// ID of the dinoz in the DB
	dinoz_id: number;
	// The health lost by the dinoz in the fight in comparison to its starting life
	hp_lost: number;
	// The items used by the dinoz during the fight
	items_used: Array<number>;
}
