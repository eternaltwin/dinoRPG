<template>
	<div id="accountList">
		<Tooltip theme="small" class="money">
			<template #tooltip-trigger>
				{{ beautifulMoney }}
				<img src="@/assets/icons/small_gold.webp" alt="or" />
			</template>
			<template #tooltip-content="{ formatContent }">
				<p v-html="formatContent($t('tooltip.gold'))" />
			</template>
		</Tooltip>
		<div class="iconMenu">
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<a id="menu_blank" class="iconor"></a>
				</template>
				<template #tooltip-content="{ formatContent }">
					<p v-html="formatContent($t('button.getGold'))" />
				</template>
			</Tooltip>
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<a id="menu_shop" @click="goToItemShop()" class="iconboutik"></a>
				</template>
				<template #tooltip-content="{ formatContent }">
					<p v-html="formatContent($t('layout.shopButton'))" />
				</template>
			</Tooltip>
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<a id="menu_clan" class="iconclan"></a>
				</template>
				<template #tooltip-content="{ formatContent }">
					<p v-html="formatContent($t('layout.clanButton'))" />
				</template>
			</Tooltip>
			<Tooltip theme="small">
				<template #tooltip-trigger>
					<a id="menu_dojo" class="icondojo"></a>
				</template>
				<template #tooltip-content="{ formatContent }">
					<p v-html="formatContent($t('layout.dojoButton'))" />
				</template>
			</Tooltip>
		</div>
		<DinozList></DinozList>
		<a class="button" @click="goToDinozShop()">
			{{ $t('button.buyDinoz') }}
		</a>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import store from '@/store';
import { isNil } from 'lodash';
import { utils, errorHandler } from '@/utils';
import { PlayerService } from '@/services';
import { Dinoz } from '@/models';
import DinozList from '@/components/dinoz/dinozList.vue';
import Tooltip from '@/components/utils/ToolTip.vue';

export default defineComponent({
	name: 'LeftPanel',
	data() {
		return {
			money: 0 as number
		};
	},
	components: {
		DinozList,
		Tooltip
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

<style lang="scss" scoped>
#accountList {
	float: left;
	position: relative;
	padding-left: 60px;
	padding-top: 35px;
	width: 145px;
	display: flex;
	flex-direction: column;
	.namePlace {
		text-align: center;
		font-size: 9pt;
		text-transform: none;
		letter-spacing: 0pt;
		color: #8e3a20;
	}
	.money {
		margin: 10px;
		width: 137px;
		height: 25px;
		margin-bottom: 34px;
		padding: 0px;
		padding-top: 6px;
		margin-left: -5px;
		text-align: center;
		font-size: 10pt !important;
		color: #ffee92;
		border: 0px;
		background-color: transparent;
		background-image: url('~@/assets/background/goldbox2.webp');
		background-repeat: no-repeat;
		cursor: help;

		img {
			vertical-align: -5%;
		}
	}
	.iconMenu {
		width: 143px;
		height: 32px;
		margin-bottom: 10px;

		a {
			display: block;
			background-repeat: no-repeat;
			border-radius: 0px;

			&.iconor {
				margin-right: 5px;
				background-image: url('~@/assets/icons/act_shop.webp');
				width: 32px;
				height: 32px;
				float: left;

				&:hover {
					background-image: url('~@/assets/icons/act_shop2.webp');
				}
			}

			&.iconboutik {
				margin-right: 5px;
				background-image: url('~@/assets/icons/act_boutique.webp');
				width: 32px;
				height: 32px;
				float: left;

				&:hover {
					background-image: url('~@/assets/icons/act_boutique2.webp');
				}
			}

			&.iconclan {
				margin-right: 5px;
				background-image: url('~@/assets/icons/act_castle.webp');
				width: 32px;
				height: 32px;
				float: left;

				&:hover {
					background-image: url('~@/assets/icons/act_castle2.webp');
				}
			}

			&.icondojo {
				background-image: url('~@/assets/icons/act_dojo.webp');
				width: 32px;
				height: 32px;
				float: left;

				&:hover {
					background-image: url('~@/assets/icons/act_dojo2.webp');
				}
			}
		}
	}
}
</style>
