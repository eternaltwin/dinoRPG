import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { demonShopFiche } from '@drpg/core/models/shop/demonShopFiche';
import { auth } from '../dao/playerDao.js';
import gameConfig from '../config/game.config.js';
import { applySkillToDinoz, getRandomArrayElement } from '../utils/index.js';
import { Request } from 'express';
import {
	isAtMaxActiveDinoz,
	generateDinozDisplay,
	getRandomUpElement,
	randomlyLevelUpDinoz,
	getDemonShopPrice,
	hasAnyActiveDinozAt
} from '../utils/dinoz.js';
import {
	getDinozDataForUnsacrificeRequest,
	getDinozDataForSacrificeRequest,
	getPlayerDemonShopRequest,
	createMultipleDemonDinoz,
	deleteDinozInDemonShopRequest,
	getDinozFromDemonShopRequest,
	getSacrificedDinozRequest
} from '../dao/demonShopDao.js';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import translate from '../utils/server/translate.js';
import { DinozSkill, LogType, Prisma, UnavailableReason } from '@drpg/prisma';
import { toDinozFiche } from '@drpg/core/utils/DinozUtils';
import { createDinoz, getDinozFicheRequest, getDinozUnavailableReason, updateDinoz } from '../dao/dinozDao.js';
import { decreaseItemQuantity, increaseItemQuantity, insertItem } from '../dao/playerItemDao.js';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { scheduleJob } from 'node-schedule';
import { GLOBAL, LOGGER } from '../context.js';
import { UNSACRIFICE_DURATION, UNSACRIFICE_DURATION_DEBUG } from '@drpg/core/constants';
import { randomUUID } from 'crypto';
import { computeUSkillsForPlayer } from './skillService.js';
import { updateDinozCount, updatePoints } from '../dao/rankingDao.js';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { createLog } from '../dao/logDao.js';
import { DinozShopFiche } from '@drpg/core/models/shop/DinozShopFiche';
import { ElementType } from '@drpg/core/models/enums/ElementType';

/**
 * @summary Format Dinoz rows from getSacrificedDinozRequest as DinozShopFiche.
 */
function toDinozShopFiche(rows: Awaited<ReturnType<typeof getSacrificedDinozRequest>>): DinozShopFiche[] {
	return rows.map(d => ({
		id: d.id,
		level: d.level,
		display: d.display,
		raceId: d.raceId,
		nbrUpFire: d.nbrUpFire,
		nbrUpWood: d.nbrUpWood,
		nbrUpWater: d.nbrUpWater,
		nbrUpLightning: d.nbrUpLightning,
		nbrUpAir: d.nbrUpAir,
		skills: d.skills.map(s => s.skillId).sort((s1, s2) => +s1 - +s2),
		price: getDemonShopPrice(d.level)
	}));
}

/**
 * @summary Get one page of a player's sacrificed Dinoz (buy-back list).
 * @param req Page number to fetch (1-indexed).
 * @return DinozShopFiche[]
 */
export async function getSacrificedDinoz(req: Request): Promise<DinozShopFiche[]> {
	const authed = await auth(req);
	const page = +req.params.page || 1;

	return toDinozShopFiche(await getSacrificedDinozRequest(authed.id, page));
}

/**
 * @summary Get all dinoz data from demon dinoz shop
 * @description If no dinoz is found, then fill the shop with X new dinoz -> X is defined is config file
 * @param req DinozID at the shop
 * @return Array<demonShopFiche>
 */
