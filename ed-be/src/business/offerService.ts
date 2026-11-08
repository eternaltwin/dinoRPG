import { Request } from 'express';
import {
	cancelOngoingOffer,
	claimEndedOffer,
	createOfferWithStock,
	deleteOffer,
	endOngoingOffer,
	getEndedOffers,
	getOffer,
	getOffers,
	getOngoingOffers,
	placeBid,
	prepareRefund,
	updateOfferDinoz
} from '../dao/offerDao.js';
import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import {
	getDinozEquipItemRequest,
	getDinozPlace,
	getDinozPlaces,
	isDinozInTournament,
	isDinozSelling,
	updateDinoz
} from '../dao/dinozDao.js';
import { getPlayerItems, increaseItemQuantity } from '../dao/playerItemDao.js';
import { getAllIngredientsDataRequest, increaseIngredientQuantity } from '../dao/playerIngredientDao.js';
import { $Enums, Dinoz, LogType, Offer, OfferBid, OfferItem, OfferStatus, UnavailableReason } from '@drpg/prisma';
import { scheduledJobs, scheduleJob } from 'node-schedule';
import { addMoney, auth, getPlayerDiscoveredSkills, ownsDinoz, setPlayer } from '../dao/playerDao.js';
import { updateDinozCount, updatePoints } from '../dao/rankingDao.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { setSpecificStat } from '../dao/trackingDao.js';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { LOGGER } from '../context.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/server/translate.js';
import { createLog } from '../dao/logDao.js';
import { createNotification } from '../dao/notificationDao.js';
import { ClaimOfferData, OfferGetList } from '@drpg/core/returnTypes/Offer';
import { computeUSkillsForPlayer } from './skillService.js';
import NotificationSeverity = $Enums.NotificationSeverity;
import dayjs from 'dayjs';
import { gameConfig } from '../utils/gameConfig.js';

/**
 * Get the list of current offers
 */
export async function getOfferList(req: Request): Promise<OfferGetList> {
	const authed = await auth(req);

	const player = await getDinozPlaces(authed.id);

	if (!player) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}

	if (!player.dinoz.some(d => d.placeId === PlaceEnum.PLACE_DU_MARCHE)) {
		throw new ExpectedError(translate('noDinozAtMarket'));
	}

	const filter = req.params.filter;
	const sellerId = req.query.sellerId ? (req.query.sellerId as string) : null;
	const bidderId = req.query.bidderId ? (req.query.bidderId as string) : null;
	const expired = req.query.expired ? req.query.expired === 'true' : false;
	const page = req.query.page ? +req.query.page : 1;
	const onlyMines = req.query.onlyMines ? req.query.onlyMines === 'true' : false;

	// Get filtered offers
	const getOffersResult = await getOffers(authed.id, filter, sellerId, bidderId, expired, page);
	let { offers } = getOffersResult;
	const { total } = getOffersResult;

	if (onlyMines) {
		offers = offers
			.filter(o => {
				if (o.bids[0] && o.bids[0].user) {
					return o.bids[0].user.id === authed.id;
				} else {
					return o.sellerId === authed.id;
				}
			})
			.filter(o => o.status === OfferStatus.ENDED);
	}

	if (expired) {
		offers.map(o => {
			if (o.dinozDetails) {
				o.dinoz = JSON.parse(o.dinozDetails);
			} else {
				o.dinoz = null;
			}
		});
	}
	return { total, offers };
}

/**
 * Create a new offer
 */
