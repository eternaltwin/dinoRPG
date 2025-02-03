<template>
	<TitleHeader :title="$t('pageTitle.dojo')" :header="$t(`dojo.welcome`)" />
	<div class="wrapper" v-if="myDojo">
		<div class="header df">
			<div class="buttons">
				<img
					v-if="tournamentState.phase === TournamentPhase.QUALIFICATION"
					@click="goToPage('DojoChallenge')"
					:src="getImgURL('icons', 'act_dojo')"
					v-tippy="{
						content: formatContent($t('dojo.accessChallenges')),
						theme: 'small'
					}"
				/>
				<img
					v-else
					@click="goToPage('DojoTournament', tournamentState.id)"
					:src="getImgURL('icons', 'act_dojo')"
					v-tippy="{
						content: formatContent($t('dojo.tournaments')),
						theme: 'small'
					}"
				/>
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
				<p>{{ $t('dojo.ranking') }} : {{ rank }}</p>
			</div>
		</div>
	</div>
	<DZDisclaimer
		v-if="tournamentState.schedule"
		:content="
			$t(`dojo.${tournamentState.phase}`, {
				qualificationStart: formatDate(tournamentState.schedule.qualificationStart),
				qualificationEnd: formatDate(tournamentState.schedule.qualificationEnd),
				poolsStart: formatDate(tournamentState.schedule.poolsStart),
				finalsStart: formatDate(tournamentState.schedule.finalsStart),
				cashPrice: utils.beautifulNumber(tournamentState.cashPrice.toString())
			})
		"
	></DZDisclaimer>
	<div
		class="tournament"
		v-if="myDojo && tournamentInfo && (!myDojo.TournamentTeam || myDojo.TournamentTeam.teamCount === 0)"
	>
		<DZDisclaimer
			:content="$t(`dojo.createTournamentTeam`, { team: tournamentInfo.teamSize, level: tournamentInfo.levelLimit })"
		></DZDisclaimer>
		<SelectDinoz :dinozList="myDinoz" :selectLimit="tournamentInfo.teamSize" @validate="composeMyTeam"></SelectDinoz>
	</div>

	<RouterView />
	<!--	<p class="subtitle">{{ $t('dojo.tidInProgress') }}</p>
	<DZButton @click="goToPage('DojoTournament')">{{ $t('dojo.accessTournament') }}</DZButton>
	<DZDisclaimer round help :content="$t('dojo.disclaimer')" />-->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { dinozStore, localStore, playerStore } from '../store/index.js';
import EventBus from '../events/index.js';
import { DojoBasic } from '@drpg/core/models/dojo/dojoBasic';
import { DojoService } from '../services/DojoService.js';
import { errorHandler, utils } from '../utils/index.js';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import SelectDinoz from '../components/dojo/SelectDinoz.vue';
import { UnavailableReasonFront } from '@drpg/core/models/dinoz/UnavailableReasonFront';
import { DinozDojoFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { TournamentPhase, TournamentState } from '@drpg/core/models/dojo/tournament';

export default defineComponent({
	name: 'DojoHome',
	computed: {
		utils() {
			return utils;
		},
		TournamentPhase() {
			return TournamentPhase;
		}
	},
	components: {
		SelectDinoz,
		DZDisclaimer,
		TitleHeader
	},
	data() {
		return {
			playerStore: playerStore(),
			myDojo: undefined as undefined | DojoBasic,
			worth: 0,
			rank: 0,
			myDinoz: [] as DinozDojoFiche[],
			dinozStore: dinozStore(),
			tournamentInfo: {} as { id: string; teamRace: number[]; teamSize: number; levelLimit: number },
			tournamentState: {} as TournamentState,
			localStore: localStore()
		};
	},
	methods: {
		goToPage(pageName: string, params?: string) {
			this.$router.push({ name: pageName, params: { id: params } });
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
				this.tournamentState = response.tournament;
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
			if (this.myDojo) {
				const totalVictory = this.myDojo.DojoChallengeHistory.filter(f => f.victory).length;
				const totalFight = this.myDojo.DojoChallengeHistory.length;
				const worth = Math.round((totalVictory / totalFight) * 100);
				this.worth = isNaN(worth) ? 0 : worth;
			}
		},
		formatDate(oldDate: Date) {
			const date = new Date(oldDate.toString());
			const lang = this.localStore.getLanguage ?? 'fr';

			// Formatter pour la date (jour, mois, année)
			const dateFormatter = new Intl.DateTimeFormat(lang, { day: '2-digit', month: 'short', year: 'numeric' });
			const formattedDate = dateFormatter.format(date);

			// Formatter pour l'heure (heure, minute, seconde)
			const timeFormatter = new Intl.DateTimeFormat(lang, {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			});
			const formattedTime = timeFormatter.format(date);

			// Combinaison date + heure
			return `${formattedDate}, ${formattedTime}`;
		}
	},
	async mounted() {
		EventBus.on('refreshDojo', async e => {
			if (e) await this.refresh();
		});
		await this.refresh();
		if (this.myDojo && !this.myDojo.TournamentTeam) {
			const tournamentInfo = await DojoService.getTournamentInfo();
			const races = tournamentInfo.teamRace.split(',').map(d => parseInt(d));
			this.tournamentInfo.id = tournamentInfo.id;
			this.tournamentInfo.levelLimit = tournamentInfo.levelLimit;
			this.tournamentInfo.teamRace = races;
			this.tournamentInfo.teamSize = tournamentInfo.teamSize;

			this.myDinoz = this.dinozStore.getDinozList
				.filter(d => d.unavailableReason !== UnavailableReasonFront.frozen)
				.filter(d => races.includes(d.race.raceId))
				.filter(d => d.level <= tournamentInfo.levelLimit)
				.map(d => {
					return {
						id: d.id,
						name: d.name,
						display: d.display,
						level: d.level
					};
				});
		}
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
</style>
