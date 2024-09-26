<template>
	<!-- Bouton Panel (visible seulement sur mobile) -->
	<button
		class="absolute top-[30px] left-0 bg-[#bc693cd7] py-4 px-6 rounded-r-lg text-white transition-transform duration-300 visible md:invisible z-50 md:z-30"
		:class="{ 'translate-x-[210px]': isPanelOpen }"
		@click="togglePanel"
	>
		<span class="text-3xl" v-if="!isPanelOpen">☰</span>
		<span class="text-3xl" v-else>✖</span>
	</button>
	<!-- Menu latéral -->
	<div
		id="accountList"
		class="absolute left-0 md:relative flex flex-col w-[200px] md:w-[220px] pl-[15px] pr-[15px] pt-[15px] md:pl-[60px] md:pr-0 md:pt-[35px] transition-transform duration-300 transform -translate-x-full md:translate-x-0 z-50 md:z-30 bg-cover bg-[url('./assets/design/tabsBg.webp')] md:bg-none"
		:class="{ 'translate-x-0': isPanelOpen }"
	>
		<div
			class="money w-[137px] h-[31px] m-[10px] mb-[28px] pt-[5px] pl-[15px] text-[#ffee92] text-left cursor-help"
			v-tippy="{ content: formatContent($t('tooltip.gold')), theme: 'small' }"
		>
			{{ beautifulMoney }}
			<img class="relative" :src="getImgURL('icons', 'small_gold')" alt="or" />
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
				@click="goToPlayerClan()"
				class="iconclan"
				:class="{ disabled: !clanId }"
				v-tippy="{
					content: formatContent($t('layout.clanButton')),
					theme: 'small'
				}"
			></a>
			<!--			<a
				id="menu_dojo"
				class="icondojo disabled"
				v-tippy="{
					content: formatContent($t('layout.dojoButton')),
					theme: 'small'
				}"
			></a>-->
			<a
				id="menu_cine"
				@click="goToCine()"
				class="iconcine"
				v-tippy="{
					content: formatContent($t('layout.cine')),
					theme: 'small'
				}"
			></a>
		</div>
		<div class="place mb-[8px] p-[2px] bg-[#fbdca5] cursor-pointer" v-if="place" @click="goToDinozPage()">
			<div class="h-[109px] w-[140px]">
				<img
					class="border ml-[14px] md:ml-0 w-full h-auto"
					style="border-color: #9a4029"
					:src="getPlaceImage(place)"
					:alt="$t(`place.name.${place}`)"
				/>
			</div>
			<p class="text-[#bc683c] text-center italic">{{ $t(`place.name.${place}`) }}</p>
		</div>
		<DinozList :currentDinozId="currentDinozId()" :key="dinozStore"></DinozList>
		<a v-if="hasPDA" class="overviewButton flex h-[20px]" @click="goToPage('ManageDinoz')">
			<img :src="getImgURL('icons', `small_edit`)" alt="edit" />
			<span>{{ $t('button.sortDinoz') }}</span>
		</a>
		<a v-if="hasPMI" class="overviewButton flex h-[20px]" @click="goToPage('DinozMissions')">
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
			money: undefined as number | undefined,
			clanId: undefined as number | undefined,
			isPanelOpen: false
		};
	},
	components: {
		DinozList
	},
	methods: {
		togglePanel() {
			this.isPanelOpen = !this.isPanelOpen; // Bascule entre ouvert et fermé
		},
		changeTimezone(date: Date, ianatz: string) {
			const invdate = new Date(
				date.toLocaleString('en-US', {
					timeZone: ianatz
				})
			);
			const diff = date.getTime() - invdate.getTime();
			return new Date(date.getTime() - diff); // needs to substract
		},
		goToPage(pageName: string) {
			this.$router.push({ name: pageName });
		},
		goToCine() {
			window.open('https://gerardufoin.github.io/DinoRPG-Legacy-Paradino/', '_blank');
		},
		goToPageWithParam(pageName: string, param: string) {
			this.$router.push({
				name: pageName,
				params: { name: param }
			});
		},
		goToDinozPage() {
			this.$router.push({
				name: 'DinozPage',
				params: { id: this.currentDinozId() }
			});
		},
		goToPageWithId(pageName: string, _id: number) {
			this.$router.push({
				name: pageName,
				params: { id: _id }
			});
		},
		goToPlayerClan() {
			if (this.clanId) {
				this.$router.push({
					name: 'Clan',
					params: { id: this.clanId }
				});
			}
		},
		isDevEnv(): boolean {
			return import.meta.env.MODE === 'development';
		},
		currentDinozId(): number | undefined {
			return this.playerStore.playerOptions.currentDinozId;
		},
		getPlaceImage(place: string | null) {
			if (!place) return;
			const today = this.changeTimezone(new Date(), 'GMT').getDay();
			if (place === 'marais' && !(today === 1 || today === 2 || today === 5)) {
				return new URL(`/src/assets/place/marais_fog.webp`, import.meta.url);
			}
			return new URL(`/src/assets/place/${place}.webp`, import.meta.url);
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
		},
		'playerStore.getClanId': function (clanId: number) {
			this.clanId = clanId;
		}
	},
	mounted(): void {
		this.money = this.playerStore.getMoney;
		this.clanId = this.playerStore.getClanId;
	}
});
</script>

<style lang="scss" scoped>
.overviewButton {
	color: #8e3e26;
	font-variant: small-caps;
	font-weight: bold;
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
	.money {
		margin-left: -5px;
		font-size: 10pt;
		background-image: url('../../assets/background/goldbox2.webp');
		background-repeat: no-repeat;
		font-weight: bold;
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
				&.disabled {
					filter: grayscale(100%);
					&:hover {
						cursor: auto;
					}
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
				&.disabled {
					filter: grayscale(100%);
					&:hover {
						cursor: auto;
					}
				}
			}
			&.iconcine {
				background-image: url('../../assets/icons/act_historique.webp');
				width: 32px;
				height: 32px;
				float: left;

				&:hover {
					filter: brightness(1.5);
				}
			}
		}
	}
}
</style>
