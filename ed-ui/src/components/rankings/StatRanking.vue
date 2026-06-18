<script setup lang="ts">
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { twinoidGoals } from '@drpg/core/models/goals/twinoidGoals';
import { GetStatRankingsResponse } from '@drpg/core/returnTypes/Ranking';
import { getCurrentInstance, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import DZUser from '../common/DZUser.vue';
import { RankingService } from '../../services/RankingService';
import { localStore } from '../../store';
import { formatLargeNumber } from '../../utils/formatLargeNumber';

// State
const loading = ref(false);
const rankings = ref<Partial<Record<StatTracking, GetStatRankingsResponse>>>({});
const router = useRouter();
const instance = getCurrentInstance();
const store = localStore();

// Lifecycle hooks
onMounted(async () => {
	try {
		const data = await RankingService.getStatRankings();
		// Group by stat name
		const groupedRankings = data.reduce(
			(acc, ranking) => {
				if (!acc[ranking.stat]) {
					acc[ranking.stat] = [];
				}
				acc[ranking.stat]?.push(ranking);
				return acc;
			},
			{} as Partial<Record<StatTracking, GetStatRankingsResponse>>
		);

		rankings.value = groupedRankings;
	} catch (error) {
		instance?.proxy?.$toast.open({
			message: instance?.proxy?.$t(`toast.errorFetchingRankings`),
			type: 'error'
		});
		router.back();
		return;
	}
});
</script>

<template>
	<Loader v-if="loading" />
	<div class="grid" v-else-if="rankings">
		<div class="grid-item" v-for="[stat, top3] in Object.entries(rankings)" :key="stat">
			<ul class="stat-card">
				<Tippy
					theme="small"
					class="stat-header"
					tag="li"
					:content="twinoidGoals[stat as StatTracking].description?.[store?.getLanguage ?? 'fr']"
				>
					<img
						:src="getImgURL('achievements', stat)"
						:alt="twinoidGoals[stat as StatTracking].name[store?.getLanguage ?? 'fr']"
					/>
					<p>{{ twinoidGoals[stat as StatTracking].name[store?.getLanguage ?? 'fr'] }}</p>
				</Tippy>
				<li class="stat-player" v-for="stats in top3" :key="stats.stat">
					<DZUser :user="{ id: stats.playerId, name: stats.playerName }" />
					<span class="stat-value" :title="stats.quantity.toString()">{{ formatLargeNumber(stats.quantity) }}</span>
				</li>
			</ul>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 16px;
	margin: 4px 0;

	.stat-card {
		list-style: none;
		background:
			url('../../assets/background/banniere_left.webp') no-repeat,
			url('../../assets/background/banniere_right.webp') no-repeat,
			url('../../assets/background/banniere_middle.webp') repeat-x;
		background-position-x: left, right, center;
		background-color: #d19860;
		background-size: auto;
		box-shadow: inset 0 0 1px 2px #d3a76a;
		border-style: solid;
		border-width: 1px;
		border-color: #9f5841;
		color: white;
		padding-bottom: 4px;

		.stat-header {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 4px;
			color: white;
			padding-left: 2px;
			font-size: 7.5pt;
			text-shadow: 0.5px 0 1px grey;
			text-transform: uppercase;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			font-weight: bold;
			margin-bottom: 10px;
			img {
				width: auto;
				max-height: 12px;
			}
		}

		.stat-player {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 2px 4px;

			&:nth-child(odd) {
				background-color: #d3a76a;
			}
		}
	}
}
</style>
