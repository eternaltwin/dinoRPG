<template>
	<TitleHeader :title="$t('pageTitle.market')" :header="$t(`market.title`)" />
	<div class="tabPanel">
		<ul class="tabs">
			<li :class="tab === 0 ? 'active' : ''">
				<a href="#" @click="changeTab(0)">{{ $t('market.allOffers') }}</a>
			</li>
			<li :class="tab === 1 ? 'active' : ''">
				<a href="#" @click="changeTab(1)">{{ $t('market.myTransactions') }}</a>
			</li>
			<li :class="tab === 2 ? 'active' : ''">
				<a href="#" @click="changeTab(2)">{{ $t('market.sell') }}</a>
			</li>
			<li :class="tab === 3 ? 'active' : ''">
				<a href="#" @click="changeTab(3)">{{ $t('market.history') }}</a>
			</li>
		</ul>
	</div>
	<OfferList v-if="tab === 0" :changeTab="changeTab" />
	<Transactions v-if="tab === 1" />
	<Sell v-if="tab === 2" :changeTab="changeTab" />
	<OfferHistory v-if="tab === 3" :changeTab="changeTab" />
	<DZButton back @click="goBackToDinozPage">{{ $t('market.back') }}</DZButton>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { dinozStore, playerStore } from '../store/index.js';
import EventBus from '../events/index.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import DZButton from '../components/common/DZButton.vue';
import { goTo } from '../utils/goTo.js';
import { formatText } from '../utils/formatText.js';

export default defineComponent({
	name: 'MarketPage',
	components: {
		TitleHeader,
		OfferList: defineAsyncComponent(() => import('../components/market/OfferList.vue')),
		Transactions: defineAsyncComponent(() => import('../components/market/Transactions.vue')),
		Sell: defineAsyncComponent(() => import('../components/market/Sell.vue')),
		OfferHistory: defineAsyncComponent(() => import('../components/market/OfferHistory.vue')),
		DZButton
	},
	props: {
		routeTab: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			playerStore: playerStore(),
			dinozStore: dinozStore(),
			tab: 0
		};
	},
	methods: {
		changeTab(tab: number) {
			this.tab = tab;
		},
		goBackToDinozPage(): void {
			goTo(this.$router, 'DinozPage', { params: { id: this.dinozStore.currentDinozId } });
		}
	},
	async mounted(): Promise<void> {
		this.tab = +this.$route.params.tab;

		const currentDinozId = this.dinozStore.getCurrentDinozId;

		// Check if we have a dinoz selected
		if (!currentDinozId) {
			const dinozList = this.dinozStore.dinozList.filter(d => d.placeId === PlaceEnum.PLACE_DU_MARCHE);
			if (dinozList.length >= 0) {
				this.dinozStore.setCurrentDinozId(dinozList[0].id);
				EventBus.emit('isLoading', false);
				return;
			}
			this.$toast.open({ message: formatText(this.$t(`toast.selectADinozAtMarketFirst`)), type: 'error' });
			goTo(this.$router, 'News');
			return;
		}

		// Check if the dinoz exists
		const currentDinoz = this.dinozStore.getDinoz(currentDinozId);
		if (!currentDinoz) {
			this.$toast.open({ message: formatText(this.$t(`toast.unknownDinoz`)), type: 'error' });
			goTo(this.$router, 'News');
			return;
		}

		// Check if the dinoz is at the market
		if (currentDinoz.placeId === PlaceEnum.PLACE_DU_MARCHE) {
			EventBus.emit('isLoading', false);
			return;
		}
		const dinozList = this.dinozStore.dinozList.filter(d => d.placeId === PlaceEnum.PLACE_DU_MARCHE);
		if (dinozList.length > 0) {
			this.dinozStore.setCurrentDinozId(dinozList[0].id);
			EventBus.emit('isLoading', false);
			return;
		}

		this.$toast.open({ message: formatText(this.$t(`toast.selectADinozAtMarketFirst`)), type: 'error' });
		goTo(this.$router, 'News');
		return;
	}
});
</script>

<style lang="scss" scoped>
.tabPanel {
	position: relative;
	color: white;
	width: 95%;
	top: 6px;

	.tabs {
		padding-top: 4px;
		background-color: transparent;
		text-shadow: 1px 1px 0px #9a4029;
		border-bottom: 3px solid #bc683c;

		:hover {
			color: white;
		}

		li.active {
			margin-top: 1px;
			text-shadow: 1px 1px 0px #9a4029;
			a {
				background-color: #d69e68;
				line-height: 16pt;
				color: white;
				border-left-color: #ffe7aa;
				border-top-color: #ffe7aa;
				border-bottom: 1px solid #d69e68;
			}
		}
	}
}
</style>
