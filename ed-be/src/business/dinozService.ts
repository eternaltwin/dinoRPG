import { Request } from 'express';
import { deleteDinozInShopRequest, getDinozShopDetailsRequest } from '../dao/playerDinozShopDao.js';
import { setPlayerMoneyRequest } from '../dao/playerDao.js';
import {

	getActiveDinoz,
	getCanDinozChangeName,
	getDinozFicheLiteRequest,
	getDinozFicheRequest,
	getDinozFightDataRequest,
	getDinozPlaceRequest,
	getDinozSkillAndStatusRequest,
	getDinozSkillRequest,
	setDinoz,
	setDinozPlaceRequest
} from '../dao/dinozDao.js';
import { addSkillToDinoz, setSkillStateRequest } from '../dao/dinozSkillDao.js';
import {
	ActionFiche,
	DinozFiche,
	DinozRace,
	DinozSkillFiche,
	FightResult,
	Npc,
	Place,
	ShopFiche,
	ShopType
} from '../models/index.js';
import {
	actionList,
	itemList,
	levelList,
	placeList,
	raceList,
	shopList,
	skillList,
	statusList
} from '../constants/index.js';
import { updatePoints } from '../dao/rankingDao.js';
import { getRandomUpElement } from '../utils/helpers/DinozHelper.js';
import { Dinoz, DinozSkill, PlayerDinozShop, Ranking } from '../entity/index.js';
import { npcList } from '../constants/npc.js';
import gameConfig from '../config/game.config.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { getHUDObjective, getMissionAction } from './missionsService.js';
import { moveFight, processFight } from './fightService.js';

/**
 * @summary Get available action from dinoz
 * @return Array<String>
 */
