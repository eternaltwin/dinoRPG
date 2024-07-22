import { IngredientFiche } from '@drpg/core/models/ingredient/IngredientFiche';
import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { LogType } from '@drpg/prisma';
import { Request } from 'express';
import { createLog } from '../dao/logDao.js';
import { addMoney } from '../dao/playerDao.js';
import { decreaseIngredientQuantity, getAllIngredientsDataRequest } from '../dao/playerIngredientDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { shopList } from '@drpg/core/models/shop/ShopList';
import { ShopType } from '@drpg/core/models/enums/ShopType';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { getDinozItinerantShop } from '../dao/dinozDao.js';
import { getSpecificSecret } from '../dao/secretDao.js';
import { ShopDTO } from '@drpg/core/models/shop/shopDTO';

/**
 * @summary Get all ingredients from itinerant shop
 * @param req
 * @param req.params.itinerantId {string} ItinerandId
 * @return Array<IngredientFiche>
 */
export async function getIngredientsFromItinerantShop(req: Request): Promise<IngredientFiche[]> {
	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized.`);
	}

	const playerId = req.auth.playerId;
	const dinozId = +req.params.dinozId;

	const player = await getDinozItinerantShop(dinozId, playerId);

	// Throw an exception if the player doesn't exists
	if (!player) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist`);
	}

	const itinerant = await getSpecificSecret('itinerant');
	if (!itinerant) throw new ErrorFormator(500, `No itinerant merchant place found.`);

	const itinerantShop = Object.values(shopList)
		.filter(shop => shop.type === ShopType.ITINERANT)
		.find(s => checkCondition(s.condition, player, dinozId));

	// Throw an exception if the shop does not exist
	if (!itinerantShop || !player.dinoz.some(d => d.placeId === +itinerant.value)) {
		throw new ErrorFormator(500, `This dinoz cannot access itinerant shop`);
	}

	if (itinerantShop.type !== ShopType.ITINERANT) {
		throw new ErrorFormator(500, `Wrong shop returned`);
	}

	return itinerantShop.listItemsSold.map(ingBuy => {
		// Get the ingredient data if the player has it
		const ingredientPlayer = player.ingredients.find(playerIng => playerIng.ingredientId === ingBuy.ingredientId);
		// Get the reference of the ingredients from the constants
		const ingredientReference = Object.values(ingredientList).find(ing => ing.ingredientId === ingBuy.ingredientId);

		if (!ingredientReference) {
			throw new ErrorFormator(500, `Ingredient ${ingBuy.ingredientId} doesn't exist`);
		}

		if (!ingBuy.price) {
			throw new ErrorFormator(500, `Ingredient ${ingBuy.ingredientId} doesn't have a price`);
		}

		// Return a new ingredient object with its properties and data
		return {
			ingredientId: ingredientReference.ingredientId,
			price: ingredientReference.price,
			quantity: ingredientPlayer ? ingredientPlayer.quantity : 0,
			maxQuantity: ingredientReference.maxQuantity
		};
	});
}

/**
 * @summary Sell an ingredient
 * @param req
 * @param req.params.itinerantId {string} ItinerantId
 * @param req.body.ingredientId {string} Ingredient to sell
 * @param req.body.quantity {string} Quantity to sell
 * @return void
 */
export async function sellIngredient(req: Request) {
	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized.`);
	}
	const playerId = req.auth.playerId;
	const dinozId = +req.params.dinozId;
	const ingredients = req.body.ingredients as ShopDTO[];

	const playerIngredients = await getAllIngredientsDataRequest(playerId);

	// Throw an exception if the player doesn't exist
	if (!playerIngredients) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}

	// Lock negative quantities
	if (ingredients.filter(i => i.quantity <= 0).length > 0) {
		throw new ErrorFormator(400, `wrongQuantity`);
	}

	const player = await getDinozItinerantShop(dinozId, playerId);

	// Throw an exception if the player doesn't exists
	if (!player) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist`);
	}

	const itinerant = await getSpecificSecret('itinerant');
	if (!itinerant) throw new ErrorFormator(500, `No itinerant merchant place found.`);

	const itinerantShop = Object.values(shopList)
		.filter(shop => shop.type === ShopType.ITINERANT)
		.find(s => checkCondition(s.condition, player, dinozId));

	// Throw an exception if the shop does not exist
	if (!itinerantShop || !player.dinoz.some(d => d.placeId === +itinerant.value)) {
		throw new ErrorFormator(500, `This dinoz cannot access itinerant shop`);
	}

	if (itinerantShop.type !== ShopType.ITINERANT) {
		throw new ErrorFormator(500, `Wrong shop returned`);
	}

	if (!player) {
		throw new ErrorFormator(500, `Dinoz is without player`);
	}
	// Search if all ingredient are valids
	const mappedIngredient = ingredients.map(i => {
		const playerQuantity = player.ingredients.find(ing => ing.ingredientId === i.itemId);
		if (!playerQuantity) throw new ErrorFormator(500, `Player doesn't have this item in stock.`);
		return {
			...itinerantShop?.listItemsSold.find(a => a.ingredientId === i.itemId),
			quantity: i.quantity,
			playerQuantity: playerQuantity.quantity
		};
	});

	let gold = 0;
	for (const ingre of mappedIngredient) {
		if (!ingre.ingredientId || !ingre.price) throw new ErrorFormator(500, `Undefined ingredient`);
		if (ingre.playerQuantity - ingre.quantity < 0)
			throw new ErrorFormator(500, `You cannot have less than 0 of this item.`);
		gold += ingre.price * ingre.quantity;
		await decreaseIngredientQuantity(playerId, ingre.ingredientId, ingre.quantity);
		await createLog(LogType.IngredientSold, playerId, undefined, ingre.ingredientId, ingre.quantity.toString());
	}

	await addMoney(playerId, gold);

	return { gold: gold };
}
