import { DinozForConditionCheck } from '@drpg/core/constants';
import { Action, ActionFiche, actionList } from '@drpg/core/models/dinoz/ActionList';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { statusList } from '@drpg/core/models/dinoz/StatusList';
import { GatherType } from '@drpg/core/models/enums/GatherType';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { ShopType } from '@drpg/core/models/enums/ShopType';
import { gatherList } from '@drpg/core/models/gather/gatherList';
import { GatherPublicGrid } from '@drpg/core/models/gather/gatherPublicGrid';
import { itemList } from '@drpg/core/models/item/ItemList';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { rewardList } from '@drpg/core/models/reward/RewardList';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import {
	DinozForDinozFiche,
	actualPlace,
	canChangeSkillState,
	canGoToThisPlace,
	canLevelUp,
	getFollowableDinoz,
	getNumberOfGatheringTries,
	getRace,
	initializeDinoz,
	isAlive,
	knowSkillId,
	toDinozFiche,
	toDinozSkillFiche
} from '@drpg/core/utils/DinozUtils';
import {
	discoverBox,
	getGridSize,
	hideGridIngredients,
	initializeGatherGrid,
	saveGrid
} from '@drpg/core/utils/GatherUtils';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { Concentration, Dinoz, DinozMission, LogType, Player } from '@drpg/prisma';
import { Request } from 'express';
import gameConfig from '../config/game.config.js';
import { digTreasures } from '../constants/digTreasures.js';
import { TemporaryStatus, shopList } from '../constants/index.js';
import {
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
	getManageData,
	updateDinoz,
	updateMultipleDinoz,
	updateOrderData
} from '../dao/dinozDao.js';
import { addMultipleSkillToDinoz, setSkillStateRequest } from '../dao/dinozSkillDao.js';
import { addStatusToDinoz, removeStatusFromDinoz } from '../dao/dinozStatusDao.js';
import { addMoney, ownsDinoz, removeMoney } from '../dao/playerDao.js';
import { deleteDinozInShopRequest, getDinozShopDetailsRequest } from '../dao/playerDinozShopDao.js';
import { createGrid, getCommonGatherInfo, updateGrid } from '../dao/playerGatherDao.js';
import { increaseIngredientQuantity, setIngredient } from '../dao/playerIngredientDao.js';
import { decreaseItemQuantity, increaseItemQuantity, insertItem } from '../dao/playerItemDao.js';
import { getPlayerRewards } from '../dao/playerRewardsDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { getRandomNumber } from '../utils/index.js';
import { rewarder } from '../utils/rewarder.js';
import { moveFight } from './fightService.js';
import { getMissionAction } from './missionsService.js';
import { mouvementListener } from './specialService.js';
import { createLog, createLogForMultipleDinoz } from '../dao/logDao.js';

/**
 * @summary Get available action from dinoz
 */
