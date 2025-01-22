<template>
	<DZTable>
		<tr>
			<th class="pos">{{ $t('ranking.th.pos') }}</th>
			<th class="player">{{ $t('ranking.th.player') }}</th>
			<th>Points</th>
		</tr>
		<tr
			v-for="(ranking, index) in rankings"
			:key="ranking.player.id"
			class="select"
			:class="{
				even: (index + 1) % 2 === 0
			}"
		>
			<td class="pos">
				{{ (page - 1) * 20 + (index + 1) }}
			</td>
			<td><DZUser :user="ranking.player" :me="ranking.player.id === me" :friend="false" /></td>
			<td>{{ ranking.dojo }}</td>
		</tr>
	</DZTable>
	<tr class="pagination-controls">
		<button @click="previousPage" :disabled="page === 1">
			<img class="left" src="/src/assets/button/button-back-arrow.webp" />
		</button>
		<span>{{ page }} </span>
		<button @click="nextPage">
			<img class="right" src="/src/assets/button/button-back-arrow.webp" />
		</button>
	</tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZTable from '../common/DZTable.vue';
import { playerStore } from '../../store/index.js';
import EventBus from '../../events/index.js';
import { PlayerService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import { RankingGetResponse } from '@drpg/core/returnTypes/Ranking';
import DZUser from '../common/DZUser.vue';

export default defineComponent({
	name: 'DojoRanking',
	components: { DZUser, DZTable },
	data() {
		return {
			page: 1 as number,
			me: playerStore().getPlayerId,
			rankings: [] as RankingGetResponse
		};
	},
	methods: {
		async getRanking(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				this.rankings = await PlayerService.getPlayersRanking('dojo', this.page);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async previousPage() {
			if (this.page > 1) {
				try {
					this.page--;
					await this.getRanking();
				} catch (error) {
					errorHandler.handle(error, this.$toast);
					return;
				}
			}
		},
		async nextPage() {
			try {
				this.page++;
				await this.getRanking();
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				return;
			}
		}
	},
	async mounted() {
		await this.getRanking();
	}
});
</script>

<style scoped lang="scss">
.pagination-controls {
	margin-top: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
	button {
		background-color: transparent;
		margin: 0 10px;
		padding: 5px 10px;
		border: none;
		cursor: pointer;
		&:disabled {
			cursor: not-allowed;
		}
		.left,
		.right {
			height: auto;
			width: 10px;
		}
		.right {
			transform: rotate(180deg);
		}
	}
}
</style>
