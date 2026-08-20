import { IngredientFiche } from '@drpg/core/models/ingredient/IngredientFiche';
import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { LogType } from '@drpg/prisma';
import { Request } from 'express';
import { createLog } from '../dao/logDao.js';
import { addMoney, auth } from '../dao/playerDao.js';
import { decreaseIngredientQuantity, getAllIngredientsDataRequest } from '../dao/playerIngredientDao.js';
import { shopList } from '@drpg/core/models/shop/ShopList';
import { ShopType } from '@drpg/core/models/enums/ShopType';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { getDinozItinerantShop } from '../dao/dinozDao.js';
import { getSpecificSecret } from '../dao/secretDao.js';
import { ShopDTO } from '@drpg/core/models/shop/shopDTO';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/server/translate.js';

/**
 * @summary Get all ingredients from itinerant shop
 * @param req
 * @param req.params.itinerantId {string} ItinerandId
 * @return Array<IngredientFiche>
 */
export async function getIngredientsFromItinerantShop(req: Request): Promise<IngredientFiche[]> {
	const authed = await auth(req);

	const playerId = authed.id;
	const dinozId = +req.params.dinozId;

	const player = await getDinozItinerantShop(dinozId, playerId);

	// Throw an exception if the player doesn't exists
	if (!player) {
		throw new ExpectedError(`Player ${playerId} doesn't exist`);
	}

	const itinerant = await getSpecificSecret('itinerant');
	if (!itinerant) throw new ExpectedError(`No itinerant merchant place found.`);

	const itinerantShop = Object.values(shopList)
		.filter(shop => shop.type === ShopType.ITINERANT)
		.find(s => checkCondition(s.condition, player, dinozId));

	// Throw an exception if the shop does not exist
	if (!itinerantShop || !player.dinoz.some(d => d.placeId === +itinerant.value)) {
		throw new ExpectedError(`This dinoz cannot access itinerant shop`);
	}

	if (itinerantShop.type !== ShopType.ITINERANT) {
		throw new ExpectedError(`Wrong shop returned`);
	}

	return itinerantShop.listItemsSold.map(ingBuy => {
		// Get the ingredient data if the player has it
		const ingredientPlayer = player.ingredients.find(playerIng => playerIng.ingredientId === ingBuy.id);
		// Get the reference of the ingredients from the constants
		const ingredientReference = Object.values(ingredientList).find(ing => ing.ingredientId === ingBuy.id);

		if (!ingredientReference) {
			throw new ExpectedError(`Ingredient ${ingBuy.id} doesn't exist`);
		}

		if (!ingBuy.price) {
			throw new ExpectedError(`Ingredient ${ingBuy.id} doesn't have a price`);
		}

		// Return a new ingredient object with its properties and data
		return {
			name: ingredientReference.name,
			ingredientId: ingredientReference.ingredientId,
			price: ingredientReference.price,
			quantity: ingredientPlayer ? ingredientPlayer.quantity : 0,
			maxQuantity: player.shopKeeper ? Math.round(ingredientReference.maxQuantity * 1.5) : ingredientReference.maxQuantity
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
	const authed = await auth(req);
	const dinozId = +req.params.dinozId;
	const ingredients = req.body.ingredients as ShopDTO[];

	const playerIngredients = await getAllIngredientsDataRequest(authed.id);

	// Throw an exception if the player doesn't exist
	if (!playerIngredients) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}

	// Lock negative quantities
	if (ingredients.filter(i => i.quantity <= 0 || !Number.isInteger(i.quantity)).length > 0) {
		throw new ExpectedError(translate(`wrongQuantity`, authed));
	}

	const player = await getDinozItinerantShop(dinozId, authed.id);

	// Throw an exception if the player doesn't exists
	if (!player) {
		throw new ExpectedError(`Player ${authed.id} doesn't exist`);
	}

	const itinerant = await getSpecificSecret('itinerant');
	if (!itinerant) throw new ExpectedError(`No itinerant merchant place found.`);

	const itinerantShop = Object.values(shopList)
		.filter(shop => shop.type === ShopType.ITINERANT)
		.find(s => checkCondition(s.condition, player, dinozId));

	// Throw an exception if the shop does not exist
	if (!itinerantShop || !player.dinoz.some(d => d.placeId === +itinerant.value)) {
		throw new ExpectedError(`This dinoz cannot access itinerant shop`);
	}

	if (itinerantShop.type !== ShopType.ITINERANT) {
		throw new ExpectedError(`Wrong shop returned`);
	}

	if (!player) {
		throw new ExpectedError(`Dinoz is without player`);
	}
	// Search if all ingredient are valids
	const mappedIngredient = ingredients.map(i => {
		const playerQuantity = player.ingredients.find(ing => ing.ingredientId === i.itemId);
		const itemToMap = itinerantShop.listItemsSold.find(a => a.id === i.itemId);
		if (!playerQuantity || !itemToMap) throw new ExpectedError(`Player doesn't have this item in stock.`);

		return {
			...itemToMap,
			quantity: i.quantity,
			playerQuantity: playerQuantity.quantity
		};
	});

	let gold = 0;
	for (const ingre of mappedIngredient) {
		if (!ingre.id || !ingre.price) throw new ExpectedError(`Undefined ingredient`);
		if (ingre.playerQuantity - ingre.quantity < 0) throw new ExpectedError(`You cannot have less than 0 of this item.`);
		gold += ingre.price * ingre.quantity;
		await decreaseIngredientQuantity(authed.id, ingre.id, ingre.quantity);
		await createLog(LogType.IngredientSold, authed.id, undefined, ingre.id, ingre.quantity.toString());
	}

	await addMoney(authed.id, gold);

	return { gold: gold };
}
