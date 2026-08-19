import { StoreStateSession } from '@drpg/core/models/store/StoreStateSession';
import { defineStore } from 'pinia';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { LiveStatsType } from '@drpg/core/models/store/LiveStats';
import { StartRunResult } from '@drpg/core/models/dungeon/DungeonClient';

export const sessionStore = defineStore('sessionStore', {
	state: (): StoreStateSession => ({
		fight: undefined,
		tab: 1,
		fromFight: false,
		liveStats: {
			connectedPlayers: 0,
			totalDinoz: 0,
			totalPlayers: 0
		},
		dungeonRun: undefined
	}),
	getters: {
		getFightResult: (state: StoreStateSession) => state.fight,
		getTab: (state: StoreStateSession) => state.tab,
		getLiveStats: (state: StoreStateSession) => state.liveStats,
		getDungeonRun: (state: StoreStateSession) => state.dungeonRun
	},
	actions: {
		setFightResult(fight: FightResult | undefined): void {
			this.fight = fight;
		},
		setTab(tab: number): void {
			this.tab = tab;
		},
		setLiveStats(stats: LiveStatsType): void {
			this.liveStats = stats;
		},
		setDungeonRun(run: StartRunResult | undefined): void {
			this.dungeonRun = run;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
