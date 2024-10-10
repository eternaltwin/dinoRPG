<template>
	<div class="ml-[-50px] mt-[45px] sm:ml-0 sm:mt-[20px]">
		<select v-model="type">
			<option value="null">All</option>
			<option v-for="(type, index) in LogTypes" :key="index" :value="type">{{ type }}</option>
		</select>
		<input type="datetime-local" v-model="fromDate" placeholder="fromDate" />
		<input type="datetime-local" v-model="toDate" placeholder="toDate" />
		<button @click="reload" :disabled="!logs.length">Reload</button>
	</div>
	<div class="relative mt-[30px] h-auto w-[80vw] md:w-[60vw] lg:w-[40vw]" v-if="type !== 'null' && type !== null">
		<Line class="ml-[-50px] w-full sm:ml-0" v-if="loaded" :data="chartData" :options="chartOptions" />
	</div>
	<div class="ml-[-50px] mt-[40px] sm:ml-0 sm:mt-[20px]">
		<table>
			<tbody>
				<tr v-for="(log, index) in paginatedLogs" :key="index">
					<td>[{{ formatDate(log.createdAt as unknown as string) }}]</td>
					<td v-html="formatContent($t(`logs.${log.type}`, getLogPropsForTranslation($t, log)))" />
				</tr>
			</tbody>
		</table>
		<button @click="page--" :disabled="page <= 1">Previous</button>
		<button @click="page++" :disabled="logs.length < 100">Next</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EventBus from '../../events/index.js';
import { errorHandler } from '../../utils/index.js';
import { LogsService } from '../../services/index.js';
import { LogListResponse } from '@drpg/core/returnTypes/Log';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { missionsList } from '../../constants/missions.js';
import { placeList } from '../../constants/place.js';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { mixin } from '../../mixin/mixin.js';
import { ingredientNameList } from '@drpg/core/models/ingredient/IngredientNameList';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
} from 'chart.js';
import { Line } from 'vue-chartjs';
import { rewardList } from '@drpg/core/models/reward/RewardList';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Permet la gestion des totaux du graph par jour / par heure
const diffDays = 0;

const LogTypes = [
	'ItemUsed',
	'ItemBought',
	'IngredientSold',
	'GoldWon',
	'GoldLost',
	'Move',
	'LevelUp',
	'Fight',
	'XPEarned',
	'HPLost',
	'Death',
	'Revive',
	'MissionStep',
	'MissionFinished',
	'MissionCanceled',
	'Gather',
	'CreateDinoz',
	'ChangeDinozOrder',
	'PlayerCreated',
	'PlayerConnected',
	'LBDone',
	'AdminUpdateDinoz',
	'AdminAddStatus',
	'AdminRemoveStatus',
	'AdminAddSkill',
	'AdminRemoveSkill',
	'AdminAddMoney',
	'AdminRemoveMoney',
	'AdminAddReward',
	'AdminRemoveReward',
	'AdminUpdatePlayer',
	'AdminUpdateSecret'
] as const;

