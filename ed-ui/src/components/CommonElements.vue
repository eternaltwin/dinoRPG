<template>
	<div>
		<span class="money"
			>{{ beautifulMoney }}
			<img src="@/assets/icons/small_gold.png" alt="or" />
		</span>
	</div>
	<div class="iconMenu">
		<a id="menu_blank" class="iconor"></a>
		<a id="menu_shop" @click="goToItemShop()" class="iconboutik"></a>
		<a id="menu_clan" class="iconclan"></a>
		<a id="menu_dojo" class="icondojo"></a>
	</div>
	<dinoz-list></dinoz-list>
	<a class="button" @click="goToDinozShop()">
		{{ $t('button.buyDinoz') }}
	</a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '@/store';
import { isNil } from 'lodash';
import { utils, errorHandler } from '@/utils';
import { PlayerService } from '@/services';
import { Dinoz } from '@/models';
import DinozList from '@/components/dinoz/dinozList.vue';

export default defineComponent({
	name: 'CommonElements',
	data() {
		return {
			money: 0 as number
		};
	},
	components: {
		DinozList
	},
	methods: {
		// Get all data displayed on every page (money, dinozList)
		// If datas aren't in store, do an API call
		async getCommonData(): Promise<void> {
			this.money = store.getters.getMoney;
			const dinozList = store.getters.getDinozList;

			if (isNil(this.money) || isNil(dinozList)) {
				try {
					const commonData: CommonData = await PlayerService.getCommonData();

					// Set data in store
					store.commit('setMoney', commonData.money);
					store.commit('setDinozList', commonData.dinoz);
				} catch (err) {
					errorHandler.handle(err);
				}
			}
		},
		goToItemShop() {
			this.$router.push({ name: 'ItemShopPage' });
		},
		goToDinozShop() {
			this.$router.push({ name: 'DinozShopPage' });
		}
	},
	computed: {
		storeMoney(): number {
			return store.getters.getMoney;
		},
		// Format money display (1000000 -> 1.000.000)
		beautifulMoney(): string | undefined {
			if (isNil(this.money)) {
				return;
			}
			return utils.beautifulNumber(this.money.toString());
		}
	},
	watch: {
		// Watch money in store. Each time money will change, the display will be updated
		storeMoney: function(money: number) {
			this.money = money;
		}
	},
	mounted(): void {
		this.getCommonData();
	}
});

interface CommonData {
	money: number;
	dinoz: Dinoz;
}
</script>
