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
			<p>{{ getElement(el) }}</p>
		</div>
	</div>
	<!--	<ul class="elements">
		<li
			:class="getMaxElement() === fire ? 'max' : ''"
			v-tippy="{
				content: formatContent($t('element.fire')),
				theme: 'small'
			}"
		>
			<img :src="getImgURL('elements', 'elem_fire')" alt="fire" /> {{ fire }}
		</li>
		<li
			:class="getMaxElement() === wood ? 'max' : ''"
			v-tippy="{
				content: formatContent($t('element.wood')),
				theme: 'small'
			}"
		>
			<img :src="getImgURL('elements', 'elem_wood')" alt="wood" /> {{ wood }}
		</li>
		<li
			:class="getMaxElement() === water ? 'max' : ''"
			v-tippy="{
				content: formatContent($t('element.water')),
				theme: 'small'
			}"
		>
			<img :src="getImgURL('elements', 'elem_water')" alt="water" /> {{ water }}
		</li>
		<li
			:class="getMaxElement() === lightning ? 'max' : ''"
			v-tippy="{
				content: formatContent($t('element.lightning')),
				theme: 'small'
			}"
		>
			<img :src="getImgURL('elements', 'elem_lightning')" alt="lightning" /> {{ lightning }}
		</li>
		<li
			:class="getMaxElement() === air ? 'max' : ''"
			v-tippy="{
				content: formatContent($t('element.air')),
				theme: 'small'
			}"
		>
			<img :src="getImgURL('elements', 'elem_air')" alt="air" /> {{ air }}
		</li>
	</ul>-->
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
		getMaxElement(): number {
			{
				return Math.max(this.fire, this.wood, this.water, this.lightning, this.air);
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
		width: fit-content;
		align-items: flex-end;
		background: url('../../assets/icons/element_bg.webp') no-repeat;
		background-position-y: 6px;
		background-position-x: 7px;
		cursor: help;
		p {
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
