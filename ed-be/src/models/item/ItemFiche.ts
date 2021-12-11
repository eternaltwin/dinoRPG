export interface ItemFiche {
	itemId: number;
	name: string;
	quantity: number;
	maxQuantity: number;
	canBeEquipped: boolean;
	canBeUsedNow: boolean;
	price: number;
}
