import { PlayerForConditionCheck } from '@drpg/core/constants';
import { Action, ActionFiche, actionList } from '@drpg/core/models/dinoz/ActionList';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { GatherType } from '@drpg/core/models/enums/GatherType';
import { ItemEffect } from '@drpg/core/models/enums/ItemEffect';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { Scenario } from '@drpg/core/models/enums/Scenario';
import { ShopType } from '@drpg/core/models/enums/ShopType';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { FighterType } from '@drpg/core/models/fight/DetailedFighter';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { gatherList } from '@drpg/core/models/gather/gatherList';
import { GatherPublicGrid } from '@drpg/core/models/gather/gatherPublicGrid';
import { GRID_FINISHED_GOLD_REWARD } from '@drpg/core/models/gather/gatherRewards';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { placeList, SWAMP_FLOODED_DAYS } from '@drpg/core/models/place/PlaceList';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { shopList } from '@drpg/core/models/shop/ShopList';
import {
	actualPlace,
	canChangeSkillState,
	canGoToThisPlace,
	canLevelUp,
	getFollowableDinoz,
	getMaxFollowers,
	getRace,
	isAlive,
	knowSkillId,
	PlayerForDinozFiche,
	toDinozFiche,
	toSkillDetails
} from '@drpg/core/utils/DinozUtils';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import {
	discoverBox,
	getGridSize,
	hideGridIngredients,
	initializeGatherGrid,
	saveGrid
} from '@drpg/core/utils/GatherUtils';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { Concentration, Dinoz, DinozMission, DinozSkill, DinozStatus, LogType, UnavailableReason } from '@drpg/prisma';
import dayjs from 'dayjs';
import { Request } from 'express';
import gameConfig from '../config/game.config.js';
import { digTreasures } from '../constants/digTreasures.js';
import { TemporaryStatus } from '../constants/index.js';
import {
	checkFrozenDinoz,
	checkRestDinoz,
	createDinoz,
	getActiveDinoz,
	getAvailableDinozToFollow,
	getCanDinozChangeName,
	getDinozFicheLiteRequest,
	getDinozFicheRequest,
	getDinozFightDataRequest,
	getDinozGatherData,
	getDinozSkillAndStatusRequest,
	getDinozSkillRequest,
	getFollowingDinoz,
	getIrmaUsageInfo,
	getLeaderWithFollowers,
	getManageData,
	isDinozInTournament,
	updateDinoz,
	updateMultipleDinoz,
	updateOrderData
} from '../dao/dinozDao.js';
import { addMultipleSkillToDinoz, setSkillStateRequest } from '../dao/dinozSkillDao.js';
import { addStatusToDinoz, removeStatusFromDinoz } from '../dao/dinozStatusDao.js';
import { createLog, createLogForMultipleDinoz } from '../dao/logDao.js';
import {
	addMoney,
	auth,
	getPlayerCompletion,
	ownsDinoz,
	removeDailyGridRewards,
	removeMoney
} from '../dao/playerDao.js';
import { deleteDinozInShopRequest, getDinozShopDetailsRequest } from '../dao/playerDinozShopDao.js';
import { createGrid, getCommonGatherInfo, updateGrid } from '../dao/playerGatherDao.js';
import { increaseIngredientQuantity, setIngredient } from '../dao/playerIngredientDao.js';
import { decreaseItemQuantity, increaseItemQuantity, insertItem } from '../dao/playerItemDao.js';
import { getPlayerRewards } from '../dao/playerRewardsDao.js';
import { upsertQuest } from '../dao/questsDao.js';
import { updateDinozCount, updatePoints } from '../dao/rankingDao.js';
import { getSpecificSecret } from '../dao/secretDao.js';
import { setSpecificStat } from '../dao/trackingDao.js';
import { prisma } from '../prisma.js';
import { selectBox } from '../utils/boxesLogic.js';
import { getNumberOfGatheringTries, initializeDinoz } from '../utils/dinoz.js';
import { getRandomInteger, getRandomNumber } from '../utils/index.js';
import { rewarder } from '../utils/rewarder.js';
import TournamentManager from '../utils/tournamentManager.js';
import translate from '../utils/translate.js';
import { calculateFightVsMonsters, fightMonstersAtPlace, rewardFightVsMonsters } from './fightService.js';
import { getMissionAction } from './missionsService.js';
import { movementListener } from './specialService.js';
import { currentWar } from './clanWar.js';

/**
 * @summary Get available action from dinoz
 */
