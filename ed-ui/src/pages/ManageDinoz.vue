<template>
	<TitleHeader :title="$t('pageTitle.manageDinoz')" />
	<div class="section ml-[-35px] mt-[-30px] sm:ml-0 sm:mt-0">
		<h3 class="titlePage">{{ $t(`manageDinoz.title`) }}</h3>
	</div>
	<DZDisclaimer help :content="$t('manageDinoz.disclaimer')" class="ml-[-45px] sm:ml-0" />
	<table class="ml-[-45px] sm:ml-0">
		<tbody>
			<tr>
				<th colspan="3">{{ $t('manageDinoz.dinoz') }}</th>
				<th>{{ $t('manageDinoz.elements') }}</th>
				<th class="w-[18px]"></th>
			</tr>

			<tr v-for="dinoz in dinozList as ManagePageData" :key="dinoz.id">
				<td class="w-[50px] text-center">
					<DinozMini :display="dinoz.display" />
				</td>
				<td class="text-center">{{ dinoz.level }}</td>
				<Tippy tag="td" theme="small">
					<span>{{ dinoz.name }}</span>
					<div class="m-[2px] h-[4px] w-[70px] overflow-hidden bg-[#8c492f]" style="border: 1px solid #8c492f">
						<div
							class="box-border h-[4px] bg-[#f9e94c]"
							style="border-right: 1px solid white"
							:style="{ width: `${(dinoz.life / dinoz.maxLife) * 100}%` }"
						/>
					</div>
					<div class="m-[2px] h-[4px] w-[70px] overflow-hidden bg-[#8c492f]" style="border: 1px solid #8c492f">
						<div
							class="box-border h-[4px] bg-[#c487ea]"
							style="border-right: 1px solid white"
							:style="{ width: `${(dinoz.experience / getMaxXp(dinoz)) * 100}%` }"
						/>
					</div>
					<template #content>
						<img
							v-for="status in dinoz.status"
							:key="status.statusId"
							:src="getImgURL('status', `fx_${statusList.imgName[status.statusId]}`)"
							:alt="statusList.imgName[status.statusId]"
						/>
					</template>
				</Tippy>
				<td>
					<Elements
						:fire="dinoz.nbrUpFire"
						:wood="dinoz.nbrUpWood"
						:water="dinoz.nbrUpWater"
						:lightning="dinoz.nbrUpLightning"
						:air="dinoz.nbrUpAir"
					/>
				</td>
				<td>
					<div
						class="m-px flex size-4 h-[20px] w-full cursor-pointer items-center justify-center bg-[#bb5e46] text-center hover:border-yellow-500 hover:bg-[#f9e5b7]"
						style="border: 1px solid #f9e5b7"
						@click="changeOrder(dinoz, -1)"
					>
						<img class="w-[10px]" :src="getImgURL('icons', 'small_equip')" alt="arrow_up" />
					</div>
					<div
						class="m-px flex size-4 h-[20px] w-full cursor-pointer items-center justify-center bg-[#bb5e46] text-center hover:border-yellow-500 hover:bg-[#f9e5b7]"
						style="border: 1px solid #f9e5b7"
						@click="changeOrder(dinoz, 1)"
					>
						<img class="w-[10px] rotate-180" :src="getImgURL('icons', 'small_equip')" alt="arrow_down" />
					</div>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import EventBus from '../events/index.js';
import { dinozStore, playerStore } from '../store/index.js';
import { DinozService } from '../services/DinozService.js';
import { ManagePageData } from '@drpg/core/returnTypes/Dinoz';
import { statusList } from '../constants/status.js';
import { errorHandler } from '../utils/index.js';
import { getMaxXp } from '@drpg/core/utils/DinozUtils';
import Elements from '../components/data/Elements.vue';
import DinozMini from '../components/dinoz/DinozMini.vue';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import { formatText } from '../utils/formatText.js';

export default defineComponent({
	name: 'ManageDinoz',
	components: {
		DinozMini,
		TitleHeader,
		Elements,
		DZDisclaimer
	},
	data() {
		return {
			dinozStore: dinozStore(),
			playerStore: playerStore(),
			dinozList: [] as ManagePageData,
			statusList,
			getMaxXp
		};
	},
	methods: {
		async changeOrder(dinoz: ManagePageData[number], direction: number) {
			// Do nothing if already at an extremity
			if ((direction === -1 && dinoz.order === 0) || (direction === 1 && dinoz.order === this.dinozList.length - 1)) {
				return;
			}

			const index = this.dinozList.findIndex(d => d.id === dinoz.id);
			let newList = [...this.dinozList];

			// Swap order
			const tmp = dinoz.order;
			dinoz.order = newList[index + direction].order;
			newList[index + direction].order = tmp;

			// Swap in list
			if (direction === -1) {
				newList = [...newList.slice(0, index - 1), newList[index], newList[index - 1], ...newList.slice(index + 1)];
			} else {
				newList = [...newList.slice(0, index), newList[index + 1], newList[index], ...newList.slice(index + 2)];
			}

			try {
				await DinozService.updateOrders(newList.map(d => d.id));

				// Update list
				this.dinozList = newList;

				// Update store
				if (!this.dinozStore.getDinozList) {
					this.$toast.open({
						message: formatText(this.$t(`toast.noDinozList`)),
						type: 'error'
					});
					return;
				}
				this.dinozStore.setDinozList(
					this.dinozStore.getDinozList.map((d, i) => {
						if (i === index) {
							d.order = dinoz.order + direction;
						} else if (i === index + direction) {
							d.order = dinoz.order;
						}
						return d;
					})
				);
			} catch (error) {
				errorHandler.handle(error, this.$toast);
			}
		}
	},
	async mounted(): Promise<void> {
		// Redirect to last page if no PDA
		if (!this.playerStore.playerOptions.hasPDA) {
			this.$toast.open({ message: formatText(this.$t(`toast.noPDA`)), type: 'error' });
			this.$router.back();
			EventBus.emit('isLoading', false);
			return;
		}

		// Fetch data
		const list = await DinozService.getDinozToManage().catch(error => errorHandler.handle(error, this.$toast, this.$t));

		if (!list) return;
		// Add order if null
		this.dinozList = list.map((dinoz, index) => {
			if (dinoz.order === null) {
				dinoz.order = index;
			}
			return dinoz;
		});
		EventBus.emit('isLoading', false);
	}
});
</script>

<style lang="scss" scoped>
table {
	min-width: 100%;
	margin-top: 10px;
	margin-bottom: 5px;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;
	tr {
		display: table-row;
		cursor: help;
		th {
			font-size: 8pt;
			text-shadow: 1px 1px 0px #356847;
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
			background-image: url('../assets/background/table_header.webp');
			background-position: left bottom;
			padding-left: 4px;
			padding-right: 4px;
			padding-bottom: 8px;
		}
		td {
			font-size: 9pt;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			background-image: url('../assets/background/table_cell.webp');
			background-position: -10px 0px;
			padding: 2px 4px;
		}
	}
}
</style>
