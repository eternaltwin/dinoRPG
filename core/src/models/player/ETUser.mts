export type ETUser = {
	type: 'User';
	id: string;
	links?: {
		twinoid: {
			current: {
				user: {
					type: 'TwinoidUser';
					id: string;
					display_name: string;
				};
			} | null;
			old: [];
		};
	};
};
