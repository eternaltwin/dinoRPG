<template>
	<select v-model="type">
		<option v-for="(type, index) in LogTypes" :key="index" :value="type">{{ type }}</option>
	</select>
	<input type="datetime-local" v-model="fromDate" placeholder="fromDate" />
	<button @click="reload" :disabled="!logs.length">Reload</button>
	<div v-if="type !== 'null' && type !== null">
		<Line v-if="loaded" :data="chartData" :options="chartOptions" :width="400" :height="400" />
	</div>
</template>

<script lang="ts">
import { LogListResponse } from '@drpg/core/returnTypes/Log';
import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	TimeScale,
	Title,
	Tooltip
} from 'chart.js';
import { defineComponent } from 'vue';
import { Line } from 'vue-chartjs';
import { mixin } from '../../mixin/mixin.js';
import { LogsService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import { LogTypes } from '../../utils/logs.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const diffDays = 0;

export default defineComponent({
	name: 'GameStats',
	components: {
		// eslint-disable-next-line vue/no-reserved-component-names
		Line
	},
	data() {
		const now = new Date();
		const todayAtMidnight = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));

		return {
			logs: [] as LogListResponse,
			type: null as LogListResponse[number]['type'] | string | null,
			LogTypes,
			fromDate: todayAtMidnight.toISOString().slice(0, 16),
			loaded: false,
			chartData: {
				labels: [] as string[],
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				datasets: [] as any[]
			},
			chartOptions: {
				scales: {
					x: {
						type: 'time',
						time: {
							unit: diffDays > 1 ? 'day' : 'hour'
						}
					},
					y: {
						ticks: {
							beginAtZero: true
						}
					}
				},
				responsive: true,
				maintainAspectRatio: false
			}
		};
	},
	computed: {
		isReloadDisabled(): boolean {
			return !this.type || !this.fromDate;
		}
	},
	methods: {
		async reload() {
			if (this.isReloadDisabled) {
				return;
			}

			try {
				const fromDate = new Date(this.fromDate);
				const type = this.type || null;

				this.logs = await LogsService.listByDate(type, fromDate);
				this.generateChart();
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		generateChart() {
			this.loaded = false;

			const totalsByPeriod = this.logs;
			const labels = Object.keys(totalsByPeriod);
			const data = Object.values(totalsByPeriod);

			const chartData = {
				labels: labels,
				datasets: [
					{
						label: this.type || 'All Types',
						data: data,
						borderColor: '#c88f44',
						fill: false
					}
				]
			};

			this.chartData = chartData;
			this.chartOptions = {};
			this.loaded = true;
		}
	},
	mixins: [errorHandler, mixin],
	watch: {
		type() {
			this.reload();
		},
		fromDate() {
			this.reload();
		}
	}
});
</script>

<style lang="scss" scoped>
input[type='datetime-local'],
select {
	padding: 5px;
	margin-top: 5px;
	margin-bottom: 10px;
	border: 1px solid #c88f44;
	background-color: #f3ca92;
	color: #710;
}
button {
	background-color: #c64e36;
	color: #fffdba;
	border: 1px solid #c64e36;
	padding: 5px 20px;
	cursor: pointer;
	margin-top: 10px;
	margin-right: 10px;
}
table td {
	font-family: monospace;
	font-size: 12px;

	&:first-child {
		width: 106px;
	}

	:deep(strong) {
		color: inherit;
	}
}
</style>
