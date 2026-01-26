import {
	Concentration,
	type Dinoz,
	DinozBuild,
	DinozItem,
	DinozMission,
	DinozSkill,
	DinozStatus,
	Player,
	PlayerItem,
	PlayerQuest,
	PlayerReward,
	Ranking,
	TournamentTeam
} from '@drpg/prisma';
import { PlayerForConditionCheck } from '../constants.mjs';
import { DinozFiche, DinozPublicFiche } from '../models/dinoz/DinozFiche.mjs';
import { DinozFicheLite } from '../models/dinoz/DinozFicheLite.mjs';
import { levelList } from '../models/dinoz/DinozLevel.mjs';
import { raceList } from '../models/dinoz/RaceList.mjs';
import { SkillDetails } from '../models/dinoz/SkillDetails.mjs';
import { Skill, skillList } from '../models/dinoz/SkillList.mjs';
import { DinozStatusId } from '../models/dinoz/StatusList.mjs';
import { UnavailableReason } from '@drpg/prisma/enums';
import { TournamentState } from '../models/dojo/tournament.mjs';
import { Stat } from '../models/enums/SkillStat.mjs';
import { Condition } from '../models/npc/NpcConditions.mjs';
import { placeList } from '../models/place/PlaceList.mjs';
import { checkCondition } from './checkCondition.mjs';
import { ExpectedError } from './ExpectedError.mjs';
import { BaseSpecialStats, SpecialStat } from './getSpecialStat.mjs';
import { getHUDObjective } from './MissionUtils.mjs';
import { MathOperator } from '../models/enums/Parser.mjs';
import { operatorProcess } from './helper.mjs';

type Config = {
	dinoz: {
		maxLevel: number;
	};
};

export type PlayerForDinozFiche = Parameters<typeof toDinozFiche>[0];
export const toDinozFiche = (
	player: Pick<Player, 'id' | 'engineer'> & {
		items: Pick<PlayerItem, 'itemId' | 'quantity'>[];
		rewards: Pick<PlayerReward, 'rewardId'>[];
		quests: Pick<PlayerQuest, 'questId' | 'progression'>[];
		ranking: Pick<Ranking, 'dinozCount' | 'points'> | null;
		dinoz: (Pick<
			Dinoz,
			| 'id'
			| 'name'
			| 'display'
			| 'unavailableReason'
			| 'level'
			| 'leaderId'
			| 'life'
			| 'maxLife'
			| 'experience'
			| 'raceId'
			| 'placeId'
			| 'nbrUpFire'
			| 'nbrUpWood'
			| 'nbrUpWater'
			| 'nbrUpLightning'
			| 'nbrUpAir'
			| 'order'
			| 'remaining'
			| 'fight'
			| 'gather'
		> & {
			missions: DinozMission[];
			items: Pick<DinozItem, 'itemId'>[];
			status: Pick<DinozStatus, 'statusId'>[];
			skills: Pick<DinozSkill, 'skillId' | 'state'>[];
			followers: Pick<Dinoz, 'id' | 'fight' | 'remaining' | 'gather' | 'name'>[];
			concentration: Concentration | null;
			TournamentTeam: Pick<TournamentTeam, 'tournamentId'>[];
			build: DinozBuild | null;
		})[];
	},
	activeDinoz: number,
	currentTournament: TournamentState | null
): DinozFiche => {
	const playerForCondition = structuredClone(player);
	const dinoz = player.dinoz.find(d => d.id === activeDinoz);
	if (!dinoz) {
		throw new ExpectedError('Inexistant dinoz');
	}
	playerForCondition.dinoz = [dinoz];
	return {
		id: dinoz.id,
		name: dinoz.name,
		display: dinoz.display,
		unavailableReason: dinoz.unavailableReason,
		level: dinoz.level,
		missionId: dinoz.missions?.find(mission => !mission.isFinished)?.missionId ?? null,
		leaderId: dinoz.leaderId,
		followers: dinoz.followers,
		life: dinoz.life,
		maxLife: dinoz.maxLife,
		experience: dinoz.experience,
		maxExperience: getMaxXp(dinoz),
		race: getRace(dinoz),
		placeId: dinoz.placeId,
		items: dinoz.items?.map(item => item.itemId),
		maxItems: backpackSlot(player.engineer, dinoz),
		status: dinoz.status?.sort((a, b) => a.statusId - b.statusId),
		borderPlace:
			dinoz.unavailableReason !== null || !dinoz.fight || dinoz.leaderId
				? []
				: actualPlace(dinoz)
						.borderPlace.map(placeId => {
							const place = Object.values(placeList).find(place => place.placeId === placeId);
							if (!place) {
								throw new Error(`Place ${placeId} doesn't exist.`);
							}
							return place;
						})
						.filter(place => !place.conditions || checkCondition(place.conditions, playerForCondition, dinoz.id))
						.map(place => place.placeId),
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir,
		missionHUD: getHUDObjective(dinoz),
		actions: [],
		skills: dinoz.skills,
		order: dinoz.order,
		remaining: dinoz.remaining,
		fight: dinoz.fight,
		gather: dinoz.gather,
		missions: dinoz.missions,
		concentration: dinoz.concentration,
		tournament: dinoz.TournamentTeam.find(team => team.tournamentId === currentTournament?.id)
			? currentTournament
			: null,
		build: dinoz.build ?? undefined
	};
};

