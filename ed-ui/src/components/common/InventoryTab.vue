<template>
	<div class="inventory">
		<table>
			<tbody>
				<tr>
					<th class="name">{{ $t('inventory.itemName') }}</th>
					<th class="qty">{{ $t('inventory.stock') }}</th>
					<th class="act">{{ $t('inventory.actions') }}</th>
				</tr>
				<tr v-for="(item, index) in allItemsData" :class="index % 2 === 1 ? 'even' : ''" :key="index">
					<Tippy class="name" tag="td" theme="normal">
						<img :src="getImgURL('item', `item_${itemNameList[item.itemId]}`)" :alt="itemNameList[item.itemId]" />
						<p v-html="$t(`item.name.${itemNameList[item.itemId]}`)" />
						<template #content>
							<h1 v-html="formatContent($t(`item.name.${itemNameList[item.itemId]}`))" />
							<h2>{{ $t(`tooltip.item.maxQuantity`) }} {{ item.maxQuantity }}</h2>
							<p v-html="formatContent($t(`item.description.${itemNameList[item.itemId]}`))" />
						</template>
					</Tippy>
					<td
						class="qty"
						:class="{
							full: isFull(item)
						}"
						v-tippy="{
							content: isFull(item) ? formatContent($t(`inventory.full`)) : '',
							theme: 'small'
						}"
					>
						<div>
							{{ item.quantity }}
						</div>
					</td>
					<td class="act">
						<a
							class="on"
							v-if="item.canBeUsedNow"
							v-tippy="{
								content: formatContent($t('tooltip.item.use')),
								theme: 'small'
							}"
							@click="useItem(item)"
						>
							<img :src="getImgURL('icons', 'small_use')" alt="small_use" />
						</a>
						<a
							class="off"
							v-else
							v-tippy="{
								content: formatContent($t('tooltip.item.useOff')),
								theme: 'small'
							}"
						>
							<img :src="getImgURL('icons', 'small_use_off')" alt="small_use_off" />
						</a>
						<a
							class="on"
							v-if="item.canBeEquipped"
							v-tippy="{
								content: formatContent($t('tooltip.item.equipTitle')),
								theme: 'small'
							}"
							@click="equipItem(item)"
						>
							<img :src="getImgURL('icons', 'small_equip')" alt="small_equip" />
						</a>
						<a
							class="off"
							v-else
							v-tippy="{
								content: formatContent($t('tooltip.item.equipOff')),
								theme: 'small'
							}"
						>
							<img :src="getImgURL('icons', 'small_equip_off')" alt="small_equip_off" />
						</a>
					</td>
				</tr>
			</tbody>
		</table>
		<a class="button" @click="goToItemShop()">{{ $t(`button.shop`) }}</a>
	</div>
</template>