export async function getAvailableActions(
	dinoz: Pick<
		Dinoz,
		| 'level'
		| 'id'
		| 'experience'
		| 'leaderId'
		| 'fight'
		| 'gather'
		| 'remaining'
		| 'maxLife'
		| 'unavailableReason'
		| 'placeId'
		| 'life'
	> & {
		missions: DinozMission[];
		concentration: Concentration | null;
		followers: Pick<Dinoz, 'id' | 'fight' | 'remaining' | 'gather'>[];
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkill, 'skillId'>[];
	},
	player: PlayerForConditionCheck
) {
	const availableActions: ActionFiche[] = [];

	const dinozPlace = actualPlace(dinoz);

	if (dinoz.unavailableReason === UnavailableReason.unfreezing) {
		return [];
	}

	// Nothing else if dinoz is being sold
	if (dinoz.unavailableReason === UnavailableReason.selling) {
		return [actionList[Action.MARKET]];
	}

	// Stop congel
	if (dinoz.unavailableReason === UnavailableReason.frozen) {
		return [actionList[Action.STOP_CONGEL]];
	}

	// Stop rest
	if (dinoz.unavailableReason === UnavailableReason.resting) {
		return [actionList[Action.STOP_REST]];
	}

	// War actions
	const currentWar = await prisma.clanEvent.findFirst({
		where: {
			endDate: {
				gt: new Date()
			}
		}
	});
	if (
		currentWar !== null &&
		player.clan &&
		player.clan.castle &&
		isAlive(dinoz) &&
		dinoz.fight &&
		dinoz.followers.filter(f => !f.fight).length <= 0 &&
		!dinoz.leaderId
	) {
		// Defend
		if (dinoz.placeId === player.clan.castle.placeId && !dinoz.leaderId && dinoz.followers.length === 0) {
			if (!player.clan.castle.defender.some(d => d.id === dinoz.id)) {
				availableActions.push(actionList[Action.WAR_DEFEND]);
			} else if (dinoz.unavailableReason === UnavailableReason.defending) {
				return [actionList[Action.WAR_REMOVE]];
			}
		}

		if (player.clan.attackingWar && player.clan.attackingWar.defender.castle.placeId === dinoz.placeId) {
			availableActions.push(actionList[Action.WAR_ATTACK]);
		}
	}

	// Leaders actions
	if (dinoz.leaderId) {
		availableActions.push(actionList[Action.UNFOLLOW]);
		availableActions.push(actionList[Action.CHANGE_LEADER]);
	} else {
		// Check if there is a dinoz to follow
		const potentialDinozToFollow = await getAvailableDinozToFollow(player.id, dinoz.id);
		const dinozToFollow = getFollowableDinoz(
			potentialDinozToFollow.map(dinoz => ({
				...dinoz,
				skills: dinoz.skills,
				followers: dinoz.followers
			})),
			dinoz
		);
		if (dinozToFollow.length > 0 && isAlive(dinoz) && dinoz.followers.length === 0) {
			availableActions.push(actionList[Action.FOLLOW]);
		}
	}
	if (dinoz.followers.length > 0) {
		availableActions.push(actionList[Action.DISBAND]);

		for (const follower of dinoz.followers) {
			// Follower gather
			if (
				follower.gather &&
				dinozPlace.gather !== undefined &&
				checkCondition(
					Object.values(gatherList).find(grid => grid.type === dinozPlace.gather)?.condition,
					player,
					follower.id
				)
			) {
				const gatherFound = Object.values(gatherList).find(grid => grid.type === dinozPlace.gather);
				if (!gatherFound) {
					throw new ExpectedError(`Gather ${dinozPlace.gather} doesn't exist.`);
				}
				availableActions.push({ ...actionList[gatherFound.action], forDinoz: follower.id });
			}
		}
	}

	// Death related actions
	if (!isAlive(dinoz)) {
		availableActions.push(actionList[Action.RESURRECT]);
		// REINCARNATION
		if (
			dinoz.skills.some(s => s.skillId === Skill.REINCARNATION) &&
			dinoz.level >= 40 &&
			!dinoz.status.some(s => s.statusId === DinozStatusId.REINCARNATION)
		) {
			availableActions.push(actionList[Action.REINCARNATION]);
		}
		return availableActions;
	}

	// Rest
	if (dinoz.life < Math.round(dinoz.maxLife / 2) && dinoz.fight) {
		availableActions.push(actionList[Action.REST]);
	}

	// Concentration
	if (dinoz.concentration) {
		availableActions.push(actionList[Action.CONCENTRATE]);
		return availableActions;
	}

	// Refresh action
	if (!dinoz.leaderId && (!dinoz.fight || !dinoz.gather)) {
		if (dinoz.remaining > 0) {
			availableActions.push(actionList[Action.ACTION]);
		} else {
			availableActions.push(actionList[Action.IRMA]);
		}
	}

	// Refresh actions in party
	if (
		dinoz.followers.length > 0 &&
		(!dinoz.fight || !dinoz.gather || dinoz.followers.filter(f => !f.fight).length > 0)
	) {
		let index = availableActions.indexOf(actionList[Action.IRMA]);
		if (index >= 0) {
			availableActions.splice(index, 1);
		}
		if (dinoz.remaining <= 0 || dinoz.followers.filter(f => !f.fight).length > 0) {
			index = availableActions.indexOf(actionList[Action.ACTION]);
			if (index >= 0) {
				availableActions.splice(index, 1);
			}
			if (dinoz.followers.some(d => d.remaining > 0)) {
				availableActions.push(actionList[Action.ACTION]);
			} else {
				availableActions.push(actionList[Action.IRMAS]);
			}
		}
	}

	// Fight
	if (!dinoz.leaderId && dinoz.fight && dinoz.followers.filter(f => !f.fight).length <= 0) {
		availableActions.push(actionList[Action.FIGHT]);
	}

	//Gather
	if (
		dinoz.gather &&
		dinozPlace.gather !== undefined &&
		checkCondition(Object.values(gatherList).find(grid => grid.type === dinozPlace.gather)?.condition, player, dinoz.id)
	) {
		const gatherFound = Object.values(gatherList).find(grid => grid.type === dinozPlace.gather);
		if (!gatherFound) {
			throw new ExpectedError(`Gather ${dinozPlace.gather} doesn't exist.`);
		}
		availableActions.push(actionList[gatherFound.action]);
	}

	// Special Gather
	if (
		dinozPlace.specialGather !== undefined &&
		checkCondition(
			Object.values(gatherList).find(grid => grid.type === dinozPlace.specialGather)?.condition,
			player,
			dinoz.id
		)
	) {
		const gatherFound = Object.values(gatherList).find(grid => grid.type === dinozPlace.specialGather);
		if (!gatherFound) {
			throw new ExpectedError(`Gather ${dinozPlace.specialGather} doesn't exist.`);
		}
		availableActions.push({
			name: gatherFound.action,
			imgName: 'act_gather'
		});
	}

	// Forcebrute Tournament
	if (dinoz.placeId === PlaceEnum.FORCEBRUT && dinoz.status.some(s => s.statusId === DinozStatusId.TOURNA)) {
		availableActions.push(actionList[Action.FB_TOURNAMENT]);
	}

	// Dig with the shovel
	if (
		dinoz.status.some(
			status => status.statusId === DinozStatusId.SHOVEL || status.statusId === DinozStatusId.ENHANCED_SHOVEL
		)
	) {
		availableActions.push(actionList[Action.DIG]);
	}

	// Shop action: check if a shop is available where the dinoz is
	const itinerant = await getSpecificSecret('itinerant');
	if (!itinerant) throw new ExpectedError(`No itinerant merchant place found.`);
	const itinerantShop = Object.values(shopList)
		.filter(shop => shop.type === ShopType.ITINERANT)
		.find(s => checkCondition(s.condition, player, dinoz.id));

	if (itinerantShop && +itinerant.value === dinoz.placeId) {
		availableActions.push({
			name: actionList[Action.ITINERANTSHOP].name,
			imgName: actionList[Action.ITINERANTSHOP].imgName,
			prop: itinerantShop.shopId
		});
	}
	const shopAvailable = Object.values(shopList).filter(
		shop =>
			shop.placeId === dinoz.placeId &&
			shop.placeId !== PlaceEnum.NOWHERE &&
			checkCondition(shop.condition, player, dinoz.id)
	);
	if (shopAvailable.length > 0) {
		// Add all the shop id to the action
		availableActions.push(
			...shopAvailable.map(s => {
				return {
					name: actionList[Action.SHOP].name,
					imgName: actionList[Action.SHOP].imgName,
					prop: s.shopId
				};
			})
		);
	}

	// Hack to remove FRETURN so dinoz can still be redirected to NPC but cannot talk to them explicitly
	dinoz.status = dinoz.status.filter(s => s.statusId !== DinozStatusId.FRETURN);
	const npcAvailable = Object.values(npcList).filter(npc => npc.placeId === dinoz.placeId);
	npcAvailable.forEach(npc => {
		if (!npc.condition || checkCondition(npc.condition, player, dinoz.id)) {
			availableActions.push({
				name: actionList[Action.NPC].name,
				imgName: actionList[Action.NPC].imgName,
				prop: npc.id
			});
		}
	});

	const missionAvailable = getMissionAction(dinoz);
	if (missionAvailable) {
		availableActions.push({
			name: actionList[Action.MISSION].name,
			imgName: actionList[Action.MISSION].imgName,
			prop: missionAvailable
		});
	}

	if (canLevelUp(dinoz, gameConfig)) {
		const tournament = await TournamentManager.getCurrentTournamentState(prisma);
		const dinozTournament = await isDinozInTournament(dinoz.id);

		const canLevelUp = !tournament || !dinozTournament || dinoz.level + 1 <= tournament.levelLimit;

		if (canLevelUp) {
			availableActions.push(actionList[Action.LEVEL_UP]);
		}
	}

	// Market if dinoz is in market
	if (dinoz.placeId === PlaceEnum.PLACE_DU_MARCHE) {
		availableActions.push(actionList[Action.MARKET]);
	}

	if (
		dinoz.placeId === PlaceEnum.GORGES_PROFONDES &&
		dinoz.status.some(status => status.statusId === DinozStatusId.FSPELE)
	) {
		availableActions.push(actionList[Action.CONGEL]);
	}

	return availableActions;
}

