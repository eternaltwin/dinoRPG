<template>
	<div id="common">
		<p>{{ money }}</p>
		<button>{{ $t('bouton.obtenirDeLor') }}</button>
		<button>{{ $t('bouton.boutique') }}</button>
		<dinoz-list></dinoz-list>
		<button @click="goToDinozShop()">{{ $t('bouton.acheterDinoz') }}</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '@/store';
import { isNil } from 'lodash';
import { errorHandler } from '@/utils';
import { PlayerService } from '@/services';
import { Dinoz } from '@/models';
import DinozList from '@/components/dinoz/dinozList.vue';

export default defineComponent({
	name: 'CommonElements',
	data() {
		return {
			money: undefined as number | undefined
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
		goToDinozShop() {
			this.$router.push({ name: 'DinozShopPage' });
		}
	},
	computed: {
		storeMoney(): number {
			return store.getters.getMoney;
		}
	},
	watch: {
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