export async function getAvailableActions(
	dinoz: DinozForConditionCheck &
		Pick<Dinoz, 'id' | 'experience' | 'isSelling' | 'leaderId'> & {
			missions: DinozMission[];
			concentration: Concentration | null;
			player: (DinozForConditionCheck['player'] & Pick<Player, 'id'>) | null;
			followers: Pick<Dinoz, 'id'>[];
		}
) {
	if (!dinoz.player) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't belong to any player.`);
	}

	const availableActions: ActionFiche[] = [];

	const dinozPlace = actualPlace(dinoz);

	// Nothing else if dinoz is being sold
	if (dinoz.isSelling) {
		return [actionList[Action.MARKET]];
	}

	// If Dinoz is following another dinoz, add the unfollow action
	if (dinoz.leaderId) {
		availableActions.push(actionList[Action.UNFOLLOW]);
	} else {
		// Check if there is a dinoz to follow
		const potentialDinozToFollow = await getAvailableDinozToFollow(dinoz.player.id, dinoz.id);
		const dinozToFollow = getFollowableDinoz(
			potentialDinozToFollow.map(dinoz => ({
				...dinoz,
				skills: dinoz.skills.map(skill => skill.skillId),
				followers: dinoz.followers.map(follower => follower.id)
			})),
			dinoz
		);
		if (dinozToFollow.length > 0 && isAlive(dinoz) && dinoz.followers.length === 0) {
			availableActions.push(actionList[Action.FOLLOW]);
		}
	}
	if (dinoz.followers.length > 0) {
		availableActions.push(actionList[Action.DISBAND]);
	}

	if (!isAlive(dinoz)) {
		availableActions.push(actionList[Action.RESURRECT]);
		return availableActions;
	}

	if (dinoz.concentration) {
		availableActions.push(actionList[Action.CONCENTRATE]);
		return availableActions;
	}

	if (!dinoz.leaderId) {
		availableActions.push(actionList[Action.FIGHT]);
	}

	//Gather
	if (
		dinozPlace.gather !== undefined &&
		checkCondition(Object.values(gatherList).find(grid => grid.type === dinozPlace.gather)?.condition, [dinoz])
	) {
		const gatherFound = Object.values(gatherList).find(grid => grid.type === dinozPlace.gather);
		if (!gatherFound) {
			throw new ErrorFormator(500, `Gather ${dinozPlace.gather} doesn't exist.`);
		}
		availableActions.push({
			name: gatherFound.action,
			imgName: 'act_gather'
		});
	}

	// Special Gather
	if (
		dinozPlace.specialGather !== undefined &&
		checkCondition(Object.values(gatherList).find(grid => grid.type === dinozPlace.specialGather)?.condition, [dinoz])
	) {
		const gatherFound = Object.values(gatherList).find(grid => grid.type === dinozPlace.specialGather);
		if (!gatherFound) {
			throw new ErrorFormator(500, `Gather ${dinozPlace.specialGather} doesn't exist.`);
		}
		availableActions.push({
			name: gatherFound.action,
			imgName: 'act_gather'
		});
	}

	// Dig with the shovel
	if (
		dinoz.status.some(status => status.statusId === statusList.SHOVEL || status.statusId === statusList.ENHANCED_SHOVEL)
	) {
		availableActions.push(actionList[Action.DIG]);
	}

	// Shop action: check if a shop is available where the dinoz is
	const shopAvailable = Object.values(shopList).find(shop => shop.placeId == dinoz.placeId);
	if (shopAvailable) {
		if (shopAvailable.type == ShopType.CURSED) {
			const dinozIsCursed = dinoz.status.some(status => status.statusId === statusList.CURSED);
			if (dinozIsCursed) {
				// Add the shop id to the action
				const shopAction = {
					name: actionList[Action.SHOP].name,
					imgName: actionList[Action.SHOP].imgName,
					prop: shopAvailable.shopId
				};
				availableActions.push(shopAction);
			}
		} else if (shopAvailable.type == ShopType.MAGICAL) {
			const playerNapodino = dinoz.player.items.find(napo => napo.itemId === itemList.GOLDEN_NAPODINO.itemId);
			if (playerNapodino && playerNapodino.quantity > 0) {
				const shopAction: ActionFiche = {
					name: actionList[Action.SHOP].name,
					imgName: actionList[Action.SHOP].imgName,
					prop: shopAvailable.shopId
				};
				availableActions.push(shopAction);
			}
		} else {
			// Add the shop id to the action
			const shopAction: ActionFiche = {
				name: actionList[Action.SHOP].name,
				imgName: actionList[Action.SHOP].imgName,
				prop: shopAvailable.shopId
			};
			availableActions.push(shopAction);
		}
	}

	const npcAvailable = Object.values(npcList).filter(npc => npc.placeId === dinoz.placeId);
	npcAvailable.forEach(npc => {
		if (!npc.condition || checkCondition(npc.condition, [dinoz])) {
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
		availableActions.push(actionList[Action.LEVEL_UP]);
	}

	// Market if dinoz is in market
	if (dinoz.placeId === placeList.PLACE_DU_MARCHE.placeId) {
		availableActions.push(actionList[Action.MARKET]);
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

	if (!req.auth) {
		throw new ErrorFormator(500, `Unauthorized`);
	}

	// Retrieve player from dinozId
	const dinozData = await getDinozFicheRequest(dinozId);

	if (!dinozData) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't exist.`);
	}

	if (!dinozData.player) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to any player.`);
	}

	// If player found is different from player who do the request, throw exception
	if (dinozData.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozData.id} doesn't belong to player ${req.auth.playerId}`);
	}

	//Remove temporary status
	const tempStatus = dinozData.status.filter(r => r.statusId in TemporaryStatus);
	if (tempStatus.length > 0) {
		const promises = tempStatus.map(r => removeStatusFromDinoz(dinozData.id, r.statusId));
		await Promise.all(promises);
	}

	// Create the answer that will be sent back
	const ret = toDinozFiche(dinozData);
	ret.actions = await getAvailableActions(dinozData);

	return ret;
}

