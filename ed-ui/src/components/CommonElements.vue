<template>
	<div>
		<span class="money">{{ beautifulMoney }}</span>
	</div>
	<div class="iconMenu">
		<a class="icon iconGold"></a>
		<a class="icon iconShop"></a>
		<a class="icon iconClan"></a>
		<a class="icon iconDojo"></a>
	</div>
	<dinoz-list></dinoz-list>
	<button class="button" @click="goToDinozShop()">
		{{ $t('bouton.acheterDinoz') }}
	</button>
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
		goToDinozShop() {
			this.$router.push({ name: 'DinozShopPage' });
		}
	},
	computed: {
		storeMoney(): number {
			return store.getters.getMoney;
		},
		beautifulMoney(): string {
			return utils.beautifulNumber(this.money.toString());
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
.icon {
	margin-right: 5px;
	width: 32px;
	height: 32px;
	float: left;
}

.icon:focus {
	outline: none;
}

.iconGold {
	background-image: url('../assets/action/act_shop.png');
}

.iconGold:hover {
	background-image: url('../assets/action/act_shop2.png');
	content: 'test';
}

.iconShop {
	background-image: url('../assets/action/act_boutique.png');
}

.iconShop:hover {
	background-image: url('../assets/action/act_boutique2.png');
}

.iconClan {
	background-image: url('../assets/action/act_castle.png');
}

.iconClan:hover {
	background-image: url('../assets/action/act_castle2.png');
}

.iconDojo {
	background-image: url('../assets/action/act_dojo.png');
}

.iconDojo:hover {
	background-image: url('../assets/action/act_dojo2.png');
}

.money {
	display: block;
	width: 137px;
	height: 25px;
	margin-bottom: 34px;
	padding: 0px;
	padding-top: 6px;
	margin-left: -5px;
	text-align: center;
	font-size: 10pt;
	color: #ffee92;
	border: 0px;
	background-color: transparent;
	background-image: url('../assets/background/goldbox2.png');
	background-repeat: no-repeat;
	cursor: help;
	font-weight: bold;
	font-family: 'Trebuchet MS', Arial, sans-serif;
}
</style>
