<template>
	<DZDisclaimer content="ranking.disclaimer.completion" />
	<div class="wrapper">
		<table>
			<tbody>
				<tr>
					<th class="pos">{{ $t('ranking.th.pos') }}</th>
					<th class="player">{{ $t('ranking.th.player') }}</th>
					<th class="dinoz">{{ $t('ranking.th.dinoz') }}</th>
					<th class="points">{{ $t('ranking.th.points') }}</th>
					<th class="points">{{ $t('ranking.th.completion') }}</th>
				</tr>
				<tr class="select" @click="changePage(-1)" v-if="page > 1">
					<td class="pos" colspan="5" style="text-align: center">
						{{ $t('ranking.page.previous') }}
					</td>
				</tr>
				<tr
					v-for="(ranking, index) in rankings"
					:key="ranking.player.id"
					class="select"
					:class="(index + 1) % 2 === 0 ? 'even' : ''"
					@click="goToAccount({ value: ranking.player.id, label: ranking.player.name })"
				>
					<td class="pos">
						{{ (page - 1) * 20 + (index + 1) }}
					</td>
					<td class="other">
						<DZUser :user="ranking.player" :me="ranking.player.id === me" :friend="false" />
					</td>
					<td class="other">
						{{ ranking.dinozCount }}
					</td>
					<td class="other">
						{{ ranking.points }}
					</td>
					<td class="other">
						{{ ranking.completion }}
					</td>
				</tr>
			</tbody>
			<tr class="select" @click="changePage(1)" :class="{ hidden: rankings.length < 20 }">
				<td class="pos" colspan="5" style="text-align: center">
					{{ $t('ranking.page.next') }}
				</td>
			</tr>
		</table>
	</div>
	<SearchEntity background entityType="player" placeHolder="ranking.placeholder.searchPlayer" @entity="goToAccount" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PlayerService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import { RankingGetResponse } from '@drpg/core/returnTypes/Ranking';
import { playerStore } from '../../store/index.js';
import DZUser from '../common/DZUser.vue';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import SearchEntity from '../data/SearchEntity.vue';
import { SelectOption } from '../common/DZSelect.vue';

export default defineComponent({
	name: 'CompletionRanking',
	components: { SearchEntity, DZDisclaimer, DZUser },
	props: {
		page: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			rankings: [] as RankingGetResponse,
			me: playerStore().getPlayerId
		};
	},
	methods: {
		goToAccount(player: SelectOption<string>) {
			this.$router.push({ name: 'Account', params: { id: player.value } });
		},
		async getRanking(): Promise<void> {
			try {
				this.rankings = await PlayerService.getPlayersRanking('completion', this.page);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		changePage(i: number) {
			this.$router.push({
				name: this.$route.name ?? '',
				query: { ...this.$route.query, page: (this.page + i).toString() }
			});
		}
	},
	async created(): Promise<void> {
		await this.getRanking();
	},
	watch: {
		page() {
			this.getRanking();
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
		margin-bottom: 5px;
		margin-bottom: 10px;
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
					width: 5em;
				}
				&.player {
					max-width: 150px;
				}
				&.dinoz {
					max-width: 15px;
				}
				&.points {
					max-width: 15px;
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