/**
 * @summary Get information to display the dinoz of a player
 * @param req
 * @param req.params.id {string} PlayerId
 */
export async function getDinozFiche(req: Request) {
	const dinozId = +req.params.id;
	const authed = await auth(req);

	// Retrieve player from dinozId
	const playerData = await getDinozFicheRequest(dinozId, authed.id);

	if (!playerData) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}

	if (playerData.dinoz.length === 0) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	const myDinoz = playerData.dinoz.find(d => d.id === dinozId);

	// If player found is different from player who do the request, throw exception
	if (!myDinoz) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't belong to player ${authed.id}`);
	}

	const currentTournament = await TournamentManager.getCurrentTournamentState(prisma);

	const isInTournament = await isDinozInTournament(dinozId);
	// Create the answer that will be sent back
	const ret = toDinozFiche(playerData, dinozId, isInTournament ? currentTournament : null);
	ret.actions = await getAvailableActions(myDinoz, playerData);

	return ret;
}

/**
 * @summary Get all skills and their state
 * @param req
 * @param req.params.id {string} DinozId
 */
export async function getDinozSkill(req: Request) {
	const authed = await auth(req);
	const dinozId: number = parseInt(req.params.id);
	const dinozSkillData = await getDinozSkillRequest(dinozId);
	if (!dinozSkillData) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	if (!dinozSkillData.player || dinozSkillData.player.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinozSkillData.id} doesn't belong to player ${authed.id}`);
	}

	return toSkillDetails(dinozSkillData.skills);
}

/**
 * @summary Buy a dinoz from the shop
 * @param req
 * @param req.params.id {string} Dinoz ID
 * @return DinozFiche
 */
export async function buyDinoz(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.id;

	// Check if player can buy more dinoz
	const dinozActive = await getActiveDinoz(authed.id);

	if (dinozActive.length > 0) {
		const player = dinozActive[0].player;

		if (!player) {
			throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
		}

		const maxDinoz = gameConfig.dinoz.maxQuantity + (player.leader ? 3 : 0) + (player.messie ? 3 : 0);
		if (dinozActive.length >= maxDinoz) {
			throw new ExpectedError(translate('tooManyActiveDinoz', authed));
		}
	}

	// Get dinoz details thanks to his ID
	const dinozShopData = await getDinozShopDetailsRequest(dinozId);

	if (!dinozShopData) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	const race = getRace(dinozShopData);

	// Throw error if dinoz doesn't belong to player shop
	if (!dinozShopData.player || dinozShopData.player.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${req.params.id} doesn't belong to your account`);
	}

	// Throws an exception if player doesn't have enough money to buy the dinoz
	if (dinozShopData.player.money < race.price) {
		throw new ExpectedError(translate('notEnoughMoney', authed));
	}

	const newDinozProps = initializeDinoz(race, dinozShopData.player.id, dinozShopData.display);

	// Set player money
	await removeMoney(dinozShopData.player.id, race.price);

	// Delete all dinoz from dinoz shop
	await deleteDinozInShopRequest(authed.id);

	// Create a new dinoz that belongs to player
	const dinozCreated = await createDinoz(newDinozProps);
	const newDinoz: PlayerForDinozFiche = {
		id: authed.id,
		engineer: false,
		items: [],
		rewards: [],
		quests: [],
		ranking: null,
		dinoz: [
			{
				...dinozCreated,
				status: [],
				skills: [],
				missions: [],
				items: [],
				followers: [],
				concentration: null,
				TournamentTeam: [],
				build: null
			}
		]
	};

	const skillsToAdd = Object.values(skillList).filter(
		skill => skill.raceId?.some(raceId => raceId === race.raceId) && skill.isBaseSkill
	);

	// Add base skills to created dinoz
	await addMultipleSkillToDinoz(
		dinozCreated.id,
		skillsToAdd.map(skill => skill.id)
	);

	// Update player points and dinoz count
	await updateDinozCount(authed.id, 1);
	await updatePoints(authed.id, 1);

	return toDinozFiche(newDinoz, dinozCreated.id, null);
}

/**
 * @summary Set the name of a dinoz
 * @param req
 * @param req.params.id {string} DinozId
 * @return void
 */
