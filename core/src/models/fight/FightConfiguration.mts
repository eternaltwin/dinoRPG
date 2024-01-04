import { DetailedFighter } from './DetailedFighter.mjs';

export interface FightConfiguration {
	// Seed (optional, only to replay a fight)
	seed?: number;

	// Flags
	is_energy_enabled: boolean;
	can_use_equipment: boolean;
	can_use_permanent_equipment_only: boolean;
	can_use_capture: boolean;
	can_delete_objects: boolean;
	is_balance_enabled: boolean;

	// Fighters
	fighters: DetailedFighter[];
}
