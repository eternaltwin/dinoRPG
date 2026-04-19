import { SortOptions } from '@drpg/core/models/inventory/sortOptions';
import { ItemFiche, ItemFicheDTO } from '@drpg/core/models/item/ItemFiche';
import { itemList } from '@drpg/core/models/item/ItemList';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { getMaxQuantity } from '@drpg/core/utils/itemUtils';
import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { playerStore } from './playerStore';
import { PlayerService } from '../services';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { Reward } from '@drpg/core/models/reward/RewardList';

export const useInventoryStore = defineStore('useInventoryStore', () => {
	const { t } = useI18n();
	const inventory: Ref<Array<ItemFiche>> = ref([]);
	const sortOption: Ref<SortOptions> = ref(SortOptions.DEFAULT);

	const setInventory = (inventoryDto: Array<ItemFicheDTO>): void => {
		inventory.value = inventoryDto.map(item => {
			return {
				...itemList[item.id],
				maxQuantity: item.maxQuantity,
				quantity: item.quantity
			};
		});
	};

	const setSortOption = (sort: SortOptions): void => {
		sortOption.value = sort;
	};

	const addItem = async (itemId: number, quantity: number): Promise<void> => {
		const item: ItemFiche | undefined = inventory.value.find(item => item.itemId === itemId);
		if (item?.quantity === undefined) {
			const player: PlayerInfo = await PlayerService.getPlayerData(playerStore().getPlayerId.toString());
			const hasMerguezCard: boolean = player.epicRewards.some(rewardId => rewardId === Reward.MERGUEZ_CARD);
			const maxQuantity: number = getMaxQuantity(itemList[itemId], playerStore().isShopkeeper, hasMerguezCard);
			inventory.value.push({
				...itemList[itemId],
				maxQuantity,
				quantity
			});
			return;
		}

		item.quantity += quantity;
	};

	const useItem = (itemId: number): void => {
		const item: ItemFiche | undefined = inventory.value.find(item => item.itemId === itemId);
		if (item?.quantity === undefined) {
			return;
		}

		item.quantity -= 1;
		inventory.value = inventory.value.filter(item => item.quantity !== undefined && item.quantity > 0);
	};

	const sortItems = (): void => {
		switch (sortOption.value) {
			case SortOptions.NAME_ASC:
				inventory.value.sort((a, b) =>
					t(`item.name.${itemNameList[a.itemId]}`).localeCompare(t(`item.name.${itemNameList[b.itemId]}`))
				);
				break;
			case SortOptions.NAME_DESC:
				inventory.value.sort((a, b) =>
					t(`item.name.${itemNameList[b.itemId]}`).localeCompare(t(`item.name.${itemNameList[a.itemId]}`))
				);
				break;
			case SortOptions.PRICE_ASC:
				inventory.value.sort((a, b) => a.price - b.price);
				break;
			case SortOptions.PRICE_DESC:
				inventory.value.sort((a, b) => b.price - a.price);
				break;
			case SortOptions.QUANTITY_ASC:
				inventory.value.sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
				break;
			case SortOptions.QUANTITY_DESC:
				inventory.value.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
				break;
			default:
				inventory.value.sort((a, b) => a.itemId - b.itemId);
		}
	};

	return {
		inventory,
		sortOption,
		setInventory,
		setSortOption,
		addItem,
		useItem,
		sortItems
	};
});