export async function setDinozName(req: Request) {
	// Retrieve player from dinozId
	const dinozId = +req.params.id;
	const dinoz = await getCanDinozChangeName(+req.params.id);
	const regexName = /^[a-zA-Z0-9éèêëÉÈÊËîïÎÏôÔûÛ\-']{3,16}$/;
	const name = req.body.newName;

	const authed = await auth(req);

	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	// If authenticated player is different from player found, throw exception
	if (!dinoz.player || dinoz.player.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinoz.id} doesn't belong to player ${authed.id}`);
	}

	// If player can't change dinoz name, throw exception
	if (!dinoz.canChangeName) {
		throw new ExpectedError(`Can't update dinoz name`);
	}
	if (regexName.test(name)) {
		await updateDinoz(+req.params.id, {
			name: req.body.newName,
			canChangeName: false
		});
	} else {
		throw new ExpectedError(translate('OnlyLettersAndNumbers', authed));
	}
}

/**
 * @summary Activate or desactivate a skill from a dinoz
 * @param req
 * @param req.params.id {string} DinozId
 * @param req.body.skillId {string} SkillId
 * @param req.body.skillState {boolean} State of the skill
 * @return boolean
 */
export async function setSkillState(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.id;
	const skillToUpdate = +req.body.skillId;
	const skillStateToUpdate = !!req.body.skillState;

	const dinoz = await getDinozSkillAndStatusRequest(dinozId);

	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}
	const skill = Object.values(skillList).find(skill => skill.id === skillToUpdate);

	// Check if skill exist and can be activate/deactivate
	if (!skill) {
		throw new ExpectedError(`Skill ${skillToUpdate} doesn't know exist`);
	}
	if (!skill.activatable) {
		throw new ExpectedError(`Skill ${skillToUpdate} cannot be activated`);
	}

	// Check if dinoz belongs to player who do the request
	if (!dinoz.player || dinoz.player.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinoz.id} doesn't belong to player ${authed.id}`);
	}

	// Check if dinoz can change his skills
	if (!canChangeSkillState(dinoz)) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't have the right status`);
	}

	// Check if dinoz knows the skill
	if (!knowSkillId(dinoz, skillToUpdate)) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't know skill : ${skillToUpdate}`);
	}

	await setSkillStateRequest(dinozId, skillToUpdate, skillStateToUpdate);

	return !skillStateToUpdate;
}

/**
 * @summary Move the dinoz to a new place
 * @param req
 * @param req.params.id {string} DinozId
 * @return FightResult
 */
export async function betaMove(req: Request) {
	//Retrieve dinozId
	const dinozId = +req.body.dinozId;
	const authed = await auth(req);

	const player = await getDinozFightDataRequest(dinozId, authed.id);

	if (!player) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}

	const dinoz = player.dinoz.find(d => d.id === dinozId);
	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	if (dinoz.canChangeName) {
		throw new ExpectedError(`Dinoz has to be named`);
	}

	if (dinoz.unavailableReason !== null) {
		throw new ExpectedError(`Dinoz is not able to move.`);
	}

	if (dinoz.leaderId) {
		throw new ExpectedError(translate('notLeader', authed));
	}

	let team = player.dinoz;

	// Go through followers and make those that are unavailable leave the group.
	const unavailableFollowers = team.filter(d => d.life <= 0 || d.unavailableReason !== null);

	if (unavailableFollowers.length > 0) {
		for (const d of unavailableFollowers) {
			await updateDinoz(d.id, { leader: { disconnect: true } });
		}
		team = team.filter(d => d.life > 0 && d.unavailableReason === null);
	}

	for (const dinozData of team) {
		//Remove temporary status
		const tempStatus = dinozData.status.filter(r => r.statusId in TemporaryStatus);
		if (tempStatus.length > 0) {
			const promises = tempStatus.map(r => removeStatusFromDinoz(dinozData.id, r.statusId));
			await Promise.all(promises);
		}
	}

	if (dinoz.concentration) {
		throw new ExpectedError(translate('concentration', authed));
	}

	if (team.some(d => !d.fight)) {
		throw new ExpectedError(translate('missingIrma', authed));
	}

	if (!isAlive(dinoz)) {
		throw new ExpectedError(translate('dead', authed));
	}

	const dinozPlace = actualPlace(dinoz);
	const desiredPlace = Object.values(placeList).find(place => place.placeId === req.body.placeId);

	// Check if desired and actual place exist and is adjacent to actual place
	if (!desiredPlace) {
		throw new ExpectedError(`Dinoz ${dinozId} want to go in the void`);
	}

	if (dinozPlace.placeId === desiredPlace.placeId) {
		throw new ExpectedError(`Dinoz ${dinozId} is already at ${dinozPlace.name}`);
	}

	if (!dinozPlace.borderPlace.includes(desiredPlace.placeId)) {
		throw new ExpectedError(`${dinozPlace.name} is not adjacent with ${desiredPlace.name}`);
	}

	// Check if condition to go to desired place are fulfilled for dinoz and followers
	if (desiredPlace.conditions) {
		for (const member of team) {
			const memberToTest: PlayerForConditionCheck = {
				id: player.id,
				items: player.items,
				rewards: player.rewards,
				quests: player.quests,
				ranking: player.ranking,
				dinoz: [member]
			};
			if (!canGoToThisPlace(memberToTest, desiredPlace.conditions, member.id)) {
				throw new ExpectedError(translate('missingStatus', authed));
			}
		}
	}

	// If dinoz leave the map, replace by the good place
	const finalPlace = desiredPlace.alias ?? desiredPlace.placeId;

	// Current date
	const currentDate = dayjs();
	// Retrieve the day of the week (0 pour dimanche, 1 pour lundi, ..., 6 pour samedi)
	const dayOfWeek = currentDate.day();

	// Marais Collant - No movement days.
	if (SWAMP_FLOODED_DAYS.includes(dayOfWeek) && dinozPlace.placeId === PlaceEnum.MARAIS_COLLANT) {
		if (!dinoz.status.some(s => s.statusId === DinozStatusId.WEIRD_SWAMP_SEEN)) {
			await addStatusToDinoz(dinoz.id, DinozStatusId.WEIRD_SWAMP_SEEN);
		}
		throw new ExpectedError(translate('noMovement', authed));
	}

	// Look for a special action that happens on the fight.
	let fight = await movementListener(player, team, finalPlace, dinozId);
	if (!fight) {
		fight = await fightMonstersAtPlace(team, finalPlace, player);
		if (fight.result) {
			await updateMultipleDinoz(
				team.map(d => d.id),
				{ placeId: finalPlace }
			);

			await createLogForMultipleDinoz(
				LogType.Move,
				player.id,
				team.map(d => d.id),
				finalPlace.toString()
			);
		}
	}

	// Consume fight action
	for (const dino of team) {
		await updateDinoz(dino.id, {
			fight: false
		});
	}

	// Update player stats
	await setSpecificStat(StatTracking.MOVES, player.id, team.length);
	await setSpecificStat(
		StatTracking.KILL_M,
		player.id,
		fight.fighters.filter(f => f.type === FighterType.MONSTER).length
	);

	return fight;
}

