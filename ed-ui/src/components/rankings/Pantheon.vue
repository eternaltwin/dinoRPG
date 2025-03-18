<template>
	<DZDisclaimer content="ranking.disclaimer.pantheon" />
	<div class="wrapper">
		<DZButton @click="pantheon = PantheonMotif.RACE">{{ $t(`ranking.pantheon.dinozPantheon`) }}</DZButton>
		<DZButton @click="pantheon = PantheonMotif.EPIC">{{ $t(`ranking.pantheon.playerPantheon`) }}</DZButton>
	</div>
	<div class="wrapper" v-if="pantheon === PantheonMotif.RACE">
		<select v-model="race" @change="refreshPantheon()">
			<option :value="null">{{ $t(`ranking.pantheon.allRaces`) }}</option>
			<option v-for="(race, index) in races" :key="index" :value="race">{{ $t(`race.name.${race}`) }}</option>
		</select>
		<select v-model="level" @change="refreshPantheon()">
			<option :value="null">{{ $t(`ranking.pantheon.allLevel`) }}</option>
			<option v-for="(level, index) in [10, 20, 30, 40, 50]" :key="index" :value="level">{{ level }}</option>
		</select>
	</div>
	<div class="wrapper" v-if="pantheon === PantheonMotif.EPIC">
		<select v-model="rewardId" @change="refreshPantheon()">
			<option :value="null">{{ $t(`ranking.pantheon.pickEpic`) }}</option>
			<option v-for="(epic, index) in epicRewards" :key="index" :value="epic.id">
				{{ $t(`rewards.name.${epic.name}`) }}
			</option>
		</select>
	</div>
	<div class="table" v-if="pantheon === PantheonMotif.RACE && display.length > 0">
		<table>
			<tbody>
				<tr>
					<th class="name">{{ $t('ranking.pantheon.dinoz') }}</th>
					<th class="status">{{ $t('ranking.pantheon.detail') }}</th>
				</tr>
				<tr v-for="item in display" :key="item.id">
					<template v-if="item.motif === PantheonMotif.RACE && item.dinoz">
						<td class="dinoz">
							<DinozWithoutFlash class="dinoImg" :display="item.dinoz.display" :life="1" flip></DinozWithoutFlash>
						</td>
						<td class="missions">
							<ul>
								<li>
									<img :src="getImgURL('design', 'info_button')" alt="info_button" />
									<span
										>{{ $t('ranking.pantheon.dinozName') }}<span class="total">{{ item.dinoz.name }}</span></span
									>
								</li>
								<li>
									<img :src="getImgURL('design', 'info_button')" alt="info_button" />
									<span
										>{{ $t('ranking.pantheon.masterName') }}
										<DZUser :user="item.player" />
									</span>
								</li>
								<li>
									<img :src="getImgURL('design', 'info_button')" alt="info_button" />
									<span
										>{{ $t('ranking.pantheon.dinozLevel') }}<span class="total"> {{ item.indicator }}</span>
									</span>
								</li>
								<li>
									<img :src="getImgURL('design', 'info_button')" alt="info_button" />
									<span
										>{{ $t('ranking.pantheon.date') }}<span class="total"> {{ formatDate(item.date) }}</span>
									</span>
								</li>
							</ul>
						</td>
					</template>
				</tr>
			</tbody>
		</table>
	</div>
	<div
		class="pantheon"
		v-if="
			pantheon === PantheonMotif.EPIC &&
			rewardId &&
			display &&
			display.length > 0 &&
			display.every(p => p.motif === PantheonMotif.EPIC && p.indicator === rewardId)
		"
	>
		<Tippy
			theme="normal"
			tag="img"
			:src="getImgURL('epicRewards', `collec_${epicRewards[rewardId - 1].name}`)"
			:alt="epicRewards[rewardId - 1].name"
		>
			<template #content>
				<h1 v-html="formatContent($t(`rewards.name.${epicRewards[rewardId - 1].name}`))" />
				<p v-html="formatContent($t(`rewards.description.${epicRewards[rewardId - 1].name}`))" />
			</template>
		</Tippy>
		<table>
			<tbody>
				<tr>
					<th class="name">{{ $t('ranking.pantheon.masterName') }}</th>
					<th class="name">{{ $t('ranking.pantheon.date') }}</th>
				</tr>
				<tr v-for="player in display" :key="player.id">
					<template v-if="player.motif === PantheonMotif.EPIC">
						<td class="dinoz"><DZUser :user="player.player" /></td>
						<td class="missions">
							<ul>
								<li>
									<img :src="getImgURL('design', 'info_button')" alt="info_button" />
									<span class="total"> {{ formatDate(player.date) }}</span>
								</li>
							</ul>
						</td>
					</template>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DataService } from '../../services/DataService.js';
