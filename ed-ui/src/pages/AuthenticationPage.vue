<template>
	<p v-if="!isCodePresent" class="sign" @click="getRedirectUri()">
		{{ $t('alpha.login') }}
	</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { OauthService } from '../services/index.js';
import { sessionStore } from '../store/index.js';
import EventBus from '../events/index.js';
import { errorHandler } from '../utils/index.js';

export default defineComponent({
	name: 'Authentication',
	data() {
		return {
			sessionStore: sessionStore(),
			isCodePresent: false as boolean
		};
	},
	methods: {
		async authenticateToET(): Promise<void> {
			EventBus.emit('isLoading', true);
			let jwt: string;
			try {
				jwt = await OauthService.authenticateUser(this.$route.query.code as string);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}

			this.sessionStore.setJwt(jwt);
			this.$router.go(0);
		},
		async getRedirectUri(): Promise<void> {
			const urlToRedirect: string = await OauthService.getRedirectUri();

			window.location.replace(urlToRedirect);
		}
	},
	mounted(): void {
		setTimeout(() => {
			this.isCodePresent = this.$route.query.code !== undefined;
			if (this.isCodePresent) {
				this.authenticateToET();
			}
		}, 1);
	}
});
</script>
