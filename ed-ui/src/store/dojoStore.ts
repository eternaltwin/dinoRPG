import { defineStore } from 'pinia';
import { StoreDojo } from '@drpg/core/models/store/StoreDojo';
import { DojoService, DojoTournamentInfo } from '../services/DojoService';

type DojoState = Omit<StoreDojo, 'tournamentInfo'> & { tournamentInfo?: DojoTournamentInfo };

export const dojoStore = defineStore('dojoStore', {
	state: (): DojoState => ({
		dojoId: undefined,
		activeChallenge: undefined,
		reputation: 0,
		DojoChallengeHistory: undefined,
		TournamentTeam: undefined,
		currentTournament: null,
		rank: 0,
		worth: 0,
		tournamentInfo: undefined,
		myTeam: []
	}),
	getters: {
		getReputation: (state: DojoState) => state.reputation,
		getWorth: (state: DojoState) => state.worth,
		getRank: (state: DojoState) => state.rank,
		getState: (state: DojoState) => state.currentTournament,
		getTeam: (state: DojoState) => state.myTeam
		// getDojo: (state: DojoState) => state.dojo,
		// getTournament: (state: DojoState) => state.tournament
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
			this.tournamentInfo = await DojoService.getTournamentInfo();
			this.myTeam = await DojoService.getTournamentTeam();
		},
		async updateTeam() {
			this.myTeam = await DojoService.getTournamentTeam();
		},
		incrementCashPrice(quantity: number) {
			if (this.currentTournament) {
				this.currentTournament.cashPrice += quantity;
			}
		},
		deleteTeam() {
			this.myTeam = [];
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
