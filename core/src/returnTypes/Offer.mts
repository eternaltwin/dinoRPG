import { Dinoz, Offer, OfferBid, OfferItem, Player } from "@drpg/prisma";

export type OfferFromGetOffers = Offer & {
	seller: Pick<Player, 'id' | 'name'>;
	dinoz: Pick<Dinoz, 'id' | 'name'> | null;
	items: Pick<OfferItem, 'itemId' | 'quantity' | 'isIngredient'>[];
	bids: Pick<OfferBid, 'userId' | 'value'>[];
}
