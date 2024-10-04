<template>
	<div :class="['disclaimer', { round }]">
		<img v-if="help" :src="getImgURL('icons', 'question', true)" class="mr-[5px]" />
		<img v-if="timer" :src="getImgURL('design', 'small_chrono')" class="mr-[5px]" />
		<div v-html="formatContent($t(content, params))" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'DZDisclaimer',
	props: {
		content: {
			type: String,
			required: true
		},
		params: {
			type: Object,
			default: () => ({})
		},
		help: {
			type: Boolean,
			default: false
		},
		timer: {
			type: Boolean,
			default: false
		},
		round: {
			type: Boolean,
			default: false
		}
	}
});
</script>

<style lang="scss" scoped>
.disclaimer {
	&.round {
		border-radius: 8px;
	}
	.icon {
		margin-right: 5px;
	}
}
</style>
