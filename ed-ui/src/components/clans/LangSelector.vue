<template>
	<div class="flags">
		<Flag
			v-for="lang in langs"
			:key="lang.short"
			:lang="lang.short"
			:class="[value.includes(lang.short) ? 'selected' : '']"
			class="flag"
			@click="updatedSelectedLangs(lang.short)"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Locales } from '../../i18n';
import Flag from '../common/Flag.vue';

export default defineComponent({
	components: { Flag },
	name: 'LangSelector',
	props: ['modelValue'],
	emits: ['update:modelValue', 'change'],
	computed: {
		value: {
			get() {
				return this.modelValue;
			},
			set(value) {
				this.$emit('update:modelValue', value);
				this.$emit('change', value);
			}
		}
	},
	data() {
		return {
			langs: Locales
		};
	},
	methods: {
		updatedSelectedLangs(langShort: string) {
			if (this.value.includes(langShort)) {
				this.value = this.value.filter(v => v !== langShort);
			} else {
				this.value = [...this.value, langShort];
			}
		}
	}
});
</script>

<style scoped lang="scss">
.flags {
	display: flex;
	justify-content: center;
	gap: 6px;

	.flag {
		cursor: pointer;
		width: 16px;
		height: 11px;
		border: 1px solid rgb(108, 113, 136);
		outline: 2px solid transparent;
		outline-offset: 0;
		box-shadow: none;

		&.selected {
			outline-color: #318d15;
		}
	}
}
</style>
