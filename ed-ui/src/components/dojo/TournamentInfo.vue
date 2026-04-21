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
		v-if="tournamentState && tournamentInfo && (!tournamentTeam || tournamentTeam.teamCount === 0)"
	>
		<DZDisclaimer
			:content="$t(`dojo.createTournamentTeam`, { team: tournamentInfo.teamSize, level: tournamentInfo.levelLimit })"
		></DZDisclaimer>
		<SelectDinoz :dinozList="myDinoz" :selectLimit="tournamentInfo.teamSize" @validate="composeMyTeam"></SelectDinoz>
	</div>
	<div class="df aic fdc" v-if="tournamentInfo && tournamentTeam">
		<div class="df jcc fww" v-if="myTeam.length > 0">
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
import { dojoStore, localStore, playerStore, useDinozStore } from '../../store/index.js';
import { DojoService } from '../../services/DojoService.js';
import { errorHandler, utils } from '../../utils/index.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import SelectDinoz from '../dojo/SelectDinoz.vue';
import { UnavailableReason } from '@drpg/prisma/enums';
import { TournamentPhase } from '@drpg/core/models/dojo/tournament';
import DZButton from '../common/DZButton.vue';
import DinozWithoutFlash from '../dinoz/DinozWithoutFlash.vue';
import { formatDateTime } from '../../utils/formatDateTime';

export default defineComponent({
	name: 'TournamentInfo',
	computed: {
		utils() {
			return utils;
		},
		TournamentPhase() {
			return TournamentPhase;
		},
		tournamentTeam() {
			if (!dojoStore().TournamentTeam) {
				return;
			}
			return dojoStore().TournamentTeam;
		},
		tournamentInfo() {
			if (!dojoStore().tournamentInfo) {
				return;
			}
			return dojoStore().tournamentInfo;
		},
		tournamentState() {
			if (!dojoStore().getState) {
				return;
			}
			return dojoStore().getState;
		},
		myDinoz() {
			return useDinozStore()
				.getDinozList.filter(d => d.unavailableReason === null || d.unavailableReason === UnavailableReason.resting)
				.filter(d => this.tournamentInfo?.teamRace.includes(d.race.raceId))
				.filter(d => d.level <= (this.tournamentInfo?.levelLimit ?? 0))
				.map(d => {
					return {
						id: d.id,
						name: d.name,
						display: d.display,
						level: d.level
					};
				});
		},
		worth() {
			return dojoStore().getWorth;
		},
		rank() {
			return dojoStore().getRank;
		},
		myTeam() {
			return dojoStore().getTeam;
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
			localStore: localStore()
		};
	},
	methods: {
		goToPage(pageName: string, params?: string) {
			this.$router.push({ name: pageName, params: { id: params } });
		},
		async deleteTeam() {
			try {
				await DojoService.deleteTournamentTeam();
				dojoStore().update();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async composeMyTeam(validate: boolean, data: number[]) {
			if (validate) {
				try {
					await DojoService.createTournamentTeam(data);
					await dojoStore().update();
				} catch (e) {
					errorHandler.handle(e, this.$toast);
				}
			}
		},
		formatDate(oldDate: Date) {
			return formatDateTime(oldDate.toString());
		}
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
		background-image: url('../../assets/background/home_dojo.webp');
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
	background-image: url('../../assets/battle/forcebrut.webp');
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
