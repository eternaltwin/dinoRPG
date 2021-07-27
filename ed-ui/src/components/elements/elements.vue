<template>
	<ul class="elements">
		<li>
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<img :src="getImg(0)" alt="fire" /> {{ fire }}
				</template>
				<template #tooltip-content="{ formatContent }">
					<p v-html="formatContent($t('element.fire'))" />
				</template>
			</Tooltip>
		</li>
		<li>
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<img :src="getImg(1)" alt="wood" /> {{ wood }}
				</template>
				<template #tooltip-content="{ formatContent }">
					<p v-html="formatContent($t('element.wood'))" />
				</template>
			</Tooltip>
		</li>
		<li>
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<img :src="getImg(2)" alt="water" /> {{ water }}
				</template>
				<template #tooltip-content="{ formatContent }">
					<p v-html="formatContent($t('element.water'))" />
				</template>
			</Tooltip>
		</li>
		<li>
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<img :src="getImg(3)" alt="light" /> {{ light }}
				</template>
				<template #tooltip-content="{ formatContent }">
					<p v-html="formatContent($t('element.light'))" />
				</template>
			</Tooltip>
		</li>
		<li>
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<img :src="getImg(4)" alt="air" /> {{ air }}
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
		fire: Number,
		wood: Number,
		water: Number,
		light: Number,
		air: Number
	},
	methods: {
		getImg(index: number): string {
			return require(`@/assets/elements/elem_${index}.png`);
		}
	}
});
</script>

<style lang="scss" scoped>
span {
	font-size: 10pt !important;
}
</style>