export async function getDinozFromDemonShop(req: Request): Promise<demonShopFiche> {
	const authed = await auth(req);

	// Retrieve player with dinoz shop info
	const player = await getPlayerDemonShopRequest(authed.id);

	if (!player) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}

	if (!player.rewards.some(r => r.rewardId === Reward.DEMON)) {
		throw new ExpectedError(translate('error.noShopAccess', authed));
	}

	// Player must have a Dinoz at the cemetary
	const dinozAtCemetary: DinozShopFiche[] = player.dinoz
		.filter(
			d =>
				d.placeId === PlaceEnum.CIMETIERE &&
				(d.unavailableReason === null || d.unavailableReason === UnavailableReason.resting)
		)
		.map(d => {
			return {
				id: d.id,
				level: d.level,
				display: d.display,
				raceId: d.raceId,
				nbrUpFire: d.nbrUpFire,
				nbrUpWood: d.nbrUpWood,
				nbrUpWater: d.nbrUpWater,
				nbrUpLightning: d.nbrUpLightning,
				nbrUpAir: d.nbrUpAir,
				skills: d.skills.map(s => s.skillId),
				price: getDemonShopPrice(d.level)
			};
		})
		.sort((dinoz1, dinoz2) => +dinoz1.id - +dinoz2.id);

	if (dinozAtCemetary.length === 0) {
		throw new ExpectedError(translate('error.noDinozAtCemetary', authed));
	}

	// Sacrificed Dinoz can pile up into the hundreds, so only the first page is loaded here.
	// The rest is fetched on demand via getSacrificedDinoz.
	const sacrificedDinoz: DinozShopFiche[] = toDinozShopFiche(await getSacrificedDinozRequest(player.id, 1));

	// Minimum 30 Demon tickets to see the list of demon dinoz.
	const demonTickets = player.items.find(i => i.itemId === Item.DEMON_TICKET)?.quantity ?? 0;
	let listDinozShop: DinozShopFiche[] = [];

	if (demonTickets >= 30) {
		// Expected number of Dinoz is based on game config plus some extra for the Belius reward.
		const hasBelius = player.rewards.some(r => r.rewardId === Reward.BELIUS);
		const totalDinoz = Math.round(gameConfig.demonShop.dinozNumber * (hasBelius ? 1.5 : 1));

		// If the shop does not have the matching create N dinoz to fill the shop (based on game config)
		if (player.demonShop.length === 0 || player.demonShop.length < totalDinoz) {
			const dinozArray = [];
			let randomRace: DinozRace;
			let randomDisplay: string;
			const availableRaces: DinozRace[] = Object.values(raceList).filter(
				r => r.demon && checkCondition(r.demon.condition, player, dinozAtCemetary[0].id)
			);

			// Make x Dinoz object to fill shop
			for (let i = 0; i < totalDinoz; i++) {
				// Set a random race to the dinoz
				randomRace = getRandomArrayElement(availableRaces);

				// Make a random display
				randomDisplay = generateDinozDisplay(randomRace, '0', '0', '0');

				const seed = randomUUID();
				// Build Dinoz so it can be used to auto level up.
				const dinoz = {
					playerId: player.id,
					id: i, // Temp value
					display: randomDisplay,
					level: 1,
					price: randomRace.price,
					raceId: randomRace.raceId,
					maxLife: 100,
					// Elements are already fully declared by the race (no random draw needed), randomlyLevelUpDinoz
					// builds these up to the race's target below.
					nbrUpFire: 0,
					nbrUpWood: 0,
					nbrUpWater: 0,
					nbrUpLightning: 0,
					nbrUpAir: 0,
					nextUpElementId: getRandomUpElement(randomRace.upChance, seed + GLOBAL.config.salt),
					nextUpAltElementId: getRandomUpElement(randomRace.upChance, seed + GLOBAL.config.salt + 'pdc'),
					seed,
					status: [],
					skills: [] as DinozSkill[],
					unlockableSkills: [] as DinozSkill[]
				};
				if (randomRace.skills) {
					randomRace.skills.forEach(s => {
						dinoz.skills.push({
							id: s,
							dinozId: dinoz.id,
							gameDinozId: null,
							skillId: s,
							state: true
						});
						const skillData = skillList[s];
						if (skillData.effects) {
							applySkillToDinoz(skillData.effects, dinoz);
						}
					});
				}
				const targetElements: ElementType[] = [
					...Array(randomRace.nbrFire).fill(ElementType.FIRE),
					...Array(randomRace.nbrWood).fill(ElementType.WOOD),
					...Array(randomRace.nbrWater).fill(ElementType.WATER),
					...Array(randomRace.nbrLightning).fill(ElementType.LIGHTNING),
					...Array(randomRace.nbrAir).fill(ElementType.AIR)
				];
				randomlyLevelUpDinoz(dinoz, targetElements);
				dinozArray.push(dinoz);
			}

			const createCommand: Prisma.PlayerDemonShopCreateManyInput[] = dinozArray.map(d => {
				return {
					playerId: d.playerId,
					display: d.display,
					raceId: d.raceId,
					seed: d.seed,
					nextUpElementId: d.nextUpElementId,
					nextUpAltElementId: d.nextUpAltElementId,
					nbrUpFire: d.nbrUpFire,
					nbrUpWood: d.nbrUpWood,
					nbrUpWater: d.nbrUpWater,
					nbrUpLightning: d.nbrUpLightning,
					nbrUpAir: d.nbrUpAir,
					skills: {
						create: d.skills.map(s => {
							return { skillId: s.skillId };
						})
					},
					unlockableSkills: {
						create: d.unlockableSkills.map(s => {
							return { skillId: s.skillId };
						})
					}
				};
			});
			// Create the Dinoz
			await createMultipleDemonDinoz(createCommand);
			// Format the created Dinoz properly for the response
			// nbrUp* already includes race + skill effects baked in at generation by randomlyLevelUpDinoz.
			listDinozShop = (await getDinozFromDemonShopRequest(player.id))
				.map(d => {
					const race = raceList[d.raceId as RaceEnum];
					return {
						id: d.id,
						level: 10,
						maxLife: 100,
						display: d.display,
						raceId: d.raceId,
						nbrUpFire: d.nbrUpFire,
						nbrUpWood: d.nbrUpWood,
						nbrUpWater: d.nbrUpWater,
						nbrUpLightning: d.nbrUpLightning,
						nbrUpAir: d.nbrUpAir,
						skills: d.skills.map(s => s.skillId).sort((s1, s2) => +s1 - +s2),
						price: race.price
					};
				})
				.sort((dinoz1, dinoz2) => +dinoz1.id - +dinoz2.id);
		} else {
			listDinozShop = player.demonShop
				.map(d => {
					const race = raceList[d.raceId as RaceEnum];
					return {
						id: d.id,
						level: 10,
						maxLife: 100,
						display: d.display,
						raceId: d.raceId,
						nbrUpFire: d.nbrUpFire,
						nbrUpWood: d.nbrUpWood,
						nbrUpWater: d.nbrUpWater,
						nbrUpLightning: d.nbrUpLightning,
						nbrUpAir: d.nbrUpAir,
						skills: d.skills.map(s => s.skillId).sort((s1, s2) => +s1 - +s2),
						price: race.price
					};
				})
				.sort((dinoz1, dinoz2) => +dinoz1.id - +dinoz2.id);
		}
	}

	return {
		dinoz: dinozAtCemetary,
		sacrificed: sacrificedDinoz,
		shop: listDinozShop
	};
}

