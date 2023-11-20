export interface Player {
	id: number;
	hasImported: boolean;
	name: string;
	eternalTwinId: string;
	money: number;
	quetzuBought: number;
	leader: boolean;
	engineer: boolean;
	cooker: boolean;
	shopKeeper: boolean;
	merchant: boolean;
	priest: boolean;
	teacher: boolean;
	rewards: number[];
	customText: string | null;
}
