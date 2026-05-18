<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { onMounted, Ref, ref } from 'vue';
import { ItemFiche, ItemFicheDTO } from '@drpg/core/models/item/ItemFiche';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
import { useDinozStore, useInventoryStore } from '../../store';
import { InventoryService, PlayerService } from '../../services';
import { ItemEffect } from '@drpg/core/models/enums/ItemEffect';
import EventBus from '../../events';
import { refreshGold } from '../../mixin/mixin';
import { formatText } from '../../utils/formatText';
import { useToast } from 'vue-toast-notification';
import { errorHandler } from '../../utils';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import DZSelect from './DZSelect.vue';
import { storeToRefs } from 'pinia';
import { SortOptions } from '@drpg/core/models/inventory/sortOptions';
import { confirm } from '../../mixin/confirmPlugin';

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const { inventory, sortOption } = storeToRefs(useInventoryStore());
const { getCurrentDinozId, getDinozList } = storeToRefs(useDinozStore());
const { useItem, sortItems, setInventory } = useInventoryStore();
const { setDinozList, setItems } = useDinozStore();

const hidden: Ref<boolean> = ref(true);
const sortOptions = Object.values(SortOptions).map(o => ({
	value: o,
	label: t(`inventory.sort.${o}`)
}));

const goToItemShop = (): void => {
	router.push({ name: 'ItemShopPage', params: { name: 'flying' } });
};

const isFull = (item: ItemFiche): boolean => {
	return (item.quantity ?? 0) >= (item.maxQuantity ?? 0);
};

const refreshDinozList = async (): Promise<void> => {
	const dinozList: Array<DinozFiche> = getDinozList.value;

	const commonData: PlayerCommonData = await PlayerService.getLoggedInData();

	const newDinozList = commonData.dinoz.map(d => d.id);
	const oldDinozList = dinozList.map(d => d.id);
	setDinozList(commonData.dinoz);

	router.push({ name: 'DinozPage', params: { id: newDinozList.find(x => !oldDinozList.includes(x)) } });
};

const itemUse = async (item: ItemFiche): Promise<void> => {
	if (item.quantity === undefined || item.quantity <= 0) {
		return;
	}

	const res = await confirm({
		message: t(`inventory.confirmUse`, { name: t(`item.name.${itemNameList[item.itemId]}`) }),
		header: t('popup.attention'),
		acceptLabel: t('popup.accept'),
		rejectLabel: t('popup.reject'),
		icon: 'pi pi-trash'
	});

	const dinozId: number | undefined = getCurrentDinozId.value;
	if (dinozId === undefined) {
		return;
	}

	if (!res) return;
	try {
		const toasts = await InventoryService.useInventoryItem(item.itemId, dinozId);
		for (const toast of toasts) {
			useItem(item.itemId);
			sortItems();
			if (toast.category === ItemEffect.EGG) {
				await refreshDinozList();
			} else if (toast.category === ItemEffect.GOLD) {
				await refreshGold();
			} else {
				EventBus.emit('refreshDinoz', true);
			}

			let message: string;
			switch (toast.category) {
				case ItemEffect.SPECIAL:
					message = t(`toast.special.${toast.value}`, {
						value: t(`item.name.${toast.effect}`),
						qty: toast.quantity
					});
					break;
				case ItemEffect.SPHERE:
					message = t(`toast.sphere`, { value: t(`skill.name.${toast.value}`) });
					break;
				case ItemEffect.QUEST:
					message = t(`quest.${toast.value}`);
					break;
				case ItemEffect.RESURRECT:
					message = t(`toast.${toast.category}`);
					break;
				case ItemEffect.EGG:
					message = t(`toast.${toast.category}`, { value: t(`race.name.${toast.value}`) });
					break;
				default:
					message =
						typeof toast.value === 'number'
							? t(`toast.${toast.category}`, { value: toast.value }, toast.value)
							: t(`toast.${toast.category}`, { value: toast.value });
					break;
			}

			useToast().open({
				message: formatText(message),
				type: 'info'
			});
		}
	} catch (error) {
		errorHandler.handle(error, toast);
		return;
	}
};

const equipItem = async (item: ItemFiche): Promise<void> => {
	const dinozId: number | undefined = getCurrentDinozId.value;
	if (item.quantity === undefined || item.quantity <= 0 || dinozId === undefined) {
		return;
	}

	try {
		const items = await InventoryService.equipInventoryItem(dinozId, item.itemId, true);
		useItem(item.itemId);
		setItems(
			dinozId,
			items.map(item => item.itemId)
		);
	} catch (error) {
		errorHandler.handle(error, toast);
		return;
	}
};

onMounted(async () => {
	try {
		const inventory: Array<ItemFicheDTO> = await InventoryService.getAllItemsData();
		setInventory(inventory);
		sortItems();
	} catch (err) {
		errorHandler.handle(err, toast);
		return;
	}
});
</script>

<template>
	<div class="inventory">
		<p class="wrapperMenu" @click="hidden = !hidden">{{ $t('inventory.sortBy') }}</p>
		<div ref="butt" class="wrapper" :class="hidden ? 'hidden' : 'shown'">
			<div class="label">
				<DZSelect class="sort-select" id="sort" v-model="sortOption" :options="sortOptions" @change="sortItems()" />
			</div>
		</div>
		<table>
			<tbody>
				<tr>
					<th class="name">{{ $t('inventory.itemName') }}</th>
					<th class="qty">{{ $t('inventory.stock') }}</th>
					<th class="act">{{ $t('inventory.actions') }}</th>
				</tr>
				<tr v-for="(item, index) in inventory" :class="index % 2 === 1 ? 'even' : ''" :key="index">
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
							@click="itemUse(item)"
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

<style lang="scss" scoped>
.inventory {
	width: 95%;
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
			vertical-align: middle;
			padding-top: 3px;
			padding-bottom: 3px;
			height: 34.5px;
		}
	}
}
.wrapperMenu {
	padding-left: 5px;
	padding-right: 5px;
	margin-top: 5px;
	margin-bottom: 5px;
	font-size: 8pt;
	border: 1px dashed rgba(0, 0, 0, 0.1);
	text-align: center;
	cursor: pointer;
	&:hover {
		background-color: #9a4029;
		color: #fce3bc;
	}
}
.hidden {
	max-height: 0;
}
.shown {
	max-height: 54px;
}
.wrapper {
	overflow: hidden;
	transition: max-height 0.2s ease-out;
	padding-left: 5px;
	padding-right: 5px;
	margin-top: 5px;
	margin-bottom: 5px;
	font-size: 8pt;
	.label {
		display: flex;
		justify-content: space-around;
	}

	&.shown {
		overflow: visible;
	}

	.sort-select {
		width: 100%;
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
		position: relative;
		margin-right: 5px;
		border: 1px solid #ae6733;
		vertical-align: middle;
	}
	p {
		display: inline-block;
		vertical-align: middle;
		max-width: calc(100% - 45px);
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
