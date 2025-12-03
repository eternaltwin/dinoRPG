<template>
	<TitleHeader :title="`${$t('pageTitle.ranking')}`" :header="$t(`topBar.rightMenuranking`)"></TitleHeader>
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
					params: { pageLoaded: 1 }
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
			this.$router.push({ name: 'MyAccount', params: { id: p.id } });
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
.onglets {
	list-style: none;
	height: 18px;
	align-self: center;
	background-color: #9a4029;
	background-image: url('../assets/design/tabsBg.webp');
	background-repeat: no-repeat;
	border-bottom: 1px solid #ffe7aa;
	li {
		float: left;
		position: relative;
		margin-right: 5px;
		&.active {
			margin-top: 1px;
			text-shadow: 1px 1px 0px #9a4029;
			a {
				background-color: #d69e68;
				color: white;
				border-left-color: #ffe7aa;
				border-top-color: #ffe7aa;
				border-bottom: 1px solid #d69e68;
			}
		}
		a {
			color: #fce3bc;
			text-decoration: none;
			padding-left: 5px;
			padding-right: 5px;
			background-color: #bc683c;
			border-right: 1px solid black;
			border-left: 1px solid #d39a65;
			border-top: 1px solid #d39a65;
			font-size: 10pt;
			border-radius: 0px;
		}
	}
}
</style>