<script lang="ts" scoped>
import { defineComponent } from 'vue';
import { ItemFiche } from '@drpg/core/models/item/ItemFiche';
import { InventoryService, PlayerService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import EventBus from '../../events/index.js';
import { ItemEffect } from '@drpg/core/models/enums/ItemEffect';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { dinozStore } from '../../store/index.js';
import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { formatText } from '../../utils/formatText.js';

export default defineComponent({
	name: 'InventoryTab',
	data() {
		return {
			dinozStore: dinozStore(),
			allItemsData: [] as Array<ItemFiche>,
			itemNameList: itemNameList
		};
	},
	methods: {
		goToItemShop() {
			this.$router.push({
				name: 'ItemShopPage',
				params: { name: 'flying' }
			});
		},
		isFull(item: ItemFiche): boolean {
			return item.quantity! >= item.maxQuantity!;
		},
		async refreshDinozList(): Promise<void> {
			const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList!;

			const commonData: PlayerCommonData = await PlayerService.getLoggedInData();

			const newDinozList = commonData.dinoz.map(d => d.id);
			const oldDinozList = dinozList.map(d => d.id);
			this.dinozStore.setDinozList(commonData.dinoz);

			this.$router.push({ name: 'DinozPage', params: { id: newDinozList.find(x => !oldDinozList.includes(x)) } });
		},
		async useItem(item: ItemFiche): Promise<void> {
			if (item.quantity! > 0) {
				EventBus.emit('isLoading', true);
				const dinozId = this.$route.params.id as string;
				try {
					const toast = await InventoryService.useInventoryItem(item.itemId, +dinozId);
					await this.resfreshInventory();

					// EventBus.emit('isLoading', false);
					if (toast.category === ItemEffect.EGG) {
						await this.refreshDinozList();
					} else if (toast.category === ItemEffect.GOLD) {
						EventBus.emit('refreshMoney', true);
					} else {
						EventBus.emit('refreshDinoz', true);
					}

					let message: string;
					switch (toast.category) {
						case ItemEffect.SPECIAL:
							message = this.$t(`toast.special.${toast.value}`, { value: this.$t(`item.name.${toast.effect}`) });
							break;
						case ItemEffect.SPHERE:
							message = this.$t(`toast.sphere`, { value: this.$t(`skill.name.${toast.value}`) });
							break;
						case ItemEffect.QUEST:
							message = this.$t(`quest.${toast.value}`);
							break;
						default:
							message = this.$t(`toast.${toast.category}`, { value: toast.value });
							break;
					}

					this.$toast.open({
						message: formatText(message),
						type: 'info'
					});
				} catch (error) {
					errorHandler.handle(error, this.$toast, this.$t);
					return;
				}
			}
		},
		async equipItem(item: ItemFiche): Promise<void> {
			if (item.quantity! > 0) {
				EventBus.emit('isLoading', true);
				const dinozId = parseInt(this.$route.params.id as string);
				try {
					const items = await InventoryService.equipInventoryItem(dinozId, item.itemId, true);
					await this.resfreshInventory();
					EventBus.emit('equipItem', items);
					EventBus.emit('refreshDinoz', true);
					EventBus.emit('isLoading', false);
				} catch (error) {
					errorHandler.handle(error, this.$toast, this.$t);
					return;
				}
			}
		},
		async resfreshInventory(): Promise<void> {
			this.allItemsData = await InventoryService.getAllItemsData();
			this.allItemsData = this.allItemsData.sort((a, b) => a.itemId - b.itemId);
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		try {
			await this.resfreshInventory();
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err, this.$toast, this.$t);
			return;
		}
		EventBus.on('refreshInventory', async () => {
			await this.resfreshInventory();
		});
	},
	unmounted() {
		EventBus.off('refreshInventory');
	}
});
</script>

<style lang="scss" scoped>
.inventory {
	margin: 5px;
	table {
		width: 100%;
		margin-top: 10px;
		margin-bottom: 5px;
		tr {
			th {
				background-color: #ddb084;
				color: #874b2e;
				font-size: 10pt;
				font-variant: small-caps;
				padding-left: 5px;
				border-bottom: 1px solid #874b2e;
			}
			&.even {
				background-color: #ddb084;
			}
			&:hover td {
				background-color: #734945;
			}
		}
		td {
			vertical-align: top;
			height: 34.5px;
		}
	}
}
.name {
	color: white;
	min-width: 163px;
	font-size: 10pt !important;
	line-height: 11pt;
	font-variant: small-caps;
	cursor: help;
	img {
		float: left;
		position: relative;
		margin-right: 5px;
		border: 1px solid #ae6733;
		vertical-align: bottom;
	}
	p {
		padding-top: 10px;
		padding-bottom: 10px;
	}
}
.type {
	font-weight: bold;
	text-align: center;
	color: #bc683c;
}
.full {
	color: yellow !important;
	cursor: help;
}
.act {
	padding-left: 5px;
	display: flex;
	justify-content: center;
	align-content: space-evenly;
	align-items: center;
	a {
		height: fit-content;
	}
	img {
		padding-left: 5px;
		padding-right: 5px;
	}
}
.qty {
	color: white;
	font-weight: bold;
	text-align: center;
	padding-left: 4px;
	padding-right: 4px;
	vertical-align: center;

	& > div {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
}
.off:hover {
	background-color: transparent;
}
.on:hover {
	cursor: pointer;
}
</style>
