// This structure needs to be exactly the same as FighterConfiguration in native/src/fight/fighter.rs
export interface FighterFiche {
	// ID of the dinoz in the DB
	dinoz_id: number;
	// Health of the dinoz at the start of the fight, it cannot go above it during a fight
	start_life: number;
	// The base elements of the dinoz
	base_elements: Array<number>;
	// The items equipped by the dinoz
	items: Array<number>;
	// The activated skills of the dinoz
	skills: Array<number>;
	// The status of the dinoz
	status: Array<number>;
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
