import { Request } from 'express';
import { deleteDinozInShopRequest, getDinozShopDetailsRequest } from '../dao/playerDinozShopDao.js';
import { getCommonPlayerGatherInfo, setPlayer, setPlayerMoneyRequest } from '../dao/playerDao.js';
import {
	getActiveDinoz,
	getCanDinozChangeName,
	getDinozFicheLiteRequest,
	getDinozFicheRequest,
	getDinozFightDataRequest,
	getDinozGatherData,
	getDinozSkillAndStatusRequest,
	getDinozSkillRequest,
	setDinoz,
	setDinozPlaceRequest
} from '../dao/dinozDao.js';
import { addSkillToDinoz, setSkillStateRequest } from '../dao/dinozSkillDao.js';
import {
	actionList,
	gather,
	itemList,
	placeList,
	shopList,
	skillList,
	statusList,
	TemporaryStatus
} from '../constants/index.js';
import { updatePoints } from '../dao/rankingDao.js';
import { Dinoz, DinozSkill, Player, PlayerDinozShop, Ranking } from '../entity/index.js';
import { npcList } from '../constants/npc.js';
import gameConfig from '../config/game.config.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { getHUDObjective, getMissionAction } from './missionsService.js';
import { moveFight } from './fightService.js';
import { addStatusToDinoz, removeStatusToDinoz } from '../dao/dinozStatusDao.js';
import { digTreasures } from '../constants/digTreasures.js';
import { getRandomNumber } from '../utils/index.js';
import { ActionFiche, DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { ShopType } from '@drpg/core/models/enums/ShopType';
import { ShopFiche } from '@drpg/core/models/shop/ShopFiche';
import { Npc } from '@drpg/core/models/npc/npc';
import { DinozSkillFiche } from '@drpg/core/models/dinoz/DinozSkillFiche';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { Place } from '@drpg/core/models/place/Place';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { DigData } from '@drpg/core/models/dinoz/DigData';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { GatherData } from '@drpg/core/models/gather/gatherData';
import { PlayerGather } from '../entity/index.js';
import { GatherPublicGrid } from '@drpg/core/models/gather/gatherPublicGrid';
import { rewarder } from '../utils/rewarder.js';
import { checkCondition } from '../utils/checkConditions.js';
import { GatherResultGrid } from '@drpg/core/models/gather/gatherResultGrid';
import { updateGrid } from '../dao/playerGatherDao.js';

/**
 * @summary Get available action from dinoz
 * @return Array<String>
 */
export function getAvailableActions(dinoz: Dinoz): Array<ActionFiche> {
	const availableActions: Array<ActionFiche> = [];

	if (!dinoz.isAlive) {
		availableActions.push(actionList.RESURRECT);
		return availableActions;
	}

	// Default actions
	availableActions.push(actionList.FIGHT);
	//availableActions.push(actionList.FOLLOW);

	//Gather
	if (dinoz.canGather && dinoz.actualPlace.gather !== undefined) {
		availableActions.push({
			name: Object.values(gather).find(grid => grid.type === dinoz.actualPlace.gather)!.action,
			imgName: 'act_gather'
		});
	}

	// Dig with the shovel
	if (
		dinoz.status.some(status => status.statusId === statusList.SHOVEL || status.statusId === statusList.ENHANCED_SHOVEL)
	) {
		availableActions.push(actionList.DIG);
	}

	// Shop action: check if a shop is available where the dinoz is
	const shopAvailable = Object.values(shopList).find(shop => shop.placeId == dinoz.placeId) as ShopFiche | undefined;
	if (shopAvailable) {
		if (shopAvailable.type == ShopType.CURSED) {
			const dinozIsCursed = dinoz.status.some(status => status.statusId === statusList.CURSED);
			if (dinozIsCursed) {
				// Add the shop id to the action
				const shopAction: ActionFiche = {
					name: actionList.SHOP.name,
					imgName: actionList.SHOP.imgName,
					prop: shopAvailable.shopId
				};
				availableActions.push(shopAction);
			}
		} else if (shopAvailable.type == ShopType.MAGICAL) {
			const playerNapodino = dinoz.player.items.find(napo => napo.itemId === itemList.GOLDEN_NAPODINO.itemId);
			if (playerNapodino && playerNapodino.quantity > 0) {
				const shopAction: ActionFiche = {
					name: actionList.SHOP.name,
					imgName: actionList.SHOP.imgName,
					prop: shopAvailable.shopId
				};
				availableActions.push(shopAction);
			}
		} else {
			// Add the shop id to the action
			const shopAction: ActionFiche = {
				name: actionList.SHOP.name,
				imgName: actionList.SHOP.imgName,
				prop: shopAvailable.shopId
			};
			availableActions.push(shopAction);
		}
	}

	const npcAvailable: Array<Npc> = Object.values(npcList).filter(npc => npc.placeId === dinoz.placeId);
	npcAvailable.forEach(npc => {
		availableActions.push({
			name: actionList.NPC.name,
			imgName: actionList.NPC.imgName,
			prop: npc.id
		});
	});

	const missionAvailable = getMissionAction(dinoz);
	if (missionAvailable) {
		availableActions.push({
			name: actionList.MISSION.name,
			imgName: actionList.MISSION.imgName,
			prop: missionAvailable
		});
	}

	if (dinoz.canLevelUp) {
		availableActions.push({
			name: actionList.LEVEL_UP.name,
			imgName: actionList.LEVEL_UP.imgName
		});
	}
	return availableActions;
}

/**
 * @summary Get information to display the dinoz of a player
 * @param req
 * @param req.params.id {string} PlayerId
 * @return DinozFiche
 */
export async function getDinozFiche(req: Request): Promise<DinozFiche> {
	const dinozId: number = parseInt(req.params.id);

	// Retrieve player from dinozId
	const dinozData: Dinoz = await getDinozFicheRequest(dinozId);
	// If player found is different from player who do the request, throw exception
	if (dinozData.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozData.id} doesn't belong to player ${req.user!.playerId}`);
	}

	//Remove temporary status
	const tempStatus = dinozData.status.filter(r => r.statusId in TemporaryStatus);
	if (tempStatus.length > 0) {
		for (const status of tempStatus) {
			await removeStatusToDinoz(parseInt(req.params.id), status.statusId);
		}
	}

	// Create the answer that will be sent back
	const ret = dinozData.toDinozFiche();
	// Hack because we cannot put getHUDObjective in Dinoz class
	ret.missions = getHUDObjective(dinozData);
	ret.actions = getAvailableActions(dinozData);
	return ret;
}

