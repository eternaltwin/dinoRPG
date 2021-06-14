<template>
	<div>
		<span>Cookie : </span>
		<input type="text" name="cookie" v-model="cookie" />
		<br />
		<button :disabled="buttonDisabled" @click="getAccountData()">
			Get account data
		</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DataService } from '@/services';

export default defineComponent({
	name: 'Data',
	data() {
		return {
			cookie: undefined as string | undefined,
			buttonDisabled: false as boolean,
			isJwtPresent: false as boolean
		};
	},
	methods: {
		async getAccountData(): Promise<void> {
			if (this.cookie) {
				this.buttonDisabled = true;

				try {
					await DataService.getAccountData(this.cookie);
				} catch (err) {
					this.buttonDisabled = false;
					console.error('Erreur lors de la sauvegarde des données');
				}
			}
		}
	}
});
</script>
