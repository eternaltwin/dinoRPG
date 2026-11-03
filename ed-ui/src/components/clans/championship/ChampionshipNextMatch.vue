<template>
	<div class="next-match" data-testid="next-match">
		<p>{{ $t('clanChampionship.opponent', { clan: opponent }) }}</p>
		<p>{{ $t('clanChampionship.kickOff', { date: formatDate(match.startsAt) }) }}</p>
		<p v-if="match.placeId !== null">{{ $t('clanChampionship.matchPlace', { place: placeName }) }}</p>
		<p v-else>{{ $t('clanChampionship.placeRevealAt', { date: formatDate(revealAt) }) }}</p>
		<RouterLink v-if="match.status === 'live'" :to="{ name: 'ClanChampionshipMatch' }">
			<DZButton>{{ $t('clanChampionship.viewBoard') }}</DZButton>
		</RouterLink>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { PLACE_REVEAL_HOURS, type ClanChampionshipMatchDTO } from '@drpg/core/models/clan/clanChampionship';
import { placeList } from '@drpg/core/models/place/PlaceList';
import DZButton from '../../common/DZButton.vue';

const props = defineProps<{ match: ClanChampionshipMatchDTO; clanId: number }>();
const { locale, t } = useI18n();

const opponent = computed(
	() => (props.match.homeClan.id === props.clanId ? props.match.awayClan : props.match.homeClan).name
);
const revealAt = computed(() => new Date(new Date(props.match.startsAt).getTime() - PLACE_REVEAL_HOURS * 3600 * 1000));
const placeName = computed(() => {
	const place = Object.values(placeList).find(p => p.placeId === props.match.placeId);
	return place ? t(`place.name.${place.name}`) : '?';
});

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
