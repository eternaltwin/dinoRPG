export interface MonsterFiche {
	name: string;
	hp: number;
	attack: number;
	xp: number;
	gold: number;
	// Chance of encountering this monster.
	odds: number;
	level: number;
}
