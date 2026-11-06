<template>
	<div class="match-timer">
		<img :src="getImgURL('design', 'small_chrono')" alt="" />
		<span v-if="status === 'scheduled'">{{ $t('clanChampionship.startsAt', { date: formatDate(startsAt) }) }}</span>
		<span v-else-if="status === 'live'">{{ $t('clanChampionship.timeLeft', { time: countdown }) }}</span>
		<span v-else>{{ $t('clanChampionship.matchFinished') }}</span>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ClanChampionshipMatchStatus } from '@drpg/core/models/clan/clanChampionship';
import { getImgURL } from '../../../mixin/mixin';

const props = defineProps<{
	startsAt?: Date | string;
	endsAt: Date | string;
	status: ClanChampionshipMatchStatus;
}>();

const { locale, t } = useI18n();
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
	return `${d > 0 ? `${t('clanChampionship.daysShort', { days: d })} ` : ''}${pad(h)}:${pad(m)}:${pad(s)}`;
});

function formatDate(d?: Date | string): string {
	return d ? new Date(d).toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short' }) : '';
}
</script>

<style lang="scss" scoped>
.match-timer {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	align-self: center;
	box-sizing: border-box;
	width: min(100%, 460px);
	padding: 4px 16px;
	border-radius: 999px;
	background-color: #bc693c;
	color: #fdeccb;
	font-weight: bold;
}
</style>
