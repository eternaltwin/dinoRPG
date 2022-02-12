<template src="./ItemShopPage.html"></template>

<script lang="ts">
import { defineComponent } from 'vue';
import { InventoryService } from '@/services';
import { Item, ItemShop } from '@/models';
import { errorHandler } from '@/utils';
import { sessionStore } from '@/store';
import Title from '@/components/utils/Title.vue';
import EventBus from '@/events';

export default defineComponent({
	name: 'ItemShopPage',
	data() {
		return {
			shop: 'shop' as string,
			itemList: [] as Array<Item>
		};
	},
	components: {
		Title
	},
	methods: {
		getImg(folder: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgName}.webp`);
		},
		async openPopinConfirmChoice(item: ItemShop): Promise<void> {
			const res: boolean = confirm(this.$t('button.confirm'));
			if (res) {
				EventBus.emit('isLoading', true);
				try {
					await InventoryService.buyItem(item.id);
					EventBus.emit('isLoading', false);
				} catch (err) {
					errorHandler.handle(err);
					return;
				}

				// Update player's money
				const newMoney = (sessionStore.getters.getMoney -
					item.price!) as number;
				sessionStore.commit('setMoney', newMoney);
			}
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		// Get dinoz to display
		try {
			// this.itemList = await ShopService.getItemFromItemShop();
			this.shop = 'shop';
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}
	}
});
</script>