/**
 * @summary Get all skills and their state
 * @param req
 * @param req.params.id {string} DinozId
 */
export async function getDinozSkill(req: Request): Promise<Array<DinozSkillFiche>> {
	const dinozId: number = parseInt(req.params.id);
	const dinozSkillData: Dinoz = await getDinozSkillRequest(dinozId);

	if (dinozSkillData.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozSkillData.id} doesn't belong to player ${req.user!.playerId}`);
	}

	return dinozSkillData.toDinozSkillFiche();
}

/**
 * @summary Buy a dinoz from the shop
 * @param req
 * @param req.params.id {string} PlayerId
 * @return DinozFiche
 */
export async function buyDinoz(req: Request): Promise<DinozFiche> {
	//Check if player can buy more dinoz
	const dinozActive: Array<Dinoz> | undefined = await getActiveDinoz(req.user!.playerId!);

	if (dinozActive.length > 0) {
		if (!dinozActive[0].player.leader && dinozActive.length >= gameConfig.dinoz.maxQuantity) {
			throw new ErrorFormator(400, 'tooManyActiveDinoz');
		}
		if (
			dinozActive[0].player.leader &&
			dinozActive.length >= gameConfig.dinoz.maxQuantity + gameConfig.dinoz.leaderBonus
		) {
			throw new ErrorFormator(400, 'tooManyActiveDinoz');
		}
	}

	// Get dinoz details thanks to his ID
	const dinozShopData: PlayerDinozShop = await getDinozShopDetailsRequest(parseInt(req.params.id));

	const race: DinozRace = dinozShopData.race;

	// Throws an exception if player doesn't have enough money to buy the dinoz
	if (dinozShopData.player.money < race.price) {
		throw new ErrorFormator(400, 'notEnoughMoney');
	}

	// Throw error if dinoz doesn't belong to player shop
	if (dinozShopData.player.id !== req.user!.playerId!) {
		throw new ErrorFormator(500, `Dinoz ${req.params.id} doesn't belong to your account`);
	}

	const newDinoz = new Dinoz(race.name, dinozShopData.player, dinozShopData.display);

	// Set player money
	const newMoney: number = dinozShopData.player.money - race.price;
	await setPlayerMoneyRequest(req.user!.playerId, newMoney);

	// Delete all dinoz from dinoz shop
	await deleteDinozInShopRequest(req.user!.playerId);

	// Create a new dinoz that belongs to player
	const dinozCreated: Dinoz = await setDinoz(newDinoz);

	const skillsToAdd: Array<DinozSkillFiche> = Object.values(skillList).filter(
		skill => skill.raceId?.some(raceId => raceId === race.raceId) && skill.isBaseSkill
	);

	// Add base skills to created dinoz
	await Promise.all(skillsToAdd.map(skill => addSkillToDinoz(new DinozSkill(dinozCreated, skill.skillId))));

	// Add a point in the ranking to the player
	const playerRanking: Ranking = dinozShopData.player.rank;
	const dinozCount = playerRanking!.dinozCount + 1;
	const sumPoints = playerRanking!.sumPoints + 1;
	const averagePoints = Math.round(sumPoints / dinozCount);
	await updatePoints(req.user!.playerId, sumPoints, averagePoints, dinozCount);

	return dinozCreated.toDinozFiche();
}

