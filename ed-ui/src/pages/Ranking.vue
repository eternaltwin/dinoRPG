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
	<PlayerRanking sort="classic" v-if="tabSelected === 1" />
	<PlayerRanking sort="average" v-if="tabSelected === 2" />
	<CompletionRanking v-if="tabSelected === 3" />
	<ClansRanking v-if="tabSelected === 4" />
	<Pantheon v-if="tabSelected === 5" />
	<input
		class="search"
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
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import ClansRanking from '../components/rankings/ClansRanking.vue';

interface PlayerSearch {
	name: string;
	id: number;
}

export default defineComponent({
	name: 'Ranking',
	components: {
		ClansRanking,
		DZDisclaimer,
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
	color: #fce3bc;
	height: 20px;
	padding-left: 8px;
	padding-right: 8px;
	padding-top: 2px;
	width: 185px;
	margin-left: 1rem;
}
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
