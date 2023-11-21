import { Dinoz, DinozMission, DinozSkill, DinozStatus, PlayerItem, PlayerReward } from "@drpg/prisma";

export const MARKET_MIN_VALUE = 5000;
export const MARKET_MAX_ITEMS = 5;
export const MARKET_OFFER_DURATION = 2 * 24 * 60 * 60 * 1000; // 48h

export type DinozForConditionCheck = Pick<Dinoz,
	'level' |
	'placeId' |
	'life'
> & {
	status: Pick<DinozStatus, 'statusId' >[];
	missions: Pick<DinozMission, 'missionId' | 'isFinished'>[];
	skills: Pick<DinozSkill, 'skillId'>[];
	player: {
		items: Pick<PlayerItem, 'itemId' | 'quantity'>[];
		rewards: Pick<PlayerReward, 'rewardId'>[];
	} | null;
}
