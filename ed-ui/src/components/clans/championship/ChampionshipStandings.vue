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
			<th class="dinoz-header">{{ $t('clanChampionship.standingsCol.points') }}</th>
		</tr>
		<tr v-for="(s, i) in standings" :key="i" :class="{ mine: s.clanId !== null && s.clanId === clanStored.getClanId }">
			<td>{{ s.rank }}</td>
			<td class="clan">
				<RouterLink v-if="s.clanId !== null" :to="{ name: 'Clan', params: { id: s.clanId } }">{{
					s.clanName
				}}</RouterLink>
				<span v-else>{{ s.clanName }}</span>
			</td>
			<td>{{ s.played }}</td>
			<td>{{ s.won }}</td>
			<td>{{ s.drawn }}</td>
			<td>{{ s.lost }}</td>
			<td>{{ signed(s.scoreDiff) }}</td>
			<td>{{ s.scoreFor }}</td>
			<td>{{ s.points }}</td>
		</tr>
	</DZTable>
</template>

<script setup lang="ts">
import type { ClanChampionshipStandingDTO } from '@drpg/core/models/clan/clanChampionship';
import DZTable from '../../common/DZTable.vue';
import { clanStore } from '../../../store/clanStore';

defineProps<{ standings: ClanChampionshipStandingDTO[] }>();

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
tr.mine td {
	background-color: #f3ca92;
	font-weight: bold;
}
</style>
