<template>
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
import { PlayerService } from '../../services/index.js';

interface PlayerSearch {
	name: string;
	id: number;
}
export default defineComponent({
	name: 'SearchPlayer',
	data() {
		return {
			searchValue: undefined as string | undefined,
			playerList: [] as Array<PlayerSearch>,
			awaitingSearch: false as boolean,
			displayErrorMessage: false as boolean
		};
	},
	emits: ['player'],
	methods: {
		async getResults(): Promise<void> {
			if (this.searchValue && this.searchValue.length >= 3) {
				this.playerList = await PlayerService.searchPlayers(this.searchValue);
			}
		},
		async getPlayer(): Promise<void> {
			this.displayErrorMessage = false;
			const player = this.playerList.find(player => player.name === this.searchValue);

			if (player === undefined) {
				this.displayErrorMessage = true;
				return;
			}

			this.$emit('player', player);
			this.searchValue = undefined;
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

<style scoped lang="scss"></style>
