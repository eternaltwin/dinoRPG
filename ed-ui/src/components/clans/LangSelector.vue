<template>
	<select v-model="value">
		<option v-for="locale of langs" :key="locale.short" :value="locale.short">{{ locale.caption }}</option>
	</select>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Locales } from '../../i18n';

export default defineComponent({
	name: 'LangSelector',
	props: ['modelValue'],
	emits: ['update:modelValue'],
	computed: {
		value: {
			get() {
				return this.modelValue;
			},
			set(value) {
				this.$emit('update:modelValue', value);
			}
		}
	},
	data() {
		return {
			langs: Locales
		};
	}
});
</script>

<style scoped lang="scss"></style>