/**
 * @summary Buy a demon dinoz from the demon shop.
 * @description Use the demon tickets from the player, refresh shop on purchase.
 * @param req ID of dinoz to purchase.
 * @return DinozFiche
 */
export async function buyDemonDinoz(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.id;

	// Retrieve player with dinoz shop info
	const player = await getPlayerDemonShopRequest(authed.id);

	if (!player) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}

	const hasActiveDinozAtCemetary = player.dinoz.some(
		d =>
			d.placeId === PlaceEnum.CIMETIERE &&
			(d.unavailableReason === null || d.unavailableReason === UnavailableReason.resting)
	);

	if (!hasActiveDinozAtCemetary) {
		throw new ExpectedError(translate('error.noDinozAtCemetary', authed));
	}

	// Check the player can get a new Dinoz.
	if (await isAtMaxActiveDinoz(authed)) {
		throw new ExpectedError(translate('tooManyActiveDinoz', authed));
	}

	if (!player.rewards.some(r => r.rewardId === Reward.DEMON)) {
		throw new ExpectedError(translate('error.noShopAccess', authed));
	}

	const dinozData = player.demonShop.find(d => d.id === dinozId);

	if (!dinozData) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	// Override with default max life, so skills can be applied after.
	const dinoz = {
		...dinozData,
		maxLife: 100
	};

	const demonTickets = player.items.find(i => i.itemId === Item.DEMON_TICKET)?.quantity ?? 0;
	const race = raceList[dinoz.raceId as RaceEnum];

	if (demonTickets <= race.price) {
		throw new ExpectedError(translate('error.notEnoughTickets', authed));
	}

	// -- DB updates
	const promises = [];
	// Update demon tickets stockpile
	promises.push(decreaseItemQuantity(player.id, Item.DEMON_TICKET, race.price));
	// Update player ranking
	promises.push(updatePoints(player.id, 10));
	// Update player Dinoz count
	promises.push(updateDinozCount(authed.id, 1));
	// Delete shop for player
	promises.push(deleteDinozInDemonShopRequest(player.id));
	await Promise.all(promises);

	// dinoz.nbrUp* already includes race + skill effects baked in at generation. maxLife isn't stored on
	// the demon shop row though, so recompute it here (on a throwaway copy, to avoid re-applying elements).
	const maxLifeCarrier = { ...dinoz };
	dinoz.skills.forEach(s => {
		const skillData = skillList[s.skillId as Skill];
		if (skillData.effects) {
			applySkillToDinoz(skillData.effects, maxLifeCarrier);
		}
	});
	dinoz.maxLife = maxLifeCarrier.maxLife;

	const dinozCreateCommand: Prisma.DinozCreateInput = {
		name: '?',
		unavailableReason: null,
		raceId: race.raceId,
		level: 10,
		placeId: PlaceEnum.CIMETIERE,
		display: dinoz.display,
		life: dinoz.maxLife,
		maxLife: dinoz.maxLife,
		experience: 0,
		canChangeName: true,
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir,
		seed: dinoz.seed,
		nextUpElementId: dinoz.nextUpElementId,
		nextUpAltElementId: dinoz.nextUpAltElementId,
		player: { connect: { id: player.id } },
		status: { create: [{ statusId: DinozStatusId.DEMON }] },
		skills: {
			create: dinoz.skills.map(s => {
				return { skillId: s.skillId };
			})
		},
		unlockableSkills: {
			create: dinoz.unlockableSkills.map(s => {
				return { skillId: s.skillId };
			})
		}
	};
	const createdDinoz = await createDinoz(dinozCreateCommand);

	// Query Dinoz and format it properly for return.
	const ficheData = await getDinozFicheRequest(createdDinoz.id, authed.id);

	if (!ficheData) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}

	const ret = toDinozFiche(ficheData, createdDinoz.id, null);

	return ret;
}