export async function resurrectDinoz(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.id;

	// Retrieve player from dinozId
	const dinozData = await getDinozFicheLiteRequest(dinozId);

	if (!dinozData) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	// If player found is different from player who do the request, throw exception
	if (!dinozData.player || dinozData.player.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't belong to player.`);
	}

	if (dinozData.life > 0) {
		throw new ExpectedError(`${dinozData.name} is not dead`);
	}

	await updateDinoz(dinozId, {
		life: 1,
		experience: Math.round(dinozData.experience / 2),
		placeId: PlaceEnum.DINOVILLE,
		leader: { disconnect: true }
	});

	if (dinozData.followers.length > 0) {
		for (const d of dinozData.followers) {
			await updateDinoz(d.id, { leader: { disconnect: true } });
		}
	}

	const starQuest = dinozData.player.quests.find(q => q.questId === Scenario.STAR && q.progression === 7);
	if (starQuest && dinozData.placeId === PlaceEnum.JUNGLE_SAUVAGE) {
		await upsertQuest(dinozData.player.id, Scenario.STAR, 8);
		await increaseItemQuantity(dinozData.player.id, itemList[Item.MAGIC_STAR].itemId, 1);
		return {
			category: ItemEffect.QUEST,
			value: 'resurrect_star_found'
		};
	}

	// Update stats
	await setSpecificStat(StatTracking.DEATHS, dinozData.player.id, 1);

	await createLog(LogType.Revive, dinozData.player.id, dinozId);
}

export async function digWithDinoz(req: Request) {
	const dinozId = +req.params.id;
	const authed = await auth(req);
	const player = await getDinozFicheRequest(dinozId, authed.id);

	if (!player) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}
	const dinozData = player.dinoz.find(d => d.id === dinozId);
	if (!dinozData) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	if (
		!dinozData.status.some(
			status => status.statusId === DinozStatusId.SHOVEL || status.statusId === DinozStatusId.ENHANCED_SHOVEL
		)
	) {
		throw new ExpectedError(`Dinoz ${dinozId} cannot dig.`);
	}

	if (dinozData.placeId === PlaceEnum.MINES_DE_CORAIL) {
		throw new ExpectedError(translate('shovelMine', authed));
	}

	const treasures = Object.values(digTreasures).filter(dig => dig.place === dinozData.placeId);
	let rewards: Rewarder[] = [];
	let fight: FightResult | null = null;
	for (const treasure of treasures) {
		if (treasure.condition && checkCondition(treasure.condition, player, dinozId)) {
			if (treasure.fight) {
				// Fetch player data needed for fight
				const fightPlayer = await getDinozFightDataRequest(dinozId, authed.id);
				if (!fightPlayer) {
					throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
				}

				const dinoz = fightPlayer.dinoz.find(d => d.id === dinozId);
				if (!dinoz) {
					throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
				}

				if (!isAlive(dinoz)) {
					throw new ExpectedError(translate('dead', authed));
				}

				// Fight before reward
				const fightResult = calculateFightVsMonsters([dinoz], fightPlayer, dinozData.placeId, treasure.fight);

				fight = await rewardFightVsMonsters([dinoz], treasure.fight, fightResult, dinozData.placeId, fightPlayer);

				if (fight.result) {
					rewards = rewards.concat(treasure.reward);

					const statusReward = treasure.reward.find(r => r.rewardType === RewardEnum.STATUS);
					if (statusReward) {
						fight.statusReward = statusReward.value;
					}
				}
			} else {
				rewards = rewards.concat(treasure.reward);
			}
		}
	}
	if (rewards.length === 0 && !fight) {
		rewards = [{ rewardType: RewardEnum.GOLD, value: getRandomInteger(0, 125) }];
	}
	await rewarder(rewards, [dinozData], authed.id, false);

	// Always break normal shovel
	if (dinozData.status.some(status => status.statusId === DinozStatusId.SHOVEL)) {
		await removeStatusFromDinoz(dinozId, DinozStatusId.SHOVEL);
		await addStatusToDinoz(dinozData.id, DinozStatusId.BROKEN_SHOVEL);
		await setSpecificStat(StatTracking.BROKEN_SHOVEL, player.id, 1);
	}

	// Try to break enhanced shovel (75% of keeping it)
	if (
		getRandomNumber(0, 100) >= 75 &&
		dinozData.status.some(status => status.statusId === DinozStatusId.ENHANCED_SHOVEL)
	) {
		await removeStatusFromDinoz(dinozId, DinozStatusId.ENHANCED_SHOVEL);
		await addStatusToDinoz(dinozData.id, DinozStatusId.BROKEN_ENHANCED_SHOVEL);
		await setSpecificStat(StatTracking.BROKEN_SHOVEL, player.id, 1);
	}

	return {
		rewards,
		fight
	};
}

