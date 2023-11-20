import { Prisma } from "@drpg/prisma";
import { prisma } from "../prisma.js";

export const getAllIngredientsDataRequest = async (playerId: number) => {
	const ingredients = await prisma.playerIngredient.findMany({
		where: {
			playerId
		},
	});
	return ingredients;
};

export const increaseIngredientQuantity = async (playerId: number, ingredientId: number, quantity: number) => {
	const ingredient = await prisma.playerIngredient.update({
		where: {
			ingredientId_playerId: {
				ingredientId,
				playerId
			}
		},
		data: {
			quantity: {
				increment: quantity
			}
		}
	});

	return ingredient;
}

export async function setIngredient(item: Prisma.PlayerIngredientCreateInput) {
	return prisma.playerIngredient.create({
		data: item
	});
}

export async function setMultipleIngredient(
	ingredientList: Prisma.PlayerIngredientCreateManyInput[]
) {
	await prisma.playerIngredient.createMany({
		data: ingredientList
	});
}