/**
 * @summary Set the name of a dinoz
 * @param req
 * @param req.params.id {string} DinozId
 * @return void
 */
export async function setDinozName(req: Request): Promise<void> {
	// Retrieve player from dinozId
	const dinoz: Dinoz = await getCanDinozChangeName(parseInt(req.params.id));

	if (!dinoz) {
		throw new ErrorFormator(500, `Dinoz ${req.params.id} doesn't exist`);
	}

	// If authenticated player is different from player found, throw exception
	if (dinoz.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't belong to player ${req.user!.playerId}`);
	}

	// If player can't change dinoz name, throw exception
	if (!dinoz.canChangeName) {
		throw new ErrorFormator(500, `Can't update dinoz name`);
	}

	const dinozToUpdate: Partial<Dinoz> = {
		id: parseInt(req.params.id),
		name: req.body.newName,
		canChangeName: false
	};

	await setDinoz(dinozToUpdate);
}

/**
 * @summary Activate or desactivate a skill from a dinoz
 * @param req
 * @param req.params.id {string} DinozId
 * @param req.body.skillId {string} SkillId
 * @param req.body.skillState {boolean} State of the skill
 * @return boolean
 */
export async function setSkillState(req: Request): Promise<boolean> {
	const dinozId: number = parseInt(req.params.id);
	const skillToUpdate: number = parseInt(req.body.skillId);
	const skillStateToUpdate: boolean = req.body.skillState;

	const dinoz: Dinoz = await getDinozSkillAndStatusRequest(dinozId);

	const skill: DinozSkillFiche | undefined = Object.values(skillList).find(skill => skill.skillId === skillToUpdate);

	// Check if skill exist and can be activate/deactivate
	if (!skill) {
		throw new ErrorFormator(500, `Skill ${skillToUpdate} doesn't know exist`);
	}
	if (!skill.activatable) {
		throw new ErrorFormator(500, `Skill ${skillToUpdate} cannot be activated`);
	}

	// Check if dinoz belongs to player who do the request
	if (dinoz.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't belong to player ${req.user!.playerId}`);
	}

	// Check if dinoz can change his skills
	if (!dinoz.canChangeSkillState) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't have the right status`);
	}

	// Check if dinoz know the skill
	if (!dinoz.knowSkillId(skillToUpdate)) {
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
export async function betaMove(req: Request): Promise<FightResult> {
	//Retrieve dinozId
	const dinozId: number = parseInt(req.body.dinozId);
	const dinoz: Dinoz = await getDinozFightDataRequest(dinozId);
	let finalPlace: number;

	// Check if dinoz belongs to player who do the request
	if (dinoz.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't belong to player ${req.user!.playerId}`);
	}

	const actualPlace: Place = dinoz.actualPlace;
	const desiredPlace: Place | undefined = Object.values(placeList).find(place => place.placeId === req.body.placeId);

	// Check if desired and actual place exist and is adjacent to actual place
	if (!desiredPlace) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} want to go in the void`);
	}

	if (actualPlace.placeId === desiredPlace.placeId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} is already at ${actualPlace!.name}`);
	}

	if (!actualPlace.borderPlace.includes(desiredPlace.placeId)) {
		throw new ErrorFormator(500, `${actualPlace!.name} is not adjacent with ${desiredPlace.name}`);
	}

	// Check if condition to go to desired place are fullfill
	if (desiredPlace.conditions && !dinoz.canGoThisPlace(desiredPlace)) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't fulfill requirement to go this place`);
	}

	// If dinoz leave the map, replace by the good place
	finalPlace = desiredPlace.alias ?? desiredPlace.placeId;

	// Fight at the desired place
	const fight: FightResult = await moveFight(dinoz, finalPlace);
	if (fight.result) {
		await setDinozPlaceRequest(dinoz.id, finalPlace);
	}

	return fight;
}

