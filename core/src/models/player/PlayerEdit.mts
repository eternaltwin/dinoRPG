export interface PlayerEdit {
	customText?: string;
	hasImported?: boolean;
	rewards?: string[];
	items?: string[];
	ingredients?: string[];
	selectedItem?: number;
	selectedIngredient?: number;
	itemQuantity: number;
	ingredientQuantity: number;
	epicOperation?: string;
	itemOperation?: string;
	ingOperation?: string;
	money?: number;
	operation?: string;
	quetzuBought?: number;
	leader?: boolean;
	engineer?: boolean;
	cooker?: boolean;
	shopKeeper?: boolean;
	merchant?: boolean;
	priest?: boolean;
	teacher?: boolean;
	messie?: boolean;
	matelasseur?: boolean;
	role?: 'admin' | 'beta' | 'player';
}