export async function createOffer(req: Request) {
	// Check if player is logged in
	const authed = await auth(req);

	const player = await getDinozPlaces(authed.id);

	if (player && !player.dinoz.some(d => d.placeId === PlaceEnum.PLACE_DU_MARCHE)) {
		throw new ExpectedError(translate('noDinozAtMarket'));
	}

	const dinozId = req.body.dinoz ? +req.body.dinoz : null;
	const total = +req.body.total;
	const ingredients = req.body.ingredients as {
		name: string;
		count: number;
	}[];
	const items = req.body.items as {
		name: string;
		count: number;
	}[];

	const { offers } = await getOffers(authed.id, 'own', authed.id, null, false, 1);

	if (offers.length > 0) {
		throw new ExpectedError(translate('alreadyOffer', authed));
	}

	if (dinozId) {
		// Check if player owns the Dinoz
		const owns = await ownsDinoz(authed.id, dinozId);

		if (!owns) {
			throw new ExpectedError(translate('invalidDinoz', authed));
		}

		const dinozPlace = await getDinozPlace(dinozId);
		// A dinoz locked on the clan championship board cannot be put on sale (it would overwrite the lock)
		if (dinozPlace?.unavailableReason === UnavailableReason.clanChampionship) {
			throw new ExpectedError(translate(`UnavailableReason.${dinozPlace.unavailableReason}`, authed));
		}
		if (dinozPlace && dinozPlace.placeId !== PlaceEnum.PLACE_DU_MARCHE) {
			throw new ExpectedError('Dinoz is not at the right place to do this.');
		}
		const dinozItems = await getDinozEquipItemRequest(dinozId);
		if (dinozItems && dinozItems.items.length >= 1) {
			throw new ExpectedError(translate('equipedItems', authed));
		}

		const dinozTournament = await isDinozInTournament(dinozId);
		if (dinozTournament) {
			throw new ExpectedError(`Dinoz ${dinozId} is in a tournament team`);
		}

		const selling = await isDinozSelling(dinozId, authed.id);
		if (selling) {
			throw new ExpectedError(`Your dinoz is already selling.`);
		}
	}

	// Group items and ingredients
	const itemsAndIngredients = [];

	itemsAndIngredients.push(
		...ingredients.map(ingredient => {
			const ingredientData = Object.entries(ingredientList).find(ing => ing[1].name === ingredient.name.toLowerCase());

			if (!ingredientData) {
				throw new ExpectedError('Ingredient not found');
			}

			return {
				itemId: ingredientData[1].ingredientId,
				quantity: ingredient.count,
				isIngredient: true
			};
		}),
		...items.map(item => {
			const itemData = Object.entries(itemList).find(i => i[1].name === item.name.toLowerCase());

			if (!itemData) {
				throw new ExpectedError('Item not found');
			}
			if (itemData[1].sellable === false) {
				throw new ExpectedError(`Item ${itemData[1]} cannot be sold`);
			}

			return {
				itemId: itemData[1].itemId,
				quantity: item.count,
				isIngredient: false
			};
		})
	);

	// The stock check below reads one line at a time: a negative quantity would credit the seller when
	// it is deducted, and two lines of the same item would each pass while removing more than the stock.
	const seenLines = new Set<string>();
	for (const line of itemsAndIngredients) {
		if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
			throw new ExpectedError('Invalid quantity');
		}
		const key = `${line.isIngredient}-${line.itemId}`;
		if (seenLines.has(key)) {
			throw new ExpectedError('Duplicate line');
		}
		seenLines.add(key);
	}

	// Get available items and ingredients
	const availableItems = await getPlayerItems(authed.id);
	const playerIngredients = await getAllIngredientsDataRequest(authed.id);
	if (!playerIngredients) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}
	// Check if user has enough items and ingredients
	for (const item of itemsAndIngredients) {
		if (item.isIngredient) {
			const availableIngredient = playerIngredients.ingredients.find(
				availableIngredient => availableIngredient.ingredientId === item.itemId
			);

			if (!availableIngredient || availableIngredient.quantity < item.quantity) {
				throw new ExpectedError(translate('notEnoughIngredients', authed));
			}
		} else {
			const availableItem = availableItems.find(availableItem => availableItem.itemId === item.itemId);

			if (!availableItem || availableItem.quantity < item.quantity) {
				throw new ExpectedError(translate('notEnoughItems', authed));
			}
		}
	}

	// Remove the content and lock the dinoz by conditional writes, in the transaction that creates the offer:
	// the checks above read the stock, a concurrent request may have spent it since
	const created = await createOfferWithStock(dinozId, total, itemsAndIngredients, authed.id);
	if ('refused' in created) {
		throw new ExpectedError(translate(created.refused, authed));
	}
	const offer = created;
	await createLog(LogType.OfferNew, authed.id, undefined, offer.id, offer.total);

	// Schedule offer expiration
	scheduleJob(`offer_${offer.id.toString()}`, offer.endDate, () => expireOffer(offer.id));
}

/**
 * Cancel an offer
 */
