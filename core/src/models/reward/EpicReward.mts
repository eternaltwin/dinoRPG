export interface EpicReward {
	id: number;
	name: string;
	displayed: boolean;
	announced: boolean;
	type: RewardType;
}

export enum RewardType {
	PVE,
	WAR,
	CDC,
	SPECIAL
}
