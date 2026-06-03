<template>
	<div class="wrapper">
		<DZTable>
			<tr>
				<th>{{ $t('ranking.th.warAttacker') }}</th>
				<th>{{ $t('ranking.th.warDefender') }}</th>
				<th>{{ $t('ranking.th.warStart') }}</th>
				<th>{{ $t('ranking.th.warResult') }}</th>
			</tr>
			<tr class="select" @click="changePage(-1)" v-if="page > 1">
				<td colspan="4" style="text-align: center">{{ $t('ranking.page.previous') }}</td>
			</tr>
			<tr
				v-for="(war, index) in wars"
				:key="war.id"
				class="select"
				:class="{ even: (index + 1) % 2 === 0 }"
				@click="$router.push({ name: 'Clan', params: { id: war.attacker.id } })"
			>
				<td>{{ war.attacker.name }}</td>
				<td>{{ war.defender.name }}</td>
				<td>{{ formatDate(war.startedAt as unknown as string) }}</td>
				<td>
					<span :class="['result', resultClass(war.endReason)]">{{
						$t(`ranking.war.${resultLabel(war.endReason)}`)
					}}</span>
				</td>
			</tr>
			<tr class="select" @click="changePage(1)" :class="{ hidden: wars.length < 20 }">
				<td colspan="4" style="text-align: center">{{ $t('ranking.page.next') }}</td>
			</tr>
		</DZTable>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { WarHistoryResponse } from '@drpg/core/returnTypes/WarHistory';
import { ClanService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import { mixin } from '../../mixin/mixin.js';
import DZTable from '../common/DZTable.vue';

const END_REASON_LABELS: Record<string, string> = {
	castleDestroyed: 'castleDestroyed',
	forfeit: 'forfeit',
	expiration: 'timeout',
	stolen: 'stolen'
};

const END_REASON_CLASSES: Record<string, string> = {
	castleDestroyed: 'result-castle',
	forfeit: 'result-forfeit',
	expiration: 'result-timeout',
	stolen: 'result-stolen'
};

export default defineComponent({
	name: 'WarHistory',
	components: { DZTable },
	mixins: [errorHandler, mixin],
	props: {
		page: {
			type: Number,
			default: 1
		}
	},
	data() {
		return {
			wars: [] as WarHistoryResponse
		};
	},
	watch: {
		page: {
			immediate: true,
			handler: 'fetchWars'
		}
	},
	methods: {
		async fetchWars(): Promise<void> {
			try {
				this.wars = await ClanService.getWarHistory(this.page);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		},
		changePage(i: number): void {
			this.$router.push({ query: { ...this.$route.query, page: this.page + i } });
		},
		resultLabel(endReason: string | null): string {
			if (endReason === null) return 'ongoing';
			return END_REASON_LABELS[endReason] ?? endReason;
		},
		resultClass(endReason: string | null): string {
			if (endReason === null) return 'result-ongoing';
			return END_REASON_CLASSES[endReason] ?? '';
		}
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 5px;

	:deep(.even td) {
		background-color: #f9dcb2;
		background-image: url('../../assets/background/table_cell_even.webp');
	}

	:deep(.select:hover td) {
		color: white;
		border-color: #9a4029;
		cursor: pointer;
	}

	:deep(.hidden) {
		display: none;
	}
}

.result {
	display: inline-block;
	padding: 1px 6px;
	border-radius: 3px;
	font-size: 8pt;
	font-weight: bold;
	color: #fff;

	&.result-ongoing {
		background-color: #3a8a4a;
	}

	&.result-castle {
		background-color: #b83232;
	}

	&.result-forfeit {
		background-color: #c86020;
	}

	&.result-timeout {
		background-color: #777;
	}

	&.result-stolen {
		background-color: #6a3a8a;
	}
}
</style>
