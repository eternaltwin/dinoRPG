<template>
	<div :class="['disclaimer', { round }]">
		<img v-if="help" :src="getImgURL('icons', 'question', true)" class="icon" />
		<img v-if="timer" :src="getImgURL('design', 'small_chrono')" class="icon" />
		<div v-if="content" v-html="formatContent($t(content, params))" />
		<slot v-else />
	</div>
</template>

<script setup lang="ts">
type Props = {
	content?: string;
	params?: Record<string, unknown>;
	help?: boolean;
	timer?: boolean;
	round?: boolean;
};

withDefaults(defineProps<Props>(), {
	params: () => ({}),
	help: false,
	timer: false,
	round: false
});
</script>

<style lang="scss" scoped>
.disclaimer {
	display: flex;
	align-items: center;
	margin: 10px;
	padding: 5px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;

	&.round {
		border-radius: 8px;
	}

	.icon {
		margin-right: 5px;
	}
}
</style>
