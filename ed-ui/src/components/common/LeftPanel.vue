<template>
	<div id="accountList">
		<div class="money" v-tippy="{ content: formatContent($t('tooltip.gold')), theme: 'small' }">
			{{ beautifulMoney }}
			<img :src="getImgURL('icons', 'small_gold')" alt="or" />
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
		<div class="place" v-if="place">
			<div class="img-wrapper">
				<img :src="getImgURL('place', place)" :alt="$t(`place.name.${place}`)" />
			</div>
			<p class="place-name">{{ $t(`place.name.${place}`) }}</p>
		</div>
		<DinozList :currentDinozId="currentDinozId()" :key="dinozStore"></DinozList>
		<a v-if="hasPDA" class="overviewButton" @click="goToPage('ManageDinoz')">
			<img :src="getImgURL('icons', `small_edit`)" alt="edit" />
			<span>{{ $t('button.sortDinoz') }}</span>
		</a>
		<a v-if="hasPMI" class="overviewButton" @click="goToPage('DinozMissions')">
			<img :src="getImgURL('icons', `small_right`)" alt="missions" />
			<span>{{ $t('button.dinozMissions') }}</span>
		</a>
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
import { dinozStore, playerStore } from '../../store/index.js';
import { utils } from '../../utils/index.js';
import DinozList from '../../components/dinoz/DinozList.vue';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';

export default defineComponent({
	name: 'LeftPanel',
	data() {
		return {
			playerStore: playerStore(),
			dinozStore: dinozStore(),
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
			return import.meta.env.MODE === 'development';
		},
		currentDinozId(): number | undefined {
			return this.playerStore.playerOptions.currentDinozId;
		}
	},
	computed: {
		storeMoney(): number | undefined {
			return this.playerStore.getMoney;
		},
		place(): string | null {
			if (!this.currentDinozId()) return this.place;

			const currentDinoz = this.dinozStore.getDinoz(this.currentDinozId()) as DinozFiche | undefined;
			if (!currentDinoz) return this.place;

			const place = Object.values(placeList).find(place => place.placeId === currentDinoz.placeId);
			if (!place) return this.place;

			return place.name;
		},
		hasPDA(): boolean {
			return this.playerStore.playerOptions.hasPDA;
		},
		hasPMI(): boolean {
			return this.playerStore.playerOptions.hasPMI;
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
		},
		// Watch current dinoz id in store. Each time current dinoz id will change, the selected dinoz will be updated
		currentDinozId: function (dinozId: number) {
			this.currentDinozId = dinozId;
		}
	},
	mounted(): void {
		this.money = this.playerStore.getMoney;
	}
});
</script>

<style lang="scss" scoped>
.overviewButton {
	color: #8e3e26;
	font-variant: small-caps;
	font-weight: bold;
	display: flex;
	align-items: center;
	margin-bottom: 1px;
	padding-top: 1px;
	padding-bottom: 1px;
	padding-left: 5px;
	font-size: 8pt;
	line-height: 10pt;
	text-decoration: none;
	border: 1px solid #d69e68;
	border-radius: 0px;
	-webkit-border-radius: 0px;
	cursor: pointer;
	img {
		width: 8px;
		padding-right: 3px;
	}
	&:hover {
		color: #fce3bc;
	}
}
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
		background-image: url('../../assets/background/goldbox2.webp');
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
				background-image: url('../../assets/icons/act_shop.webp');
				width: 32px;
				height: 32px;
				float: left;

				&:hover {
					background-image: url('../../assets/icons/act_shop2.webp');
				}
			}

			&.iconboutik {
				margin-right: 5px;
				background-image: url('../../assets/icons/act_boutique.webp');
				width: 32px;
				height: 32px;
				float: left;

				&:hover {
					background-image: url('../../assets/icons/act_boutique2.webp');
				}
			}

			&.iconclan {
				margin-right: 5px;
				background-image: url('../../assets/icons/act_castle.webp');
				width: 32px;
				height: 32px;
				float: left;

				&:hover {
					background-image: url('../../assets/icons/act_castle2.webp');
				}
			}

			&.icondojo {
				background-image: url('../../assets/icons/act_dojo.webp');
				width: 32px;
				height: 32px;
				float: left;

				&:hover {
					background-image: url('../../assets/icons/act_dojo2.webp');
				}
			}
		}
	}
}

.place {
	padding: 2px;
	background-color: #fbdca5;
	margin-bottom: 8px;

	.img-wrapper {
		height: 109px;
		overflow: hidden;

		img {
			width: 100%;
			border: 1px solid #9a4029;
			box-sizing: border-box;
		}
	}

	.place-name {
		color: #bc683c;
		text-align: center;
		font-size: 9pt;
		font-style: italic;

		&:first-letter {
			font-weight: normal;
			font-size: 9pt;
		}
	}
}
</style>
