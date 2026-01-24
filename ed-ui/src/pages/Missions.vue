<template>
	<TitleHeader :title="`${$t('pageTitle.missions')}`" :header="formatContent($t(`missions.header`))" />
	<table>
		<tbody>
			<tr>
				<th class="name">{{ $t('missions.headers.title') }}</th>
				<th class="status">{{ $t('missions.headers.status') }}</th>
			</tr>
			<tr v-for="mission in missionList" :key="mission.missionId" :class="mission.status">
				<td class="name" @click="getInformation(mission)">
					<img v-if="mission.status === 'ongoing'" :src="getImgURL('icons', `small_missAct`)" alt="small_missAct" />
					<img v-if="mission.status === 'available'" :src="getImgURL('icons', `small_right`)" alt="small_missNew" />
					<img v-if="mission.status === 'finished'" :src="getImgURL('icons', `small_missDone`)" alt="small_missDone" />
					<Tippy
						v-if="mission.status === 'unavailable'"
						tag="img"
						:src="getImgURL('icons', `help${getLanguage()}`)"
						theme="normal"
						class="help"
					>
						<template #content>
							<h1 v-html="formatContent($t(`missions.unavailable.title`))" />
							<p v-html="formatContent($t(`missions.unavailable.description`))" />
						</template>
					</Tippy>
					{{ $t(`missions.name.${allMission[mission.missionId]}`) }}
				</td>
				<td class="status">{{ $t(`missions.status.${mission.status}`) }}</td>
			</tr>
		</tbody>
	</table>
	<MissionInformation
		:enabled="information"
		:mission="mission"
		:dinozId="dinozId"
		@close="information = !information"
		@reload="reload()"
	/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MissionList } from '@drpg/core/models/missions/missionList';
import { MissionService } from '../services/index.js';
import { errorHandler } from '../utils/index.js';
import { missionsList } from '../constants/index.js';
import MissionInformation from '../components/modal/MissionInformationModal.vue';
import { sessionStore, useLoadingStore } from '../store/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';

export default defineComponent({
	name: 'Missions',
	components: {
		MissionInformation,
		TitleHeader
	},
	data() {
		return {
			missionList: [] as Array<MissionList>,
			sessionStore: sessionStore(),
			allMission: missionsList,
			information: false as boolean,
			mission: undefined as MissionList | undefined
		};
	},
	methods: {
		getInformation(mission: MissionList): void {
			if (mission.status === 'ongoing' || mission.status === 'available') {
				this.mission = mission;
				this.information = !this.information;
			}
		},
		async reload(): Promise<void> {
			const dinozId: string = this.$route.params.id.toString();
			const npc: string = this.$route.params.npc.toString();
			useLoadingStore().setLoaderOn();
			try {
				this.missionList = await MissionService.getMissions(dinozId, npc);
				this.information = !this.information;
				useLoadingStore().setLoaderOff();
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		getLanguage() {
			return this.$i18n.locale.toLocaleUpperCase();
		}
	},
	computed: {
		dinozId(): number {
			return +this.$route.params.id;
		}
	},
	async mounted(): Promise<void> {
		const dinozId: string = this.$route.params.id.toString();
		const npc: string = this.$route.params.npc.toString();
		useLoadingStore().setLoaderOn();
		try {
			this.missionList = await MissionService.getMissions(dinozId, npc);
			useLoadingStore().setLoaderOff();
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.help {
	border: 1px solid #bc683c;
	cursor: help;
	margin-left: 5px;

	&:hover {
		outline: 1px solid white;
	}
}

table {
	width: 100%;
	margin-bottom: 10px;
	border: 2px solid #f3d6b1;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;

	tr {
		display: table-row;

		th {
			font-size: 8pt;
			text-shadow: 1px 1px 0 #356847;
			padding-left: 4px;
			padding-right: 4px;
			padding-bottom: 8px;
			height: 41px;
			vertical-align: bottom;
			color: #fffdba;
			text-transform: uppercase;
			font-weight: bold;
			letter-spacing: 1pt;
			text-align: left;
			white-space: nowrap;
			border: 1px solid #356847;
			background-color: #c64e36;
			background-image: url('../assets/background/table_header.webp');
			background-position: left bottom;

			//&.name {
			//	width: 200px;
			//}

			&.status {
				min-width: 70px;
			}
		}

		td {
			font-size: 10pt;
			padding-right: 5px;
			padding-top: 1px;
			padding-bottom: 1px;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;

			&.name {
				background-image: url('../assets/background/table_cell.webp');
				background-position: 0px 0px;
				padding-left: 15px;

				p {
					padding-top: 4px;
				}

				img {
					float: left;
					position: relative;
					margin-right: 5px;
					vertical-align: bottom;
				}
			}

			&.status {
				font-weight: bold;
				text-align: center;
				color: #bc683c;
				background-image: url('../assets/background/table_cell.webp');
				background-position: -10px 0px;
				max-width: 4px;
			}

			background-image: url('../assets/background/table_cell.webp');
			background-position: -10px 0px;
		}

		&.available {
			cursor: pointer;
			text-decoration: underline;
			text-decoration-color: #710;
			font-style: normal;
		}

		&.available:hover {
			td {
				color: white;
				border-color: #9a4029;
			}
		}

		&.unavailable {
			font-style: normal;

			td {
				background-image: url('../assets/background/table_cell_off.webp');
				color: #db9c57;
				border-color: #e6b57b;
				font-style: italic;
			}
		}

		&.ongoing {
			td {
				background-image: url('../assets/background/table_cell_hover.webp');
				border-color: #7a261b;
				font-style: italic;
				color: #fffdba;
				font-weight: bold;
				cursor: pointer;
			}
		}
	}
}
</style>
