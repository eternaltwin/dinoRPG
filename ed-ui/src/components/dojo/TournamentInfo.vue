<template>
	<DZDisclaimer
		v-if="tournamentState && tournamentState.schedule"
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
		v-if="
			myDojo && tournamentState && tournamentInfo && (!myDojo.TournamentTeam || myDojo.TournamentTeam.teamCount === 0)
		"
	>
		<DZDisclaimer
			:content="$t(`dojo.createTournamentTeam`, { team: tournamentInfo.teamSize, level: tournamentInfo.levelLimit })"
		></DZDisclaimer>
		<SelectDinoz :dinozList="myDinoz" :selectLimit="tournamentInfo.teamSize" @validate="composeMyTeam"></SelectDinoz>
	</div>
	<div class="df aic fdc" v-if="myDojo && tournamentInfo && myDojo.TournamentTeam">
		<DZButton @click="displayTeam" v-if="myTeam.length === 0">{{ $t('dojo.team') }}</DZButton>
		<div class="df" v-if="myTeam.length > 0">
			<div v-for="dinoz in myTeam" :key="dinoz.id" class="dinoz-button">
				<DinozWithoutFlash :display="dinoz.display" :life="1" />

				<div class="textbox">
					<p class="name">{{ dinoz.name }}</p>
					<p class="level">{{ $t('myAccount.level') }} {{ dinoz.level }}</p>
				</div>
			</div>
		</div>
		<DZButton @click="deleteTeam" v-if="myTeam.length > 0">{{ $t('dojo.deleteTeam') }}</DZButton>
	</div>
	<DZDisclaimer v-if="!tournamentState" :content="$t(`dojo.noTournament`)"></DZDisclaimer>

	<RouterView />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dinozStore, localStore, playerStore } from '../../store/index.js';
import EventBus from '../../events/index.js';
import { DojoBasic } from '@drpg/core/models/dojo/dojoBasic';
import { DojoService } from '../../services/DojoService.js';
import { errorHandler, utils } from '../../utils/index.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import SelectDinoz from '../dojo/SelectDinoz.vue';
import { UnavailableReasonFront } from '@drpg/core/models/dinoz/UnavailableReasonFront';
import { DinozDojoFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { TournamentPhase, TournamentState } from '@drpg/core/models/dojo/tournament';
import DZButton from '../common/DZButton.vue';
import DinozWithoutFlash from '../dinoz/DinozWithoutFlash.vue';

export default defineComponent({
	name: 'TournamentInfo',
	computed: {
		utils() {
			return utils;
		},
		TournamentPhase() {
			return TournamentPhase;
		}
	},
	components: {
		DinozWithoutFlash,
		DZButton,
		SelectDinoz,
		DZDisclaimer
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
