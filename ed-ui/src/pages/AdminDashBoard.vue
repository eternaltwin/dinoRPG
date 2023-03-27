<template>
	<div class="search">
		<input type="text" placeholder="Search Player" v-model="searchValue" list="players" @keyup.enter="getPlayer()" />
		<datalist id="players">
			<option v-for="(players, index) in playerList" :key="index">
				{{ players.name }}
			</option>
		</datalist>
		<input type="submit" @click="getPlayer()" />
	</div>
	<div v-if="displayErrorMessage" class="red">This player doesn't exist</div>
	<ul class="tabs" style="margin-top: 10px">
		<li :class="tabSelected === 1 ? 'active' : ''">
			<a href="#" @click="tabSelected = 1"> Player Edit </a>
		</li>
		<li :class="tabSelected === 2 ? 'active' : ''">
			<a href="#" @click="tabSelected = 2"> Dinoz Edit </a>
		</li>
		<li :class="tabSelected === 3 ? 'active' : ''">
			<a href="#" @click="tabSelected = 3"> News </a>
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EventBus from '../events';
import { errorHandler } from '../utils';
import { AdminService, PlayerService } from '../services';
import { Dinoz, Player } from '../models';
import PlayerEdit from '../components/admin/PlayerEdit.vue';
import DinozEdit from '../components/admin/DinozEdit.vue';
import NewsEdit from '../components/admin/NewsEdit.vue';

interface PlayerSearch {
	name: string;
	id: number;
}

export default defineComponent({
	name: 'AdminDashBoard',
	components: { NewsEdit, PlayerEdit, DinozEdit },
	data() {
		return {
			searchValue: undefined as string | undefined,
			playerList: [] as Array<PlayerSearch>,
			player: {} as Player,
			tabSelected: 1 as number,
			dinozList: {} as Array<Dinoz>,
			selectedDinoz: null as Dinoz | null,
			awaitingSearch: false as boolean,
			displayErrorMessage: false as boolean
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
			const playerId: number | undefined = this.playerList.find(player => player.name === this.searchValue)?.id;

			if (playerId === undefined) {
				this.displayErrorMessage = true;
				return;
			}

			EventBus.emit('isLoading', true);

			try {
				[this.player, this.dinozList] = await Promise.all([
					AdminService.getplayerInformation(playerId),
					AdminService.listAllDinozFromPlayer(playerId)
				]);
			} catch (err) {
				errorHandler.handle(err);
			}

			EventBus.emit('isLoading', false);
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		try {
			await AdminService.getDashBoard();
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.red {
	color: red;
}
</style>