export async function resurrectDinoz(req: Request): Promise<void> {
	const dinozId: number = parseInt(req.params.id);

	// Retrieve player from dinozId
	const dinozData: Dinoz = await getDinozFicheLiteRequest(dinozId);

	// If player found is different from player who do the request, throw exception
	if (dinozData.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player.`);
	}

	if (dinozData.life > 0) {
		throw new ErrorFormator(500, `${dinozData.name} is not dead`);
	}

	const dinozToUpdate: Partial<Dinoz> = {
		id: parseInt(req.params.id),
		life: 1,
		experience: Math.round(dinozData.experience / 2),
		placeId: placeList.DINOVILLE.placeId
	};

	await setDinoz(dinozToUpdate);
}

export async function digWithDinoz(req: Request): Promise<Rewarder> {
	const dinozId: number = parseInt(req.params.id);
	const dinozData: Dinoz = await getDinozFicheRequest(dinozId);

	if (dinozData.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player.`);
	}

	if (
		!dinozData.status.some(
			status => status.statusId === statusList.SHOVEL || status.statusId === statusList.ENHANCED_SHOVEL
		)
	) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} cannot dig.`);
	}

	const digPlace: DigData | undefined = Object.values(digTreasures).find(dig => dig.place === dinozData.placeId);
	let reward: Array<Rewarder>;
	if (digPlace && digPlace.condition && checkCondition(digPlace?.condition, dinozData)) {
		reward = digPlace.reward;
	} else {
		reward = [{ rewardType: RewardEnum.GOLD, value: getRandomNumber(100, 500) }];
	}
	await rewarder(reward, dinozData);

	//Broke shovel
	if (dinozData.status.some(status => status.statusId === statusList.SHOVEL)) {
		await removeStatusToDinoz(dinozId, statusList.SHOVEL);
		await addStatusToDinoz(dinozData, statusList.BROKEN_SHOVEL);
	}

	//Try to broke enhanced shovel (75% of keeping it)
	if (
		getRandomNumber(0, 100) > 100 &&
		dinozData.status.some(status => status.statusId === statusList.ENHANCED_SHOVEL)
	) {
		await removeStatusToDinoz(dinozId, statusList.ENHANCED_SHOVEL);
		await addStatusToDinoz(dinozData, statusList.BROKEN_ENHANCED_SHOVEL);
	}

	return reward[0];
}

export async function getGatherGrid(req: Request): Promise<GatherPublicGrid> {
	const dinozId: number = parseInt(req.params.id);
	const dinozData: Dinoz = await getDinozGatherData(dinozId);
	const playerGrid: Player = await getCommonPlayerGatherInfo(dinozData.player.id);
	const place: Place = dinozData.actualPlace;
	const gatherPlace: GatherData | undefined = Object.values(gather).find(g => g.type === place.gather);

	if (!dinozData.canGather) {
		throw new ErrorFormator(500, `Dinoz cannot gather`);
	}

	if (!gatherPlace) {
		throw new ErrorFormator(500, `Dinoz cannot gather at this place`);
	}

	if (!checkCondition(gatherPlace.condition, dinozData)) {
		throw new ErrorFormator(500, `Dinoz don't have the skill to gather at this place`);
	}

	let myGrid = playerGrid.gather.find(grid => grid.place === place.placeId) as PlayerGather | undefined;

	if (!myGrid) {
		myGrid = new PlayerGather(playerGrid, place.placeId, gatherPlace);
		playerGrid.gather.push(myGrid);
		await setPlayer(playerGrid);
	}
	/*await postGrid('Grille en DB',myGrid.grid)
  await postGrid('Grille affichée',myGrid.hideIngredients())*/

	return myGrid.hideIngredients();
}

export async function gatherWithDinoz(req: Request): Promise<GatherResultGrid> {
	const dinozId: number = parseInt(req.params.id);
	const dinozData: Dinoz = await getDinozGatherData(dinozId);
	const playerGrid: Player = await getCommonPlayerGatherInfo(dinozData.player.id);
	const place: Place = dinozData.actualPlace;
	const gatherPlace: GatherData | undefined = Object.values(gather).find(g => g.type === place.gather);
	let myGrid = playerGrid.gather.find(grid => grid.place === place.placeId) as PlayerGather;

	if (!dinozData.canGather) {
		throw new ErrorFormator(500, `Dinoz cannot gather`);
	}

	if (!gatherPlace) {
		throw new ErrorFormator(500, `Dinoz cannot gather at this place`);
	}

	if (!checkCondition(gatherPlace.condition, dinozData)) {
		throw new ErrorFormator(500, `Dinoz don't have the skill to gather at this place`);
	}

	// Sanatize the box to open
	const boxToSanatize: Array<Array<any>> = req.body.box;
	boxToSanatize.forEach(element => {
		if (
			!element.every(coord => {
				return typeof coord === 'number';
			})
		) {
			throw new ErrorFormator(500, `This coordinate is not correct : ${element}`);
		}
	});

	const boxToOpen = boxToSanatize as Array<[number, number]>;

	await updateGrid(playerGrid.id, place.placeId, myGrid.saveGrid(...boxToOpen));

	return myGrid.discoverBox(dinozData, gatherPlace, ...boxToOpen);
}
