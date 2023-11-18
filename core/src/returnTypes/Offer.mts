// Temp offer typing
export type Offer = {
	id: number;
	seller: {
		id: number;
		name: string;
	};
	endDate: string;
	dinoz: {
		name: string;
	} | null;
	items: {
		id: number;
		quantity: number;
	}[];
	bid: {
		user: {
			id: number;
			name: string;
		};
		value: number;
	} | null;
};
