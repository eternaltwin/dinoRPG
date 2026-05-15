import { Reward } from '../reward/RewardList.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { ClanEventType } from '@drpg/prisma/enums';

export type ClanEventConfig = {
	eventType: ClanEventType.war;
	rewards: ClanEventReward;
	fight: ClanEventFight;
	warPlaces: PlaceEnum[];
	swampEnable: boolean;
};

export interface ClanEventReward {
	winner: Reward;
	podium: Reward;
	participant: Reward;
}

export interface ClanEventFight {
	attackTime: number;
	defenderTotal: number;
	defenderActiveMax: number;
}

export interface EventForm {
	start: string;
	duration: number;
	places: number[];
	winner: Reward | null;
	podium: Reward | null;
	participant: Reward | null;
}

export interface OngoingEvent {
	id: string;
	eventType: ClanEventType;
	endDate: Date | null;
	config: ClanEventConfig;
}
