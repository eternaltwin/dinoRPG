<template>
	<ul class="onglets">
		<li>
			<RouterLink
				:to="{
					name: 'RankingClans',
					query: { ...$route.query, type: ClanRankingType.TREASURE, page: 1 }
				}"
				:class="{ active: rankingType === ClanRankingType.TREASURE }"
				>{{ $t(`ranking.button.clanTreasure`) }}</RouterLink
			>
		</li>
		<li v-if="eventInProgress">
			<RouterLink
				:to="{
					name: 'RankingClans',
					query: { ...$route.query, type: ClanRankingType.EVENT, page: 1 }
				}"
				:class="{ active: rankingType === ClanRankingType.EVENT }"
				>{{ $t(`ranking.button.clanEvent`) }}</RouterLink
			>
		</li>
		<li v-if="warInProgress">
			<RouterLink
				:to="{
					name: 'RankingClans',
					query: { ...$route.query, type: ClanRankingType.WAR, page: 1 }
				}"
				:class="{ active: rankingType === ClanRankingType.WAR }"
				>{{ $t(`ranking.button.clanWar`) }}</RouterLink
			>
		</li>
		<li v-if="warInProgress">
			<RouterLink
				:to="{
					name: 'RankingClans',
					query: { ...$route.query, type: ClanRankingType.WAR_HISTORY, page: 1 }
				}"
				:class="{ active: rankingType === ClanRankingType.WAR_HISTORY }"
				>{{ $t('tabs.wars') }}</RouterLink
			>
		</li>
		<li>
			<RouterLink
				:to="{
					name: 'RankingClans',
					query: { ...$route.query, type: ClanRankingType.CHAMPIONSHIP, page: 1 }
				}"
				:class="{ active: rankingType === ClanRankingType.CHAMPIONSHIP }"
				>{{ $t('tabs.championship') }}</RouterLink
			>
		</li>
	</ul>

	<DZDisclaimer v-if="rankingType === ClanRankingType.TREASURE" content="ranking.disclaimer.clans" />
	<DZDisclaimer v-if="rankingType === ClanRankingType.EVENT" content="ranking.disclaimer.clansEvent" />
	<div
		v-if="
			rankingType === ClanRankingType.WAR ||
			rankingType === ClanRankingType.EVENT ||
			rankingType === ClanRankingType.TREASURE
		"
		class="wrapper"
	>
		<i18n-t keypath="ranking.disclaimer.clansCreation" tag="p" for="ranking.disclaimer.clansCreationLink">
			<RouterLink :to="`/clans`">
				{{ $t('ranking.disclaimer.clansCreationLink') }}
			</RouterLink>
		</i18n-t>

		<table>
			<tbody>
				<tr>
					<th class="pos">{{ $t('ranking.th.pos') }}</th>
					<th class="clans">{{ $t('ranking.th.clans') }}</th>
					<th class="treasure">
						{{ $t(`ranking.th.${rankingType}`) }}
					</th>
					<th class="castle" v-if="rankingType === ClanRankingType.WAR">{{ $t('ranking.th.castle') }}</th>
				</tr>
				<tr class="select" @click="changePage(-1)" v-if="page > 1">
					<td class="pos" :colspan="rankingType === ClanRankingType.WAR ? 4 : 3" style="text-align: center">
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
							<template v-if="rankingType === ClanRankingType.TREASURE">
								{{ moneyLint(clan.treasureValue ?? 0) }}
							</template>
							<template v-else-if="rankingType === ClanRankingType.EVENT">
								{{ clan.totalScore }}
							</template>
							<template v-else-if="rankingType === ClanRankingType.WAR">
								{{ clan.clanWarRanking?.[0]?.reputation ?? 0 }}
								<img :src="getImgURL('icons', 'small_reput')" alt="reputation" />
							</template>
							<span
								v-if="rankingType === ClanRankingType.TREASURE"
								v-html="formatContent(':gold:')"
								class="relative mt-[-2px]"
							/>
						</div>
					</td>
					<td class="other text-center" v-if="rankingType === ClanRankingType.WAR" style="width: 30px">
						<img v-if="clan.isCastleBuilt" :src="getImgURL('icons', 'small_star')" alt="castle" />
					</td>
				</tr>
			</tbody>
			<tr class="select" @click="changePage(1)" :class="{ hidden: clansList.length < 20 }">
				<td class="pos" :colspan="rankingType === ClanRankingType.WAR ? 4 : 3" style="text-align: center">
					{{ $t('ranking.page.next') }}
				</td>
			</tr>
		</table>
	</div>
	<div v-else-if="rankingType === ClanRankingType.WAR_HISTORY">
		<WarHistory />
	</div>
	<div v-else-if="rankingType === ClanRankingType.CHAMPIONSHIP && championship">
		<div v-if="championship.phase === 'registration'">
			<h3>{{ $t('clanChampionship.registeredClans', { count: championship.registrations.length }) }}</h3>
			<p v-if="championship.registrations.length === 0">{{ $t('clanChampionship.noRegistration') }}</p>
			<ul v-else class="registrations">
				<li
					v-for="(r, i) in championship.registrations"
					:key="i"
					:class="{ mine: r.clanId !== null && r.clanId === myClanId }"
				>
					<RouterLink v-if="r.clanId !== null" :to="{ name: 'Clan', params: { id: r.clanId } }">{{
						r.clanName
					}}</RouterLink>
					<span v-else>{{ r.clanName }}</span>
				</li>
			</ul>
		</div>
		<ChampionshipStandings v-else :standings="championship.standings" />
	</div>
	<SearchEntity background entityType="clan" placeHolder="ranking.placeholder.searchClan" @entity="goToClan" />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ClanLite } from '@drpg/core/models/clan/clan';
