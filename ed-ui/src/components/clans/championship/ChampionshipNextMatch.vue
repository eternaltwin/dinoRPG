<template>
	<div class="next-match" data-testid="next-match">
		<p>{{ $t('clanChampionship.opponent', { clan: opponent }) }}</p>
		<p v-if="kickOffIn > 0" :title="formatDate(match.startsAt)">
			{{ $t('clanChampionship.kickOff', countdown(kickOffIn)) }}
		</p>
		<p v-else>{{ $t('clanChampionship.status.live') }}</p>
		<p v-if="match.placeId !== null">{{ $t('clanChampionship.matchPlace', { place: placeName }) }}</p>
		<p v-else :title="formatDate(revealAt)">{{ $t('clanChampionship.placeRevealAt', countdown(revealIn)) }}</p>
		<RouterLink v-if="match.status === 'live'" :to="{ name: 'ClanChampionshipMatch' }">
			<DZButton>{{ $t('clanChampionship.viewBoard') }}</DZButton>
		</RouterLink>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { PLACE_REVEAL_HOURS, type ClanChampionshipMatchDTO } from '@drpg/core/models/clan/clanChampionship';
import { placeList } from '@drpg/core/models/place/PlaceList';
import DZButton from '../../common/DZButton.vue';
import { secondsToDhms } from '../../../utils/index.js';

const props = defineProps<{ match: ClanChampionshipMatchDTO; clanId: number }>();
const { locale, t } = useI18n();

const opponent = computed(
	() => (props.match.homeClan.id === props.clanId ? props.match.awayClan : props.match.homeClan).name
);
const revealAt = computed(() => new Date(new Date(props.match.startsAt).getTime() - PLACE_REVEAL_HOURS * 3600 * 1000));
const now = ref(Date.now());
const ticker = setInterval(() => (now.value = Date.now()), 30 * 1000);
onBeforeUnmount(() => clearInterval(ticker));
const kickOffIn = computed(() => new Date(props.match.startsAt).getTime() - now.value);
const revealIn = computed(() => revealAt.value.getTime() - now.value);

const placeName = computed(() => {
	const place = Object.values(placeList).find(p => p.placeId === props.match.placeId);
	return place ? t(`place.name.${place.name}`) : '?';
});

// Rounded up to the minute so the countdown never reads 0 minutes while time remains
function countdown(ms: number) {
	return secondsToDhms(Math.max(0, Math.ceil(ms / 60000)) * 60);
}

function formatDate(d: Date | string): string {
	return new Date(d).toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short' });
}
</script>

<style lang="scss" scoped>
.next-match {
	display: flex;
	flex-direction: column;
	gap: 4px;
	align-items: flex-start;
}
</style>
