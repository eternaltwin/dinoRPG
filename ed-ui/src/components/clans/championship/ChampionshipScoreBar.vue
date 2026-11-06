<template>
	<div class="score-bar">
		<div class="pill">
			<strong class="clan-name west" data-testid="clan-name">{{ west.name }}</strong>
			<span class="score">{{ west.score }} - {{ east.score }}</span>
			<strong class="clan-name east" data-testid="clan-name">{{ east.name }}</strong>
		</div>
		<div class="details">
			<div class="side">
				<span>{{ $t('clanChampionship.scoreLine', { line: west.scoreLine }) }}</span>
				<span>{{ $t('clanChampionship.quota', { used: west.quotaUsed, max: QUOTA }) }}</span>
			</div>
			<div class="side east">
				<span>{{ $t('clanChampionship.scoreLine', { line: east.scoreLine }) }}</span>
				<span>{{ $t('clanChampionship.quota', { used: east.quotaUsed, max: QUOTA }) }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { BoardSideDTO } from '@drpg/core/models/clan/clanChampionship';

const QUOTA = 100;

defineProps<{ west: BoardSideDTO; east: BoardSideDTO }>();
</script>

<style lang="scss" scoped>
.score-bar {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
.pill {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
	align-items: center;
	gap: 10px;
	align-self: center;
	box-sizing: border-box;
	width: min(100%, 460px);
	padding: 4px 16px;
	border-radius: 999px;
	background-color: #bc693c;
	color: #fdeccb;
}
.clan-name {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	&.west {
		text-align: right;
	}
}
.score {
	font-size: 1.2em;
	font-weight: bold;
	white-space: nowrap;
}
.details {
	display: flex;
	justify-content: space-between;
	gap: 8px;
	font-size: 0.8em;
}
.side {
	display: flex;
	flex-direction: column;
	&.east {
		align-items: flex-end;
		text-align: right;
	}
}
</style>
