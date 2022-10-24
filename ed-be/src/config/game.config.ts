import { getEnvironnement } from '../utils/context.js';

const gameConfig: GameConfig = {
	development: {
		dinoz: {
			maxLevel: 80
		},
		shop: {
			dinozNumber: 30,
			buyableQuetzu: 6
		},
		general: {
			initialMoney: 1000000
		}
	},
	production: {
		dinoz: {
			maxLevel: 80
		},
		shop: {
			dinozNumber: 30,
			buyableQuetzu: 6
		},
		general: {
			initialMoney: 200000
		}
	}
};

interface GameConfig {
	[envName: string]: {
		dinoz: {
			maxLevel: number;
		};
		shop: {
			dinozNumber: number;
			buyableQuetzu: number;
		};
		general: {
			initialMoney: number;
		};
	};
}

export default gameConfig[getEnvironnement()];
