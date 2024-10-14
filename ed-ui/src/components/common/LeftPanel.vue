<template>
	<!-- Bouton Panel (visible seulement sur mobile) -->
	<button
		class="visible absolute left-0 top-[30px] z-50 rounded-r-lg bg-[#bc693cd7] px-6 py-4 text-white transition-transform duration-300 md:invisible md:z-30"
		:class="{ 'translate-x-[200px]': isPanelOpen }"
		@click="togglePanel"
	>
		<span class="text-3xl" v-if="!isPanelOpen">☰</span>
		<span class="text-3xl" v-else>✖</span>
	</button>
	<!-- Menu latéral -->
	<div
		id="accountList"
		class="absolute left-0 z-50 flex w-[200px] -translate-x-full flex-col bg-[url('./assets/design/tabsBg.webp')] bg-cover px-[15px] pt-[15px] transition-transform duration-300 md:relative md:z-30 md:w-[220px] md:translate-x-0 md:bg-none md:pl-[60px] md:pr-0 md:pt-[35px]"
		:class="{ 'translate-x-0': isPanelOpen }"
	>
		<div
			class="m-[10px] -ml-2 mb-[28px] h-[31px] w-[137px] cursor-help bg-[url('./assets/background/goldbox2.webp')] bg-no-repeat pl-[15px] pt-[5px] text-left text-[10pt] font-bold text-[#ffee92]"
			v-tippy="{ content: formatContent($t('tooltip.gold')), theme: 'small' }"
		>
			{{ beautifulMoney }}
			<img class="relative" :src="getImgURL('icons', 'small_gold')" alt="or" />
		</div>
		<div class="mb-2.5 h-[32px] w-[143px] hover:cursor-pointer">
			<a
				id="menu_blank"
				class="float-left mr-[5px] block size-[32px] bg-[url('./assets/icons/act_shop.webp')] hover:bg-[url('./assets/icons/act_shop2.webp')]"
				v-tippy="{
					content: formatContent($t('button.getGold')),
					theme: 'small'
				}"
			></a>
			<a
				id="menu_shop"
				@click="goToPageWithParam('ItemShopPage', 'flying')"
				class="float-left mr-[5px] block size-[32px] bg-[url('./assets/icons/act_boutique.webp')] hover:bg-[url('./assets/icons/act_boutique2.webp')]"
				v-tippy="{
					content: formatContent($t('layout.shopButton')),
					theme: 'small'
				}"
			></a>
			<a
				id="menu_clan"
				@click="goToPlayerClan()"
				class="float-left mr-[5px] block size-[32px] cursor-pointer bg-[url('./assets/icons/act_castle.webp')] hover:bg-[url('./assets/icons/act_castle2.webp')]"
				:class="{ 'cursor-auto grayscale': !clanId }"
				v-tippy="{
					content: formatContent($t('layout.clanButton')),
					theme: 'small'
				}"
			></a>
			<!--			<a
				id="menu_dojo"
				class="disabled:grayscale disabled:hover:cursor-auto disabled float-left block size-[32px] bg-[url('./assets/icons/act_dojo.webp')] hover:bg-[url('./assets/icons/act_dojo2.webp')]"
				v-tippy="{
					content: formatContent($t('layout.dojoButton')),
					theme: 'small'
				}"
			></a>-->
			<a
				id="menu_cine"
				@click="goToCine()"
				class="float-left size-[32px] bg-[url('./assets/icons/act_historique.webp')] hover:brightness-150"
				v-tippy="{
					content: formatContent($t('layout.cine')),
					theme: 'small'
				}"
			></a>
		</div>
		<div class="mb-[8px] cursor-pointer bg-[#fbdca5] p-[2px]" v-if="place" @click="goToDinozPage()">
			<div class="h-[109px] w-[140px]">
				<img
					class="ml-[14px] h-auto w-full border md:ml-0"
					style="border-color: #9a4029"
					:src="getPlaceImage(place)"
					:alt="$t(`place.name.${place}`)"
				/>
			</div>
			<p class="text-center italic text-[#bc683c]">{{ $t(`place.name.${place}`) }}</p>
		</div>
		<DinozList :currentDinozId="currentDinozId()" :key="dinozStore" @click="togglePanel"></DinozList>
		<a
			v-if="hasPDA"
			class="mb-px flex h-[20px] cursor-pointer border border-[#d69e68] py-px pl-[5px] text-[8pt] font-bold leading-[10pt] text-[#8e3e26] hover:bg-[#8e3e26] hover:text-[#fce3bc]"
			style="font-variant: small-caps"
			@click="goToPage('ManageDinoz')"
		>
			<img class="size-[12px] pr-[3px] pt-[3px]" :src="getImgURL('icons', `small_edit`)" alt="edit" />
			<span>{{ $t('button.sortDinoz') }}</span>
		</a>
		<a
			v-if="hasPMI"
			class="mb-px flex h-[20px] cursor-pointer border border-[#d69e68] py-px pl-[5px] text-[8pt] font-bold leading-[10pt] text-[#8e3e26] hover:bg-[#8e3e26] hover:text-[#fce3bc]"
			style="font-variant: small-caps"
			@click="goToPage('DinozMissions')"
		>
			<img class="size-[12px] pr-[3px] pt-[2px]" :src="getImgURL('icons', `small_right`)" alt="missions" />
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
			this.togglePanel();
			this.$router.push({ name: pageName });
		},
		goToCine() {
			this.togglePanel();
			window.open('https://gerardufoin.github.io/DinoRPG-Legacy-Paradino/', '_blank');
		},
		goToPageWithParam(pageName: string, param: string) {
			this.togglePanel();
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
			this.togglePanel();
			this.$router.push({
				name: pageName,
				params: { id: _id }
			});
		},
		goToPlayerClan() {
			this.togglePanel();
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
