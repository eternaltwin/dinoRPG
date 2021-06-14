<template>
	<div id="auth">
		<div v-if="!isCodePresent">
			<button @click="getRedirectUri()">Sign-in to Eternal-Twin</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { OauthService, DataService } from '@/services';
import { isNil } from 'lodash';
import store from '@/store';

export default defineComponent({
	name: 'Authentication',
	data() {
		return {
			isCodePresent: false as boolean
		};
	},
	methods: {
		async authenticateToET(): Promise<void> {
			let jwt: string;
			try {
				jwt = await OauthService.authenticateUser(
					this.$route.query.code as string
				);
			} catch (err) {
				console.error(err);
				return Promise.reject(err);
			}

			store.commit('setJwt', jwt);

			this.$router.push({ name: 'Accueil' });
			setTimeout(() => this.$router.go(0), 100);
		},
		async getRedirectUri(): Promise<void> {
			const urlToRedirect: string = await DataService.getRedirectUri();

			window.open(urlToRedirect);
		}
	},
	mounted(): void {
		setTimeout(() => {
			this.isCodePresent = !isNil(this.$route.query.code);
			if (this.isCodePresent) {
				this.authenticateToET();
			}
		}, 1);
	}
});
</script>
