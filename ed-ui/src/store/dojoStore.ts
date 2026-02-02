import { defineStore } from 'pinia';
import { StoreDojo } from '@drpg/core/models/store/StoreDojo';
import { DojoService } from '../services/DojoService';

export const dojoStore = defineStore('dojoStore', {
	state: (): StoreDojo => ({
		dojoId: undefined,
		activeChallenge: undefined,
		reputation: 0,
		DojoChallengeHistory: undefined,
		TournamentTeam: undefined,
		currentTournament: null,
		rank: 0,
		worth: 0
	}),
	getters: {
		getReputation: (state: StoreDojo) => state.reputation,
		getWorth: (state: StoreDojo) => state.worth,
		getRank: (state: StoreDojo) => state.rank,
		getState: (state: StoreDojo) => state.currentTournament
		// getDojo: (state: StoreDojo) => state.dojo,
		// getTournament: (state: StoreDojo) => state.tournament
	},
	actions: {
		async update() {
			const response = await DojoService.getMyDojo();
			this.dojoId = response.dojo.id;
			this.activeChallenge = response.dojo.activeChallenge;
			this.reputation = response.dojo.reputation;
			this.DojoChallengeHistory = response.dojo.DojoChallengeHistory;
			this.TournamentTeam = response.dojo.TournamentTeam;
			this.rank = response.rank;
			this.currentTournament = response.tournament;

			const totalVictory = this.DojoChallengeHistory.filter(f => f.victory).length;
			const totalFight = this.DojoChallengeHistory.length;
			const worth = Math.round((totalVictory / totalFight) * 100);
			this.worth = isNaN(worth) ? 0 : worth;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
