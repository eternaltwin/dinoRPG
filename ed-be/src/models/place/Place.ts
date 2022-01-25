export interface Place {
	placeId: number;
	name: string;
	borderPlace: Array<number>;
	conditions?: number;
	alias?: number;
}
