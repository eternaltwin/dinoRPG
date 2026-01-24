<template>
	<p v-if="!isLogged" @click="getRedirectUri()">
		{{ $t('alpha.login') }}
	</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { OauthService } from '../services/index.js';
import { dinozStore, localStore, playerStore, useLoadingStore } from '../store/index.js';
import { errorHandler } from '../utils/index.js';
import { setCookie } from '../utils/cookies';

export default defineComponent({
	name: 'Authentication',
	data() {
		return {
			localStore: localStore(),
			playerStore: playerStore(),
			dinozStore: dinozStore(),
			isLogged: false as boolean
		};
	},
	props: {
		autoLog: {
			type: Boolean
		}
	},
	methods: {
		async authenticateToET(): Promise<void> {
			useLoadingStore().setLoaderOn();
			try {
				const commonData = await OauthService.authenticateUser(this.$route.query.code as string);
				// Set cookies
				const channel = import.meta.env.VITE_API_RELEASE_CHANNEL;
				setCookie(`x-drpg-${channel}-user`, commonData.id, 7);
				setCookie(`x-drpg-${channel}-token`, commonData.connexionToken, 7);
				useLoadingStore().setLoaderOff();
				this.isLogged = true;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}

			this.$router.push({ name: 'News' });
		},
		async getRedirectUri(): Promise<void> {
			const urlToRedirect = await OauthService.getRedirectUri();

			window.location.href = urlToRedirect.url;
		}
	},
	mounted(): void {
		setTimeout(() => {
			if (this.$route.query.code !== undefined) {
				this.authenticateToET();
			}
		}, 1);
	},
	watch: {
		autoLog() {
			this.getRedirectUri();
		}
	}
});
</script>
