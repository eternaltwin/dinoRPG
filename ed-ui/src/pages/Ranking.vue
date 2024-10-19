<template>
	<TitleHeader :title="`${$t('pageTitle.ranking')}`"></TitleHeader>
	<div class="section ml-[-25px] mt-[-25px] sm:ml-0 sm:mt-0">
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
		<li :class="tabSelected === 5 ? 'active' : ''">
			<a href="#" @click="setTab(5)">{{ $t('tabs.pantheon') }}</a>
		</li>
	</ul>
	<DZDisclaimer
		v-if="tabSelected === 1"
		help
		:content="$t('ranking.disclaimer.classic')"
		class="ml-[-50px] mt-[50px] sm:ml-0 sm:mt-0"
	/>
	<DZDisclaimer
		v-if="tabSelected === 2"
		help
		:content="$t('ranking.disclaimer.average')"
		class="ml-[-50px] mt-[50px] sm:ml-0 sm:mt-0"
	/>
	<DZDisclaimer
		v-if="tabSelected === 3"
		help
		:content="$t('ranking.disclaimer.completion')"
		class="ml-[-50px] mt-[50px] sm:ml-0 sm:mt-0"
	/>
	<DZDisclaimer
		v-if="tabSelected === 5"
		help
		:content="$t('ranking.disclaimer.pantheon')"
		class="ml-[-50px] mt-[50px] sm:ml-0 sm:mt-0"
	/>
	<PlayerRanking sort="classic" :tab-selected="tabSelected" v-if="tabSelected === 1" />
	<PlayerRanking sort="average" :tab-selected="tabSelected" v-if="tabSelected === 2" />
	<CompletionRanking :tab-selected="tabSelected" v-if="tabSelected === 3" />
	<Pantheon v-if="tabSelected === 5" />
	<input
		class="ml-[-50px] h-[22px] w-[200px] border-none bg-[url('./assets/background/form_field.webp')] bg-no-repeat px-2.5 pt-0.5 text-[#fce3bc] outline-none placeholder:text-[#fce3bc] sm:ml-0"
		type="text"
		:placeholder="$t('ranking.search')"
		v-model="searchValue"
		list="players"
		@keyup.enter="getPlayer()"
	/><datalist id="players">
		<option v-for="(players, index) in playerList" :key="index">
			{{ players.name }}
		</option>
	</datalist>
	<div v-if="displayErrorMessage" class="text-red-500">This player doesn't exist</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import PlayerRanking from '../components/rankings/PlayerRanking.vue';
import CompletionRanking from '../components/rankings/CompletionRanking.vue';
import { PlayerService } from '../services/index.js';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import Pantheon from '../components/rankings/Pantheon.vue';

interface PlayerSearch {
	name: string;
	id: number;
}

export default defineComponent({
	name: 'Ranking',
	components: {
		CompletionRanking,
		TitleHeader,
		PlayerRanking,
		DZDisclaimer,
		Pantheon
	},
	data() {
		return {
			tabSelected: 1 as number,
			displayErrorMessage: false as boolean,
			awaitingSearch: false as boolean,
			searchValue: undefined as string | undefined,
			playerList: [] as Array<PlayerSearch>
		};
	},
	methods: {
		async setTab(value: number): Promise<void> {
			this.tabSelected = value;
		},
		async getResults(): Promise<void> {
			if (this.searchValue && this.searchValue.length >= 3) {
				this.playerList = await PlayerService.searchPlayers(this.searchValue);
			}
		},
		goToAccount(paramId: number): void {
			this.$router.push({ name: 'MyAccount', params: { id: paramId } });
		},
		async getPlayer(): Promise<void> {
			this.displayErrorMessage = false;
			const playerId: number | undefined = this.playerList.find(player => player.name === this.searchValue)?.id;

			if (playerId === undefined) {
				this.displayErrorMessage = true;
				return;
			}

			this.goToAccount(playerId);
		}
	},
	watch: {
		searchValue(): void {
			if (!this.awaitingSearch) {
				setTimeout(() => {
					this.getResults();
					this.awaitingSearch = false;
				}, 700); // 0.7 sec delay
			}
			this.awaitingSearch = true;
		}
	}
});
</script>

<style lang="scss" scoped>
.tabs {
	background-color: transparent !important;
}
</style>
