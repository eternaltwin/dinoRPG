import { Moderation, Player, PlayerIngredient, PlayerItem, PlayerQuest, PlayerReward } from '@drpg/prisma';

export type PlayerTypeToSend = Player & {
	items: Pick<PlayerItem, 'itemId' | 'quantity'>[];
	ingredients: Pick<PlayerIngredient, 'ingredientId' | 'quantity'>[];
	quests: Pick<PlayerQuest, 'questId' | 'progression'>[];
	rewards: Pick<PlayerReward, 'rewardId'>[];
	banCase: Moderation;
};
