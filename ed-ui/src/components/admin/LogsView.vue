<template>
	<select v-model="type">
		<option value="null">All</option>
		<!-- <option v-for="type in LogType" :key="type" :value="type">{{ type }}</option> -->
	</select>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { LogsService } from '../../services/index.js';
import prisma = require('@drpg/prisma');
import EventBus from '../../events/index.js';
import { errorHandler } from '../../utils/index.js';

export default defineComponent({
	name: 'LogsView',
	data() {
		return {
			logs: [] as prisma.Log[],
			type: null as prisma.LogType | null,
			userId: null as number | null,
			dinozId: null as number | null,
			LogType: prisma.LogType
		};
	},
	methods: {
		async reload() {
			EventBus.emit('isLoading', true);
			try {
				this.logs = await LogsService.list(this.type, this.userId, this.dinozId);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
		}
	},
	async mounted() {
		this.reload();
	},
	watch: {
		type() {
			this.reload();
		},
		userId() {
			this.reload();
		},
		dinozId() {
			this.reload();
		}
	}
});
</script>

<style lang="scss" scoped></style>
