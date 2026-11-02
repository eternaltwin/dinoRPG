<template>
	<div class="score-bar">
		<div class="side west">
			<strong class="clan-name">{{ west.name }}</strong>
			<span class="score">{{ west.score }}</span>
			<span class="detail">{{ $t('clanChampionship.scoreLine', { line: west.scoreLine }) }}</span>
			<span class="detail">{{ $t('clanChampionship.quota', { used: west.quotaUsed, max: QUOTA }) }}</span>
		</div>
		<div class="center">
			<span class="status">{{ $t(`clanChampionship.status.${status}`) }}</span>
			<span class="timer" v-if="status === 'scheduled'">{{
				$t('clanChampionship.startsAt', { date: formatDate(startsAt) })
			}}</span>
			<span class="timer" v-else-if="status === 'live'">{{
				$t('clanChampionship.timeLeft', { time: countdown })
			}}</span>
		</div>
		<div class="side east">
			<strong class="clan-name">{{ east.name }}</strong>
			<span class="score">{{ east.score }}</span>
			<span class="detail">{{ $t('clanChampionship.scoreLine', { line: east.scoreLine }) }}</span>
			<span class="detail">{{ $t('clanChampionship.quota', { used: east.quotaUsed, max: QUOTA }) }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { BoardSideDTO, ClanChampionshipMatchStatus } from '@drpg/core/models/clan/clanChampionship';

const QUOTA = 100;

const props = defineProps<{
	west: BoardSideDTO;
	east: BoardSideDTO;
	startsAt?: Date | string;
	endsAt: Date | string;
	status: ClanChampionshipMatchStatus;
}>();

const { locale } = useI18n();
const now = ref(Date.now());
const timer = setInterval(() => (now.value = Date.now()), 1000);
onBeforeUnmount(() => clearInterval(timer));

const countdown = computed(() => {
	const total = Math.max(0, Math.floor((new Date(props.endsAt).getTime() - now.value) / 1000));
	const d = Math.floor(total / 86400);
	const h = Math.floor((total % 86400) / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d > 0 ? `${d}j ` : ''}${pad(h)}:${pad(m)}:${pad(s)}`;
});

function formatDate(d?: Date | string): string {
	return d ? new Date(d).toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short' }) : '';
}
</script>

<style lang="scss" scoped>
.score-bar {
	display: flex;
	justify-content: space-between;
	align-items: stretch;
	gap: 8px;
	padding: 6px 10px;
	border-radius: 6px;
	background-color: #f3ca92;
	border: 1px solid #874a16;
}
.side {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 0;
	&.east {
		align-items: flex-end;
		text-align: right;
		.clan-name {
			color: var(--cdc-east, #b03a2e);
		}
	}
	&.west .clan-name {
		color: var(--cdc-west, #2b6cb0);
	}
}
.clan-name {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 100%;
}
.score {
	font-size: 1.8em;
	font-weight: bold;
	line-height: 1.1;
}
.detail {
	font-size: 0.8em;
}
.center {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	.status {
		text-transform: uppercase;
		font-size: 0.8em;
		letter-spacing: 1px;
		color: #874a16;
	}
	.timer {
		font-weight: bold;
	}
}
</style>