export const toDinozFicheLite = (
	dinoz: Pick<
		Dinoz,
		| 'id'
		| 'name'
		| 'display'
		| 'leaderId'
		| 'life'
		| 'maxLife'
		| 'experience'
		| 'placeId'
		| 'order'
		| 'unavailableReason'
		| 'level'
	> & {
		status: Pick<DinozStatus, 'statusId'>[];
	}
): DinozFicheLite => {
	return {
		id: dinoz.id,
		name: dinoz.name,
		display: dinoz.display,
		leaderId: dinoz.leaderId,
		life: dinoz.life,
		maxLife: dinoz.maxLife,
		experience: dinoz.experience,
		maxExperience: getMaxXp(dinoz),
		placeId: dinoz.placeId,
		order: dinoz.order,
		unavailableReason: dinoz.unavailableReason
	};
};

export const toDinozPublicFiche = (
	dinoz: Pick<Dinoz, 'id' | 'name' | 'display' | 'unavailableReason' | 'level' | 'raceId' | 'life' | 'order'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	}
): DinozPublicFiche => {
	return {
		id: dinoz.id,
		name: dinoz.name,
		display: dinoz.display,
		isFrozen: dinoz.unavailableReason === UnavailableReason.frozen,
		level: dinoz.level,
		life: dinoz.life,
		race: getRace(dinoz),
		status: dinoz.status?.map(status => status.statusId).sort((a, b) => a - b),
		order: dinoz.order
	};
};

export const toSkillDetails = (skills: Pick<DinozSkill, 'skillId' | 'state'>[]): SkillDetails[] =>
	skills.map(skill => {
		const skillFound = Object.values(skillList).find(skillDinoz => skillDinoz.id === skill.skillId);
		if (!skillFound) {
			throw new Error(`Skill ${skill.skillId} doesn't exist.`);
		}

		return {
			...skillFound,
			state: skill.state
		};
	});

export const orderDinozList = <T extends Pick<DinozFiche, 'id' | 'order' | 'name' | 'leaderId' | 'followers'>[]>(
	dinozList: T
) => {
	const sortedByOrderAndName = [...dinozList].sort((a, b) => {
		if (a.order === null) {
			a.order = a.id;
		}
		if (b.order === null) {
			b.order = b.id;
		}
		if (a.order === b.order) {
			return a.name.localeCompare(b.name);
		}
		return a.order - b.order;
	});

	// Group by leader
	for (const leader of sortedByOrderAndName.filter(dinoz => dinoz.followers.length)) {
		// Find all dinoz that follow this leader
		const followers = sortedByOrderAndName.filter(dinoz => dinoz.leaderId === leader.id);

		// Remove them from the list
		for (const follower of followers) {
			sortedByOrderAndName.splice(
				sortedByOrderAndName.findIndex(dinoz => dinoz.id === follower.id),
				1
			);
		}

		// Add them after the leader
		sortedByOrderAndName.splice(sortedByOrderAndName.findIndex(dinoz => dinoz.id === leader.id) + 1, 0, ...followers);
	}

	return sortedByOrderAndName;
};

export const getFollowableDinoz = <
	T extends Pick<DinozFiche, 'id' | 'placeId' | 'leaderId' | 'unavailableReason' | 'followers' | 'skills' | 'life'>
