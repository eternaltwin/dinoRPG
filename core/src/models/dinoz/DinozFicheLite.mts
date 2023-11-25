export interface DinozFicheLite {
	id: number;
	name: string;
	display: string;
	leaderId: number | null;
	life: number;
	maxLife: number;
	experience: number;
	maxExperience: number;
	placeId: number;
	order: number | null;
	isFrozen: boolean;
}
