import { loadConfig } from '../config/config.js';

const gameConfig: GameConfig = {
	development: {
		dinoz: {
			maxLevel: 50,
			maxQuantity: 10,
			leaderBonus: 3,
			initialMaxLevel: 50
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
			maxLevel: 50,
			maxQuantity: 18,
			leaderBonus: 3,
			initialMaxLevel: 50
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
			maxQuantity: number;
			leaderBonus: number;
			initialMaxLevel: number;
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

const env = loadConfig().isProduction ? 'production' : 'development';

export default gameConfig[env];
