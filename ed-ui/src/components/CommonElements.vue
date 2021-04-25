<template>
	<div id="common">
		<p>{{ money }}</p>
		<div>
			<button class="actionButton buttonGold"></button>
			<button class="actionButton buttonShop"></button>
			<button class="actionButton buttonClan"></button>
			<button class="actionButton buttonDojo"></button>
		</div>
		<dinoz-list></dinoz-list>
		<button class="button" @click="goToDinozShop()">
			{{ $t('bouton.acheterDinoz') }}
		</button>
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

<style lang="scss">
.actionButton {
	background-repeat: no-repeat;
	width: 34px;
	height: 32px;
	float: left;
	border-style: none;
	cursor: pointer;
}

.actionButton:focus {
	outline: none;
}

.buttonGold {
	background-image: url('../assets/action/act_shop.png');
}

.buttonGold:hover {
	background-image: url('../assets/action/act_shop2.png');
	content: 'test';
}

.buttonShop {
	background-image: url('../assets/action/act_boutique.png');
}

.buttonShop:hover {
	background-image: url('../assets/action/act_boutique2.png');
}

.buttonClan {
	background-image: url('../assets/action/act_castle.png');
}

.buttonClan:hover {
	background-image: url('../assets/action/act_castle2.png');
}

.buttonDojo {
	background-image: url('../assets/action/act_dojo.png');
}

.buttonDojo:hover {
	background-image: url('../assets/action/act_dojo2.png');
}
</style>