export async function cancelOffer(req: Request) {
	// Check if player is logged in
	const authed = await auth(req);

	const player = await getDinozPlaces(authed.id);

	if (player && !player.dinoz.some(d => d.placeId === PlaceEnum.PLACE_DU_MARCHE)) {
		throw new ExpectedError(translate('noDinozAtMarket'));
	}

	const playerId = authed.id;
	const offerId = +req.params.offerId;

	// Get user current offers
	const offer = await getOffer(offerId, OfferStatus.ONGOING);

	// Check if user is the seller
	if (!offer || !offer.seller || offer.seller.id !== playerId) {
		throw new ExpectedError(translate('invalidOffer', authed));
	}

	// Check if the offer can be cancelled
	if (offer.status !== OfferStatus.ONGOING) {
		throw new ExpectedError(translate('invalidOffer', authed));
	}

	if (offer.bids.length > 0) {
		throw new ExpectedError(translate('offerInProgress', authed));
	}

	const { dinoz, items: itemsAndIngredients } = offer;

	// Separate items and ingredients
	const items = itemsAndIngredients.filter(item => !item.isIngredient);
	const ingredients = itemsAndIngredients.filter(item => item.isIngredient);

	const refund = await checkRefund(playerId, ingredients, items, offer.dinoz, offerId);

	if (typeof refund === 'string') {
		throw new ExpectedError(translate(refund, authed));
	}

	// Gives the content back and deletes the offer only if it is still ongoing and without bid: a bid or a
	// second cancellation arriving meanwhile makes this one fail
	if (!(await cancelOngoingOffer({ id: offerId, dinozId: dinoz?.id ?? null, items: itemsAndIngredients }, playerId))) {
		throw new ExpectedError(translate('invalidOffer', authed));
	}

	await createLog(LogType.OfferCancelled, playerId, undefined, offerId);
	scheduledJobs[`offer_${offerId.toString()}`]?.cancel();
}

/**
 * Bid on an offer
 */
export async function bidOffer(req: Request) {
	// Check if player is logged in
	const authed = await auth(req);

	const player = await getDinozPlaces(authed.id);

	if (player && !player.dinoz.some(d => d.placeId === PlaceEnum.PLACE_DU_MARCHE)) {
		throw new ExpectedError(translate('noDinozAtMarket'));
	}

	const offerId = +req.params.offerId;
	const value = +req.body.value;

	// Get user current offers
	const offer = await getOffer(offerId, OfferStatus.ONGOING);

	// Check if user is the seller
	if (!offer || !offer.seller || offer.seller.id === authed.id) {
		throw new ExpectedError(translate('invalidOffer', authed));
	}

	// Check if the offer can be bid on
	if (offer.status !== OfferStatus.ONGOING) {
		throw new ExpectedError(translate('invalidOffer', authed));
	}

	if (!Number.isInteger(value)) {
		throw new ExpectedError(translate('bidIsLower', authed));
	}

	// Checked again under the lock of the offer, with the bid that really leads at that moment
	const placed = await placeBid(offerId, { id: authed.id, name: authed.name }, value);
	if ('refused' in placed) {
		throw new ExpectedError(translate(placed.refused, authed));
	}
	await createLog(LogType.OfferBid, authed.id, undefined, offer.id, value);

	// Each bid adds 30 seconds to the offer
	const job = scheduledJobs[`offer_${offerId.toString()}`];
	if (job) {
		job.cancel();
		job.schedule(placed.endDate);
	} else {
		scheduleJob(`offer_${offerId.toString()}`, placed.endDate, () => expireOffer(offerId));
	}
}

/**
 * Expire an offer
 */
export const expireOffer = async (offerId: number) => {
	// Ends the offer first, by a conditional write: a bid that extended it meanwhile, or a second expiration,
	// leaves it ongoing and this call stops
	if (!(await endOngoingOffer(offerId))) {
		return;
	}
	const offer = await getOffer(offerId, OfferStatus.ENDED);

	if (!offer || !offer.seller) {
		throw new ExpectedError('Offer not found');
	}

	const winnerBid = offer.bids[offer.bids.length - 1];
	if (winnerBid && winnerBid.userId) {
		// Send Discord notification
		// LOGGER.log(`Offer ${offerId} won by ${winnerBid.userId}`);
		await createLog(LogType.OfferWon, offer.seller.id, undefined, offer.id, winnerBid.userId, winnerBid.value);
		// Send buyer notification for won offer
		await createNotification(
			winnerBid.userId,
			JSON.stringify({ offer: offerId, value: winnerBid.value }),
			NotificationSeverity.offerWon
		);
		// The seller is paid when the winner claims the offer
		// Send seller notification for ended offer
		await createNotification(
			offer.seller.id,
			JSON.stringify({ offer: offerId, value: winnerBid.value }),
			NotificationSeverity.offerEnded
		);
		// Update stats tracking
		await setSpecificStat(StatTracking.MARKET, offer.seller.id, 1);
	} else {
		// Send seller notification for expired offer
		await createNotification(offer.seller.id, JSON.stringify({ offer: offerId }), NotificationSeverity.offerExpired);
	}

	if (offer.dinoz) {
		await updateOfferDinoz(offerId, JSON.stringify(offer.dinoz));
	}
	scheduleUnclaimedOfferRefund(offer);
};