function getAvailableActions(dinoz: Dinoz): Array<ActionFiche> {
	const availableActions: Array<ActionFiche> = [];

	if (dinoz.life === 0) {
		availableActions.push(actionList.RESURRECT);
		return availableActions;
	}

	// Default actions
	availableActions.push(actionList.FIGHT);
	availableActions.push(actionList.FOLLOW);

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

	const maxExp: number = levelList.find(level => level.id === dinoz?.level)!.experience;
	if (maxExp - dinoz.experience <= 0 && dinoz.level < gameConfig.dinoz.maxLevel) {
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
const getDinozFiche = async (req: Request): Promise<DinozFiche> => {
	const dinozId: number = parseInt(req.params.id);

	// Retrieve player from dinozId
	const dinozData: Dinoz = await getDinozFicheRequest(dinozId);
	// If player found is different from player who do the request, throw exception
	if (dinozData.player.id !== req.user!.playerId) {
		throw new ErrorFormator(
			500,
			`Cannot get dinoz details, dinozId : ${dinozId} belongs to player ${dinozData.player.id} instead of player ${
				req.user!.playerId
			}`
		);
	}

	// Create the answer that will be sent back
	return {
		id: dinozData.id,
		name: dinozData.name,
		display: dinozData.display,
		isFrozen: dinozData.isFrozen,
		isSacrificed: dinozData.isSacrificed,
		level: dinozData.level,
		missionId: dinozData.missions.find(mission => !mission.isFinished)?.missionId,
		canChangeName: dinozData.canChangeName,
		following: dinozData.following,
		life: dinozData.life,
		maxLife: dinozData.maxLife,
		experience: dinozData.experience,
		maxExperience: levelList.find(level => level.id === dinozData.level)!.experience,
		canGather: dinozData.canGather,
		race: Object.values(raceList).find(race => race.raceId === dinozData.raceId)!,
		placeId: dinozData.placeId,
		actions: getAvailableActions(dinozData),
		missions: getHUDObjective(dinozData),
		items: dinozData.items.map(item => item.itemId),
		status: dinozData.status.map(status => status.statusId),
		borderPlace: Object.values(placeList)
			.find(place => place.placeId === dinozData.placeId)!
			.borderPlace.map(placeId => Object.values(placeList).find(place => place.placeId === placeId))
			.filter(place => !place!.conditions || dinozData.status.some(status => status.statusId === place!.conditions))
			.map(place => place!.placeId),
		nbrUpFire: dinozData.nbrUpFire,
		nbrUpWood: dinozData.nbrUpWood,
		nbrUpWater: dinozData.nbrUpWater,
		nbrUpLightning: dinozData.nbrUpLightning,
		nbrUpAir: dinozData.nbrUpAir
	};
};

/**
 * @summary Get all skills and their state
 * @param req
 * @param req.params.id {string} DinozId
 */
const getDinozSkill = async (req: Request): Promise<Array<DinozSkillFiche>> => {
	const dinozId: number = parseInt(req.params.id);
	const dinozSkillData: Dinoz = await getDinozSkillRequest(dinozId);

	if (dinozSkillData.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player ${dinozSkillData.player.id}`);
	}

	return dinozSkillData.skills.map(skill => {
		const skillFound: DinozSkillFiche | undefined = Object.values(skillList).find(
			skillDinoz => skillDinoz.skillId === skill.skillId
		)!;
		return {
			skillId: skillFound.skillId,
			type: skillFound.type,
			energy: skillFound.energy,
			element: skillFound.element,
			state: skill.state,
			activatable: skillFound.activatable,
			tree: skillFound.tree,
			isBaseSkill: skillFound.isBaseSkill,
			isSphereSkill: skillFound.isSphereSkill
		};
	});
};

/**
 * @summary Buy a dinoz from the shop
 * @param req
 * @param req.params.id {string} PlayerId
 * @return DinozFiche
 */
const buyDinoz = async (req: Request): Promise<DinozFiche> => {
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

	const race: DinozRace = Object.values(raceList).find(race => race.raceId === dinozShopData.raceId)!;

	// Throws an exception if player doesn't have enough money to buy the dinoz
	if (dinozShopData.player.money < race.price) {
		throw new ErrorFormator(400, 'notEnoughMoney');
	}

	// Throw error if dinoz doesn't belong to player shop
	if (dinozShopData.player.id !== req.user!.playerId!) {
		throw new ErrorFormator(500, `Dinoz ${req.params.id} doesn't belong to your account`);
	}

	const newDinoz: Partial<Dinoz> = {
		name: '?',
		isFrozen: false,
		isSacrificed: false,
		raceId: race.raceId,
		level: 1,
		player: dinozShopData.player,
		placeId: placeList.DINOVILLE.placeId,
		display: dinozShopData.display,
		life: 100,
		maxLife: 100,
		experience: 0,
		canChangeName: true,
		canGather: false,
		nbrUpFire: race.nbrFire,
		nbrUpWood: race.nbrWood,
		nbrUpWater: race.nbrWater,
		nbrUpLightning: race.nbrLightning,
		nbrUpAir: race.nbrAir,
		nextUpElementId: getRandomUpElement(race.upChance)!,
		nextUpAltElementId: getRandomUpElement(race.upChance)!
	};

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
	skillsToAdd.forEach(async skill => await addSkillToDinoz(new DinozSkill(dinozCreated, skill.skillId)));

	const dinozToSend: DinozFiche = {
		id: dinozCreated.id,
		display: dinozCreated.display,
		experience: dinozCreated.experience,
		following: dinozCreated.following,
		life: dinozCreated.life,
		maxLife: dinozCreated.maxLife,
		name: dinozCreated.name,
		placeId: dinozCreated.placeId,
		level: dinozCreated.level
	};

	// Add a point in the ranking to the player
	const playerRanking: Ranking = dinozShopData.player.rank;
	const dinozCount = playerRanking!.dinozCount + 1;
	const sumPoints = playerRanking!.sumPoints + 1;
	const averagePoints = Math.round(sumPoints / dinozCount);
	await updatePoints(req.user!.playerId, sumPoints, averagePoints, dinozCount);

	return dinozToSend;
};

/**
 * @summary Set the name of a dinoz
 * @param req
 * @param req.params.id {string} DinozId
 * @return void
 */
const setDinozName = async (req: Request): Promise<void> => {
	// Retrieve player from dinozId
	const dinoz: Dinoz = await getCanDinozChangeName(parseInt(req.params.id));

	// If authenticated player is different from player found, throw exception
	if (dinoz!.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${req.params.id} doesn't belong to player ${req.user!.playerId}`);
	}

	// If player can't change dinoz name, throw exception
	if (!dinoz!.canChangeName) {
		throw new ErrorFormator(500, `Can't update dinoz name`);
	}

	const dinozToUpdate: Partial<Dinoz> = {
		id: parseInt(req.params.id),
		name: req.body.newName,
		canChangeName: false
	};

	await setDinoz(dinozToUpdate);
};

/**
 * @summary Activate or desactivate a skill from a dinoz
 * @param req
 * @param req.params.id {string} DinozId
 * @param req.body.skillId {string} SkillId
 * @param req.body.skillState {boolean} State of the skill
 * @return boolean
 */
const setSkillState = async (req: Request): Promise<boolean> => {
	const dinozId: number = parseInt(req.params.id);
	const skillToUpdate: number = parseInt(req.body.skillId);
	const skillStateToUpdate: boolean = req.body.skillState;

	const dinoz: Dinoz = await getDinozSkillAndStatusRequest(dinozId);

	// Check if dinoz belongs to player who do the request
	if (dinoz.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player ${req.user!.playerId}`);
	}

	// Check if dinoz can change his skills
	const amulst = dinoz.status.some(status => status.statusId === statusList.STRATEGY_IN_130_LESSONS);

	if (!amulst) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't have the right status`);
	}

	// Check if dinoz know the skill
	const dinozKnowThisSkill = dinoz.skills.some(skill => skill.skillId === skillToUpdate);

	if (!dinozKnowThisSkill) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't know skill : ${skillToUpdate}`);
	}

	// Check if skill can be activate / desactivate
	const skillIsActivatable: DinozSkillFiche | undefined = Object.values(skillList).find(
		skill => skill.skillId === skillToUpdate
	);

	if (!skillIsActivatable!.activatable) {
		throw new ErrorFormator(500, `Skill ${skillToUpdate} cannot be activated`);
	}

	await setSkillStateRequest(dinozId, skillToUpdate, skillStateToUpdate);

	return !skillStateToUpdate;
};