>(
	dinozList: T[],
	potentialFollower: Pick<DinozFiche, 'id' | 'placeId' | 'fight' | 'remaining'> & {
		skills: Pick<DinozSkill, 'skillId'>[];
	}
) => {
	// Brave dinoz cannot follow others
	if (potentialFollower.skills.some(skill => skill.skillId === Skill.BRAVE)) return [];
	return dinozList.filter(dinoz => {
		// Filter out current dinoz
		if (dinoz.id === potentialFollower.id) {
			return false;
		}
		// Filter out unavaible Dinoz (selling, resting...)
		if (dinoz.unavailableReason !== null) {
			return false;
		}
		// Filter out Dinoz that already have a leader
		if (dinoz.leaderId) {
			return false;
		}
		// Filter out Dinoz that are not in the same place
		if (dinoz.placeId !== potentialFollower.placeId) {
			return false;
		}
		// Filter out brave Dinoz
		if (dinoz.skills.some(skill => skill.skillId === Skill.BRAVE)) {
			return false;
		}

		if (dinoz.life <= 0) {
			return false;
		}

		const maxFollowers = getMaxFollowers(dinoz);

		// Filter out Dinoz that have too many followers
		if (dinoz.followers.length >= maxFollowers) {
			return false;
		}

		return true;
	});
};

export const getMaxFollowers = (dinoz: Pick<DinozFiche, 'skills'>) => {
	let max = BaseSpecialStats[SpecialStat.MAX_FOLLOWERS];

	const skillsAffectingMaxFollowers = Object.values(skillList).filter(skill => skill.effects?.[Stat.MAX_FOLLOWERS]);

	for (const skill of skillsAffectingMaxFollowers) {
		if (dinoz.skills.some(s => s.skillId === skill.id)) {
			const effect = skill.effects?.[Stat.MAX_FOLLOWERS];
			if (effect) {
				max = operatorProcess(max, effect);
			}
		}
	}

	return max;
};

export const getRace = (dinoz: Pick<Dinoz, 'raceId'>) => {
	const race = Object.values(raceList).find(race => race.raceId === dinoz.raceId);

	if (!race) {
		throw new Error(`Race ${dinoz.raceId} doesn't exist.`);
	}

	return race;
};

export const getMaxXp = (
	dinoz: Pick<Dinoz, 'level'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	}
) => {
	const level = levelList.find(level => level.id === dinoz.level);

	if (!level) {
		throw new Error(`Level ${dinoz.level} doesn't exist.`);
	}

	if (dinoz.status.some(s => s.statusId !== DinozStatusId.BROKEN_LIMIT_3) && dinoz.level === 70) return 0;
	if (dinoz.status.some(s => s.statusId !== DinozStatusId.BROKEN_LIMIT_2) && dinoz.level === 60) return 0;
	if (dinoz.status.some(s => s.statusId !== DinozStatusId.BROKEN_LIMIT_1) && dinoz.level === 50) return 0;

	return level.experience;
};

export const isAlive = (dinoz: Pick<Dinoz, 'life'>) => dinoz.life > 0;

export const actualPlace = (dinoz: Pick<Dinoz, 'placeId'>) => {
	const place = Object.values(placeList).find(place => place.placeId === dinoz.placeId);

	if (!place) {
		throw new Error(`Place ${dinoz.placeId} doesn't exist.`);
	}

	return place;
};

export const remainingXPToLevelUp = (
	dinoz: Pick<Dinoz, 'experience' | 'level'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	}
) => {
	return getMaxXp(dinoz) - dinoz.experience;
};

export const isMaxLevel = (dinoz: Pick<Dinoz, 'level'>, config: Config) => dinoz.level >= config.dinoz.maxLevel;

export const canLevelUp = (
	dinoz: Pick<Dinoz, 'experience' | 'level'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	},
	config: Config
) => {
	return remainingXPToLevelUp(dinoz) <= 0 && !isMaxLevel(dinoz, config);
};

export const backpackSlot = (
	engineer: boolean,
	dinoz: Pick<Dinoz, 'id'> & {
		skills: Pick<DinozSkill, 'skillId'>[];
		status: Pick<DinozStatus, 'statusId'>[];
	}
) => {
	let total = 2;
	if (dinoz.skills.find(skill => skill.skillId === skillList[Skill.POCHE_VENTRALE].id)) total++;
	if (dinoz.skills.find(skill => skill.skillId === skillList[Skill.SURPLIS_DHADES].id)) total++;
	if (dinoz.status.find(status => status.statusId === DinozStatusId.BACKPACK)) total++;
	if (engineer) total++;

	// TODO: Check for other dinoz storekeeper here
	return total;
};

export const canChangeSkillState = (dinoz: { status: Pick<DinozStatus, 'statusId'>[] }) => {
	return dinoz.status.some(status => status.statusId === DinozStatusId.STRATEGY_IN_130_LESSONS);
};

