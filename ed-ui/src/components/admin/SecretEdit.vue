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
			<table>
				<tbody>
					<tr>
						<th>Key</th>
						<th>Value</th>
					</tr>
					<tr>
						<td>{{ newSecret.key }}</td>
						<td><input type="text" v-model="newSecret.value" /></td>
					</tr>
				</tbody>
			</table>
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
.radio {
	padding-right: 10px;
	margin-left: 3px;
	margin-top: 3px;
}
table {
	width: 100%;
	margin-top: 10px;
	margin-bottom: 10px;
	border: 2px solid #bc683c;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;
	tr {
		display: table-row;
		th {
			font-size: 8pt;
			text-shadow: 1px 1px 0px #356847;
			padding-left: 4px;
			padding-right: 4px;
			padding-bottom: 8px;
			height: 41px;
			vertical-align: bottom;
			color: #fffdba;
			text-transform: uppercase;
			font-weight: bold;
			letter-spacing: 1pt;
			text-align: left;
			white-space: nowrap;
			border: 1px solid #356847;
			background-color: #c64e36;
			background-image: url('../../assets/background/table_header.webp');
			background-position: left bottom;
			max-width: 222px;
		}
		td {
			font-size: 9pt;
			padding: 1px 5px;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			height: 75px;
		}
	}
}
</style>