/**
 * @summary Get all skills and their state
 * @param req
 * @param req.params.id {string} DinozId
 */
export async function getDinozSkill(req: Request) {
	const dinozId: number = parseInt(req.params.id);
	const dinozSkillData = await getDinozSkillRequest(dinozId);
	if (!dinozSkillData) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't exist.`);
	}

	if (!dinozSkillData.player || !req.auth || dinozSkillData.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozSkillData.id} doesn't belong to player ${req.auth?.playerId}`);
	}

	return toDinozSkillFiche(dinozSkillData);
}

/**
 * @summary Buy a dinoz from the shop
 * @param req
 * @param req.params.id {string} Dinoz ID
 * @return DinozFiche
 */
export async function buyDinoz(req: Request) {
	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized`);
	}

	//Check if player can buy more dinoz
	const dinozActive = await getActiveDinoz(req.auth.playerId);

	if (dinozActive.length > 0) {
		const player = dinozActive[0].player;

		if (!player) {
			throw new ErrorFormator(500, `Missing player`);
		}

		if (!player.leader && dinozActive.length >= gameConfig.dinoz.maxQuantity) {
			throw new ErrorFormator(400, 'tooManyActiveDinoz');
		}
		if (player.leader && dinozActive.length >= gameConfig.dinoz.maxQuantity + gameConfig.dinoz.leaderBonus) {
			throw new ErrorFormator(400, 'tooManyActiveDinoz');
		}
	}

	// Get dinoz details thanks to his ID
	const dinozShopData = await getDinozShopDetailsRequest(+req.params.id);

	if (!dinozShopData) {
		throw new ErrorFormator(500, `Dinoz ${req.params.id} doesn't exist.`);
	}

	const race = getRace(dinozShopData);

	// Throw error if dinoz doesn't belong to player shop
	if (!dinozShopData.player || !req.auth || dinozShopData.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${req.params.id} doesn't belong to your account`);
	}

	// Throws an exception if player doesn't have enough money to buy the dinoz
	if (dinozShopData.player.money < race.price) {
		throw new ErrorFormator(400, 'notEnoughMoney');
	}

	const newDinozProps = initializeDinoz(race, dinozShopData.player.id, dinozShopData.display);

	// Set player money
	await removeMoney(dinozShopData.player.id, race.price);

	// Delete all dinoz from dinoz shop
	await deleteDinozInShopRequest(req.auth.playerId);

	// Create a new dinoz that belongs to player
	const dinozCreated = await createDinoz(newDinozProps);
	const newDinoz: DinozForDinozFiche = {
		...dinozCreated,
		status: [],
		skills: [],
		missions: [],
		items: [],
		followers: [],
		player: {
			engineer: false,
			items: [],
			rewards: []
		}
	};

	const skillsToAdd = Object.values(skillList).filter(
		skill => skill.raceId?.some(raceId => raceId === race.raceId) && skill.isBaseSkill
	);

	// Add base skills to created dinoz
	await addMultipleSkillToDinoz(
		newDinoz.id,
		skillsToAdd.map(skill => skill.id)
	);

	// // Add a point in the ranking to the player
	// const playerRanking: Ranking = dinozShopData.player.rank;
	// const dinozCount = playerRanking!.dinozCount + 1;
	// const sumPoints = playerRanking!.sumPoints + 1;
	// const averagePoints = Math.round(sumPoints / dinozCount);
	// await updatePoints(req.auth!.playerId, sumPoints, averagePoints, dinozCount);

	return toDinozFiche(newDinoz);
}

