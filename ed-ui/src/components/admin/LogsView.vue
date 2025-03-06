<template>
	<select v-model="type">
		<option value="null">All</option>
		<option v-for="(type, index) in LogTypes" :key="index" :value="type">{{ type }}</option>
	</select>
	<input type="text" v-model="userId" placeholder="userId" />
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
	<button @click="page++" :disabled="logs.length < 20">Next</button>
</template>

<script lang="ts">
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { ingredientNameList } from '@drpg/core/models/ingredient/IngredientNameList';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { rewardList } from '@drpg/core/models/reward/RewardList';
import { LogListResponse } from '@drpg/core/returnTypes/Log';
import { defineComponent } from 'vue';
import { missionsList } from '../../constants/missions.js';
import { placeList } from '../../constants/place.js';
import EventBus from '../../events/index.js';
import { mixin } from '../../mixin/mixin.js';
import { LogsService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';

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
	'GridFinished',
	'CreateDinoz',
	'ChangeDinozOrder',
	'PlayerCreated',
	'PlayerConnected',
	'OfferNew',
	'OfferBid',
	'OfferCancelled',
	'OfferExpired',
	'OfferWon',
	'LBDone',
	'AdminUpdateDinoz',
	'AdminAddStatus',
	'AdminRemoveStatus',
	'AdminAddSkill',
	'AdminRemoveSkill',
	'AdminAddUnlockableSkill',
	'AdminRemoveUnlockableSkill',
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

	const player = log.player ? log.player.name : null;
	const playerId = log.playerId || null;

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
				quantity: log.values[1],
				total: log.values[2]
			};
			break;
		case 'IngredientSold':
			values = {
				item: $t(`ingredients.name.${ingredientNameList[+log.values[0]]}`),
				quantity: log.values[1],
				amount: log.values[2]
			};
			break;
		case 'GoldWon':
			values = {
				quantity: log.values[0],
				total: log.values[1]
			};
			break;
		case 'GoldLost':
			values = {
				quantity: log.values[0],
				total: log.values[1]
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
		case 'GridFinished':
			values = {
				gold: log.values[0]
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
				playerId: log.values[1]
			};
			break;
		case 'PlayerConnected':
			values = {
				name: log.values[0]
			};
			break;
		case 'OfferNew':
			values = {
				offer: log.values[0],
				amount: log.values[1]
			};
			break;
		case 'OfferBid':
			values = {
				offer: log.values[0],
				amount: log.values[1]
			};
			break;
		case 'OfferCancelled':
			values = {
				offer: log.values[0]
			};
			break;
		case 'OfferExpired':
			values = {
				offer: log.values[0]
			};
			break;
		case 'OfferWon':
			values = {
				offer: log.values[0],
				winner: log.values[1],
				amount: log.values[2]
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
		case 'AdminAddUnlockableSkill':
			values = {
				skill: $t(`skill.name.${skillList[+log.values[0]].name}`)
			};
			break;
		case 'AdminRemoveUnlockableSkill':
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
		player,
		playerId,
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
			userId: null as string | null,
			dinozId: null as number | null,
			LogTypes,
			getLogPropsForTranslation
		};
	},
	computed: {
		isReloadDisabled(): boolean {
			return !this.type;
		}
	},
	methods: {
		async reload() {
			if (this.isReloadDisabled) {
				EventBus.emit('isLoading', false);
				return;
			}
			EventBus.emit('isLoading', true);
			try {
				const page = this.page;
				const type = this.type;
				const userId = this.userId || null;
				const dinozId = this.dinozId || null;
				this.logs = await LogsService.list(page, type, userId, dinozId);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		}
	},
	mixins: [errorHandler, mixin],
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
input[type='number'],
input[type='text'],
select {
	padding: 2px;
	margin-top: 5px;
	margin-bottom: 10px;
	border: 1px solid #c88f44;
	background-color: #f3ca92;
	color: #710;
}
button {
	margin-top: 20px;
	background-color: #c64e36;
	color: #fffdba;
	border: 1px solid #c64e36;
	padding: 5px 20px;
	cursor: pointer;
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
