<template>
	<DZTable>
		<tr>
			<th>Job Name</th>
			<th>Next run</th>
			<th>Actions</th>
		</tr>
		<tr v-for="job in jobs" :key="job.name">
			<td>{{ job.name }}</td>
			<td>{{ new Date(job.nextRun).toLocaleString('fr-FR') }}</td>
			<td>%</td>
		</tr>
	</DZTable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AdminService } from '../../services';
import { errorHandler } from '../../utils';
import DZTable from '../common/DZTable.vue';
import { Jobs } from '@drpg/core/models/admin/jobs';

export default defineComponent({
	name: 'ScheduledJobs',
	components: { DZTable },
	data() {
		return {
			jobs: [] as Jobs[]
		};
	},
	async mounted() {
		try {
			this.jobs = await AdminService.getScheduledJobs();
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
	}
});
</script>

<style scoped lang="scss"></style>
