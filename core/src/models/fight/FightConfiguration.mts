import { Dinoz, DinozItem, DinozSkill } from '@drpg/prisma';
import { DetailedFighter } from './DetailedFighter.mjs';

export type DinozToGetFighter = Pick<
	Dinoz,
	'id' | 'level' | 'name' | 'life' | 'maxLife' | 'nbrUpFire' | 'nbrUpWood' | 'nbrUpWater' | 'nbrUpLightning' | 'nbrUpAir'
> & {
	items: Pick<DinozItem, 'itemId'>[];
	skills: Pick<DinozSkill, 'skillId'>[];
}

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
	initialDinozList: DinozToGetFighter[];
	fighters: DetailedFighter[];
}
