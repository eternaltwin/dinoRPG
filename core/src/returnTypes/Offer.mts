import { Dinoz, DinozSkill, DinozStatus, Offer, OfferBid, OfferItem, Player } from '@drpg/prisma';

export type OfferFromGetOffers = Offer & {
	seller: Pick<Player, 'id' | 'name'>;
	dinoz:
		| (Pick<
				Dinoz,
				| 'id'
				| 'name'
				| 'level'
				| 'raceId'
				| 'nbrUpFire'
				| 'nbrUpWater'
				| 'nbrUpLightning'
				| 'nbrUpWood'
				| 'nbrUpAir'
				| 'display'
		  > & {
				status: Pick<DinozStatus, 'statusId'>[];
				skills: Pick<DinozSkill, 'skillId'>[];
		  })
		| null;
	items: Pick<OfferItem, 'itemId' | 'quantity' | 'isIngredient'>[];
	bids: (Pick<OfferBid, 'value'> & {
		user: Pick<Player, 'id' | 'name'>;
	})[];
};

export type EnhancedOffer = Omit<OfferFromGetOffers, 'items'> & {
	items: {
		itemId: number;
		quantity: number;
		isIngredient: boolean;
		name: string;
	}[];
};
