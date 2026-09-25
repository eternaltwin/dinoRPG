export interface EpicReward {
	id: number;
	name: string;
	displayed: boolean;
	announced: boolean;
	type: RewardType;
	stackable: boolean;
}

export enum RewardType {
	PVE,
	WAR,
	CDC,
	SPECIAL
}