export const knowSkillId = (
	dinoz: {
		skills: Pick<DinozSkill, 'skillId'>[];
	},
	skillId: number
) => {
	return dinoz.skills.some(skill => skill.skillId === skillId);
};

export const canGoToThisPlace = (player: PlayerForConditionCheck, condition: Condition, activeDinoz: number) => {
	return checkCondition(condition, player, activeDinoz);
};

export const possessStatus = (
	dinoz: {
		status: Pick<DinozStatus, 'statusId'>[];
	},
	statusId: number
) => {
	return dinoz.status.some(status => status.statusId === statusId);
};

export const canWinXP = (
	dinoz: Pick<Dinoz, 'id' | 'experience' | 'level'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	}
) => {
	if (dinoz.status.some(s => s.statusId === DinozStatusId.CURSED)) return false;
	if (dinoz.status.some(s => s.statusId === DinozStatusId.BROKEN_LIMIT_3)) return true;
	if (dinoz.status.some(s => s.statusId === DinozStatusId.BROKEN_LIMIT_2) && dinoz.level < 70) return true;
	if (dinoz.status.some(s => s.statusId === DinozStatusId.BROKEN_LIMIT_1) && dinoz.level < 60) return true;
	if (dinoz.level < 50) return true;
	else return false;
};

export const calculateXPBonus = (
	dinoz: Pick<Dinoz, 'id'> & {
		skills: Pick<DinozSkill, 'skillId'>[];
		status: Pick<DinozStatus, 'statusId'>[];
	},
	xp: number,
	player: Pick<Player, 'teacher'>
) => {
	let f = 1.0;
	if (dinoz.skills.some(s => s.skillId === Skill.INTELLIGENCE)) f *= 1.05;
	if (player.teacher) f *= 1.05;
	//TODO encyclopedie et maudit
	/*if( d.hasEquip(Data.OBJECTS.list.mencly) )
		f *= 1.15;
	if( d.hasEffect(Data.EFFECTS.list.maudit) )
		f = 0;*/
	return Math.round(xp * f);
};

/**
 * @summary Calculate the XP before bonus for a PvP fight
 * @param opponentLevel Level of the opponent
 * @param dinozLevel Level of the Dinoz that fought the opponent
 * @returns The experience the Dinoz is entitled to receive before bonuses
 */
export const calculatePvPxp = (opponentLevel: number, dinozLevel: number) => {
	const BASE_PVP_XP = 50;
	const XP_BASE = 1.2;
	const XP_ADD = 0.8;
	const PVP_COEF = 2.5;

	// Factor based on the level difference
	const levelDiff = (opponentLevel - dinozLevel) / opponentLevel;
	// XP result solely base on the level difference
	const xpFactor = XP_BASE + XP_ADD * levelDiff;
	let xp;
	if (xpFactor < 1) {
		// If the experience  factor based on the level difference too low (i.e Dinoz level is higher than its opponents), then default to a formula based on the opponents level.
		xp = PVP_COEF * opponentLevel;
	} else {
		// Else the opponent's level is equal or higher than the Dinoz, then apply the PVP coef and opponent level to the xp factor based on the level difference.
		xp = xpFactor * PVP_COEF * opponentLevel;
	}

	// Set the minimum to the BASE PVP
	return Math.max(xp, BASE_PVP_XP);
};

/**
 * @summary Calculate the XP before bonus for a PvE fight
 * @param totalMonsterXp Total xp generated by the monsters
 * @param dinozLevel Level of the Dinoz
 * @param maxLevel Maximum achievable level
 * @param initialMaxLevel First max level limit in the game
 * @returns The experience the Dinoz is entitled to receive before bonuses
 */
export const calculatePvExp = (
	totalMonsterXp: number,
	dinozLevel: number,
	maxLevel: number,
	initialMaxLevel: number
) => {
	const XP_BASE = 1.2;
	const XP_ADD = 0.8;
	// Minimum factor applie to the total monster xp
	const MINIMUM_XP_FACTOR = 1.0;
	// Multiplicator constant to increase/decrease result as necessary
	const XP_MULTIPLICATOR = 1.0;

	// Factor based on the level difference
	const levelDiff = (maxLevel - dinozLevel) / maxLevel;

	// XP factor to apply to the total
	let xpFactor = Math.max(XP_BASE + XP_ADD * levelDiff, MINIMUM_XP_FACTOR);

	// Apply new factor when max level limit increases
	if (maxLevel / initialMaxLevel > xpFactor) xpFactor = maxLevel / initialMaxLevel;

	return Math.round(totalMonsterXp * xpFactor * XP_MULTIPLICATOR);
};
