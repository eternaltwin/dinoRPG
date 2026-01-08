<template>
	<DZTable>
		<tr>
			<th>IP</th>
			<th>Compte uniques</th>
			<th>Liste</th>
		</tr>
		<tr v-for="item in list" :key="item.ip">
			<td>{{ item.ip }}</td>
			<td>{{ item.count }}</td>
			<td><DZButton @click="listPLayers(item.ip)">Click</DZButton></td>
		</tr>
	</DZTable>
	<tr class="pagination-controls">
		<button @click="previousPage" :disabled="currentPage === 1">
			<img class="left" src="/src/assets/button/button-back-arrow.webp" />
		</button>
		<button @click="nextPage">
			<img class="right" src="/src/assets/button/button-back-arrow.webp" />
		</button>
	</tr>

	{{ currentIP }}
	<DZTable>
		<tr>
			<th>Profile</th>
			<th>LastLogin</th>
		</tr>
		<tr v-for="item in multiList" :key="item.id">
			<td><DZUser :user="item"></DZUser></td>
			<td>{{ formatDate(item.lastLogin) }}</td>
		</tr>
	</DZTable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AdminService } from '../../services';
import { errorHandler } from '../../utils';
import DZTable from '../common/DZTable.vue';
import { IPList, suspectedPlayer } from '@drpg/core/models/admin/IPList';
import DZButton from '../common/DZButton.vue';
import DZUser from '../common/DZUser.vue';

export default defineComponent({
	name: 'MultiMonitoring',
	components: { DZUser, DZButton, DZTable },
	data() {
		return {
			list: [] as IPList[],
			currentIP: '' as string,
			multiList: [] as suspectedPlayer[],
			currentPage: 1 as number
		};
	},
	methods: {
		async listPLayers(ip: string) {
			this.currentIP = ip;
			try {
				this.multiList = await AdminService.listPlayerBehindIp(btoa(ip));
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		previousPage() {
			if (this.currentPage > 0) {
				this.currentPage--;
			}
		},
		nextPage() {
			this.currentPage++;
		}
	},
	async mounted() {
		try {
			this.list = await AdminService.getMultiIPs(this.currentPage);
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
	},
	watch: {
		async currentPage() {
			try {
				this.list = await AdminService.getMultiIPs(this.currentPage);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	}
});
</script>

<style scoped lang="scss"></style>