export async function getGatherGrid(req: Request): Promise<GatherPublicGrid> {
	const authed = await auth(req);
	const dinozId = +req.params.id;
	const gatherPlaceArray = Object.values(gatherList).filter(g => g.action === req.params.type.toString().toLowerCase());

	const player = await getDinozGatherData(dinozId, authed.id);
	if (!player) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}
	const dinozData = player.dinoz.find(d => d.id === dinozId);
	if (!dinozData) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	const place = actualPlace(dinozData);

	const typeOfGridArray = Object.entries(GatherType).filter(g => {
		if (g[1] === place.gather || g[1] === place.specialGather) return true;
	});
	const typeOfGrid = typeOfGridArray.find(
		g => g[0].toLowerCase().replace(/[0-9]/g, '') === req.params.type.toString().toLowerCase()
	);

	if (!typeOfGrid) {
		throw new ExpectedError(`This type of grid doesn't exist`);
	}
	const idOfTypeOfGrid = +typeOfGrid[1];

	const playerGrid = await getCommonGatherInfo(player.id);
	const gatherPlace = gatherPlaceArray.find(place => place.type === idOfTypeOfGrid);

	if (!gatherPlace) {
		throw new ExpectedError(`Dinoz cannot gather at this place`);
	}

	if (!checkCondition(gatherPlace.condition, player, dinozId)) {
		throw new ExpectedError(`Dinoz don't have the skill to gather at this place`);
	}

	let myGrid = playerGrid.filter(grid => grid.place === place.placeId).find(grid => grid.type === idOfTypeOfGrid);

	if (!myGrid) {
		myGrid = await createGrid(initializeGatherGrid(authed.id, place.placeId, gatherPlace));
	}

	// Generate a new one if all box are empty
	if (myGrid.grid.every(box => box === -1)) {
		myGrid = await updateGrid(
			player.id,
			dinozId,
			myGrid.id,
			initializeGatherGrid(authed.id, place.placeId, gatherPlace)
		);
	}

	const hiddenGrid = hideGridIngredients(myGrid.grid);
	const unflattenedGrid = [];
	for (let i = 0; i < hiddenGrid.length; i += getGridSize(myGrid)) {
		unflattenedGrid.push(hiddenGrid.slice(i, i + getGridSize(myGrid)));
	}

	return {
		grid: unflattenedGrid,
		gatherTurn: getNumberOfGatheringTries(dinozData, gatherPlace),
		gatherType: gatherPlace.apparence.toLowerCase()
	};
}

export async function gatherWithDinoz(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.id;
	const gatherPlaceArray = Object.values(gatherList).filter(g => g.action === req.body.type.toString().toLowerCase());

	const player = await getDinozGatherData(dinozId, authed.id);
	if (!player) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}
	const dinozData = player.dinoz.find(d => d.id === dinozId);
	if (!dinozData) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	const place = actualPlace(dinozData);
	const typeOfGridArray = Object.entries(GatherType).filter(g => {
		if (g[1] === place.gather || g[1] === place.specialGather) return true;
	});
	const typeOfGrid = typeOfGridArray.find(
		g => g[0].toLowerCase().replace(/[0-9]/g, '') === req.body.type.toString().toLowerCase()
	);

	if (!typeOfGrid) {
		throw new ExpectedError(`This type of grid doesn't exist`);
	}
	const idOfTypeOfGrid = +typeOfGrid[1];
	const playerGrid = await getCommonGatherInfo(player.id);
	const gatherPlace = gatherPlaceArray.find(place => place.type === typeOfGrid[1]);
	const myGrid = playerGrid.find(grid => grid.place === place.placeId && grid.type === idOfTypeOfGrid);

	if (!gatherPlace) {
		throw new ExpectedError(`Dinoz cannot gather at this place`);
	}

	if (!dinozData.gather && !gatherPlace.special) {
		throw new ExpectedError(`Dinoz don't have action to gather`);
	}

	if (!myGrid) {
		throw new ExpectedError(`You don't have generated any grid.`);
	}

	if (!checkCondition(gatherPlace.condition, player, dinozId)) {
		throw new ExpectedError(`Dinoz don't have the skill to gather at this place`);
	}

	// Consume token if it's a special gather
	if (gatherPlace.special) {
		const playerToken = player.items.find(item => item.itemId === gatherPlace.cost.itemId);
		if (!playerToken) throw new ExpectedError(`You don't have the needed token to gather here.`);
		await decreaseItemQuantity(player.id, gatherPlace.cost.itemId, 1);

		await createLog(LogType.ItemUsed, player.id, dinozData.id, gatherPlace.cost.itemId.toString(), '1');
	}

	// Sanitize the box to open
	const boxToSanitize: number[][] = req.body.box;
	for (const element of boxToSanitize) {
		if (!element.every(coord => typeof coord === 'number')) {
			throw new ExpectedError(`This coordinate is not correct : ${element}`);
		}
		if (element.some(coord => coord > getGridSize(myGrid) || coord < 0)) {
			throw new ExpectedError(`This coordinate is out of the grid : ${element}`);
		}
	}

	const boxToOpen: [number, number][] = boxToSanitize as [number, number][];

	// Check if number of box to open is equal or lower than the number of maximum click
	if (boxToOpen.length > getNumberOfGatheringTries(dinozData, gatherPlace)) {
		throw new ExpectedError(`You have selected too many square`);
	}

	const returnGrid = discoverBox(myGrid, player, gatherPlace, ...boxToOpen);
	await updateGrid(player.id, dinozId, myGrid.id, saveGrid(myGrid, ...boxToOpen));

	for (const [index, i] of returnGrid.rewards.item.entries()) {
		const itemToReward = player.items.find(items => items.itemId === i.id);
		if (i.id === itemList[Item.BOX_HANDLER].itemId) {
			const completion = await getPlayerCompletion(player.id);
			if (completion?.ranking?.completion === undefined) {
				throw new ExpectedError(`Failed to find completion.`);
			}
			const box = selectBox(completion.ranking.completion);
			const boxToReward = player.items.find(items => items.itemId === box.itemId);
			if (boxToReward) {
				await increaseItemQuantity(player.id, boxToReward.itemId, 1);
			} else {
				player.items.push(await insertItem(player.id, { itemId: box.itemId, quantity: 1 }));
			}
			returnGrid.rewards.item[index] = { id: box.itemId, price: box.price, quantity: 1, maxQuantity: box.maxQuantity };
		} else {
			const goldItems = [
				itemList[Item.GOLD100].itemId,
				itemList[Item.GOLD500].itemId,
				itemList[Item.GOLD1000].itemId,
				itemList[Item.GOLD2000].itemId,
				itemList[Item.GOLD2500].itemId,
				itemList[Item.GOLD3000].itemId,
				itemList[Item.GOLD5000].itemId,
				itemList[Item.GOLD10000].itemId,
				itemList[Item.GOLD20000].itemId
			];
			if (itemToReward && itemToReward.quantity < i.maxQuantity && !goldItems.includes(i.id)) {
				await increaseItemQuantity(player.id, i.id, 1);
				// Update quantity in case multiple were obtained and the max was reached
				itemToReward.quantity += 1;
			} else if (goldItems.includes(i.id)) {
				await addMoney(player.id, i.price);
			} else {
				player.items.push(await insertItem(player.id, { itemId: i.id, quantity: 1 }));
			}
		}
	}

	for (const i of returnGrid.rewards.ingredients) {
		const ingredientToReward = player.ingredients.find(ingre => ingre.ingredientId === i.ingredientId);
		let isMaxQuantity = false;
		let currentQuantity = ingredientToReward ? ingredientToReward.quantity : 0;

		if (ingredientToReward && ingredientToReward.quantity < i.maxQuantity) {
			if (!ingredientToReward.playerId) {
				throw new ExpectedError(`Ingredient ${ingredientToReward.ingredientId} doesn't belong to any player.`);
			}
			await increaseIngredientQuantity(ingredientToReward.playerId, ingredientToReward.ingredientId, 1);
			// Update quantity in case multiple were obtained and the max was reached
			currentQuantity += 1;
			ingredientToReward.quantity = currentQuantity;

			isMaxQuantity = ingredientToReward.quantity >= i.maxQuantity;
		} else if (ingredientToReward && ingredientToReward.quantity >= i.maxQuantity) {
			// Do nothing
			currentQuantity = ingredientToReward.quantity;
			isMaxQuantity = true;
		} else {
			currentQuantity = 1;
			player.ingredients.push(
				await setIngredient({
					player: { connect: { id: player.id } },
					ingredientId: i.ingredientId,
					quantity: currentQuantity
				})
			);
		}
		// Add or update the ingredient in ingredientsAtMaxQuantity
		const existingEntry = returnGrid.ingredientsAtMaxQuantity.find(ingre => ingre.ingredientId === i.ingredientId);
		if (existingEntry) {
			existingEntry.quantity = currentQuantity;
			existingEntry.isMaxQuantity = isMaxQuantity;
		} else {
			returnGrid.ingredientsAtMaxQuantity.push({
				ingredientId: i.ingredientId,
				quantity: currentQuantity,
				isMaxQuantity: isMaxQuantity
			});
		}
	}

	if (!gatherPlace.special) {
		await updateDinoz(dinozId, {
			gather: false
		});

		// Check if the grid was finished and award the player if it has not exhausted its daily grid rewards
		if (myGrid.grid.every(box => box === -1)) {
			returnGrid.isGridComplete = true;
			// If the grid is finished, we process the rewards
			if (player.dailyGridRewards > 0) {
				returnGrid.goldReward = GRID_FINISHED_GOLD_REWARD;
				await addMoney(player.id, returnGrid.goldReward);
				await removeDailyGridRewards(player.id, 1);
			}
			await createLog(LogType.GridFinished, authed.id, undefined, returnGrid.goldReward);
		}
	}

	switch (gatherPlace.type) {
		case GatherType.CUEILLE1:
		case GatherType.CUEILLE3:
		case GatherType.CUEILLE4:
		case GatherType.CUEILLE2:
			await setSpecificStat(StatTracking.CUEILLE, player.id, 1);
			break;
		case GatherType.ENERGY1:
		case GatherType.ENERGY2:
			await setSpecificStat(StatTracking.ENERGY, player.id, 1);
			break;
		case GatherType.FISH:
			await setSpecificStat(StatTracking.FISH, player.id, 1);
			break;
		case GatherType.SEEK:
			await setSpecificStat(StatTracking.SEEK, player.id, 1);
			break;
		case GatherType.HUNT:
			await setSpecificStat(StatTracking.CHASSE, player.id, 1);
			break;
		default:
			break;
	}

	return returnGrid;
}

