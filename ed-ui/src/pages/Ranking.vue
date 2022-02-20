<template>
	<Title :title="`${$t('pageTitle.ranking')}`"></Title>
	<div class="section">
		<div class="titlePage">
			<h3>{{ $t(`rightMenu.ranking`) }}</h3>
		</div>
	</div>
	<ul class="tabs">
		<li :class="tabSelected === 1 ? 'active' : ''">
			<a href="#" @click="setTab(1)"
				><img :src="getImg('design', 'small_', 'member')" />
				{{ $t('tabs.players') }}</a
			>
		</li>
		<li :class="tabSelected === 2 ? 'active' : ''">
			<a href="#" @click="setTab(2)">{{ $t('tabs.average') }}</a>
		</li>
		<li :class="tabSelected === 3 ? 'active' : ''">
			<a href="#" @click="setTab(3)">{{ $t('tabs.clans') }}</a>
		</li>
	</ul>
	<div class="disclaimer" v-if="tabSelected === 1">
		{{ $t('ranking.disclaimer.classic') }}
	</div>
	<div class="disclaimer" v-if="tabSelected === 2">
		{{ $t('ranking.disclaimer.average') }}
	</div>
	<PlayerRanking sort="classic" v-if="tabSelected === 1" />
	<PlayerRanking sort="average" v-if="tabSelected === 2" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Title from '@/components/utils/Title.vue';
import PlayerRanking from '@/components/rankings/PlayerRanking.vue';

export default defineComponent({
	name: 'Ranking',
	components: {
		Title,
		PlayerRanking
	},
	data() {
		return {
			tabSelected: 1 as number
		};
	},
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.gif`);
		},
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
