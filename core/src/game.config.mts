import type { GoldDiminishingCurve } from './utils/fightGold.mjs';

const gameConfig: GameConfig = {
	development: {
		dinoz: {
			maxLevel: 50,
			maxQuantity: 18,
			leaderMessieBonus: 3,
			initialMaxLevel: 50
		},
		shop: {
			dinozNumber: 10,
			buyableQuetzu: 6
		},
		demonShop: {
			dinozNumber: 5
		},
		general: {
			initialMoney: 1000000,
			dailyGridRewards: 10,
			fightGoldDiminishing: { start: 400000, end: 500000, floorRate: 0.1 }
		}
	},
	production: {
		dinoz: {
			maxLevel: 50,
			maxQuantity: 18,
			leaderMessieBonus: 3,
			initialMaxLevel: 50
		},
		shop: {
			dinozNumber: 30,
			buyableQuetzu: 6
		},
		demonShop: {
			dinozNumber: 5
		},
		general: {
			initialMoney: 200000,
			dailyGridRewards: 5,
			fightGoldDiminishing: { start: 400000, end: 500000, floorRate: 0.1 }
		}
	}
};

export interface GameConfig {
	[envName: string]: {
		dinoz: {
			maxLevel: number;
			maxQuantity: number;
			leaderMessieBonus: number;
			initialMaxLevel: number;
		};
		shop: {
			dinozNumber: number;
			buyableQuetzu: number;
		};
		demonShop: {
			dinozNumber: number;
		};
		general: {
			initialMoney: number;
			dailyGridRewards: number;
			fightGoldDiminishing: GoldDiminishingCurve;
		};
	};
}

export const getGameConfig = (env: string) => {
	return gameConfig[env];
};
