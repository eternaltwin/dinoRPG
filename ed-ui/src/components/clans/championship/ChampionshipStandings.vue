<template>
	<DZTable data-testid="standings">
		<tr>
			<th class="dinoz-header">{{ $t('clanChampionship.standingsCol.rank') }}</th>
			<th class="dinoz-header">{{ $t('clanChampionship.standingsCol.clan') }}</th>
			<th class="dinoz-header">{{ $t('clanChampionship.standingsCol.played') }}</th>
			<th class="dinoz-header">{{ $t('clanChampionship.standingsCol.won') }}</th>
			<th class="dinoz-header">{{ $t('clanChampionship.standingsCol.drawn') }}</th>
			<th class="dinoz-header">{{ $t('clanChampionship.standingsCol.lost') }}</th>
			<th class="dinoz-header">{{ $t('clanChampionship.standingsCol.diff') }}</th>
			<th class="dinoz-header">{{ $t('clanChampionship.standingsCol.scoreFor') }}</th>
			<th class="dinoz-header" title="Buchholz">{{ $t('clanChampionship.standingsCol.buchholz') }}</th>
			<th class="dinoz-header">{{ $t('clanChampionship.standingsCol.points') }}</th>
		</tr>
		<tr v-for="(s, i) in standings" :key="i" :class="{ mine: s.clanId !== null && s.clanId === clanStored.getClanId }">
			<td>{{ s.rank }}</td>
			<td class="clan">
				<RouterLink v-if="s.clanId !== null" :to="{ name: 'Clan', params: { id: s.clanId } }">{{
					s.clanName
				}}</RouterLink>
				<span v-else>{{ s.clanName }}</span>
				<span v-if="liveClans?.has(s.clanName)" class="live" :title="$t('clanChampionship.liveMatch')">●</span>
			</td>
			<td>{{ s.played }}</td>
			<td>{{ s.won }}</td>
			<td>{{ s.drawn }}</td>
			<td>{{ s.lost }}</td>
			<td>{{ signed(s.scoreDiff) }}</td>
			<td>{{ s.scoreFor }}</td>
			<td>{{ s.buchholz }}</td>
			<td>{{ s.points }}</td>
		</tr>
	</DZTable>
</template>

<script setup lang="ts">
import type { ClanChampionshipStandingDTO } from '@drpg/core/models/clan/clanChampionship';
import DZTable from '../../common/DZTable.vue';
import { clanStore } from '../../../store/clanStore';

defineProps<{
	standings: ClanChampionshipStandingDTO[];
	/** Clans whose match is in progress (by name, the standings key), flagged in the live view. */
	liveClans?: Set<string>;
}>();

function signed(n: number): string {
	return n > 0 ? `+${n}` : `${n}`;
}
const clanStored = clanStore();
</script>

<style lang="scss" scoped>
td,
th {
	text-align: center;
}
td.clan {
	text-align: left;
}
td.clan .live {
	margin-left: 4px;
	color: #c62828;
	animation: live-blink 1.5s ease-in-out infinite;
}
@keyframes live-blink {
	50% {
		opacity: 0.3;
	}
}
tr.mine td {
	background-color: #f3ca92;
	font-weight: bold;
}
</style>
