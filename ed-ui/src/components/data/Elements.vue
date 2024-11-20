<template>
	<div class="element">
		<div
			v-for="el in elementList"
			:key="el"
			v-tippy="{
				content: formatContent($t(`element.${el}`)),
				theme: 'small'
			}"
		>
			<img :src="getImgURL('elements', `elem_${el}`)" :alt="el" />
			<span :class="getMaxElement(el) ? 'max' : ''">{{ getElement(el) }}</span>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Elements',
	props: {
		fire: { type: Number, required: true },
		wood: { type: Number, required: true },
		water: { type: Number, required: true },
		lightning: { type: Number, required: true },
		air: { type: Number, required: true }
	},
	methods: {
		getMaxElement(el: string): boolean {
			const maxValue = Math.max(this.fire, this.wood, this.water, this.lightning, this.air);
			switch (el) {
				case 'fire':
					return this.fire === maxValue;
				case 'wood':
					return this.wood === maxValue;
				case 'water':
					return this.water === maxValue;
				case 'lightning':
					return this.lightning === maxValue;
				case 'air':
					return this.air === maxValue;
				default:
					return false;
			}
		},
		getElement(el: string): number {
			switch (el) {
				case 'fire':
					return this.fire;
				case 'wood':
					return this.wood;
				case 'water':
					return this.water;
				case 'lightning':
					return this.lightning;
				case 'air':
					return this.air;
				default:
					return 0;
			}
		}
	},
	computed: {
		elementList() {
			return ['fire', 'wood', 'water', 'lightning', 'air'];
		}
	}
});
</script>

<style lang="scss" scoped>
.element {
	display: flex;
	gap: 1px;
	flex-wrap: wrap;
	width: 100%;
	padding-bottom: 2px;
	justify-content: space-evenly;
	div {
		display: flex;
		font-weight: bold;
		gap: 5px;
		width: 43px;
		align-items: flex-end;
		background: url('../../assets/icons/element_bg.webp') no-repeat;
		background-position-y: 6px;
		background-position-x: 7px;
		cursor: help;
		span {
			color: white;
			font-size: 13.3px;
			text-align: left;
			padding-right: 7px;
			letter-spacing: -0.2pt;
			&.max {
				color: yellow;
			}
		}
	}
}
</style>