/**
 * Get data needed for the /manage page
 */
export async function getDinozToManage(req: Request) {
	const authed = await auth(req);

	// Get player rewards
	const rewards = await getPlayerRewards(authed.id);

	// Check if player has PDA
	const hasPDA = rewards.some(reward => reward.rewardId === Reward.PDA);

	// Stop if player doesn't have PDA
	if (!hasPDA) {
		throw new ExpectedError('Player has no PDA');
	}

	// Get Dinoz
	const dinozList = await getManageData(authed.id);

	return dinozList;
}

/**
 * Update a player dinoz order
 */
export async function updateOrders(req: Request) {
	const authed = await auth(req);

	const order = req.body.order;

	if (!order || !Array.isArray(order)) {
		throw new ExpectedError('Order is not an array');
	}

	const playerId = authed.id;

	// Get player rewards
	const rewards = await getPlayerRewards(playerId);

	// Check if player has PDA
	const hasPDA = rewards.some(reward => reward.rewardId === Reward.PDA);

	// Stop if player doesn't have PDA
	if (!hasPDA) {
		throw new ExpectedError('Player has no PDA');
	}

	// Preformat Dinoz data
	const dinozList = order.map((id: number, index) => ({
		id,
		order: index
	}));

	// Update orders
	const newOrder = await updateOrderData(playerId, dinozList);
	return newOrder;
}

/**
 * Follow a dinoz
 */
export async function followDinoz(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.id;
	const dinozToFollowId = +req.params.targetId;

	const player_dinoz = await getDinozFicheRequest(dinozId, authed.id);
	const player_leader = await getDinozFicheRequest(dinozToFollowId, authed.id);

	if (!player_dinoz || !player_leader) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}

	if (dinozId === dinozToFollowId) {
		throw new ExpectedError('Cannot follow itself');
	}

	const dinoz = player_dinoz.dinoz.find(d => d.id === dinozId);
	const leader = player_leader.dinoz.find(d => d.id === dinozToFollowId);

	if (!dinoz || !leader) {
		throw new ExpectedError('No dinoz found');
	}

	if (dinoz.canChangeName || leader.canChangeName) {
		throw new ExpectedError(`Dinoz has to be named.`);
	}

	//Check if leader is not at max followers
	const max = getMaxFollowers(toDinozFiche(player_leader, leader.id, null));
	if (leader.followers.length >= max) {
		throw new ExpectedError(translate('maxFollowers', authed));
	}

	if (dinoz.leaderId || dinoz.followers.length > 0) {
		throw new ExpectedError('Dinoz is already following another dinoz.');
	}

	if (dinoz.skills.some(s => s.skillId === Skill.BRAVE) || leader.skills.some(s => s.skillId === Skill.BRAVE)) {
		throw new ExpectedError('Dinoz cannot follow any dinoz');
	}

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId, dinozToFollowId))) {
		throw new ExpectedError('Player does not own this dinoz');
	}

	if (dinoz.placeId !== leader.placeId) {
		throw new ExpectedError('Dinoz should be at the same place.');
	}

	// Update dinoz
	await updateDinoz(dinozId, { leader: { connect: { id: dinozToFollowId } } });
}

