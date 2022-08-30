<template>
	<div id="accountList">
		<div class="money" v-tippy="{ content: formatContent($t('tooltip.gold')), theme: 'small' }">
			{{ beautifulMoney }}
			<img src="@/assets/icons/small_gold.webp" alt="or" />
		</div>
		<div class="iconMenu">
			<a
				id="menu_blank"
				class="iconor"
				v-tippy="{
					content: formatContent($t('button.getGold')),
					theme: 'small'
				}"
			></a>
			<a
				id="menu_shop"
				@click="goToPageWithParam('ItemShopPage', 'flying')"
				class="iconboutik"
				v-tippy="{
					content: formatContent($t('layout.shopButton')),
					theme: 'small'
				}"
			></a>
			<a
				id="menu_clan"
				class="iconclan"
				v-tippy="{
					content: formatContent($t('layout.clanButton')),
					theme: 'small'
				}"
			></a>
			<a
				id="menu_dojo"
				class="icondojo"
				v-tippy="{
					content: formatContent($t('layout.dojoButton')),
					theme: 'small'
				}"
			></a>
		</div>
		<DinozList></DinozList>
		<a class="button" @click="goToPage('DinozShopPage')">
			{{ $t('button.buyDinoz') }}
		</a>
		<a class="button" @click="goToPage('DinozGenerator')">
			{{ $t('button.generator') }}
		</a>
		<a class="button" v-if="isDevEnv()" @click="goToPage('DinozWithoutFlash')"> Dinoz display </a>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { sessionStore } from '@/store';
import { utils } from '@/utils';
import DinozList from '@/components/dinoz/dinozList.vue';

export default defineComponent({
	name: 'LeftPanel',
	data() {
		return {
			sessionStore: sessionStore(),
			money: undefined as number | undefined
		};
	},
	components: {
		DinozList
	},
	methods: {
		goToPage(pageName: string) {
			this.$router.push({ name: pageName });
		},
		goToPageWithParam(pageName: string, param: string) {
			this.$router.push({
				name: pageName,
				params: { name: param }
			});
		},
		isDevEnv(): boolean {
			return import.meta.env.NODE_ENV === 'development';
		}
	},
	computed: {
		storeMoney(): number | undefined {
			return this.sessionStore.getMoney;
		},
		// Format money display (1000000 -> 1.000.000)
		beautifulMoney(): string | undefined {
			if (!this.money) {
				return;
			}
			return utils.beautifulNumber(this.money.toString());
		}
	},
	watch: {
		// Watch money in store. Each time money will change, the display will be updated
		storeMoney: function (money: number) {
			this.money = money;
		}
	},
	mounted(): void {
		this.money = this.sessionStore.getMoney;
	}
});
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
		background-image: url('@/assets/background/goldbox2.webp');
		background-repeat: no-repeat;
		cursor: help;
		font-weight: bold;

		img {
			vertical-align: -5%;
		}
	}
	.iconMenu {
		width: 143px;
		height: 32px;
		margin-bottom: 10px;
		&:hover {
			cursor: pointer;
		}

		a {
			display: block;
			background-repeat: no-repeat;
			border-radius: 0px;

			&.iconor {
				margin-right: 5px;
				background-image: url('@/assets/icons/act_shop.webp');
				width: 32px;
				height: 32px;
				float: left;

				&:hover {
					background-image: url('@/assets/icons/act_shop2.webp');
				}
			}

			&.iconboutik {
				margin-right: 5px;
				background-image: url('@/assets/icons/act_boutique.webp');
				width: 32px;
				height: 32px;
				float: left;

				&:hover {
					background-image: url('@/assets/icons/act_boutique2.webp');
				}
			}

			&.iconclan {
				margin-right: 5px;
				background-image: url('@/assets/icons/act_castle.webp');
				width: 32px;
				height: 32px;
				float: left;

				&:hover {
					background-image: url('@/assets/icons/act_castle2.webp');
				}
			}

			&.icondojo {
				background-image: url('@/assets/icons/act_dojo.webp');
				width: 32px;
				height: 32px;
				float: left;

				&:hover {
					background-image: url('@/assets/icons/act_dojo2.webp');
				}
			}
		}
	}
}
</style>
