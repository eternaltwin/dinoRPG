<template>
	<TitleHeader :title="$t('pageTitle.dojo')" :header="$t(`dojo.welcome`)" />
	<div class="wrapper" v-if="myDojo">
		<div class="header df">
			<div class="buttons">
				<img
					v-if="tournamentState && tournamentState.phase === TournamentPhase.QUALIFICATION"
					@click="goToPage('DojoChallenge')"
					:src="getImgURL('icons', 'act_defi')"
					v-tippy="{
						content: formatContent($t('dojo.accessChallenges')),
						theme: 'small'
					}"
				/>
				<RouterLink
					v-else-if="tournamentState"
					:to="{
						name: 'DojoTournament',
						params: { id: tournamentState.id, group: '0' }
					}"
				>
					<img
						:src="getImgURL('icons', 'act_tournoi')"
						v-tippy="{
							content: formatContent($t('dojo.tournaments')),
							theme: 'small'
						}"
					/>
				</RouterLink>
				<img
					@click="goToPage('ChallengeFriend')"
					:src="getImgURL('design', 'dojo_test')"
					v-tippy="{
						content: formatContent($t('dojo.testDinoz')),
						theme: 'small'
					}"
				/>
				<img
					@click="goToPage('DojoHistory')"
					:src="getImgURL('design', 'dojo_history')"
					v-tippy="{
						content: formatContent($t('dojo.fightHistory')),
						theme: 'small'
					}"
				/>
				<img
					@click="goToPage('DojoRanking')"
					:src="getImgURL('design', 'dojo_ranking')"
					v-tippy="{
						content: formatContent($t('dojo.ranking')),
						theme: 'small'
					}"
				/>
				<img
					@click="goToPage('TournamentHistory')"
					:src="getImgURL('design', 'dojo_history')"
					v-tippy="{
						content: formatContent($t('dojo.tournamentHistory')),
						theme: 'small'
					}"
				/>
				<RouterLink
					v-if="tournamentState && tournamentState.phase === TournamentPhase.QUALIFICATION"
					:to="{
						name: 'TournamentInfo'
					}"
				>
					<img
						:src="getImgURL('icons', 'act_sun')"
						v-tippy="{
							content: formatContent($t('dojo.team')),
							theme: 'small'
						}"
					/>
				</RouterLink>
				<!--			<img
					@click="goToPage('DojoTeam')"
					:src="getImgURL('icons', 'act_dojo')"
					v-tippy="{
						content: formatContent($t('dojo.team')),
						theme: 'small'
					}"
				/>
				<img
					@click="goToPage('DojoTournament')"
					:src="getImgURL('icons', 'act_dojo')"
					v-tippy="{
						content: formatContent($t('dojo.tournaments')),
						theme: 'small'
					}"
				/>
				<img
					:src="getImgURL('icons', 'act_dojo')"
					class="disabled"
					v-tippy="{
						content: formatContent($t('dojo.build')),
						theme: 'small'
					}"
				/>-->
			</div>
			<div class="header-text df jcsb">
				<p class="ttu">
					{{ $t('dojo.reputation') }} : {{ myDojo.reputation }} {{ $t('dojo.points') }} - {{ $t('dojo.worth') }} :
					{{ worth }}%
				</p>
				<p>{{ $t('dojo.position') }} : {{ rank }}</p>
			</div>
		</div>
		<DojoTimer v-if="tournamentState" :state="tournamentState" />
	</div>
	<RouterView />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { localStore } from '../store/index.js';
