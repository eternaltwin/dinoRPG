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

/**
 * PvE group rewards.
 *
 * A lone Dinoz keeps 100% of a monster's xp. In a group each Dinoz keeps a smaller share,
 * but the shares add up to MORE than 100%, so fighting together pays off:
 * total = min((n + 1) / 2, GROUP_XP_MAX_MULTIPLIER)
 *   n=1 -> 100% each (total 100%)   n=2 -> 75% each (total 150%)
 *   n=3 -> 67% each (total 200%)    n=4 -> 62% each (total 250%, capped from here on)
 *
 * The cap keeps a group of 6 from dwarfing every other way to play, and leaves room for
 * future monsters that give more xp.
 */
export const GROUP_XP_MAX_MULTIPLIER = 2.5;

/**
 * Gold gets a damped share of the same bonus: growing the monster pool already raises a
 * group's gold per action on its own, so applying the full xp multiplier here would inflate
 * the economy. Raise the divisor to damp further, or drop the multiplier entirely.
 */
export const GROUP_GOLD_DAMPENING = 3;

/** Total xp multiplier awarded to a team of `size` Dinoz. Always 1 for a lone Dinoz. */
export const groupXpMultiplier = (size: number) => Math.min((size + 1) / 2, GROUP_XP_MAX_MULTIPLIER);

/** Same bonus as groupXpMultiplier, damped, for gold. */
export const groupGoldMultiplier = (size: number) =>
	1 + (groupXpMultiplier(size) - 1) / GROUP_GOLD_DAMPENING;

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
