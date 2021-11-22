<template src="./ItemShopPage.html"></template>

<script lang="ts">
import { defineComponent } from 'vue';
import { InventoryService } from '@/services';
import { Item, ItemShop } from '@/models';
import { errorHandler } from '@/utils';
import store from '@/store';
import Title from '@/components/utils/Title.vue';

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
				try {
					await InventoryService.buyItem(item.id);
				} catch (err) {
					errorHandler.handle(err);
					return Promise.reject(err);
				}

				// Update player's money
				const newMoney = (store.getters.getMoney - item.price!) as number;
				store.commit('setMoney', newMoney);
			}
		}
	},
	async mounted(): Promise<void> {
		// Get dinoz to display
		try {
			// this.itemList = await ShopService.getItemFromItemShop();
			this.shop = 'shop';
		} catch (err) {
			errorHandler.handle(err);
		}
	}
});
</script>
