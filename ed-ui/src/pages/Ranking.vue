<template>
	<TitleHeader :title="`${$t('pageTitle.ranking')}`" :header="$t(`topBar.rightMenu.ranking`)"></TitleHeader>
	<ul class="onglets">
		<li>
			<RouterLink
				:to="{
					name: 'RankingPlayers',
					params: { pageLoaded: 1 }
				}"
				><img :src="getImgURL('design', 'small_member')" alt="member" /> {{ $t('tabs.players') }}</RouterLink
			>
		</li>
		<li>
			<RouterLink
				:to="{
					name: 'RankingAverage',
					params: { pageLoaded: 1 }
				}"
				>{{ $t('tabs.average') }}</RouterLink
			>
		</li>
		<li>
			<RouterLink
				:to="{
					name: 'RankingCompletion',
					params: { pageLoaded: 1 }
				}"
				>{{ $t('tabs.completion') }}</RouterLink
			>
		</li>
		<li>
			<RouterLink
				:to="{
					name: 'RankingClans',
					query: { page: 1 }
				}"
				>{{ $t('tabs.clans') }}</RouterLink
			>
		</li>
		<li>
			<RouterLink
				:to="{
					name: 'RankingPantheon'
				}"
				>{{ $t('tabs.pantheon') }}</RouterLink
			>
		</li>
		<li>
			<RouterLink
				:to="{
					name: 'StatRanking'
				}"
				>{{ $t('tabs.stats') }}</RouterLink
			>
		</li>
	</ul>

	<RouterView />
</template>

<script lang="ts">
import { Clan, Player } from '@drpg/prisma';
import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';
import TitleHeader from '../components/utils/TitleHeader.vue';

export default defineComponent({
	name: 'Ranking',
	components: {
		TitleHeader,
		RouterView
	},
	methods: {
		goToAccount(p: Pick<Player, 'id' | 'name'>): void {
			this.$router.push({ name: 'Account', params: { id: p.id } });
		},
		goToClan(c: Pick<Clan, 'id' | 'name'>): void {
			this.$router.push({ name: 'Clan', params: { id: c.id } });
		}
	}
});
</script>

<style lang="scss" scoped>
.search::placeholder {
	color: #fce3bc;
}
a {
	cursor: pointer;
}
</style>
