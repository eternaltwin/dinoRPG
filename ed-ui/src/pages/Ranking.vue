<template>
	<TitleHeader :title="`${$t('pageTitle.ranking')}`"></TitleHeader>
	<div class="section -mt-[25px] sm:mt-0 -ml-[25px] sm:ml-0">
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
	<div
		class="disclaimer my-[10px] -ml-[50px] sm:ml-0 p-[5px] pl-[20px] text-[#fce3bc] text-[10pt] bg-[#bc683c]"
		v-if="tabSelected === 1"
	>
		{{ $t('ranking.disclaimer.classic') }}
	</div>
	<div
		class="disclaimer my-[10px] -ml-[50px] sm:ml-0 p-[5px] pl-[20px] text-[#fce3bc] text-[10pt] bg-[#bc683c]"
		v-if="tabSelected === 2"
	>
		{{ $t('ranking.disclaimer.average') }}
	</div>
	<div
		class="disclaimer my-[10px] -ml-[50px] sm:ml-0 p-[5px] pl-[20px] text-[#fce3bc] text-[10pt] bg-[#bc683c]"
		v-if="tabSelected === 3"
	>
		{{ $t('ranking.disclaimer.completion') }}
	</div>
	<div class="disclaimer" v-if="tabSelected === 5">
		{{ $t('ranking.disclaimer.pantheon') }}
	</div>
	<PlayerRanking sort="classic" :tab-selected="tabSelected" v-if="tabSelected === 1" />
	<PlayerRanking sort="average" :tab-selected="tabSelected" v-if="tabSelected === 2" />
	<CompletionRanking :tab-selected="tabSelected" v-if="tabSelected === 3" />
	<Pantheon v-if="tabSelected === 5" />
	<input
		class="search -ml-[50px] sm:ml-0 placeholder:text-[#fce3bc]"
		type="text"
		placeholder="Search Player"
		v-model="searchValue"
		list="players"
		@keyup.enter="getPlayer()"
	/><datalist id="players">
		<option v-for="(players, index) in playerList" :key="index">
			{{ players.name }}
		</option>
	</datalist>
	<div v-if="displayErrorMessage" class="red">This player doesn't exist</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import PlayerRanking from '../components/rankings/PlayerRanking.vue';
import CompletionRanking from '../components/rankings/CompletionRanking.vue';
import { PlayerService } from '../services/index.js';
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
.search {
	background-image: url('../assets/background/form_field.webp');
	background-repeat: no-repeat;
	border: none;
	outline: none;
	color: #fce3bc;
	height: 22px;
	padding-left: 8px;
	padding-right: 8px;
	padding-top: 2px;
	width: 200px;
}
.tabs {
	background-color: transparent !important;
}
</style>
