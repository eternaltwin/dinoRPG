<template>
	<div class="search">
		<input
			id="player"
			type="text"
			:placeholder="$t('messagerie.addParticipants')"
			v-model="searchValue"
			list="players"
		/>
		<div>
			<div
				class="userSearchResultsContainer"
				:class="{ show: playerList.length > 0, hide: playerList.length <= 0 }"
				:key="playerList.length"
			>
				<div
					class="users"
					v-for="(player, index) in playerList"
					:key="index"
					@click="
						$emit('player', player);
						playerList = [];
						searchValue = undefined;
					"
				>
					<span>{{ player.name }}</span>
				</div>
			</div>
		</div>

		<div v-if="displayErrorMessage">{{ $t('messagerie.playerNotFound') }}</div>
	</div>
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
			} else {
				this.playerList = [];
			}
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

<style scoped lang="scss">
input {
	background-color: #b05733;
	outline: 1px solid transparent;
	outline-offset: 2px;
	border: none;
	padding-left: 4px;
	font-weight: 400;
	font-size: 16px;
	color: #ffee92;
	height: 100%;
	&:focus {
		transition: outline-color 0.5s;
		outline-color: #efdba8;
	}
}
.search {
	display: flex;
	flex-direction: column;
	width: max-content;
	height: auto;
	position: relative;
	.userSearchResultsContainer {
		flex-direction: column;
		max-height: calc(32px * 5);
		position: absolute;
		background: #5c2b20;
		border: 1px solid #ddab76;
		box-shadow: 0 0 3px #000;

		display: block;
		margin: 2px 0 0;
		outline: 1px solid #000;
		overflow: auto;
		width: calc(100% - 2px);
		z-index: 1;
	}
	.users {
		height: 32px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		gap: 3px;
		background-color: rgb(174 97 57);
		&::after {
			content: ' ';
			border: 1px #ddab76;
			border-top-style: dotted;
			width: calc(100% - 2px);
		}
		&:hover {
			transition: outline-color 0.5s;
			outline-color: #efdba8;
			cursor: pointer;
			background-color: rgb(203 124 73);
		}
	}
	.hide {
		opacity: 0;

		height: 0;
		transition: all 0.5s ease;
	}
	.show {
		opacity: 1;
		height: auto;
		transition: height 2s ease;
	}
}
</style>
