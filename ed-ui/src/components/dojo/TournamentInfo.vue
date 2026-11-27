<template>
	<DZDisclaimer
		v-if="tournamentState && tournamentState.schedule"
		:content="
			$t(`dojo.${tournamentState.phase}`, {
				qualificationStart: formatDate(tournamentState.schedule.qualificationStart),
				qualificationEnd: formatDate(tournamentState.schedule.qualificationEnd),
				poolsStart: formatDate(tournamentState.schedule.poolsStart),
				finalsStart: formatDate(tournamentState.schedule.finalsStart),
				cashPrice: formatNumber(tournamentState.cashPrice)
			})
		"
	></DZDisclaimer>
	<TournamentArchetype v-if="tournamentState && tournamentInfo" :info="tournamentInfo" />
	<div
		class="tournament"
		v-if="tournamentState && tournamentInfo && (!tournamentTeam || tournamentTeam.teamCount === 0)"
	>
		<DZDisclaimer
			:content="
				$t(`dojo.createTournamentTeam`, {
					team: tournamentInfo.teamSize,
					level: tournamentInfo.levelLimit,
					races: tournamentInfo.teamRace.map(r => $t(`race.name.${raceList[r]}`)).join(', ')
				})
			"
		></DZDisclaimer>
		<SelectDinoz
			:dinozList="myDinoz"
			:selectLimit="tournamentInfo.teamSize"
			:minLimit="tournamentInfo.teamSize"
			:ruleError="ruleError"
			@change="selection = $event"
			@validate="composeMyTeam"
		></SelectDinoz>
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
import { errorHandler } from '../../utils/index.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import SelectDinoz from '../dojo/SelectDinoz.vue';
import { UnavailableReason } from '@drpg/prisma/enums';
import { TournamentPhase } from '@drpg/core/models/dojo/tournament';
import DZButton from '../common/DZButton.vue';
import DinozWithoutFlash from '../dinoz/DinozWithoutFlash.vue';
import { formatDateTime } from '../../utils/formatDateTime';
import { raceList } from '../../constants/race.js';
import { formatNumber } from '@drpg/core/utils/string';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { raceNameKey, safeValidateTeam, toTeamDinoz } from '../../utils/dojo.js';
import TournamentArchetype from './TournamentArchetype.vue';

export default defineComponent({
	name: 'TournamentInfo',
	computed: {
		formatNumber() {
			return formatNumber;
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
		/** First rule broken by the selected team (translated), null when valid or when the check cannot run */
		ruleError(): string | null {
			const info = this.tournamentInfo;
			if (!info || this.selection.length < info.teamSize) return null;
			const team = this.selection
				.map(id => useDinozStore().getDinozList.find(d => d.id === id))
				.filter((d): d is DinozFiche => d !== undefined)
				.map(toTeamDinoz);
			const error = safeValidateTeam(team, {
				teamSize: info.teamSize,
				raceMinimum: info.raceMinimum ?? 1,
				teamRace: info.teamRace,
				levelLimit: info.levelLimit,
				rules: info.rules ?? {}
			});
			if (!error) return null;
			return this.$t(`tournament.archetype.error.${error.key}`, this.formatErrorParams(error.params));
		},
		myDinoz() {
			return useDinozStore()
				.getDinozList.filter(
					d =>
						d.unavailableReason !== UnavailableReason.frozen &&
						d.unavailableReason !== UnavailableReason.sacrificed &&
						d.unavailableReason !== UnavailableReason.unfreezing &&
						d.unavailableReason !== UnavailableReason.unsacrificing &&
						d.unavailableReason !== UnavailableReason.selling
				)
				.filter(d => this.tournamentInfo?.teamRace.includes(d.race.raceId))
				.filter(d => d.level <= (this.tournamentInfo?.levelLimit ?? 0))
				.map(d => {
					return {
						id: d.id,
						name: d.name,
						display: d.display,
						level: d.level,
						raceId: d.race.raceId
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
		DZDisclaimer,
		TournamentArchetype
	},
	data() {
		return {
			selection: [] as number[],
			raceList: raceList,
			playerStore: playerStore(),
			localStore: localStore()
		};
	},
	methods: {
		/** Race lists are shown as race names, the other parameters as is */
		formatErrorParams(params?: Record<string, unknown>): Record<string, unknown> {
			if (!params) return {};
			return Object.fromEntries(
				Object.entries(params).map(([key, value]) => [
					key,
					Array.isArray(value)
						? value.map(v => (typeof v === 'number' ? this.$t(raceNameKey(v)) : String(v))).join(', ')
						: value
				])
			);
		},
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
		async composeMyTeam(data: number[]) {
			try {
				await DojoService.createTournamentTeam(data);
				await dojoStore().update();
			} catch (e) {
				errorHandler.handle(e, this.$toast);
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
