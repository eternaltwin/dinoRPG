<template>
	<div class="infos">
		<ul class="elements">
			<li><img :src="getImg(0)" alt="fire" />{{ fire }}</li>
			<li><img :src="getImg(1)" alt="wood" />{{ wood }}</li>
			<li><img :src="getImg(2)" alt="water" />{{ water }}</li>
			<li><img :src="getImg(3)" alt="light" />{{ light }}</li>
			<li><img :src="getImg(4)" alt="air" />{{ air }}</li>
		</ul>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Elements',
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
