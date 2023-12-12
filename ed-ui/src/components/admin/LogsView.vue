<template>
	<select v-model="type">
		<option value="null">All</option>
		<option v-for="(type, index) in LogTypes" :key="index" :value="type">{{ type }}</option>
	</select>
	<input type="number" v-model="userId" placeholder="userId" />
	<input type="number" v-model="dinozId" placeholder="dinozId" />
	<table>
		<tbody>
			<tr v-for="log in logs" :key="log.id">
				<td>[{{ formatDate(log.createdAt as unknown as string) }}]</td>
				<td v-html="formatContent($t(`logs.${log.type}`, getLogPropsForTranslation($t, log)))" />
			</tr>
		</tbody>
	</table>
	<button @click="page--" :disabled="page <= 1">Previous</button>
	<button @click="page++" :disabled="logs.length < 100">Next</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { LogsService } from '../../services/index.js';
import EventBus from '../../events/index.js';
import { errorHandler } from '../../utils/index.js';
import { LogListResponse } from '@drpg/core/returnTypes/log';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { missionsList } from '../../constants/missions.js';
import { placeList } from '../../constants/place.js';

const LogTypes = [
	'ItemUsed',
	'ItemBought',
	'GoldWon',
	'GoldLost',
	'Move',
	'LevelUp',
	'Fight',
	'Death',
	'Revive',
	'MissionStep',
	'MissionFinished',
	'MissionCanceled',
	'Gather',
	'CreateDinoz',
	'ChangeDinozOrder'
] as const;

const pad = (n: number) => (n < 10 ? `0${n}` : n);

const formatDate = (date: string) => {
	const dateObj = new Date(date);
	const month = pad(dateObj.getMonth() + 1);
	const day = pad(dateObj.getDate());
	const hours = pad(dateObj.getHours());
	const minutes = pad(dateObj.getMinutes());
	const seconds = pad(dateObj.getSeconds());

	return `${day}/${month} ${hours}:${minutes}:${seconds}`;
};

const getLogPropsForTranslation = (
	$t: (key: string, options?: Record<string, string>) => string,
	log: LogListResponse[number]
) => {
	let values;

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
	name: 'LogsView',
	data() {
		return {
			logs: [] as LogListResponse,
			page: 1,
			type: null as LogListResponse[number]['type'] | null,
			userId: null as number | null,
			dinozId: null as number | null,
			LogTypes,
			getLogPropsForTranslation,
			formatDate
		};
	},
	methods: {
		async reload() {
			EventBus.emit('isLoading', true);
			try {
				const page = this.page;
				const type = this.type;
				const userId = this.userId || null;
				const dinozId = this.dinozId || null;
				this.logs = await LogsService.list(page, type, userId, dinozId);
				EventBus.emit('isLoading', false);
			} catch (err) {
				console.log(err);
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
		},
		page() {
			this.reload();
		}
	}
});
</script>

<style lang="scss" scoped>
table td {
	font-family: monospace;
	font-size: 12px;

	:deep(strong) {
		color: inherit;
	}
}
</style>
