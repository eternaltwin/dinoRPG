<template>
	<TitleHeader :title="$t('pageTitle.manageDinoz')" :header="$t(`manageDinoz.title`)" />
	<DZDisclaimer :content="$t('manageDinoz.disclaimer')" />
	<table>
		<tbody>
			<tr>
				<th class="dinoz" colspan="3">{{ $t('manageDinoz.dinoz') }}</th>
				<th class="elements">{{ $t('manageDinoz.elements') }}</th>
				<th class="order"></th>
			</tr>

			<tr v-for="dinoz in dinozList as ManagePageData" :key="dinoz.id">
				<td class="dinoz">
					<DinozMini :display="dinoz.display" />
				</td>
				<td class="level">{{ dinoz.level }}</td>
				<Tippy tag="td" theme="small">
					<span>{{ dinoz.name }}</span>
					<div class="life-full">
						<div class="life" :style="{ width: `${(dinoz.life / dinoz.maxLife) * 100}%` }" />
					</div>
					<div class="experience-full">
						<div class="experience" :style="{ width: `${(dinoz.experience / getMaxXp(dinoz)) * 100}%` }" />
					</div>

					<template #content>
						<template v-for="status in dinoz.status" :key="status.statusId">
							<img
								v-if="statusList.displayed[status.statusId]"
								:src="getImgURL('status', `fx_${statusList.imgName[status.statusId]}`)"
								:alt="statusList.imgName[status.statusId]"
							/>
						</template>
					</template>
				</Tippy>
				<td class="elements">
					<Elements
						:fire="dinoz.nbrUpFire"
						:wood="dinoz.nbrUpWood"
						:water="dinoz.nbrUpWater"
						:lightning="dinoz.nbrUpLightning"
						:air="dinoz.nbrUpAir"
					/>
				</td>
				<td class="order">
					<div class="up" @click="changeOrder(dinoz, -1)">
						<img :src="getImgURL('icons', 'small_equip')" alt="arrow_up" />
					</div>
					<div class="down" @click="changeOrder(dinoz, 1)">
						<img :src="getImgURL('icons', 'small_equip')" alt="arrow_down" />
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
				const returnList = await DinozService.updateOrders(newList.map(d => d.id));
				this.dinozList = newList;

				this.dinozStore.setDinozList(
					this.dinozStore.getDinozList.map(d => {
						const currentDinoz = returnList.find(e => e.id === d.id);
						if (currentDinoz) {
							d.order = currentDinoz.order;
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
		const list = await DinozService.getDinozToManage().catch(error => errorHandler.handle(error, this.$toast));

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
	width: 100%;
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

			&.order {
				width: 18px;
			}
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

			&.dinoz {
				width: 50px;
				text-align: center;
			}

			&.level {
				text-align: center;
			}

			.life-full {
				width: 70px;
				height: 4px;
				background-color: #8c492f;
				border: 1px solid #8c492f;
				overflow: hidden;
				margin: 2px;

				.life {
					height: 4px;
					background-color: #f9e94c;
					border-right: 1px solid white;
					box-sizing: border-box;
				}
			}

			.experience-full {
				width: 70px;
				height: 4px;
				background-color: #8c492f;
				border: 1px solid #8c492f;
				overflow: hidden;
				margin: 2px;

				.experience {
					height: 4px;
					background-color: #c487ea;
					border-right: 1px solid white;
					box-sizing: border-box;
				}
			}

			&.order {
				& > div {
					display: flex;
					align-items: center;
					justify-content: center;
					border: 1px solid #f9e5b7;
					background-color: #bb5e46;
					margin: 1px;
					text-align: center;
					cursor: pointer;
					width: 16px;
					height: 16px;

					&:hover {
						border: 1px solid yellow;
						background-color: #f9e5b7;
					}

					img {
						width: 10px;
					}

					&.down img {
						transform: rotate(180deg);
					}
				}
			}
		}
	}
}
</style>
