<template>
	<TitleHeader :title="$t('pageTitle.demonShop')" :header="formatContent($t(`shop.demon.name`))" />
</template>

<script lang="ts" scoped>
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { playerStore } from '../store/index.js';
import { demonShopFiche } from '@drpg/core/models/shop/demonShopFiche';
import { DemonShopService } from '../services/DemonShopService.js';
// import DZInput from '../components/common/DZInput.vue';

export default defineComponent({
	name: 'DemonShopPage',
	components: {
		TitleHeader
		// DZInput
	},
	data() {
		return {
			playerStore: playerStore(),
			demonShop: {} as demonShopFiche
		};
	},
	methods: {},
	async mounted(): Promise<void> {
		this.demonShop = await DemonShopService.getDemonDinozShop();
	}
});
</script>

<style lang="scss" scoped></style>