/**
 * @summary Move the dinoz to a new place
 * @param req
 * @param req.params.id {string} DinozId
 * @return FightResult
 */
const betaMove = async (req: Request): Promise<FightResult> => {
	//Retrieve dinozId
	const dinozId: number = parseInt(req.body.dinozId);
	const dinoz: Dinoz = await getDinozFightDataRequest(dinozId);
	let finalPlace: number;

	// Check if dinoz belongs to player who do the request
	if (dinoz.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player ${req.user!.playerId}`);
	}

	const actualPlace: Place | undefined = Object.values(placeList).find(place => place.placeId === dinoz.placeId);
	const desiredPlace: Place | undefined = Object.values(placeList).find(place => place.placeId === req.body.placeId);

	// Check if desired and actual place exist and is adjacent to actual place
	if (!desiredPlace) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} want to go in the void`);
	}

	if (actualPlace!.placeId === desiredPlace.placeId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} is already at ${actualPlace!.name}`);
	}

	if (!actualPlace!.borderPlace.includes(desiredPlace.placeId)) {
		throw new ErrorFormator(500, `${actualPlace!.name} is not adjacent with ${desiredPlace.name}`);
	}

	// Check if condition to go to desired place are fullfill
	if (desiredPlace.conditions) {
		const canGoToWantedPlace: boolean = dinoz!.status.some(status => status.statusId === desiredPlace.conditions);
		if (!canGoToWantedPlace) {
			throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't fulfill requirement to go this place`);
		}
	}

	// If dinoz leave the map, replace by the good place
	finalPlace = desiredPlace.alias ?? desiredPlace.placeId;

	// Fight at the desired place
	const fight: FightResult = await moveFight(dinoz, finalPlace);
	if (fight.result) {
		await setDinozPlaceRequest(dinoz.id, finalPlace);
	}

	return fight;
};

const resurrectDinoz = async (req: Request): Promise<void> => {
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
};

export { getDinozFiche, buyDinoz, setDinozName, getDinozSkill, setSkillState, betaMove, resurrectDinoz };
