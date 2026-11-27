<template>
	<div class="featured-race" data-testid="featured-race">
		<span class="star">★</span>
		<div class="text">
			<p class="title" v-html="formatContent($t('dojo.ui.featuredRace.title', { race: $t(raceNameKey(race)) }))" />
			<p class="rule">{{ $t('dojo.ui.featuredRace.rule') }}</p>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { raceNameKey } from '../../utils/dojo.js';

export default defineComponent({
	name: 'FeaturedRace',
	props: {
		race: {
			type: Number,
			required: true
		}
	},
	methods: {
		raceNameKey
	}
});
</script>

<style lang="scss" scoped>
.featured-race {
	display: flex;
	align-items: center;
	gap: 8px;
	align-self: center;
	width: 95%;
	box-sizing: border-box;
	padding: 6px 12px;
	background-color: #4d2713;
	border: 1px solid #ffd700;
	border-radius: 5px;
	color: #fff;

	.star {
		color: #ffd700;
		font-size: 24px;
		flex-shrink: 0;
	}

	.title {
		font-weight: bold;
		color: #ffda97;
	}

	.rule {
		font-size: 11px;
	}
}
</style>