const getLogPropsForTranslation = (
	$t: (key: string, options?: Record<string, string>) => string,
	log: LogListResponse[number]
) => {
	let values: Record<string, string> = {};

	switch (log.type) {
		case 'ItemUsed':
			values = {
				item: $t(`item.name.${itemNameList[+log.values[0]]}`),
				quantity: log.values[1]
			};
			break;
		case 'ItemBought':
			values = {
				item: $t(`item.name.${itemNameList[+log.values[0]]}`),
				quantity: log.values[1]
			};
			break;
		case 'IngredientSold':
			values = {
				item: $t(`ingredients.name.${ingredientNameList[+log.values[0]]}`),
				quantity: log.values[1]
			};
			break;
		case 'GoldWon':
			values = {
				quantity: log.values[0]
			};
			break;
		case 'GoldLost':
			values = {
				quantity: log.values[0]
			};
			break;
		case 'Move':
			values = {
				location: $t(`place.name.${placeList[+log.values[0]].name}`)
			};
			break;
		case 'LevelUp':
			values = {
				level: log.values[0]
			};
			break;
		case 'Fight':
			values = {
				gold: log.values[0],
				xp: log.values[1],
				hpLost: log.values[2]
			};
			break;
		case 'XPEarned':
			values = {
				xp: log.values[0]
			};
			break;
		case 'HPLost':
			values = {
				hpLost: log.values[0]
			};
			break;
		case 'Death':
			values = {};
			break;
		case 'Revive':
			values = {};
			break;
		case 'MissionStep':
			values = {
				mission: $t(`missions.name.${missionsList[+log.values[0]]}`),
				step: log.values[1]
			};
			break;
		case 'MissionFinished':
			values = {
				mission: $t(`missions.name.${missionsList[+log.values[0]]}`)
			};
			break;
		case 'MissionCanceled':
			values = {
				mission: $t(`missions.name.${missionsList[+log.values[0]]}`)
			};
			break;
		case 'Gather':
			values = {
				quantity: log.values[0]
			};
			break;
		case 'CreateDinoz':
			values = {};
			break;
		case 'ChangeDinozOrder':
			values = {};
			break;
		case 'PlayerCreated':
			values = {
				name: log.values[0],
				id: log.values[1]
			};
			break;
		case 'PlayerConnected':
			values = {
				name: log.values[0]
			};
			break;
		case 'AdminUpdateDinoz':
			values = {
				stat: log.values[0],
				value: log.values[1]
			};
			break;
		case 'AdminAddStatus':
			values = {
				status: $t(`status.name.${+log.values[0]}`)
			};
			break;
		case 'AdminRemoveStatus':
			values = {
				status: $t(`status.name.${+log.values[0]}`)
			};
			break;
		case 'AdminAddSkill':
			values = {
				skill: $t(`skill.name.${skillList[+log.values[0]].name}`)
			};
			break;
		case 'AdminRemoveSkill':
			values = {
				skill: $t(`skill.name.${skillList[+log.values[0]].name}`)
			};
			break;
		case 'AdminAddMoney':
			values = {
				targetId: log.values[0],
				quantity: log.values[1]
			};
			break;
		case 'AdminRemoveMoney':
			values = {
				targetId: log.values[0],
				quantity: log.values[1]
			};
			break;
		case 'AdminAddReward':
			values = {
				targetId: log.values[0],
				reward: $t(`rewards.name.${rewardList[+log.values[1]].name}`)
			};
			break;
		case 'AdminRemoveReward':
			values = {
				targetId: log.values[0],
				reward: $t(`rewards.name.${rewardList[+log.values[1]].name}`)
			};
			break;
		case 'AdminUpdatePlayer':
			values = {
				targetId: log.values[0],
				stat: log.values[1],
				value: log.values[2]
			};
			break;
		case 'AdminUpdateSecret':
			values = {
				key: log.values[0],
				value: log.values[1]
			};
			break;
		default:
			break;
	}

	return {
		player: log.player.name,
		playerId: log.playerId,
		dinoz: log.dinoz?.name,
		dinozId: log.dinozId,
		...values
	};
};

export default defineComponent({
	name: 'GameStats',
	components: {
		// eslint-disable-next-line vue/no-reserved-component-names
		Line
	},
	data() {
		return {
			page: 1,
			logs: [] as LogListResponse,
			type: null as LogListResponse[number]['type'] | string | null,
			LogTypes,
			getLogPropsForTranslation,
			fromDate: null as Date | null,
			toDate: null as Date | null,
			loaded: false,
			chartData: null,
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
		paginatedLogs() {
			const startIndex = (this.page - 1) * 100;
			const endIndex = this.page * 100;
			return this.logs.slice(startIndex, endIndex);
		}
	},
	methods: {
		async reload() {
			EventBus.emit('isLoading', true);
			try {
				const fromDate = this.fromDate || null;
				const toDate = this.toDate || null;
				const type = this.type || null;
				const logType = type as LogListResponse[number]['type'];
				this.logs = await LogsService.listByDate(logType, fromDate, toDate);
				this.generateChart();
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		generateChart() {
			this.loaded = false;
			const fromDate = this.fromDate ? new Date(this.fromDate) : null;
			const toDate = this.toDate ? new Date(this.toDate) : null;
			const diffTime = fromDate && toDate ? Math.abs(toDate.getTime() - fromDate.getTime()) : 0;
			const diffDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
			const totalsByPeriod = {};
			this.logs.forEach(log => {
				const logDate = new Date(log.createdAt);
				let formattedPeriod;
				if (!fromDate || !toDate || diffDays > 1) {
					formattedPeriod = logDate.toLocaleDateString();
				} else {
					const formattedDate = logDate.toLocaleDateString();
					const formattedHour = logDate.getHours().toString().padStart(2, '0') + ':00';
					formattedPeriod = `${formattedDate} ${formattedHour}`;
				}

				if (!totalsByPeriod[formattedPeriod]) {
					totalsByPeriod[formattedPeriod] = 0;
				}
				totalsByPeriod[formattedPeriod] += this.getLogTypeTotal(log.type, log.values);
			});
			const labels = Object.keys(totalsByPeriod).reverse();
			const data = Object.values(totalsByPeriod).reverse();
			const chartData = {
				labels: labels,
				datasets: [
					{
						label: this.type,
						data: data,
						borderColor: '#c88f44',
						fill: false
					}
				]
			};
			this.chartData = chartData;
			this.chartOptions = {};
			this.loaded = true;
		},
		getLogTypeTotal(type, values) {
			switch (type) {
				case 'GoldWon':
				case 'GoldLost':
				case 'XPEarned':
				case 'HPLost':
					return Number(values[0]);
				case 'ItemBought':
				case 'IngredientSold':
					return Number(values[1]);
				default:
					return 1;
			}
		}
	},
	mixins: [errorHandler, mixin],
	watch: {
		type() {
			this.reload();
		},
		fromDate() {
			this.reload();
		},
		toDate() {
			this.reload();
		},
		page() {
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