/**
 * @summary Sacrifice a Dinoz at the demon shop.
 * @description Receive demon tickets, mark Dinoz as unavailable.
 * @param req ID of dinoz to sacrifice.
 * @return Number of demon tickets received.
 */
export async function sacrificeDinoz(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.dinozId;

	// Retrieve player with dinoz shop info
	const dinoz = await getDinozDataForSacrificeRequest(dinozId);

	// Error cases
	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	if (dinoz.player.id !== authed.id) {
		throw new ExpectedError(translate('error.notYourDinoz', authed));
	}

	// Checking that the Dinoz to sacrifice is not at the cemetary is enough, no need to check for any Dinoz being there.
	if (dinoz.placeId !== PlaceEnum.CIMETIERE) {
		throw new ExpectedError(translate('error.dinozWrongLocation', authed));
	}

	if (!dinoz.player.rewards.some(r => r.rewardId === Reward.DEMON)) {
		throw new ExpectedError(translate('error.noShopAccess', authed));
	}

	if (dinoz.unavailableReason !== null && dinoz.unavailableReason !== UnavailableReason.resting) {
		throw new ExpectedError(translate('error.dinozNotAvailable', authed));
	}

	if (dinoz.items.length > 0) {
		throw new ExpectedError(translate('error.dinozInventoryNotEmpty', authed));
	}

	// Logic

	const playerTickets = dinoz.player.items.find(i => i.itemId === Item.DEMON_TICKET)?.quantity ?? 0;
	const demonTickets = getDemonShopPrice(dinoz.level);

	// Cannot exceed max number of tickets (even if the cap is really high)
	if (playerTickets + demonTickets > itemList[Item.DEMON_TICKET].maxQuantity) {
		throw new ExpectedError(translate('error.tooManyItems', authed));
	}

	// -- DB updates
	const promises = [];
	// Update Dinoz unavailable reason
	promises.push(
		updateDinoz(dinozId, {
			unavailableReason: UnavailableReason.sacrificed
		})
	);
	// Update demon tickets of player
	if (dinoz.player.items.some(i => i.itemId === Item.DEMON_TICKET)) {
		promises.push(increaseItemQuantity(dinoz.player.id, Item.DEMON_TICKET, demonTickets));
	} else {
		promises.push(insertItem(dinoz.player.id, { itemId: Item.DEMON_TICKET, quantity: demonTickets }));
	}
	// Update player U skills
	promises.push(computeUSkillsForPlayer(dinoz.player.id));
	// Update player ranking
	promises.push(updatePoints(dinoz.player.id, -dinoz.level));
	// Update player Dinoz count
	promises.push(updateDinozCount(authed.id, -1));
	// Add log
	promises.push(createLog(LogType.Sacrifice, dinoz.player.id, dinoz.id, demonTickets));
	await Promise.all(promises);

	return demonTickets;
}

