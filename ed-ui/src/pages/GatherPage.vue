<template>
	<TitleHeader :title="$t('pageTitle.gather') + $t(`gather.action.${gatherType}`) + ` ]`" />
	<div style="width: auto">
		<div class="section">
			<div class="titlePage">
				<h3>{{ $t(`gather.action.${gatherType}`) }}</h3>
			</div>
		</div>
	</div>
	<div class="disclaimer">
		{{ $t('levelup.disclaimer') }}
	</div>
	<div
		class="container"
		v-if="loaded"
		:style="{
			height: `${grid.grid.length * 34}px`,
			width: `${grid.grid.length * 34}px`
		}"
	>
		<img class="bgimg" :src="getImgURL('gather/background', gatherType)" />
		<div class="grid">
			<div class="row" v-for="(row, rowNumber) in grid.grid" :key="row">
				<div
					v-for="(box, boxNumber) in row"
					:key="box"
					@click="selectBox(rowNumber, boxNumber)"
					:class="[
						{
							selected: isSelected(rowNumber, boxNumber),
							open: box === -1
						},
						gatherType
					]"
					class="overlay"
				>
					{{ grid.gatherTurn }}
				</div>
			</div>
		</div>
		<GatherRewardModal v-if="gatherOver" :rewards="gatherResult.rewards" @close="returnToDinoz()" />
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import EventBus from '../events/index.js';
import { GatherPublicGrid } from '@drpg/core/models/gather/gatherPublicGrid';
import { DinozService } from '../services/index.js';
import { errorHandler } from '../utils/index.js';
import { GatherResult } from '@drpg/core/models/gather/gatherResult';
import GatherRewardModal from '../components/modal/GatherRewardModal.vue';

export default defineComponent({
	name: 'GatherPage',
	components: {
		GatherRewardModal,
		TitleHeader: defineAsyncComponent(() => import('../components/utils/TitleHeader.vue'))
	},
	data() {
		return {
			grid: undefined as GatherPublicGrid,
			loaded: false as boolean,
			clickedBox: [] as Array<Array<number>>,
			gatherOver: false as boolean,
			gatherResult: undefined as GatherResult
		};
	},
	methods: {
		returnToDinoz() {
			this.$router.go(-1);
		},
		async selectBox(row: number, box: number): Promise<void> {
			if (this.gatherOver) return;
			const isNotDiscover = this.grid.grid[row][box] === 0;
			const toPush = [row, box];
			const isInArray = this.clickedBox.some(a => a.every((val, index) => val === toPush[index]));
			if (isNotDiscover && !isInArray) {
				this.clickedBox.push(toPush);
				this.grid.gatherTurn--;
			}
			if (this.grid.gatherTurn <= 0) {
				this.gatherResult = await DinozService.gatherWithDinoz(this.dinozId, this.gatherType, this.clickedBox);
				this.grid.grid = this.gatherResult.grid;
				this.gatherOver = true;
			}
			if (
				this.grid.grid.reduce((partSum, b) => b.reduce((partialSum, a) => partialSum + a, 0) + partSum, 0) +
					this.grid.grid[0].length * this.grid.grid[0].length -
					this.grid.gatherTurn <
				this.grid.gatherTurn
			) {
				this.gatherResult = await DinozService.gatherWithDinoz(this.dinozId, this.gatherType, this.clickedBox);
				this.grid.grid = this.gatherResult.grid;
				this.gatherOver = true;
			}
		},
		isSelected(row: number, box: number): boolean {
			const toTest = [row, box];
			return this.clickedBox.some(a => a.every((val, index) => val === toTest[index]));
		}
	},
	computed: {
		gatherType(): string {
			return this.$route.params.type.toString();
		},
		dinozId(): number {
			return parseInt(this.$route.params.dinozId as string);
		}
	},
	async created(): Promise<void> {
		EventBus.emit('isLoading', true);
		try {
			this.grid = await DinozService.getGatherGrid(this.dinozId, this.gatherType);
			this.loaded = true;
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.disclaimer {
	border-radius: 5px;
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px 5px 5px 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;
}
.bgimg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}
.grid {
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	box-shadow: inset 0 4px 0 #720d00;
}
.container {
	position: relative;
	margin: 15px;
	overflow: hidden;
	border: 10px solid transparent;
	border-image: url('../assets/gather/border.webp') 30 stretch;
}

.row {
	display: flex;
	flex-direction: row;
	flex-grow: 1;

	// TILES DESIGN
	div {
		color: transparent;
		flex-grow: 1;
		background-size: cover;
		box-shadow: 0 4px 0 #720d00;
		box-sizing: border-box;
		cursor: pointer;
		display: inline-block;
		height: 34px;
		width: 34px;

		&::after { // creates a pseudo-element to display the bg-images
			content: '';
			display: block;
			opacity: 30%;
			margin-top: -18px;
			width: 34px;
			height: 34px;
		}

		&:hover {
			outline: 1px solid #994400;
			box-shadow: inset 0 0 0 1px #ffee92, inset 0 0 0 2px #994400, 0 4px 0 #720d00;
		}

		&.open {
			visibility: hidden;
		}
		&:not(.open):hover {
			border: 1px solid #994400;
			box-shadow: inset 0 0 0 1px #ffee92, inset 0 0 0 2px #994400, 0 4px 0 #720d00;
			font-size: initial;
			text-align: center;
			padding-top: 7px;
			padding-left: 2px;
			color: white;
			text-shadow: rgb(188, 104, 60) 1px 0 0, rgb(188, 104, 60) 0.540302px 0.841471px 0,
				rgb(188, 104, 60) -0.416147px 0.909297px 0, rgb(188, 104, 60) -0.989993px 0.14112px 0,
				rgb(188, 104, 60) -0.653644px -0.756803px 0, rgb(188, 104, 60) 0.283662px -0.958924px 0,
				rgb(188, 104, 60) 0.96017px -0.279416px 0;
		}
	}
}

// ATLERNING TILE COLOR
.row:nth-child(odd) div:nth-child(even),
.row:nth-child(even) div:nth-child(odd) {
	background-image: url('../assets/gather/light.webp');
}
.row:nth-child(odd) div:nth-child(odd),
.row:nth-child(even) div:nth-child(even) {
	background-image: url('../assets/gather/dark.webp');
}


.fish::after {
	background-image: url('../assets/gather/overlay/fish.webp');
	background-size: 238px;
}

.anniv::after {
	background-image: url('../assets/gather/overlay/anniv.webp');
	background-size: 340px;
}

// TILES BG POSITION - INDEXED TO TILE SIZE: 34px (will break if tiles are not exactly this size)
// BG Y OFFSET
@for $i from 1 through 12 {
	.row:nth-child(#{$i}) .overlay::after {
		background-position-y: ($i - 1) * -34px;
	}
}

// BG X OFFSET
@for $i from 1 through 12 {
	.row div:nth-child(#{$i}).overlay::after {
		background-position-x: ($i - 1) * -34px;
	}
}
.selected {
	border: 1px solid #ffee92 !important;
}
</style>
