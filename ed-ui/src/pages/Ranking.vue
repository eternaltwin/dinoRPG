<template>
	<TitleHeader :title="`${$t('pageTitle.ranking')}`"></TitleHeader>
	<div class="section">
		<div class="titlePage">
			<h3>{{ $t(`rightMenu.ranking`) }}</h3>
		</div>
	</div>
	<ul class="tabs">
		<li :class="tabSelected === 1 ? 'active' : ''">
			<a href="#" @click="setTab(1)"
				><img :src="getImgURL('design', 'small_member')" alt="member" /> {{ $t('tabs.players') }}</a
			>
		</li>
		<li :class="tabSelected === 2 ? 'active' : ''">
			<a href="#" @click="setTab(2)">{{ $t('tabs.average') }}</a>
		</li>
		<li :class="tabSelected === 3 ? 'active' : ''">
			<a href="#" @click="setTab(3)">{{ $t('tabs.completion') }}</a>
		</li>
		<li :class="tabSelected === 4 ? 'active' : ''">
			<a href="#" @click="setTab(3)">{{ $t('tabs.clans') }}</a>
		</li>
	</ul>
	<div class="disclaimer" v-if="tabSelected === 1">
		{{ $t('ranking.disclaimer.classic') }}
	</div>
	<div class="disclaimer" v-if="tabSelected === 2">
		{{ $t('ranking.disclaimer.average') }}
	</div>
	<div class="disclaimer" v-if="tabSelected === 3">
		{{ $t('ranking.disclaimer.completion') }}
	</div>
	<PlayerRanking sort="classic" v-if="tabSelected === 1" />
	<PlayerRanking sort="average" v-if="tabSelected === 2" />
	<CompletionRanking v-if="tabSelected === 3" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import PlayerRanking from '../components/rankings/PlayerRanking.vue';
import CompletionRanking from '../components/rankings/CompletionRanking.vue';

export default defineComponent({
	name: 'Ranking',
	components: {
		CompletionRanking,
		TitleHeader,
		PlayerRanking
	},
	data() {
		return {
			tabSelected: 1 as number
		};
	},
	methods: {
		async setTab(value: number): Promise<void> {
			this.tabSelected = value;
		}
	}
});
</script>

<style lang="scss" scoped>
.disclaimer {
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px;
	padding-left: 5px;
	padding-left: 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;
}
</style>
