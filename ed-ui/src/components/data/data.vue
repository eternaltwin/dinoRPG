<template>
	<div>
		<input type="text" name="cookie" v-model="cookie" />
		<br />
		<button :disabled="buttonDisabled" @click="getAccountData()">
			Get account data
		</button>
		<button @click="authentication()">Test connection</button>
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
			buttonDisabled: false as boolean
		};
	},
	methods: {
		async getAccountData(): Promise<void> {
			if (this.cookie) {
				this.buttonDisabled = true;

				try {
					// await DataService.getAccountData();
				} catch (err) {
					this.buttonDisabled = false;
					console.error('Erreur lors de la sauvegarde des données');
				}
			}
		},
		async authentication(): Promise<void> {
			const code: string = await DataService.authentication();

			console.log(code);
		}
	}
});
</script>