import EventBus from '../events/index.js';
import { DojoBasic } from '@drpg/core/models/dojo/dojoBasic';
import { DojoService } from '../services/DojoService.js';
import { errorHandler } from '../utils/index.js';
import { DinozDojoFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { TournamentPhase, TournamentState } from '@drpg/core/models/dojo/tournament';
import DojoTimer from '../components/dojo/DojoTimer.vue';
import { formatDateTime } from '../utils/formatDateTime';

export default defineComponent({
	name: 'DojoHome',
	computed: {
		TournamentPhase() {
			return TournamentPhase;
		}
	},
	components: {
		DojoTimer,
		TitleHeader
	},
	data() {
		return {
			myDojo: undefined as undefined | DojoBasic,
			worth: 0,
			rank: 0,
			tournamentInfo: {} as { id: string; teamRace: number[]; teamSize: number; levelLimit: number },
			tournamentState: undefined as undefined | TournamentState,
			localStore: localStore(),
			myTeam: [] as DinozDojoFiche[]
		};
	},
	methods: {
		goToPage(pageName: string, params?: string) {
			this.$router.push({ name: pageName, params: { id: params } });
		},
		async displayTeam() {
			try {
				this.myTeam = await DojoService.getTournamentTeam();
				await this.refresh();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async deleteTeam() {
			try {
				this.myTeam = [] as DinozDojoFiche[];
				await DojoService.deleteTournamentTeam();
				await this.refresh();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async composeMyTeam(data) {
			try {
				await DojoService.createTournamentTeam(data);
				await this.refresh();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async refresh() {
			try {
				const response = await DojoService.getMyDojo();
				this.myDojo = response.dojo;
				this.rank = response.rank;
				if (response.tournament) {
					this.tournamentState = response.tournament;
				}
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
			if (this.myDojo) {
				const totalVictory = this.myDojo.DojoChallengeHistory.filter(f => f.victory).length;
				const totalFight = this.myDojo.DojoChallengeHistory.length;
				const worth = Math.round((totalVictory / totalFight) * 100);
				this.worth = isNaN(worth) ? 0 : worth;
				if (!this.myDojo.TournamentTeam && this.tournamentState) {
					const tournamentInfo = await DojoService.getTournamentInfo();
					const races = tournamentInfo.teamRace.split(',').map(d => parseInt(d));
					this.tournamentInfo.id = tournamentInfo.id;
					this.tournamentInfo.levelLimit = tournamentInfo.levelLimit;
					this.tournamentInfo.teamRace = races;
					this.tournamentInfo.teamSize = tournamentInfo.teamSize;
				}
			}
		},
		formatDate(oldDate: Date) {
			return formatDateTime(oldDate.toString());
		}
	},
	async mounted() {
		EventBus.on('refreshDojo', async e => {
			if (e) await this.refresh();
		});
		await this.refresh();
	},
	unmounted() {
		EventBus.off('refreshDojo');
	}
});
</script>

<style lang="scss" scoped>
.subtitle {
	text-transform: uppercase;
	font-weight: bold;
	text-align: center;
}

.wrapper {
	background-color: #4d2713;
	margin-bottom: 8px;
	border: 1px solid #bc683c;
	align-self: center;
	max-width: 530px;
	width: 95%;

	.header {
		background-image: url('../assets/background/home_dojo.webp');
		background-repeat: no-repeat;
		align-items: center;

		height: 288px;
		flex-direction: column-reverse;

		.header-text {
			width: 96%;
			padding: 4px;
			//background-color: rgba(0, 0, 0, 0.5);
			color: #fff;

			p:last-child {
				color: #aae59c;
			}
		}
	}

	.buttons {
		display: flex;
		gap: 8px;
		padding: 8px;
		height: 47px;
		align-self: baseline;

		img {
			display: block;
			cursor: pointer;
			flex-shrink: 0;
			flex-grow: 0;
			height: 50px;

			&.disabled {
				filter: grayscale(100%);
			}
		}
	}
}
.dinoz-button {
	max-width: 96px;
	margin: 4px;
	border-radius: 5px;
	text-align: center;
	border: 1px solid #874b2e;
	cursor: pointer;
	user-select: none;
	display: flex;
	flex-direction: column;
	background-image: url('../assets/battle/forcebrut.webp');
	background-repeat: no-repeat;
	background-size: cover;
	background-position-x: center;
	background-position-y: -4px;
	position: relative;

	.delete {
		position: absolute;
		right: 3px;
		top: 3px;

		&:hover {
			filter: brightness(120%);
		}
	}
	.textbox {
		background: rgb(255 249 0);
		background: linear-gradient(180deg, rgb(255 249 0) 0%, rgb(176 153 20) 100%);
		border-top: 1px solid #874b2e;
		border-bottom-left-radius: 5px;
		border-bottom-right-radius: 5px;
		font-size: 10px;
		font-weight: bold;

		.name {
			color: #874b2e;
		}

		.level {
			color: #fce3bc;
		}
	}
}
</style>
