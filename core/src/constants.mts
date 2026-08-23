import {
	Dinoz,
	DinozItem,
	DinozMission,
	DinozSkill,
	DinozStatus,
	PlayerItem,
	PlayerReward,
	PlayerQuest,
	Player,
	Ranking,
	PlayerIngredient,
	Clan,
	ClanCastle,
	ClanWar
} from '@drpg/prisma';

export const MARKET_MIN_VALUE = 5000;
export const MARKET_MAX_ITEMS = 5;
export const MARKET_OFFER_DURATION = 2 * 24 * 60 * 60 * 1000; // 48h
export const MARKET_OFFER_DURATION_DEBUG = 30 * 1000; // 30s

export const SHORT_BAN_DURATION_MS = 24 * 60 * 60 * 1000; // 24h
export const MEDIUM_BAN_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 1w
export const LONG_BAN_DURATION_MS = 31 * 24 * 60 * 60 * 1000; // 1m

export const UNSACRIFICE_DURATION = 24 * 60 * 60 * 1000; // 24h
export const UNSACRIFICE_DURATION_DEBUG = 30 * 1000; // 30s

export const DEFAULT_SIMULTANEOUS_DISPLAYED_NOTIFICATIONS = 3;

/* Clan related constants */
export const CLAN_MAX_MEMBERS_AMOUNT = 5;
export const CLAN_JOIN_MONEY = 1000;
export const CLAN_CREATE_MONEY = 20000;
export const CLAN_CREATE_RANKING_POINTS = 15;

export type PlayerForConditionCheck = Pick<Player, 'id'> & {
	items: Pick<PlayerItem, 'itemId' | 'quantity'>[];
	rewards: Pick<PlayerReward, 'rewardId'>[];
	quests: Pick<PlayerQuest, 'questId' | 'progression'>[];
	ingredients?: Pick<PlayerIngredient, 'ingredientId' | 'quantity'>[];
	ranking: Pick<Ranking, 'dinozCount' | 'points'> | null;
	clan?:
		| (Pick<Clan, 'id'> & {
				castle?:
					| (Pick<ClanCastle, 'placeId'> & {
							defender: Pick<Dinoz, 'id'>[];
					  })
					| null;
				attackingWars: (Pick<ClanWar, 'id'> & {
					defender: Pick<Clan, 'id'> & {
						castle: Pick<ClanCastle, 'placeId'>;
					};
				})[];
		  })
		| null;
	dinoz: (Pick<Dinoz, 'level' | 'placeId' | 'life' | 'id'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		missions: Pick<DinozMission, 'missionId' | 'isFinished' | 'step'>[];
		items: Pick<DinozItem, 'itemId'>[];
		skills: Pick<DinozSkill, 'skillId'>[];
	})[];
};