/**
 * Unfollow a dinoz
 */
export async function unfollowDinoz(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.id;

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId))) {
		throw new ExpectedError('Player does not own this dinoz');
	}

	// Update dinoz
	await updateDinoz(dinozId, { leader: { disconnect: true } });
}

/**
 * Change the leader of a group
 */
export async function changeLeaderDinoz(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.id;

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId))) {
		throw new ExpectedError('Player does not own this dinoz');
	}

	// Retrieve the dinoz and its group (followers + skills)
	const currentLeader = await getLeaderWithFollowers(dinozId);

	if (!currentLeader) {
		throw new ExpectedError('No leader found for this dinoz');
	}

	// Retrieve the follower who will become the new leader directly from currentLeader.followers
	const newLeader = currentLeader.followers.find(f => f.id === dinozId);

	if (!newLeader) {
		throw new ExpectedError('Dinoz not found as a follower of the current leader');
	}

	// Check if the new leader can have this many followers
	const maxFollowers = getMaxFollowers(newLeader);
	if (currentLeader.followers.length > maxFollowers) {
		throw new ExpectedError(translate('maxFollowers', authed));
	}

	// Update leader/follower relationships
	await updateDinoz(newLeader.id, { leader: { disconnect: true } }); // The new leader no longer has a leader

	await updateDinoz(currentLeader.id, { leader: { connect: { id: newLeader.id } } }); // The former leader becomes a follower of the new leader

	await prisma.dinoz.updateMany({
		where: { leaderId: currentLeader.id },
		data: { leaderId: newLeader.id } // All former followers now follow the new leader
	});
}

export async function disband(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.id;

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId))) {
		throw new ExpectedError('Player does not own this dinoz');
	}
	const dinoz = await getFollowingDinoz(dinozId);

	if (!dinoz) {
		throw new ExpectedError('No dinoz found');
	}

	for (const d of dinoz.followers) {
		await updateDinoz(d.id, { leader: { disconnect: true } });
	}
}

export async function useIrma(req: Request) {
	const dinozId = +req.params.id;

	const authed = await auth(req);

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId))) {
		throw new ExpectedError('Player does not own this dinoz');
	}
	const dinoz = await getIrmaUsageInfo(dinozId);

	if (!dinoz || !dinoz.player) {
		throw new ExpectedError('No dinoz found');
	}

	const team = [dinoz, ...dinoz.followers];

	const irmaQuantity = dinoz.player.items.find(i => i.itemId === itemList[Item.POTION_IRMA].itemId);

	const neededIrma = team.filter(d => d.remaining === 0 && (!d.fight || !d.gather)).length;

	if ((!irmaQuantity || (irmaQuantity && irmaQuantity.quantity < neededIrma)) && neededIrma > 0) {
		throw new ExpectedError(translate('notEnoughIrma', authed));
	}

	for (const dino of team.filter(d => !d.fight || !d.gather)) {
		if (dino.remaining > 0) {
			await updateDinoz(dino.id, {
				fight: true,
				gather: true,
				remaining: { decrement: 1 }
			});
		} else {
			await updateDinoz(dino.id, {
				fight: true,
				gather: true
			});
		}
	}

	if (neededIrma > 0) {
		await decreaseItemQuantity(dinoz.player.id, itemList[Item.POTION_IRMA].itemId, neededIrma);
	}
	return {
		category: ItemEffect.ACTION,
		value: neededIrma
	};
}

export async function frozeDinoz(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.id;

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId))) {
		throw new ExpectedError(translate('error.notYourDinoz', authed));
	}

	const dinoz = await checkFrozenDinoz(dinozId);

	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	if (dinoz.placeId !== PlaceEnum.GORGES_PROFONDES) {
		throw new ExpectedError(translate('error.dinozWrongLocation', authed));
	}

	if (dinoz.leaderId) {
		await updateDinoz(dinozId, { leader: { disconnect: true } });
	}

	if (dinoz.followers.length > 0) {
		for (const d of dinoz.followers) {
			await updateDinoz(d.id, { leader: { disconnect: true } });
		}
	}

	if (dinoz.unavailableReason === UnavailableReason.frozen) {
		throw new ExpectedError('Dinoz already frozen');
	}

	await updateDinoz(dinozId, {
		unavailableReason: UnavailableReason.frozen,
		remaining: 0
	});
}

export async function unfrozeDinoz(req: Request) {
	const dinozId = +req.params.id;

	const authed = await auth(req);

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId))) {
		throw new ExpectedError('Player does not own this dinoz');
	}

	const dinoz = await checkFrozenDinoz(dinozId);

	if (!dinoz) {
		throw new ExpectedError('No dinoz found');
	}

	if (dinoz.unavailableReason !== UnavailableReason.frozen) {
		throw new ExpectedError('Dinoz is not frozen');
	}

	// Check if player can buy more dinoz
	const dinozActive = await getActiveDinoz(authed.id);

	if (dinozActive.length > 0) {
		const player = dinozActive[0].player;

		if (!player) {
			throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
		}

		if (!player.leader && dinozActive.length >= gameConfig.dinoz.maxQuantity) {
			throw new ExpectedError(translate('tooManyActiveDinoz', authed));
		}
		if (player.leader && dinozActive.length >= gameConfig.dinoz.maxQuantity + gameConfig.dinoz.leaderBonus) {
			throw new ExpectedError(translate('tooManyActiveDinoz', authed));
		}
	}
	await updateDinoz(dinozId, {
		unavailableReason: UnavailableReason.unfreezing
	});
}

export async function restDinoz(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.id;
	const start = req.body.start as boolean;

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId))) {
		throw new ExpectedError('Player does not own this dinoz');
	}

	const dinoz = await checkRestDinoz(dinozId);

	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	if (dinoz.unavailableReason === UnavailableReason.resting && start) {
		throw new ExpectedError(`Dinoz is already resting`);
	}

	if (dinoz.unavailableReason !== UnavailableReason.resting && !start) {
		throw new ExpectedError(`Dinoz is not resting`);
	}

	await updateDinoz(dinozId, { unavailableReason: start ? UnavailableReason.resting : null });
}
