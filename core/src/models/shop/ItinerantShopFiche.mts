import { IngredientFiche } from "../ingredient/IngredientFiche.mjs";
import { Condition } from "../npc/NpcConditions.mjs";

export interface ItinerantShopFiche {
    itinerantId: number;
    placeId: number;
    listIngredients: Partial<IngredientFiche>[];
    condition?: Condition;
}