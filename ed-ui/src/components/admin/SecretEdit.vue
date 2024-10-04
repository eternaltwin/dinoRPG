<template>
	<template v-if="allSecrets">
		<label for="secret">Select a secret to edit : </label>
		<select id="secret" v-model="newSecret" @change="newSelect = true">
			<template v-for="(secret, index) in allSecrets" :key="index">
				<option :value="secret">{{ secret.key }}</option>
			</template></select
		><br />
		<label for="createSecret">Or type the name to create a secret : </label>
		<input id="createSecret" v-model="newSecret.key" type="text" />
		<form @submit.prevent="sendToServer()" v-if="newSecret.key">
			<fieldset>
				<legend>Secret Keys</legend>
				<div>
					<label for="secretKey" class="mt-[5px] font-bold uppercase">{{ newSecret.key }}</label>
					<input id="secretKey" type="text" v-model="newSecret.value" />
				</div>
			</fieldset>
			<input type="submit" />
		</form>
	</template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AdminService } from '../../services/index.js';
import { SecretData } from '@drpg/core/models/admin/SecretData';

export default defineComponent({
	data() {
		return {
			allSecrets: [] as Array<SecretData>,
			newSecret: {} as Partial<SecretData>,
			newSelect: false as boolean
		};
	},
	methods: {
		async sendToServer(): Promise<void> {
			this.allSecrets = await AdminService.pushSecret(this.newSecret.key, this.newSecret.value);
		}
	},
	async mounted(): Promise<void> {
		this.allSecrets = await AdminService.getAllSecret();
	}
});
</script>

<style lang="scss" scoped>
form {
	width: 100%;
	margin-top: 20px;
	margin-bottom: 10px;
	background-color: #ecbd84;
	border-spacing: 2px;
	padding: 5px;
	fieldset {
		border: 2px solid #bc683c;
		margin: 15px 0;
		padding: 20px;
		width: 90%;
	}
	legend {
		font-size: 13pt;
		text-shadow: 1px 1px 0px #356847;
		padding-left: 8px;
		padding-right: 8px;
		padding-bottom: 8px;
		height: 41px;
		color: #fffdba;
		text-transform: uppercase;
		font-weight: bold;
		letter-spacing: 1.5pt;
		text-align: left;
		border: 1px solid #356847;
		background-color: #c64e36;
		background-image: url('../../assets/background/table_header.webp');
		background-position: left bottom;
		width: 60%;
	}
	div {
		align-items: flex-start;
		display: flex;
		flex-direction: column;
	}
	label {
		display: block;
		margin-bottom: 5px;
		color: #710;
		font-size: 9pt;
	}
	input[type='text'] {
		width: calc(100% - 20px);
		padding: 5px;
		margin-top: 5px;
		margin-bottom: 10px;
		border: 1px solid #c88f44;
		background-color: #f3ca92;
		color: #710;
	}
	input[type='submit'] {
		margin-top: 20px;
		background-color: #c64e36;
		color: #fffdba;
		border: none;
		padding: 10px 20px;
		cursor: pointer;
		border-radius: 5px;
	}
}
input[type='text'],
select {
	padding: 5px;
	margin-top: 5px;
	margin-bottom: 10px;
	border: 1px solid #c88f44;
	background-color: #f3ca92;
	color: #710;
}
</style>