/**
 * @summary Set the name of a dinoz
 * @param req
 * @param req.params.id {string} DinozId
 * @return void
 */
export async function setDinozName(req: Request) {
	// Retrieve player from dinozId
	const dinoz = await getCanDinozChangeName(+req.params.id);

	if (!dinoz) {
		throw new ErrorFormator(500, `Dinoz ${req.params.id} doesn't exist`);
	}

	// If authenticated player is different from player found, throw exception
	if (!dinoz.player || !req.auth || dinoz.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't belong to player ${req.auth?.playerId}`);
	}

	// If player can't change dinoz name, throw exception
	if (!dinoz.canChangeName) {
		throw new ErrorFormator(500, `Can't update dinoz name`);
	}

	await updateDinoz(+req.params.id, {
		name: req.body.newName,
		canChangeName: false
	});
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
	const dinozId = +req.params.id;
	const skillToUpdate = +req.body.skillId;
	const skillStateToUpdate = !!req.body.skillState;

	const dinoz = await getDinozSkillAndStatusRequest(dinozId);

	if (!dinoz) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't exist.`);
	}
	const skill = Object.values(skillList).find(skill => skill.id === skillToUpdate);

	// Check if skill exist and can be activate/deactivate
	if (!skill) {
		throw new ErrorFormator(500, `Skill ${skillToUpdate} doesn't know exist`);
	}
	if (!skill.activatable) {
		throw new ErrorFormator(500, `Skill ${skillToUpdate} cannot be activated`);
	}

	// Check if dinoz belongs to player who do the request
	if (!dinoz.player || !req.auth || dinoz.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't belong to player ${req.auth?.playerId}`);
	}

	// Check if dinoz can change his skills
	if (!canChangeSkillState(dinoz)) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't have the right status`);
	}

	// Check if dinoz knows the skill
	if (!knowSkillId(dinoz, skillToUpdate)) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't know skill : ${skillToUpdate}`);
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
	const dinoz = await getDinozFightDataRequest(dinozId);

	if (!dinoz) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't exist.`);
	}

	// Check if dinoz belongs to player who do the request
	if (!dinoz.player || !req.auth || dinoz.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't belong to player ${req.auth?.playerId}`);
	}

	if (dinoz.leaderId) {
		throw new ErrorFormator(400, 'notLeader');
	}

	const followers = dinoz.followers.map(follower => ({
		...follower,
		player: dinoz.player
	}));
	const team = [dinoz, ...followers];

	if (dinoz.concentration) {
		throw new ErrorFormator(400, 'concentration');
	}

	if (!isAlive(dinoz)) {
		throw new ErrorFormator(400, 'dead');
	}

	const dinozPlace = actualPlace(dinoz);
	const desiredPlace = Object.values(placeList).find(place => place.placeId === req.body.placeId);

	// Check if desired and actual place exist and is adjacent to actual place
	if (!desiredPlace) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} want to go in the void`);
	}

	if (dinozPlace.placeId === desiredPlace.placeId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} is already at ${dinozPlace.name}`);
	}

	if (!dinozPlace.borderPlace.includes(desiredPlace.placeId)) {
		throw new ErrorFormator(500, `${dinozPlace.name} is not adjacent with ${desiredPlace.name}`);
	}

	// Check if condition to go to desired place are fullfilled for dinoz and followers
	if (desiredPlace.conditions) {
		for (const member of team) {
			if (!canGoToThisPlace(member, desiredPlace.conditions)) {
				throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't fulfill requirement to go this place`);
			}
		}
	}

	// If dinoz leave the map, replace by the good place
	const finalPlace = desiredPlace.alias ?? desiredPlace.placeId;

	let fight = await mouvementListener(team, finalPlace);
	if (!fight) {
		fight = await moveFight(team, finalPlace);
		if (fight.result) {
			await updateMultipleDinoz(
				team.map(d => d.id),
				{ placeId: finalPlace }
			);

			await createLogForMultipleDinoz(
				LogType.Move,
				dinoz.player.id,
				team.map(d => d.id),
				finalPlace.toString()
			);
		}
	}
	return fight;
}

