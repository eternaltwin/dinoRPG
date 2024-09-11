import {
	Dinoz,
	DinozItem,
	DinozMission,
	DinozSkill,
	DinozStatus,
	PlayerItem,
	PlayerReward,
	PlayerQuest,
	Player
} from '@drpg/prisma';

export const MARKET_MIN_VALUE = 5000;
export const MARKET_MAX_ITEMS = 5;
export const MARKET_OFFER_DURATION = 2 * 24 * 60 * 60 * 1000; // 48h
export const MARKET_OFFER_DURATION_DEBUG = 2 * 60 * 1000; // 2min

/* Clan related constants */
export const CLAN_MAX_MEMBERS_AMOUNT = 5;
export const CLAN_JOIN_MONEY = 1000;
export const CLAN_CREATE_MONEY = 20000;
export const CLAN_CREATE_RANKING_POINTS = 15;

export type PlayerForConditionCheck = Pick<Player, 'id'> & {
	items: Pick<PlayerItem, 'itemId' | 'quantity'>[];
	rewards: Pick<PlayerReward, 'rewardId'>[];
	quests: Pick<PlayerQuest, 'questId' | 'progression'>[];
	dinoz: (Pick<Dinoz, 'level' | 'placeId' | 'life' | 'id'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		missions: Pick<DinozMission, 'missionId' | 'isFinished'>[];
		items: Pick<DinozItem, 'itemId'>[];
		skills: Pick<DinozSkill, 'skillId'>[];
	})[];
};
