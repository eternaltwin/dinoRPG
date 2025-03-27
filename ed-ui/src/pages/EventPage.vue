<template>
	<TitleHeader :title="$t('pageTitle.event')" :header="$t(`events.header`)" />
	<div class="wrapper" v-if="show">
		<DZDisclaimer round :content="$t('events.disclaimer')" />
		<DZTable>
			<tr>
				<th class="items-header">{{ $t('events.races') }}</th>
				<th class="items-header">{{ $t('events.level') }}</th>
				<th class="dinoz-header">{{ $t('events.subscribed') }}</th>
			</tr>
			<tr v-for="event in currentEvent" :key="event.id" @click="goToTournament(event.id)">
				<td>{{ $t(`race.name.${raceList[event.teamRace]}`) }}</td>
				<td>{{ event.levelLimit }}</td>
				<td>{{ event.participantCount }} / 256</td>
			</tr>
		</DZTable>
	</div>
	<RouterView />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { errorHandler } from '../utils/index.js';
import { FBService } from '../services/FBTournamentService.js';
import { PublicEvent } from '@drpg/core/models/dojo/ForceBrute';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import DZTable from '../components/common/DZTable.vue';
import { localStore } from '../store/index.js';
import { raceList } from '../constants/index.js';

export default defineComponent({
	name: 'EventPage',
	components: { DZTable, TitleHeader, DZDisclaimer },
	data() {
		return {
			currentEvent: [] as PublicEvent[],
			localStore: localStore(),
			raceList: raceList,
			show: true
		};
	},
	methods: {
		async getCurrentEvents() {
			try {
				this.currentEvent = await FBService.getCurrentEvent();
				this.currentEvent.sort((a, b) => b.levelLimit - a.levelLimit);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		formatDate(dateString: string) {
			const date = new Date(dateString);
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
		},
		goToTournament(id: string) {
			this.$router.push({ name: 'FBTournament', query: { id: id } });
		}
	},
	async mounted() {
		await this.getCurrentEvents();
		this.show = this.$route.name === 'EventPage';
	},
	watch: {
		$route: function (to) {
			if (to.name === 'FBTournament') {
				this.show = false;
			} else if (to.name === 'EventPage') {
				this.show = true;
			}
		}
	}
});
</script>

<style scoped lang="scss">
.wrapper {
	display: flex;
	width: 90%;
	justify-content: center;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	align-self: center;
}
.dinozList {
	display: flex;
	gap: 5px;
	justify-content: space-evenly;
	flex-wrap: wrap;
	.dinoz {
		width: 170px;
		height: 160px;
		background-color: #fbdba8;
		cursor: default;
		border: 1px solid #fce3bc;
		border-radius: 10px;
		-webkit-border-radius: 10px;
		&:hover {
			border: 1px solid #f1c98e;
		}
		img {
			width: 100%;
		}
		.name {
			text-align: center;
			font-weight: bold;
			line-height: 10pt;
			color: #52646b;
			background-color: transparent;
			margin-top: -25px;
		}
		.dinozInfo {
			text-align: center;
			font-size: 9pt;
			line-height: 10pt;
			color: #bc683c;
			width: 170px;
		}
	}

	.levelup {
		cursor: pointer;
		animation: blinker 1s linear infinite;
	}
}
@keyframes blinker {
	0% {
		border: 1px solid #f1c98e;
	}
	100% {
		border: 1px solid #bc683c;
	}
}
.naming {
	display: flex;
	align-items: center;
	max-width: 310px;
	flex-wrap: wrap;
	justify-content: center;
	gap: 10px;

	.name {
		width: 95px;
		text-align: center;
		font-variant: normal;
		font-weight: bold;
		font-size: 8pt;
		color: #ffee92;
		background-color: #e4aa69;
		border-radius: 10px;
		-webkit-border-radius: 10px;
		grid-column: 1;
		grid-row: 1;
	}
	input {
		width: 184px;
		height: 20px;
		padding-left: 8px;
		padding-right: 8px;
		padding-top: 2px;
		color: #ffee92;
		font-size: 9pt;
		font-weight: bold;
		border: none;
		background-image: url('../assets/design/form_field.webp');
		background-repeat: no-repeat;
		background-color: transparent;
		grid-column: 2 / 4;
		grid-row: 1;
	}
}
</style>