export async function resurrectDinoz(req: Request) {
	const dinozId = +req.params.id;

	// Retrieve player from dinozId
	const dinozData = await getDinozFicheLiteRequest(dinozId);

	if (!dinozData) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't exist.`);
	}

	// If player found is different from player who do the request, throw exception
	if (!dinozData.player || !req.auth || dinozData.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player.`);
	}

	if (dinozData.life > 0) {
		throw new ErrorFormator(500, `${dinozData.name} is not dead`);
	}

	await updateDinoz(dinozId, {
		life: 1,
		experience: Math.round(dinozData.experience / 2),
		placeId: placeList.DINOVILLE.placeId
	});

	await createLog(LogType.Revive, dinozData.player.id, dinozId);
}

export async function digWithDinoz(req: Request) {
	const dinozId = +req.params.id;
	const dinozData = await getDinozFicheRequest(dinozId);

	if (!dinozData) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't exist.`);
	}

	if (!dinozData.player || !req.auth || dinozData.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player.`);
	}

	if (
		!dinozData.status.some(
			status => status.statusId === statusList.SHOVEL || status.statusId === statusList.ENHANCED_SHOVEL
		)
	) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} cannot dig.`);
	}

	const digPlace = Object.values(digTreasures).find(dig => dig.place === dinozData.placeId);
	let reward: Rewarder[];
	if (digPlace && digPlace.condition && checkCondition(digPlace?.condition, [dinozData])) {
		reward = digPlace.reward;
	} else {
		reward = [{ rewardType: RewardEnum.GOLD, value: getRandomNumber(100, 500) }];
	}
	await rewarder(reward, [dinozData]);

	//Broke shovel
	if (dinozData.status.some(status => status.statusId === statusList.SHOVEL)) {
		await removeStatusFromDinoz(dinozId, statusList.SHOVEL);
		await addStatusToDinoz(dinozData.id, statusList.BROKEN_SHOVEL);
	}

	//Try to broke enhanced shovel (75% of keeping it)
	if (getRandomNumber(0, 100) > 75 && dinozData.status.some(status => status.statusId === statusList.ENHANCED_SHOVEL)) {
		await removeStatusFromDinoz(dinozId, statusList.ENHANCED_SHOVEL);
		await addStatusToDinoz(dinozData.id, statusList.BROKEN_ENHANCED_SHOVEL);
	}

	return reward[0];
}

