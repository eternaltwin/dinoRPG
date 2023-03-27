import { FighterFiche } from './FighterFiche.js';

// This structure needs to be exactly the same as ManagerConfiguration in native/src/fight/manager.rs
export interface FightConfiguration {
	// Flags
	is_energy_enabled: boolean;
	can_use_equipment: boolean;
	can_use_permanent_equipment_only: boolean;
	can_use_capture: boolean;
	can_delete_objects: boolean;
	is_balance_enabled: boolean;

	// Fighters
	attackers: Array<FighterFiche>;
	defenders: Array<FighterFiche>;
}
