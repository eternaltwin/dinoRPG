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
						{{ item.quantity }}
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
import { Item } from '@/models';
import { itemNameList } from '@/constants';
import { InventoryService } from '@/services';
import { errorHandler } from '@/utils';
import EventBus from '@/events';

export default defineComponent({
	name: 'InventoryTab',
	data() {
		return {
			allItemsData: [] as Array<Item>,
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
		isFull(item: Item): boolean {
			return item.quantity! >= item.maxQuantity!;
		},
		async useItem(item: Item): Promise<void> {
			if (item.quantity! > 0) {
				EventBus.emit('isLoading', true);
				const dinozId = this.$route.params.id as string;
				try {
					await InventoryService.useInventoryItem(item.itemId, parseInt(dinozId));
					EventBus.emit('isLoading', false);
					EventBus.emit('refreshDinoz', true);
				} catch (error) {
					errorHandler.handle(error);
					return;
				}
			}
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		try {
			this.allItemsData = await InventoryService.getAllItemsData();
			this.allItemsData = this.allItemsData.sort((a, b) => a.itemId - b.itemId);
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}
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
}
.off:hover {
	background-color: transparent;
}
.on:hover {
	cursor: pointer;
}
</style>
