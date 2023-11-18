<template>
	<div class="disclaimer">
		<img v-if="help" :src="getImgURL('icons', 'question', true)" class="help" />
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
		}
	}
});
</script>

<style lang="scss" scoped>
.disclaimer {
	display: flex;
	align-items: center;
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;
	.help {
		margin-right: 5px;
	}
}
</style>
