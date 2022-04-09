export interface Player {
	playerId: number;
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
	rewards: Array<number>;
	customText: string | null;
}
