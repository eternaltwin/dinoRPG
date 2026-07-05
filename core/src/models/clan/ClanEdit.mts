import { AdminRole } from "@drpg/prisma/enums";

export interface ClanPage {
	id: number;
	home: boolean;
	name: string;
	content: string;
	clanId: number;
}

export interface ClanIngredient {
	ingredientId: number;
	quantity: number;
}

export interface ClanEdit {
	id: number;
	name: string;
	treasureValue: number;
	ingredients: ClanIngredient[];
	banner: string | null;
	leaderId?: string;
	members: Array<{
		playerId: string;
		rights: string[];
		player: {
			id: string;
			name: string;
		};
	}>;
	pages: ClanPage[];
	langs?: string[];
	role?: AdminRole;
}