import { PantheonMotif } from '@drpg/core/models/enums/PantheonMotif';
import DZButton from '../common/DZButton.vue';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { errorHandler } from '../../utils/index.js';
import { PantheonDisplay } from '@drpg/core/models/pantheon/pantheonDisplay';
import DinozWithoutFlash from '../dinoz/DinozWithoutFlash.vue';
import DZUser from '../common/DZUser.vue';
import { localStore } from '../../store/index.js';
import { rewardList } from '@drpg/core/models/reward/RewardList';
import DZDisclaimer from '../common/DZDisclaimer.vue';

export default defineComponent({
	name: 'Pantheon',
	components: { DZDisclaimer, DZUser, DZButton, DinozWithoutFlash },
	data() {
		return {
			page: 1 as number,
			pantheon: PantheonMotif.RACE as PantheonMotif,
			display: [] as PantheonDisplay[],
			race: null,
			level: null,
			rewardId: null,
			localStore: localStore()
		};
	},
	methods: {
		goToAccount(paramId: number): void {
			this.$router.push({ name: 'MyAccount', params: { id: paramId } });
		},
		formatDate(dateString: string) {
			const date = new Date(dateString);
			const lang = this.localStore.getLanguage;
			const formatter = new Intl.DateTimeFormat(lang ?? 'fr', { month: 'long' });
			const day = String(date.getDate()).padStart(2, '0'); // Ajoute un '0' si nécessaire
			const month = formatter.format(date);
			const year = date.getFullYear();
			return `${day} ${month} ${year}`;
		},
		async refreshPantheon() {
			try {
				this.display = await DataService.getPantheon(this.pantheon, this.level, this.race, this.rewardId);
			} catch (e) {
				errorHandler.handle(e, this.$t);
			}
		}
	},
	computed: {
		PantheonMotif() {
			return PantheonMotif;
		},
		races() {
			const ret = Object.values(raceList).map(p => p.name);
			return ret;
		},
		epicRewards() {
			return Object.values(rewardList).filter(r => r.announced);
		}
	},
	watch: {
		pantheon() {
			if (this.pantheon === PantheonMotif.RACE) this.rewardId = null;
			if (this.pantheon === PantheonMotif.EPIC) {
				this.level = null;
				this.race = null;
			}
			this.refreshPantheon();
		}
	},
	async mounted(): Promise<void> {
		this.refreshPantheon();
	}
});
</script>

<style lang="scss" scoped>
.pantheon {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.wrapper {
	display: flex;
	justify-content: space-around;
	width: 95%;
	align-self: center;
	margin-bottom: 5px;
}
.hidden {
	display: none !important;
}
.table {
	width: 95%;
	align-self: center;
}
table {
	width: 100%;
	margin-top: 10px;
	margin-bottom: 5px;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;

	tr {
		display: table-row;
		cursor: help;

		th {
			font-size: 8pt;
			text-shadow: 1px 1px 0px #356847;
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
			background-image: url('../../assets/background/table_header.webp');
			background-position: left bottom;

			&.dinoz {
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
			}

			&.name {
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
			}
			&.status {
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
			}
		}

		td {
			font-size: 16px;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			background-image: url('../../assets/background/table_cell.webp');
			background-position: -10px 0px;

			&.dinoz {
				padding: 1px 5px;
				font-variant: small-caps;
				display: flex;
				justify-content: center;
				min-height: 30px;
				align-items: center;
			}

			&.missions {
				font-size: 9pt;
				padding: 1px 5px;
				font-weight: bold;

				ul {
					list-style-type: none;
					background-color: #f4d9a8;
					border-radius: 5px;
					margin: 4px 8px;
					padding: 4px 8px;

					img {
						padding-right: 8px;
						padding-left: 4px;
					}

					.total {
						color: #ea0000;
					}
				}
			}

			.see-button {
				margin-left: 8px;
				border-color: #c85d3f;
				border-style: double;
				background-color: #c85d3f;
				color: #f3ca92;
				background-clip: padding-box;
				font-variant: small-caps;
				font-size: 9pt;
				padding: 0px 4px;
				text-decoration: none;

				&:hover {
					background-color: #f3ca92;
					color: #c85d3f;
				}
			}
		}
	}
}
</style>
