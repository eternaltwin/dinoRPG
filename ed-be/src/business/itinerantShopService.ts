import { DinozStatusId } from "@drpg/core/models/dinoz/StatusList";
import { IngredientFiche } from "@drpg/core/models/ingredient/IngredientFiche";
import { ingredientList } from "@drpg/core/models/ingredient/ingredientList";
import { ItinerantShopFiche } from "@drpg/core/models/shop/ItinerantShopFiche";
import { itinerantShopList } from "@drpg/core/models/shop/ItinerantShopList";
import { Dinoz, DinozStatus, LogType, PlayerIngredient } from "@drpg/prisma";
import { PlaceEnum } from "@drpg/core/models/enums/PlaceEnum";
import { Request } from "express";
import dayjs from "dayjs";
import { createLog } from "../dao/logDao.js";
import { getPlayerShopIngredientsDataRequest, addMoney } from "../dao/playerDao.js";
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

    // TODO: Check Dinoz Place 

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