/**
 * Claim an ENDED offer
 */
export async function claimOffer(req: Request): Promise<ClaimOfferData> {
	const offerId = +req.params.offerId;
	const offer = await getOffer(offerId, OfferStatus.ENDED);
	if (!offer || !offer.seller || !offer.sellerId) {
		throw new ExpectedError('Offer not found');
	}
	const authed = await auth(req);

	const player = await getDinozPlaces(authed.id);

	if (player && !player.dinoz.some(d => d.placeId === PlaceEnum.PLACE_DU_MARCHE)) {
		throw new ExpectedError(translate('noDinozAtMarket'));
	}

	const sellerId = offer.sellerId;
	const result: ClaimOfferData = {
		discoveredSkills: []
	};

	// Separate items and ingredients
	const items = offer.items.filter(item => !item.isIngredient);
	const ingredients = offer.items.filter(item => item.isIngredient);
	const winnerBid = offer.bids[offer.bids.length - 1];
	const promises = [];

	// A sold offer is claimed by its winner; an unsold one, or one whose winner deleted their account, by its seller
	const claimantId = offer.bids.length && winnerBid.userId ? winnerBid.userId : sellerId;
	if (authed.id !== claimantId) {
		throw new ExpectedError(translate('invalidOffer', authed));
	}

	if (offer.bids.length && winnerBid.userId) {
		const winner = await checkRefund(winnerBid.userId, ingredients, items, offer.dinoz, offerId);

		if (typeof winner === 'string') {
			throw new ExpectedError(translate(winner, authed));
		}
		if (!(await claimEndedOffer(offerId))) {
			throw new ExpectedError(translate('invalidOffer', authed));
		}
		if (!offer.sellerPaid) {
			await addMoney(sellerId, winnerBid.value * 1000);
		}
		if (offer.dinoz && winnerBid.userId) {
			// Change Dinoz owner and set as not selling
			await updateDinoz(offer.dinoz.id, {
				player: { connect: { id: winnerBid.userId } },
				unavailableReason: null
			});

			// Update winner discovered skills
			const { discoveredSkills } = await getPlayerDiscoveredSkills(winnerBid.userId);
			const dinozSkills = offer.dinoz.skills.map(skill => skill.skillId);
			const newSkills = dinozSkills.filter(skill => !discoveredSkills.some(s => s === skill));

			if (newSkills.length) {
				await setPlayer(winnerBid.userId, {
					discoveredSkills: [...discoveredSkills, ...newSkills]
				});

				result.discoveredSkills = newSkills;
			}

			// Update seller ranking
			await updateDinozCount(offer.seller.id, -1);
			await updatePoints(offer.seller.id, -offer.dinoz.level);
			// Recompute U skills of seller
			await computeUSkillsForPlayer(offer.seller.id);

			// Update winner ranking
			await updateDinozCount(winnerBid.userId, 1);
			await updatePoints(winnerBid.userId, offer.dinoz.level);
			// Recompute U skills of winner
			await computeUSkillsForPlayer(winnerBid.userId);

			// await updateOfferDinoz(offerId, JSON.stringify(offer.dinoz));
		}

		// Add items to winner inventory
		promises.push(...items.map(item => increaseItemQuantity(winnerBid.userId, item.itemId, item.quantity)));

		// Add ingredients to winner inventory
		promises.push(...ingredients.map(item => increaseIngredientQuantity(winnerBid.userId, item.itemId, item.quantity)));
	} else {
		const refund = await checkRefund(sellerId, ingredients, items, offer.dinoz, offerId);

		if (typeof refund === 'string') {
			throw new ExpectedError(translate(refund, authed));
		}
		if (!(await claimEndedOffer(offerId))) {
			throw new ExpectedError(translate('invalidOffer', authed));
		}
		// Set Dinoz as not selling
		if (offer.dinoz) {
			await updateDinoz(offer.dinoz.id, { unavailableReason: null });
		}
		// Add items to inventory
		promises.push(...items.map(item => increaseItemQuantity(sellerId, item.itemId, item.quantity)));

		// Add ingredients to inventory
		promises.push(...ingredients.map(item => increaseIngredientQuantity(sellerId, item.itemId, item.quantity)));

		// Send Discord notification
		// LOGGER.log(`Offer ${offerId} expired`);
		await createLog(LogType.OfferExpired, sellerId, undefined, offer.id);
	}

	await Promise.all(promises);

	return result;
}

