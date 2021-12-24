<template>
	<p v-if="!isCodePresent" class="sign" @click="getRedirectUri()">
		{{ $t('alpha.login') }}
	</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { OauthService } from '@/services';
import { isNil } from 'lodash';
import store from '@/store';
import EventBus from '@/events';

export default defineComponent({
	name: 'Authentication',
	data() {
		return {
			isCodePresent: false as boolean
		};
	},
	methods: {
		async authenticateToET(): Promise<void> {
			EventBus.emit('isLoading', true);
			let jwt: string;
			try {
				jwt = await OauthService.authenticateUser(
					this.$route.query.code as string
				);
				EventBus.emit('isLoading', false);
			} catch (err) {
				console.error(err);
				return;
			}

			store.commit('setJwt', jwt);

			this.$router.push({ name: 'Accueil' });
			setTimeout(() => this.$router.go(0), 100);
		},
		async getRedirectUri(): Promise<void> {
			const urlToRedirect: string = await OauthService.getRedirectUri();

			window.location.replace(urlToRedirect);
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
