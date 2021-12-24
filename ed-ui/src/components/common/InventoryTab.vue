<template>
	<div class="inventory">
		<table>
			<tbody>
				<tr>
					<th>{{ $t('inventory.itemName') }}</th>
					<th>{{ $t('inventory.stock') }}</th>
					<th>{{ $t('inventory.actions') }}</th>
				</tr>
				<tr
					v-for="(item, index) in allItemsData"
					:class="index % 2 === 1 ? 'even' : ''"
					:key="index"
				>
					<td class="name">
						<Tooltip theme="normal">
							<template #tooltip-trigger>
								<img
									:src="
										getImg('item', 'item_', $t(`item.imgName.${item.itemId}`))
									"
								/>
								{{ $t(`item.name.${item.itemId}`) }}
							</template>
							<template #tooltip-content="{ formatContent }">
								<h1 v-html="formatContent($t(`item.name.${item.itemId}`))" />
								<h2>{{ $t(`tooltip.maxQuantity`) }} {{ item.maxQuantity }}</h2>
								<p
									v-html="formatContent($t(`item.description.${item.itemId}`))"
								/>
							</template>
						</Tooltip>
					</td>
					<td class="qty">{{ item.quantity }}</td>
					<td class="act">
						<a id="inv_TODO_use" v-if="item.canBeUsedNow">
							<Tooltip theme="small">
								<template #tooltip-trigger>
									<img :src="getImg('icons', 'small_', 'use')" />
								</template>
								<template #tooltip-content="{ formatContent }">
									<p v-html="formatContent($t(`tooltip.itemUse`))" />
								</template>
							</Tooltip>
						</a>
						<a v-else>
							<Tooltip theme="small">
								<template #tooltip-trigger>
									<img :src="getImg('icons', 'small_', 'use_off')" />
								</template>
								<template #tooltip-content="{ formatContent }">
									<p v-html="formatContent($t(`tooltip.itemUseOff`))" />
								</template>
							</Tooltip>
						</a>
						<a id="inv" v-if="item.canBeEquipped">
							<Tooltip theme="small">
								<template #tooltip-trigger>
									<img :src="getImg('icons', 'small_', 'equip')" />
								</template>
								<template #tooltip-content="{ formatContent }">
									<p v-html="formatContent($t(`tooltip.itemEquipTitle`))" />
									<p
										v-html="formatContent($t(`tooltip.itemEquipDescription`))"
									/>
								</template>
							</Tooltip>
						</a>
						<a v-else>
							<Tooltip theme="small">
								<template #tooltip-trigger>
									<img :src="getImg('icons', 'small_', 'equip_off')" />
								</template>
								<template #tooltip-content="{ formatContent }">
									<p v-html="formatContent($t(`tooltip.itemEquipOff`))" />
								</template>
							</Tooltip>
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
import { InventoryService } from '@/services';
import { errorHandler } from '@/utils';
import Tooltip from '@/components/utils/ToolTip.vue';
import EventBus from '@/events';

export default defineComponent({
	name: 'InventoryTab',
	components: {
		Tooltip
	},
	data() {
		return {
			allItemsData: {} as Array<Item>
		};
	},
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.webp`);
		},

		goToItemShop() {
			this.$router.push({ name: 'ItemShopPage' });
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		try {
			this.allItemsData = await InventoryService.getAllItemsData();
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
			&.even td {
				background-color: #ddb084;
			}
		}
		td {
			vertical-align: top;
			&.name {
				color: white;
				padding-right: 4px;
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
			}
			&.type {
				font-weight: bold;
				text-align: center;
				color: #bc683c;
			}
			&.full {
				color: yellow;
				cursor: help;
			}
			&.act img {
				padding-left: 5px;
				padding-right: 5px;
			}
		}
	}
}
</style>
