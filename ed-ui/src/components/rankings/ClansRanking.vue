<template>
	<DZDisclaimer v-if="rankingType === ClanRankingType.TREASURE" content="ranking.disclaimer.clans" />
	<DZDisclaimer v-if="rankingType === ClanRankingType.EVENT" content="ranking.disclaimer.clansEvent" />
	<div class="wrapper">
		<i18n-t keypath="ranking.disclaimer.clansCreation" tag="p" for="ranking.disclaimer.clansCreationLink">
			<RouterLink :to="`/clans`">
				{{ $t('ranking.disclaimer.clansCreationLink') }}
			</RouterLink>
		</i18n-t>

		<DZButton v-if="eventInProgress && rankingType === ClanRankingType.TREASURE" @click="switchRanking()">{{
			$t(`ranking.button.clanEvent`)
		}}</DZButton>
		<DZButton v-if="eventInProgress && rankingType === ClanRankingType.EVENT" @click="switchRanking()">{{
			$t(`ranking.button.clanTreasure`)
		}}</DZButton>
		<table>
			<tbody>
				<tr>
					<th class="pos">{{ $t('ranking.th.pos') }}</th>
					<th class="clans">{{ $t('ranking.th.clans') }}</th>
					<th class="treasure">
						{{ rankingType === ClanRankingType.TREASURE ? $t('ranking.th.treasure') : $t('ranking.th.event') }}
					</th>
				</tr>
				<tr class="select" @click="changePage(-1)" v-if="page > 1">
					<td class="pos" colspan="5" style="text-align: center">
						{{ $t('ranking.page.previous') }}
					</td>
				</tr>
				<tr
					v-for="(clan, index) in clansList"
					:key="clan.id"
					@click="goToClan({ value: clan.id, label: clan.name })"
					class="select"
					:class="{
						even: (index + 1) % 2 === 0
					}"
				>
					<td class="pos">
						{{ (page - 1) * 20 + (index + 1) }}
					</td>
					<td class="other">
						<Flags :langs="clan.langs" />
						{{ clan.name }}
					</td>
					<td class="other">
						<div class="flex items-center gap-2">
							{{ rankingType === ClanRankingType.TREASURE ? moneyLint(clan.treasureValue ?? 0) : clan.totalScore }}
							<span
								v-if="rankingType === ClanRankingType.TREASURE"
								v-html="formatContent(':gold:')"
								class="relative mt-[-2px]"
							/>
						</div>
					</td>
				</tr>
			</tbody>
			<tr class="select" @click="changePage(1)" :class="{ hidden: clansList.length < 20 }">
				<td class="pos" colspan="5" style="text-align: center">
					{{ $t('ranking.page.next') }}
				</td>
			</tr>
		</table>
	</div>
	<SearchEntity background entityType="clan" placeHolder="ranking.placeholder.searchClan" @entity="goToClan" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ClanLite } from '@drpg/core/models/clan/clan';
import { ClanService } from '../../services/index.js';
import { errorHandler, utils } from '../../utils/index.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import SearchEntity from '../data/SearchEntity.vue';
import Flags from '../common/Flags.vue';
import { ClanRankingType } from '@drpg/core/models/rankings/clanRanking';
import DZButton from '../common/DZButton.vue';
import { currentEvents } from '@drpg/core/models/event/Events';
import { SelectOption } from '../common/DZSelect.vue';
import { useLoadingStore } from '../../store';

export default defineComponent({
	name: 'ClansRanking',
	components: { DZButton, Flags, SearchEntity, DZDisclaimer },
	data() {
		return {
			clansList: [] as Array<ClanLite>,
			page: 1 as number,
			rankingType: ClanRankingType.TREASURE as ClanRankingType
		};
	},
	methods: {
		async getClansRanking(): Promise<void> {
			useLoadingStore().setLoaderOn();
			try {
				this.clansList = await ClanService.getClansRanking(this.page, this.rankingType);
				useLoadingStore().setLoaderOff();
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		goToClan(clan: SelectOption<number>): void {
			this.$router.push({ name: 'Clan', params: { id: clan.value } });
		},
		changePage(i: number) {
			this.page += i;
			this.getClansRanking();
		},
		moneyLint(quantity: number): string {
			return utils.beautifulNumber(quantity.toString());
		},
		async switchRanking() {
			if (this.rankingType === ClanRankingType.TREASURE) {
				this.rankingType = ClanRankingType.EVENT;
			} else {
				this.rankingType = ClanRankingType.TREASURE;
			}
			await this.getClansRanking();
		}
	},
	computed: {
		ClanRankingType() {
			return ClanRankingType;
		},
		eventInProgress() {
			return currentEvents().length > 0;
		}
	},
	async created(): Promise<void> {
		await this.getClansRanking();
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 5px;

	table {
		width: 100%;
		margin-top: 10px;
		margin-bottom: 15px;
		border: 2px solid #f3d6b1;
		background-color: #ecbd84;
		border-collapse: separate;
		border-spacing: 1px;

		tr {
			display: table-row;

			th {
				font-size: 8pt;
				letter-spacing: 0pt;
				text-shadow: 1px 1px 0px #356847;
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
				background-image: url('../../assets/background/table_header.webp');
				background-position: left bottom;
				max-width: 222px;

				&.pos {
					width: 4em;
				}

				&.clans {
					max-width: 150px;
				}

				&.treasure {
					width: 150px;
				}
			}

			td {
				font-size: 9pt;
				padding-right: 5px;
				padding-top: 1px;
				padding-bottom: 1px;
				color: #710;
				background-color: #f3ca92;
				border: 1px solid #c88f44;
				cursor: pointer;

				&.pos {
					background-image: url('../../assets/background/table_cell.webp');
					background-position: 0px 0px;
					padding-left: 1.2em;
				}

				&.other {
					padding-left: 1em;
					background-image: url('../../assets/background/table_cell.webp');
					background-position: -10px 0px;
					max-width: 4px;
					padding-top: 4px;
					font-variant: small-caps;
				}
			}

			&.even {
				td.pos {
					background-image: url('../../assets/background/table_cell_even.webp');
					background-position: 0px 0px;
				}

				td.other {
					background-image: url('../../assets/background/table_cell_even.webp');
					background-position: -10px 0px;
				}
			}

			&.select:hover {
				td {
					color: white;
					border-color: #9a4029;
				}
			}
		}
	}
}
.hidden {
	display: none !important;
}
</style>