/**
 * @summary Unsacrifice a Dinoz at the demon shop.
 * @description Consume demon tickets, mark Dinoz for resurrection.
 * @param req ID of dinoz to unsacrifice.
 */
export async function unsacrificeDinoz(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.dinozId;

	// Check if the player has any active Dinoz at the cemetary
	if (!(await hasAnyActiveDinozAt(authed, PlaceEnum.CIMETIERE))) {
		throw new ExpectedError(translate('error.noDinozAtCemetary', authed));
	}

	// Check the player can unsacrifice Dinoz.
	if (await isAtMaxActiveDinoz(authed)) {
		throw new ExpectedError(translate('tooManyActiveDinoz', authed));
	}

	// Retrieve player with dinoz shop info
	const dinoz = await getDinozDataForUnsacrificeRequest(dinozId);

	// Error cases
	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	if (dinoz.player.id !== authed.id) {
		throw new ExpectedError(translate('error.notYourDinoz', authed));
	}

	if (!dinoz.player.rewards.some(r => r.rewardId === Reward.DEMON)) {
		throw new ExpectedError(translate('error.noShopAccess', authed));
	}

	if (dinoz.unavailableReason !== UnavailableReason.sacrificed) {
		throw new ExpectedError(translate('error.dinozNotAvailable', authed));
	}

	const cost = getDemonShopPrice(dinoz.level);
	const demonTickets = dinoz.player.items.find(i => i.itemId === Item.DEMON_TICKET)?.quantity ?? 0;

	if (demonTickets < cost) {
		throw new ExpectedError(translate('error.notEnoughTickets', authed));
	}

	// -- DB updates
	const promises = [];
	// Update Dinoz unavailable reason
	const duration = GLOBAL.config.isProduction ? UNSACRIFICE_DURATION : UNSACRIFICE_DURATION_DEBUG;
	const endDate = new Date(Date.now() + duration);
	promises.push(
		updateDinoz(dinozId, {
			unavailableReason: UnavailableReason.unsacrificing,
			unavailableUntil: endDate
		})
	);
	// Update demon tickets stockpile
	promises.push(decreaseItemQuantity(dinoz.player.id, Item.DEMON_TICKET, cost));
	// Update player U skills
	promises.push(computeUSkillsForPlayer(dinoz.player.id));
	// Update player ranking
	promises.push(updatePoints(dinoz.player.id, dinoz.level));
	// Update player Dinoz count
	promises.push(updateDinozCount(authed.id, 1));
	// Add log
	promises.push(createLog(LogType.Unsacrifice, dinoz.player.id, dinoz.id, cost));
	await Promise.all(promises);

	// Schedule job
	scheduleJob(`unsacrifice_${dinoz.id}`, endDate, () => finishDinozUnsacrifice(dinoz.id));

	return;
}

// If a Dinoz is being unsacrificed, remove the unavailable reason.
// This method is ran in a job.
export async function finishDinozUnsacrifice(dinozId: number) {
	const dinoz = await getDinozUnavailableReason(dinozId);

	if (!dinoz) {
		LOGGER.error(`Dinoz ${dinozId} not found for unsacrificing finish.`);
		return;
	}

	if (dinoz.unavailableReason !== UnavailableReason.unsacrificing) {
		LOGGER.error(
			`Dinoz ${dinozId} unexpected unavailable reason (${dinoz.unavailableReason}) for unsacrificing finish.`
		);
		return;
	}

	await updateDinoz(dinozId, {
		unavailableReason: null,
		unavailableUntil: null
	});
}
