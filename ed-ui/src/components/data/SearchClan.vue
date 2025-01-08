<template>
	<div
		:class="{
			search: true,
			background: background
		}"
	>
		<input id="player" type="text" :placeholder="$t(placeHolder)" v-model="searchValue" list="players" />
		<div>
			<div
				class="clanSearchResultsContainer"
				:class="{ show: clanList.length > 0, hide: clanList.length <= 0 }"
				:key="clanList.length"
			>
				<div
					class="clans"
					v-for="(clan, index) in clanList"
					:key="index"
					@click="
						$emit('clan', clan);
						clanList = [];
						searchValue = undefined;
					"
				>
					<span>{{ clan.name }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ClanService } from '../../services/index.js';

export interface ClanSearch {
	name: string;
	id: number;
}
export default defineComponent({
	name: 'SearchPlayer',
	props: {
		placeHolder: { type: String, required: true },
		background: { type: Boolean, default: false }
	},
	data() {
		return {
			searchValue: undefined as string | undefined,
			clanList: [] as Array<ClanSearch>,
			awaitingSearch: false as boolean
		};
	},
	emits: ['clan'],
	methods: {
		async getResults(): Promise<void> {
			if (this.searchValue && this.searchValue.length >= 3) {
				this.clanList = await ClanService.searchClans(this.searchValue);
			} else {
				this.clanList = [];
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
	.clanSearchResultsContainer {
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
	.clans {
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
.background {
	background-image: url('../../assets/background/form_field.webp');
	align-self: center;
	background-repeat: no-repeat;
	border: none;
	color: #fce3bc;
	width: 200px;
	height: 22px;
	&:focus {
		transition: outline-color 0.5s;
		outline-color: #efdba8;
	}
	input {
		background: none;
		margin-left: 5px;
		outline: 1px solid transparent;
		outline-offset: 0;
		border: none;
		padding-left: 0;
		font-weight: 400;
		font-size: 16px;
		color: #ffee92;
		height: 100%;
	}
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
}
</style>