export async function checkRefund(
	playerId: string,
	ingredients: { itemId: number; quantity: number; isIngredient: boolean }[],
	items: { itemId: number; quantity: number; isIngredient: boolean }[],
	dinoz: Pick<Dinoz, 'playerId'> | null,
	offerId: number
) {
	const refund = await prepareRefund(
		playerId,
		ingredients.map(p => p.itemId),
		items.map(i => i.itemId)
	);

	if (dinoz) {
		const maxDinoz =
			gameConfig().dinoz.maxQuantity +
			(refund.leader ? gameConfig().dinoz.leaderMessieBonus : 0) +
			(refund.messie ? gameConfig().dinoz.leaderMessieBonus : 0) +
			(dinoz.playerId === playerId ? 1 : 0);
		if (refund._count.dinoz + 1 > maxDinoz) {
			return 'tooManyActiveDinoz';
		}
	}

	const shopKeeper = refund.shopKeeper;

	const ingredientsWithMaxQuantity = Object.values(ingredientList)
		.filter(i => {
			return ingredients.some(a => a.itemId === i.ingredientId);
		})
		.filter(i => {
			return refund.ingredients.some(a => a.ingredientId === i.ingredientId);
		})
		.map(i => {
			const playerIng = refund.ingredients.find(a => a.ingredientId === i.ingredientId);
			const marketIng = ingredients.find(a => a.itemId === i.ingredientId);
			if (!playerIng || !marketIng) {
				LOGGER.error(
					`Cannot find ingredient ${i.name} in offer or database for offer ${offerId} when player ${playerId} refund.`
				);
				throw new ExpectedError(`Cannot find ingredient ${i.name} in offer or database`);
			}
			return {
				ingredientId: i.ingredientId,
				maxQuantity: shopKeeper ? Math.round(i.maxQuantity * 1.5) : i.maxQuantity,
				futureQuantity: playerIng.quantity + marketIng.quantity
			};
		});
	const itemWithMaxQuantity = Object.values(itemList)
		.filter(i => {
			return items.some(a => a.itemId === i.itemId);
		})
		.filter(i => {
			return refund.items.some(a => a.itemId === i.itemId);
		})
		.map(i => {
			const playerItems = refund.items.find(a => a.itemId === i.itemId);
			const marketItems = items.find(a => a.itemId === i.itemId);
			if (!playerItems || !marketItems) {
				LOGGER.error(
					`Cannot find item ${i.name} in offer or database for offer ${offerId} when player ${playerId} refund.`
				);
				throw new ExpectedError(`Cannot find item ${i.name} in offer or database`);
			}
			return {
				itemId: i.itemId,
				maxQuantity: shopKeeper ? Math.round(i.maxQuantity * 1.5) : i.maxQuantity,
				futureQuantity: playerItems.quantity + marketItems.quantity
			};
		});

	if (ingredientsWithMaxQuantity.some(i => i.futureQuantity > i.maxQuantity)) {
		return 'tooManyIngredients';
	}
	if (itemWithMaxQuantity.some(i => i.futureQuantity > i.maxQuantity)) {
		return 'tooManyItems';
	}
	return true;
}

/**
 * Schedule offers expiration
 */
