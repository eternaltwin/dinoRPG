import { IngredientFiche } from "@drpg/core/models/ingredient/IngredientFiche";
import { ingredientList } from "@drpg/core/models/ingredient/ingredientList";
import { ItinerantShopFiche } from "@drpg/core/models/shop/ItinerantShopFiche";
import { itinerantShopList } from "@drpg/core/models/shop/ItinerantShopList";
import { Dinoz, LogType } from "@drpg/prisma";
import { PlaceEnum } from "@drpg/core/models/enums/PlaceEnum";
import { Request } from "express";
import dayjs from "dayjs";
import { createLog } from "../dao/logDao.js";
import { getPlayerShopIngredientsDataRequest, addMoney, getPlayerShopOneIngredientsDataRequest } from "../dao/playerDao.js";
import { decreaseIngredientQuantity } from "../dao/playerIngredientDao.js";
import { ErrorFormator } from "../utils/errorFormator.js";


// Fonction pour calculer l'ID du marchand itinérant en fonction de la date actuelle
function calculateItinerantId(): number {
    // Obtenir le jour actuel en utilisant Day.js
    const currentDay = dayjs().day(); // Day.js retourne un numéro de 0 (dimanche) à 6 (samedi)

    // Si le jour est dimanche (0), retourne itinerantId 7 (dimanche)
    if (currentDay === 0) {
        return 7;
    }

    return currentDay;
}

/**
 * @summary Get all ingredients from itinerant shop
 * @param req
 * @param req.params.itinerantId {string} ItinerandId
 * @return Array<IngredientFiche>
 */
export async function getIngredientsFromItinerantShop(req: Request): Promise<IngredientFiche[]> {
    if (!req.auth?.playerId) {
        throw new ErrorFormator(500, `Unauthorized.`)
    }

    const playerId = req.auth.playerId;
    const itinerantId = calculateItinerantId();
    const itinerantTempShop = Object.values(itinerantShopList).find(itinerantShop => itinerantShop.itinerantId === itinerantId);

    // Throw an exception if the shop does not exist
    if (itinerantTempShop === undefined) {
        throw new ErrorFormator(500, `The itinerant shop ${itinerantId} does not exist`);
    }

    const playerIngShopData = await getPlayerShopIngredientsDataRequest(playerId);

    if (!playerIngShopData) {
        throw new ErrorFormator(500, `Player ${playerId} doesn't exist`)
    }

    checkDinozPlace(itinerantTempShop, playerIngShopData, itinerantId);

    return itinerantTempShop.listIngredients.map(ingBuy => {
        // Get the ingredient data if the player has it
        const ingredientPlayer = playerIngShopData.ingredients.find(playerIng => playerIng.ingredientId === ingBuy.ingredientId);
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
        }
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
    const itinerantId = +req.params.itinerantId;
    const ingredientId = +req.body.ingredientId;
    const quantitySelled = +req.body.quantity; 

    const playerIngShopData = await getPlayerShopOneIngredientsDataRequest(playerId, ingredientId);

    if (!playerIngShopData) {
        throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`)
    }

    const playerIngData = playerIngShopData.ingredients.find(ing => ing.ingredientId === ingredientId);

    if (quantitySelled <= 0) {
        throw new ErrorFormator(400, `wrongQuantity`);
    }

    const theItinerantShop: ItinerantShopFiche | undefined = Object.values(itinerantShopList).find(itinerantShop => itinerantShop.itinerantId === itinerantId);

    if (!theItinerantShop) {
        throw new ErrorFormator(500, `The itinerant shop ${itinerantId} does not exist`);
    }

    checkDinozPlace(theItinerantShop, playerIngShopData, itinerantId);

    const ingSell = theItinerantShop.listIngredients.find(ing => ing.ingredientId === ingredientId);
    if (ingSell === undefined) {
        throw new ErrorFormator(500, `The ingredient ${ingredientId} does not exist in this shop`)
    }

    const ingredientReference = Object.values(ingredientList).find(ing => ing.ingredientId === ingredientId);

    if (!ingredientReference) {
        throw new ErrorFormator(500, `Ingredient ${ingredientId} doesn't exist.`);
    }

    if (!ingSell.price) {
        throw new ErrorFormator(500, `Ingredient ${ingredientId} doesn't have a price.`)
    }

    ingredientReference.price = ingSell.price;
    ingredientReference.quantity = playerIngData ? playerIngData.quantity - quantitySelled : quantitySelled;

    const maxQuantityAvailable = playerIngData ? playerIngData.quantity : 0;

    if (quantitySelled > maxQuantityAvailable) {
        throw new ErrorFormator(400, `enoughQuantity`);
    }

    await addMoney(playerId, ingredientReference.price * quantitySelled);

    if (playerIngData) {
        await decreaseIngredientQuantity(
            playerId,
            ingredientReference.ingredientId,
            quantitySelled
        )
    }

    await createLog(
        LogType.GoldWon,
        playerId,
        undefined,
        ingredientReference.ingredientId.toString(),
        ingredientReference.quantity.toString()
    );
}

// Check if player can access the shop
// The check is done for the shops that are not accessible from anywhere (i.e does not apply to the flying shop)
function checkDinozPlace(
	theItinerantShop: ItinerantShopFiche,
	player: {
		dinoz: (Pick<Dinoz, 'placeId'>)[];
	},
	itinerantId: number
) {
    // Check at least one dinoz that is not frozen or sacrificed is at the location of the shop
			if (!player.dinoz.some(dinoz => dinoz.placeId === theItinerantShop.placeId)) {
				throw new ErrorFormator(500, `You don't have any dinoz at the shop's location ${itinerantId}`);
			}
}