<template>
	<TitleHeader :title="`${$t('pageTitle.ranking')}`" :header="$t(`rightMenu.ranking`)"></TitleHeader>
	<ul class="onglets">
		<li :class="tabSelected === 1 ? 'active' : ''">
			<a @click="setTab(1)"><img :src="getImgURL('design', 'small_member')" alt="member" /> {{ $t('tabs.players') }}</a>
		</li>
		<li :class="tabSelected === 2 ? 'active' : ''">
			<a @click="setTab(2)">{{ $t('tabs.average') }}</a>
		</li>
		<li :class="tabSelected === 3 ? 'active' : ''">
			<a @click="setTab(3)">{{ $t('tabs.completion') }}</a>
		</li>
		<li :class="tabSelected === 4 ? 'active' : ''">
			<a @click="setTab(4)">{{ $t('tabs.clans') }}</a>
		</li>
		<li :class="tabSelected === 5 ? 'active' : ''">
			<a @click="setTab(5)">{{ $t('tabs.pantheon') }}</a>
		</li>
	</ul>
	<DZDisclaimer content="ranking.disclaimer.classic" v-if="tabSelected === 1" />
	<DZDisclaimer content="ranking.disclaimer.average" v-if="tabSelected === 2" />
	<DZDisclaimer content="ranking.disclaimer.completion" v-if="tabSelected === 3" />
	<DZDisclaimer content="ranking.disclaimer.clans" v-if="tabSelected === 4" />
	<DZDisclaimer content="ranking.disclaimer.pantheon" v-if="tabSelected === 5" />
	<RouterView />
	<SearchEntity
		v-if="tabSelected === 1 || tabSelected === 2 || tabSelected === 3"
		background
		entityType="player"
		placeHolder="ranking.placeholder.searchPlayer"
		@entity="goToAccount"
	/>
	<SearchEntity
		v-if="tabSelected === 4"
		background
		entityType="clan"
		placeHolder="ranking.placeholder.searchClan"
		@entity="goToClan"
	/>
</template>

<script lang="ts">
import { Player } from '@drpg/core/models/player/Player';
import { Clan } from '@drpg/prisma';
import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import SearchEntity from '../components/data/SearchEntity.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';

export default defineComponent({
	name: 'Ranking',
	components: {
		DZDisclaimer,
		TitleHeader,
		SearchEntity,
		RouterView
	},
	data() {
		return {
			tabSelected: 1 as number
		};
	},
	methods: {
		async setTab(value: number): Promise<void> {
			this.tabSelected = value;
			const routes = ['RankingPlayers', 'RankingAverage', 'RankingCompletion', 'RankingClans', 'RankingPantheon'];
			this.$router.push({ name: routes[value - 1] });
		},
		goToAccount(p: Pick<Player, 'id' | 'name'>): void {
			this.$router.push({ name: 'MyAccount', params: { id: p.id } });
		},
		goToClan(c: Pick<Clan, 'id' | 'name'>): void {
			this.$router.push({ name: 'Clan', params: { id: c.id } });
		}
	},
	watch: {
		tabSelected(value: number) {
			const routes = ['RankingPlayers', 'RankingAverage', 'RankingCompletion', 'RankingClans', 'RankingPantheon'];
			this.$router.push({ name: routes[value - 1] });
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
