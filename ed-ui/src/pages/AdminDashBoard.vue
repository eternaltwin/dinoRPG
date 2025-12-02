<template>
	<TitleHeader :title="$t('pageTitle.admin')"></TitleHeader>
	<div class="search">
		<DZSelect id="player-search" v-model="searchedPlayerId" :search="searchPlayer" />
		<DZButton @click="getPlayer">Edit</DZButton>
	</div>
	<div v-if="displayErrorMessage" class="red">This player doesn't exist</div>
	<ul class="tabs" style="margin-top: 10px">
		<li>
			<a href="#" :class="tabSelected === 1 ? 'active' : ''" @click="setTab(1)"> Player Edit </a>
		</li>
		<li>
			<a href="#" :class="tabSelected === 2 ? 'active' : ''" @click="setTab(2)"> Dinoz Edit </a>
		</li>
		<li>
			<a href="#" :class="tabSelected === 3 ? 'active' : ''" @click="setTab(3)"> News </a>
		</li>
		<li>
			<a href="#" :class="tabSelected === 4 ? 'active' : ''" @click="setTab(4)"> Secret </a>
		</li>
		<li>
			<a href="#" :class="tabSelected === 5 ? 'active' : ''" @click="setTab(5)"> Logs </a>
		</li>
		<li>
			<a href="#" :class="tabSelected === 6 ? 'active' : ''" @click="setTab(6)"> GameStats </a>
		</li>
		<li>
			<a href="#" :class="tabSelected === 7 ? 'active' : ''" @click="setTab(7)"> Moderation </a>
		</li>
		<li>
			<a href="#" :class="tabSelected === 8 ? 'active' : ''" @click="setTab(8)"> Banned </a>
		</li>
		<li>
			<a href="#" :class="tabSelected === 9 ? 'active' : ''" @click="setTab(9)"> Game </a>
		</li>
		<li>
			<a href="#" :class="tabSelected === 10 ? 'active' : ''" @click="setTab(10)"> Debug </a>
		</li>
		<li>
			<a href="#" :class="tabSelected === 11 ? 'active' : ''" @click="setTab(11)"> Scheduled Jobs </a>
		</li>
		<li>
			<a href="#" :class="tabSelected === 12 ? 'active' : ''" @click="setTab(12)"> Polls </a>
		</li>
	</ul>
	<PlayerEdit v-if="player.name && tabSelected === 1" :playerProp="player" />
	<div v-if="player.name && tabSelected === 2">
		<form>
			<select name="dinoz" v-model="selectedDinoz">
				<template v-for="(dinoz, index) in dinozList" :key="index">
					<option :value="dinoz">{{ dinoz.name }}</option>
				</template>
			</select>
		</form>
	</div>
	<DinozEdit v-if="selectedDinoz && tabSelected === 2" :dinozProp="selectedDinoz" :playerId="player.id" />
	<NewsEdit v-if="tabSelected === 3" />
	<SecretEdit v-if="tabSelected === 4" />
	<LogsView v-if="tabSelected === 5" />
	<GameStats v-if="tabSelected === 6" />
	<Moderation v-if="tabSelected === 7" />
	<Banned v-if="tabSelected === 8" />
	<GameControl v-if="tabSelected === 9" />
	<DebugFight v-if="tabSelected === 10" />
	<ScheduledJobs v-if="tabSelected === 11" />
	<PollEdit v-if="tabSelected === 12" />
</template>

<script lang="ts">
import TitleHeader from '../components/utils/TitleHeader.vue';
import { defineComponent } from 'vue';
import EventBus from '../events/index.js';
import { errorHandler } from '../utils/index.js';
import { AdminService, PlayerService } from '../services/index.js';
import PlayerEdit from '../components/admin/PlayerEdit.vue';
import DinozEdit from '../components/admin/DinozEdit.vue';
import NewsEdit from '../components/admin/NewsEdit.vue';
import SecretEdit from '../components/admin/SecretEdit.vue';
import LogsView from '../components/admin/LogsView.vue';
import GameStats from '../components/admin/GameStats.vue';
import Moderation from '../components/admin/Moderation.vue';
import Banned from '../components/admin/Banned.vue';
import { DinozAdminFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { playerStore } from '../store/index.js';
import GameControl from '../components/admin/GameControl.vue';
import DebugFight from '../components/admin/DebugFight.vue';
import ScheduledJobs from '../components/admin/ScheduledJobs.vue';
import { Player } from '@drpg/prisma';
import PollEdit from '../components/admin/PollEdit.vue';
import DZSelect from '../components/common/DZSelect.vue';
import DZButton from '../components/common/DZButton.vue';

interface PlayerSearch {
	name: string;
	id: string;
}

export default defineComponent({
	name: 'AdminDashBoard',
	components: {
		ScheduledJobs,
		DebugFight,
		GameControl,
		TitleHeader,
		NewsEdit,
		PlayerEdit,
		DinozEdit,
		SecretEdit,
		LogsView,
		GameStats,
		Moderation,
		Banned,
		PollEdit,
		DZSelect,
		DZButton
	},
	data() {
		return {
			searchValue: undefined as string | undefined,
			playerList: [] as Array<PlayerSearch>,
			player: {} as Player,
			tabSelected: 1 as number,
			dinozList: {} as Array<DinozAdminFiche>,
			selectedDinoz: null as DinozAdminFiche | null,
			awaitingSearch: false as boolean,
			displayErrorMessage: false as boolean,
			searchedPlayerId: ''
		};
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
	},
	methods: {
		async searchPlayer(query: string): Promise<Array<{ value: string; label: string }>> {
			if (query.length < 3) {
				return [];
			}
			const results = await PlayerService.searchPlayers(query);
			return results.map(player => ({
				value: player.id,
				label: `${player.name} (${player.id.slice(0, 6)})`
			}));
		},
		async setTab(value: number): Promise<void> {
			this.tabSelected = value;
		},
		async getResults(): Promise<void> {
			if (this.searchValue && this.searchValue.length >= 3) {
				this.playerList = await PlayerService.searchPlayers(this.searchValue);
			}
		},
		async getPlayer(): Promise<void> {
			this.displayErrorMessage = false;

			EventBus.emit('isLoading', true);

			try {
				[this.player, this.dinozList] = await Promise.all([
					AdminService.getplayerInformation(this.searchedPlayerId),
					AdminService.listAllDinozFromPlayer(this.searchedPlayerId)
				]);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}

			EventBus.emit('isLoading', false);
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);

		if (!playerStore().isAdmin) {
			this.$router.push({
				name: 'News'
			});
		}
		try {
			await AdminService.getDashBoard();
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.search {
	display: flex;
	align-items: center;
	gap: 10px;
}
.active {
	background-color: #f3ca92;
	color: #710;
	padding: 4px;
}
.red {
	color: red;
}
.tabs {
	height: auto;
}
input[type='text'],
select {
	padding: 5px;
	margin-top: 5px;
	margin-bottom: 10px;
	border: 1px solid #c88f44;
	background-color: #f3ca92;
	color: #710;
}
input[type='submit'] {
	margin-top: 20px;
	background-color: #c64e36;
	color: #fffdba;
	border: 1px solid #c64e36;
	padding: 5px 20px;
	cursor: pointer;
}
</style>