import { ClanChampionshipService, ClanService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import SearchEntity from '../data/SearchEntity.vue';
import Flags from '../common/Flags.vue';
import { ClanRankingType } from '@drpg/core/models/rankings/clanRanking';
import { currentEvents } from '@drpg/core/models/event/Events';
import { SelectOption } from '../common/DZSelect.vue';
import { clanStore } from '../../store/clanStore';
import { formatNumber } from '@drpg/core/utils/string';
import WarHistory from './WarHistory.vue';
import ChampionshipStandings from '../clans/championship/ChampionshipStandings.vue';
import { ClanChampionshipDTO } from '@drpg/core/models/clan/clanChampionship';

export default defineComponent({
	name: 'ClansRanking',
	components: { ChampionshipStandings, WarHistory, Flags, SearchEntity, DZDisclaimer },
	props: {
		page: {
			type: Number,
			default: 1
		},
		type: {
			type: String as PropType<ClanRankingType>,
			default: ClanRankingType.TREASURE
		}
	},
	data() {
		return {
			clansList: [] as Array<ClanLite>,
			witness: false as boolean,
			championship: null as ClanChampionshipDTO | null
		};
	},
	watch: {
		page: {
			immediate: true,
			handler: 'getClansRanking'
		},
		type: {
			immediate: true,
			handler: 'getClansRanking'
		}
	},
	methods: {
		async getClansRanking(): Promise<void> {
			if (this.witness) return;
			this.witness = true;
			try {
				switch (this.rankingType) {
					case ClanRankingType.CHAMPIONSHIP:
						this.championship = await ClanChampionshipService.getCurrent();
						break;
					case ClanRankingType.EVENT:
					case ClanRankingType.TREASURE:
					case ClanRankingType.WAR:
						this.clansList = await ClanService.getClansRanking(this.page, this.rankingType);
						break;
					default:
						break;
				}
				this.witness = false;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		goToClan(clan: SelectOption<number>): void {
			this.$router.push({ name: 'Clan', params: { id: clan.value } });
		},
		changePage(i: number) {
			this.$router.push({
				query: {
					...this.$route.query,
					page: this.page + i
				}
			});
		},
		moneyLint(quantity: number): string {
			return formatNumber(quantity);
		}
	},
	computed: {
		rankingType(): ClanRankingType {
			return this.type || ClanRankingType.TREASURE;
		},
		ClanRankingType() {
			return ClanRankingType;
		},
		eventInProgress() {
			return currentEvents().length > 0;
		},
		warInProgress() {
			return !!clanStore().clanEvent;
		},
		myClanId(): number {
			return clanStore().getClanId;
		}
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
h3 {
	color: #874a16;
	text-transform: uppercase;
	font-size: 0.9em;
	letter-spacing: 1px;
}
.registrations {
	columns: 2;

	li {
		list-style-type: none;
		.mine a {
		}

		font-weight: bold;
	}
}
</style>