export async function getGatherGrid(req: Request): Promise<GatherPublicGrid> {
	const dinozId = +req.params.id;
	const gatherPlaceArray = Object.values(gatherList).filter(g => g.action === req.params.type.toString().toLowerCase());
	const dinozData = await getDinozGatherData(dinozId);

	if (!dinozData) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't exist.`);
	}

	if (!dinozData.player || !req.auth || dinozData.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to any player.`);
	}

	const place = actualPlace(dinozData);

	const typeOfGridArray = Object.entries(GatherType).filter(g => {
		if (g[1] === place.gather || g[1] === place.specialGather) return true;
	});
	const typeOfGrid = typeOfGridArray.find(
		g => g[0].toLowerCase().replace(/[0-9]/g, '') === req.params.type.toString().toLowerCase()
	);

	if (!typeOfGrid) {
		throw new ErrorFormator(500, `This type of grid doesn't exist`);
	}
	const idOfTypeOfGrid = +typeOfGrid[1];

	const playerGrid = await getCommonGatherInfo(dinozData.player.id);
	const gatherPlace = gatherPlaceArray.find(place => place.type === idOfTypeOfGrid);

	if (!gatherPlace) {
		throw new ErrorFormator(500, `Dinoz cannot gather at this place`);
	}

	if (!checkCondition(gatherPlace.condition, [dinozData])) {
		throw new ErrorFormator(500, `Dinoz don't have the skill to gather at this place`);
	}

	let myGrid = playerGrid.filter(grid => grid.place === place.placeId).find(grid => grid.type === idOfTypeOfGrid);

	if (!myGrid) {
		myGrid = await createGrid(initializeGatherGrid(req.auth.playerId, place.placeId, gatherPlace));
	}

	// Generate a new one if all box are empty
	if (myGrid.grid.every(box => box === -1)) {
		myGrid = await updateGrid(
			dinozData.player.id,
			dinozId,
			myGrid.id,
			initializeGatherGrid(req.auth.playerId, place.placeId, gatherPlace)
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
	const dinozId = +req.params.id;
	const gatherPlaceArray = Object.values(gatherList).filter(g => g.action === req.body.type.toString().toLowerCase());
	const dinozData = await getDinozGatherData(dinozId);
	if (!dinozData) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't exist.`);
	}

	if (!dinozData.player || !req.auth || dinozData.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to any player.`);
	}

	const place = actualPlace(dinozData);
	const typeOfGridArray = Object.entries(GatherType).filter(g => {
		if (g[1] === place.gather || g[1] === place.specialGather) return true;
	});
	const typeOfGrid = typeOfGridArray.find(
		g => g[0].toLowerCase().replace(/[0-9]/g, '') === req.body.type.toString().toLowerCase()
	);

	if (!typeOfGrid) {
		throw new ErrorFormator(500, `This type of grid doesn't exist`);
	}
	const idOfTypeOfGrid = +typeOfGrid[1];
	const playerGrid = await getCommonGatherInfo(dinozData.player.id);
	const gatherPlace = gatherPlaceArray.find(place => place.type === typeOfGrid[1]);
	const myGrid = playerGrid.find(grid => grid.place === place.placeId && grid.type === idOfTypeOfGrid);

	if (!gatherPlace) {
		throw new ErrorFormator(500, `Dinoz cannot gather at this place`);
	}

	if (!myGrid) {
		throw new ErrorFormator(500, `You don't have generated any grid.`);
	}

	if (!checkCondition(gatherPlace.condition, [dinozData])) {
		throw new ErrorFormator(500, `Dinoz don't have the skill to gather at this place`);
	}

	// Consume token if it's a special gather
	if (gatherPlace.special) {
		const playerToken = dinozData.player.items.find(item => item.itemId === gatherPlace.cost.itemId);
		if (!playerToken) throw new ErrorFormator(500, `You don't have the needed token to gather here.`);
		await decreaseItemQuantity(dinozData.player.id, gatherPlace.cost.itemId, 1);

		await createLog(LogType.ItemUsed, dinozData.player.id, dinozData.id, gatherPlace.cost.itemId.toString(), '1');
	}

	// Sanitize the box to open
	const boxToSanitize: number[][] = req.body.box;
	for (const element of boxToSanitize) {
		if (!element.every(coord => typeof coord === 'number')) {
			throw new ErrorFormator(500, `This coordinate is not correct : ${element}`);
		}
		if (element.some(coord => coord > getGridSize(myGrid) || coord < 0)) {
			throw new ErrorFormator(500, `This coordinate is out of the grid : ${element}`);
		}
	}

	const boxToOpen: [number, number][] = boxToSanitize as [number, number][];

	// Check if number of box to open is equal or lower than the number of maximum click
	if (boxToOpen.length > getNumberOfGatheringTries(dinozData, gatherPlace)) {
		throw new ErrorFormator(500, `You have selected too many square`);
	}

	const returnGrid = discoverBox(myGrid, dinozData, gatherPlace, ...boxToOpen);
	await updateGrid(dinozData.player.id, dinozId, myGrid.id, saveGrid(myGrid, ...boxToOpen));

	for (const i of returnGrid.rewards.item) {
		const itemToReward = dinozData.player.items.find(items => items.itemId === i.itemId);
		const goldItems = [
			itemList.GOLD100.itemId,
			itemList.GOLD500.itemId,
			itemList.GOLD1000.itemId,
			itemList.GOLD2000.itemId,
			itemList.GOLD2500.itemId,
			itemList.GOLD3000.itemId,
			itemList.GOLD5000.itemId,
			itemList.GOLD10000.itemId,
			itemList.GOLD20000.itemId
		];
		if (itemToReward && itemToReward.quantity < i.maxQuantity && !goldItems.includes(i.itemId)) {
			await increaseItemQuantity(dinozData.player.id, i.itemId, 1);
		} else if (itemToReward && goldItems.includes(i.itemId)) {
			await addMoney(dinozData.player.id, i.price);
		} else {
			dinozData.player.items.push(await insertItem(dinozData.player.id, { itemId: i.itemId, quantity: 1 }));
		}
	}

	for (const i of returnGrid.rewards.ingredients) {
		const ingredientToReward = dinozData.player.ingredients.find(ingre => ingre.ingredientId === i.ingredientId);

		if (ingredientToReward && ingredientToReward.quantity < i.maxQuantity) {
			if (!ingredientToReward.playerId) {
				throw new ErrorFormator(500, `Ingredient ${ingredientToReward.ingredientId} doesn't belong to any player.`);
			}
			await increaseIngredientQuantity(ingredientToReward.playerId, ingredientToReward.ingredientId, 1);
		} else if (ingredientToReward && ingredientToReward.quantity >= i.maxQuantity) {
			// Do nothing
		} else {
			dinozData.player.ingredients.push(
				await setIngredient({
					player: { connect: { id: dinozData.player.id } },
					ingredientId: i.ingredientId,
					quantity: 1
				})
			);
		}
	}

	return returnGrid;
}

