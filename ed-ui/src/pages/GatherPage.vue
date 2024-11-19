<template>
	<TitleHeader
		:title="$t('pageTitle.gather') + $t(`gather.action.${gatherType}`) + ` ]`"
		:header="$t(`gather.action.${gatherType}`)"
	/>
	<div class="disclaimer" v-if="loaded">
		{{ $t('gather.disclaimer', { number: grid.gatherTurn, search: $t(`gather.type.${gatherType}`) }) }}
	</div>
	<div
		class="container"
		v-if="grid && loaded"
		:style="{
			height: `${grid.grid.length * 34}px`,
			width: `${grid.grid.length * 34}px`
		}"
	>
		<img class="bgimg" :src="getImgURL('gather/background', grid.gatherType)" />
		<div class="grid">
			<div class="row" v-for="(row, rowNumber) in grid.grid" :key="rowNumber">
				<div
					v-for="(box, boxNumber) in row"
					:key="boxNumber"
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
		<GatherRewardModal v-if="gatherOver && gatherResult" :rewards="gatherResult.rewards" @close="returnToDinoz()" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EventBus from '../events/index.js';
import { GatherPublicGrid } from '@drpg/core/models/gather/gatherPublicGrid';
import { DinozService } from '../services/index.js';
import { errorHandler } from '../utils/index.js';
import { GatherResult } from '@drpg/core/models/gather/gatherResult';
import GatherRewardModal from '../components/modal/GatherRewardModal.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';

export default defineComponent({
	name: 'GatherPage',
	components: {
		GatherRewardModal,
		TitleHeader
	},
	data() {
		return {
			grid: undefined as GatherPublicGrid | undefined,
			loaded: false as boolean,
			clickedBox: [] as Array<Array<number>>,
			gatherOver: false as boolean,
			gatherResult: undefined as GatherResult | undefined
		};
	},
	methods: {
		returnToDinoz() {
			this.$router.go(-1);
		},
		async selectBox(row: number, box: number): Promise<void> {
			if (!this.grid) return;
			if (this.gatherOver) return;
			const isNotDiscover = this.grid.grid[row][box] === 0;
			const toPush = [row, box];
			const isInArray = this.clickedBox.some(a => a.every((val, index) => val === toPush[index]));
			if (isNotDiscover && !isInArray) {
				this.clickedBox.push(toPush);
				this.grid.gatherTurn--;
			}
			const leftSquare = Math.pow(this.grid.grid[0].length, 2) + this.sumOfArrays(this.grid.grid);
			if (this.grid.gatherTurn <= 0 || leftSquare - this.clickedBox.length == 0) {
				EventBus.emit('isLoading', true);
				try {
					this.gatherResult = await DinozService.gatherWithDinoz(this.dinozId, this.gatherType, this.clickedBox);
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
				this.grid.grid = this.gatherResult.grid;
				this.gatherOver = true;
				EventBus.emit('isLoading', false);
			}
		},
		isSelected(row: number, box: number): boolean {
			const toTest = [row, box];
			return this.clickedBox.some(a => a.every((val, index) => val === toTest[index]));
		},
		sumOfArrays(arrays: Array<Array<number>>) {
			let sum = 0;

			for (let i = 0; i < arrays.length; i++) {
				for (let j = 0; j < arrays[i].length; j++) {
					sum += arrays[i][j];
				}
			}

			return sum;
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
			errorHandler.handle(err, this.$toast);
			this.$router.push({
				name: 'DinozPage',
				params: { id: this.dinozId }
			});
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
	align-self: center;
}

.row {
	display: flex;
	flex-direction: row;
	flex-grow: 1;

	// TILES DESIGN
	div {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		color: transparent;
		flex-grow: 1;
		background-size: cover;
		box-shadow: 0 4px 0 #720d00;
		box-sizing: border-box;
		cursor: pointer;
		height: 34px;
		width: 34px;

		&::after {
			// creates a pseudo-element to display the bg-images
			position: absolute;
			top: 0;
			left: 0;
			content: '';
			display: block;
			opacity: 30%;
			width: 34px;
			height: 34px;
		}

		&:hover {
			outline: 1px solid #994400;
			box-shadow:
				inset 0 0 0 1px #ffee92,
				inset 0 0 0 2px #994400,
				0 4px 0 #720d00;
			font-size: initial;
			text-align: center;
			color: white;
		}

		&.open {
			visibility: hidden;
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
.cueille::after {
	background-image: url('../assets/gather/overlay/cueille.webp');
	background-size: 278px;
}
.energy::after {
	background-image: url('../assets/gather/overlay/energy.webp');
	background-size: 204px;
}
.hunt::after {
	background-image: url('../assets/gather/overlay/hunt.webp');
	background-size: 204px;
}
.seek::after {
	background-image: url('../assets/gather/overlay/seek.webp');
	background-size: 340px;
}

.anniv::after {
	background-image: url('../assets/gather/overlay/anniv.webp');
	background-size: 340px;
}

.daily::after {
	background-image: url('../assets/gather/overlay/daily.webp');
	background-size: 199px;
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
