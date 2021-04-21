export interface BasicDinoz {
	dinozId: number;
	display: string;
	experience: number;
	following: number | null;
	life: number;
	name: string;
	place: { name: string };
}