export const scheduleOffersExpiration = async () => {
	const ongoingOffers = await getOngoingOffers();

	// Process outdated offers immediately
	const outdatedOffers = ongoingOffers.filter(offer => offer.endDate <= new Date());
	const promises = outdatedOffers.map(offer => expireOffer(offer.id));

	await Promise.all(promises);

	// Schedule expiration for remaining offers
	const remainingOffers = ongoingOffers.filter(offer => offer.endDate > new Date());

	remainingOffers.forEach(offer => {
		LOGGER.log(`Scheduling offer ${offer.id} expiration at ${offer.endDate}`);

		scheduleJob(`offer_${offer.id.toString()}`, offer.endDate, () => expireOffer(offer.id));
	});
};

type RefundableOffer = Pick<Offer, 'id' | 'sellerId' | 'sellerPaid' | 'dinozId' | 'endDate'> & {
	items: Pick<OfferItem, 'itemId' | 'quantity' | 'isIngredient'>[];
	bids: Pick<OfferBid, 'userId' | 'value'>[];
};

/** The winner, or the seller of an unsold offer, has one week after the end of the offer to claim it. */
const unclaimedOfferRefundDate = (endDate: Date) => dayjs(endDate).add(1, 'week').toDate();

/**
 * Cancels an offer still unclaimed. Never rejects: node-schedule would emit the error without a listener,
 * which stops the server.
 * @param offer the offer when already loaded, otherwise it is read again since it may have been claimed meanwhile
 */
async function refundUnclaimedOffer(offerId: number, offer?: RefundableOffer) {
	try {
		const current = offer ?? (await getOffer(offerId, OfferStatus.ENDED));
		if (current) {
			await refundEndedOffers(current);
		}
	} catch (err) {
		LOGGER.error(`Cannot refund unclaimed offer ${offerId}: ${err}`);
	}
}

function scheduleUnclaimedOfferRefund(offer: Pick<Offer, 'id' | 'endDate'>) {
	scheduleJob(`offerEnded_${offer.id.toString()}`, unclaimedOfferRefundDate(offer.endDate), () =>
		refundUnclaimedOffer(offer.id)
	);
}

/**
 * Plans again, at startup, the refund of the ended offers. The refund date of an offer is set when it ends:
 * those reached while the server was down are refunded at once.
 */
export const scheduleEndedOffersExpiration = async () => {
	const endedOffers = await getEndedOffers();
	const now = new Date();

	const overdueOffers = endedOffers.filter(offer => unclaimedOfferRefundDate(offer.endDate) <= now);
	await Promise.all(overdueOffers.map(offer => refundUnclaimedOffer(offer.id, offer)));

	endedOffers
		.filter(offer => unclaimedOfferRefundDate(offer.endDate) > now)
		.forEach(offer => {
			LOGGER.log(`Scheduling refund of unclaimed offer ${offer.id} at ${unclaimedOfferRefundDate(offer.endDate)}`);
			scheduleUnclaimedOfferRefund(offer);
		});
};

export const refundEndedOffers = async (offer: RefundableOffer) => {
	// An unclaimed sale is cancelled: the seller gets the content back and the winner their coupons.
	// The seller was never paid, since payment happens when the winner claims.
	const winningBid = offer.bids.reduce<RefundableOffer['bids'][number] | null>(
		(highest, bid) => (highest && highest.value > bid.value ? highest : bid),
		null
	);
	// Sales ended before this rule already paid their seller: they stay claimable by their winner
	if (offer.sellerPaid && winningBid?.userId) {
		return;
	}
	// Fails when the winner or the seller claimed it meanwhile
	if (!(await claimEndedOffer(offer.id))) {
		return;
	}

	const items = offer.items.filter(item => !item.isIngredient);
	const ingredients = offer.items.filter(item => item.isIngredient);

	const refundPromises = [];
	if (offer.sellerId) {
		refundPromises.push(...items.map(item => increaseItemQuantity(offer.sellerId, item.itemId, item.quantity)));
		refundPromises.push(
			...ingredients.map(item => increaseIngredientQuantity(offer.sellerId, item.itemId, item.quantity))
		);
		if (offer.dinozId) {
			refundPromises.push(updateDinoz(offer.dinozId, { unavailableReason: null }));
		}
	}
	if (winningBid?.userId) {
		refundPromises.push(
			increaseItemQuantity(winningBid.userId, itemList[Item.TREASURE_COUPON].itemId, winningBid.value)
		);
	}
	refundPromises.push(deleteOffer(offer.id));

	await Promise.all(refundPromises);
	LOGGER.log(`Cancelling offer ${offer.id}, it expired since ${offer.endDate}`);
};
