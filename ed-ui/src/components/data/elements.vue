<template>
	<ul class="elements">
		<li :class="getMaxElement() === fire ? 'max' : ''">
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<img :src="getImg('fire')" alt="fire" /> {{ fire }}
				</template>
				<template #tooltip-content="{ formatContent }">
					<p v-html="formatContent($t('element.fire'))" />
				</template>
			</Tooltip>
		</li>
		<li :class="getMaxElement() === wood ? 'max' : ''">
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<img :src="getImg('wood')" alt="wood" /> {{ wood }}
				</template>
				<template #tooltip-content="{ formatContent }">
					<p v-html="formatContent($t('element.wood'))" />
				</template>
			</Tooltip>
		</li>
		<li :class="getMaxElement() === water ? 'max' : ''">
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<img :src="getImg('water')" alt="water" /> {{ water }}
				</template>
				<template #tooltip-content="{ formatContent }">
					<p v-html="formatContent($t('element.water'))" />
				</template>
			</Tooltip>
		</li>
		<li :class="getMaxElement() === light ? 'max' : ''">
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<img :src="getImg('light')" alt="light" /> {{ light }}
				</template>
				<template #tooltip-content="{ formatContent }">
					<p v-html="formatContent($t('element.light'))" />
				</template>
			</Tooltip>
		</li>
		<li :class="getMaxElement() === air ? 'max' : ''">
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<img :src="getImg('air')" alt="air" /> {{ air }}
				</template>
				<template #tooltip-content="{ formatContent }">
					<p v-html="formatContent($t('element.air'))" />
				</template>
			</Tooltip>
		</li>
	</ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Tooltip from '@/components/utils/ToolTip.vue';

export default defineComponent({
	name: 'Elements',
	components: { Tooltip },
	props: {
		fire: { type: Number, required: true },
		wood: { type: Number, required: true },
		water: { type: Number, required: true },
		light: { type: Number, required: true },
		air: { type: Number, required: true }
	},
	methods: {
		getImg(index: string): string {
			return require(`@/assets/elements/elem_${index}.webp`);
		},
		getMaxElement(): number {
			{
				return Math.max(this.fire, this.wood, this.water, this.light, this.air);
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
		background-image: url('~@/assets/icons/element_bg.webp');
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
