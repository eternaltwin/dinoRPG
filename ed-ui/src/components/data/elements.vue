<template>
	<ul class="elements">
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
	</ul>
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
		}
	}
});
</script>

<style lang="scss" scoped>
span {
	font-size: 10pt !important;

	&.max {
		color: yellow;
	}
}
.elements {
	list-style: none;
	height: 23px;

	li {
		float: left;
		position: relative;
		width: 42px;
		height: 23px;
		margin-right: 2px;
		font-size: 10pt !important;
		font-weight: bold;
		color: white;
		text-align: left;
		letter-spacing: -0.2pt;
		background-image: url('@/assets/icons/element_bg.webp');
		background-position: 7px 5px;
		background-repeat: no-repeat;
		cursor: help;

		&.max {
			color: yellow;
		}

		img {
			margin-right: -3px;
			vertical-align: -30%;
		}
	}
}
</style>