/**
 * Get data needed for the /manage page
 */
export async function getDinozToManage(req: Request) {
	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'No player found');
	}

	const playerId = req.auth.playerId;

	// Get player rewards
	const rewards = await getPlayerRewards(playerId);

	// Check if player has PDA
	const hasPDA = rewards.some(reward => reward.rewardId === rewardList.PDA);

	// Stop if player doesn't have PDA
	if (!hasPDA) {
		throw new ErrorFormator(500, 'Player has no PDA');
	}

	// Get Dinoz
	const dinozList = await getManageData(playerId);

	return dinozList;
}

/**
 * Update a player dinoz order
 */
export async function updateOrders(req: Request) {
	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'No player found');
	}

	const order = req.body.order;

	if (!order || !Array.isArray(order)) {
		throw new ErrorFormator(500, 'Order is not an array');
	}

	const playerId = req.auth.playerId;

	// Get player rewards
	const rewards = await getPlayerRewards(playerId);

	// Check if player has PDA
	const hasPDA = rewards.some(reward => reward.rewardId === rewardList.PDA);

	// Stop if player doesn't have PDA
	if (!hasPDA) {
		throw new ErrorFormator(500, 'Player has no PDA');
	}

	// Preformat Dinoz data
	const dinozList = order.map((id: number, index) => ({
		id,
		order: index
	}));

	// Update orders
	await updateOrderData(playerId, dinozList);
}

/**
 * Follow a dinoz
 */
export async function followDinoz(req: Request) {
	const dinozId = +req.params.id;
	const dinozToFollowId = +req.params.targetId;

	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'No player found');
	}

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(req.auth.playerId, dinozId, dinozToFollowId))) {
		throw new ErrorFormator(500, 'Player does not own this dinoz');
	}

	// Update dinoz
	await updateDinoz(dinozId, { leader: { connect: { id: dinozToFollowId } } });
}

/**
 * Unfollow a dinoz
 */
export async function unfollowDinoz(req: Request) {
	const dinozId = +req.params.id;

	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'No player found');
	}

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(req.auth.playerId, dinozId))) {
		throw new ErrorFormator(500, 'Player does not own this dinoz');
	}

	// Update dinoz
	await updateDinoz(dinozId, { leader: { disconnect: true } });
}

export async function disband(req: Request) {
	const dinozId = +req.params.id;

	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'No player found');
	}

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(req.auth.playerId, dinozId))) {
		throw new ErrorFormator(500, 'Player does not own this dinoz');
	}
	const dinoz = await getFollowingDinoz(dinozId);

	if (!dinoz) {
		throw new ErrorFormator(500, 'No dinoz found');
	}

	for (const d of dinoz.followers) {
		await updateDinoz(d.id, { leader: { disconnect: true } });
	}
}
