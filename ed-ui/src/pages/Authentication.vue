<template>
	<div id="auth">
		Login : <input type="text" name="login" v-model="login" />
		<br />
		Password : <input type="password" name="password" v-model="password" />
		<br />
		<div v-if="erreurAuth"><span>Incorrect login or password</span><br /></div>
		<div v-if="emptyLoginOrPassword">
			<span>Merci de renseigner les champs ci-dessus</span><br />
		</div>
		<button @click="authenticateToET()">Authenticate to Eternal-Twin</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { OauthService } from '@/services';
import Buffer from 'buffer';
import { isNil } from 'lodash';
import store from '@/store';

export default defineComponent({
	name: 'Authentication',
	data() {
		return {
			login: undefined as string | undefined,
			password: undefined as string | undefined,
			erreurAuth: false as boolean,
			emptyLoginOrPassword: false as boolean
		};
	},
	emits: ['leaveAuth'],
	methods: {
		async authenticateToET(): Promise<void> {
			if (isNil(this.login) || isNil(this.password)) {
				this.emptyLoginOrPassword = true;
				return;
			}

			this.emptyLoginOrPassword = false;

			const loginToSend: string = this.login!.toLowerCase();
			const passwordToSend: string = Buffer.Buffer.from(
				this.password!,
				'utf-8'
			).toString('hex');

			try {
				const jwt: string = await OauthService.authenticateUser(
					loginToSend,
					passwordToSend
				);
				store.commit('setJwt', jwt);
				this.$emit('leaveAuth');
			} catch (err) {
				this.erreurAuth = true;
				console.log(err);
			}
		}
	}
});
</script>
