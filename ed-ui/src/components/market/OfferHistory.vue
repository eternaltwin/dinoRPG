<template>
	<DZDisclaimer help content="market.historyView.lastOffers" class="ml-[-48px] sm:ml-0" />
	<div class="flex justify-around sm:justify-between">
		<DZButton @click="changeTab(2)">{{ $t('market.makeAnOffer') }}</DZButton>
		<select :placeholder="$t('market.filter')" @change="changeFilter">
			<option value="all">{{ $t('market.all') }}</option>
			<option value="dinoz">{{ $t('market.dinoz') }}</option>
			<option value="items">{{ $t('market.items') }}</option>
			<option value="own">{{ $t('market.historyView.yourBids') }}</option>
		</select>
	</div>
	<DZTable class="ml-[-50px] sm:ml-0">
		<tr>
			<th class="w-[50px]">{{ $t('market.dinoz') }}</th>
			<th class="w-[187px]">{{ $t('market.items') }}</th>
			<th></th>
		</tr>
		<OfferLine v-for="offer in offers" :key="offer.id" :offer="offer" :now="now" :tab="tab" />
	</DZTable>
	<tr class="ml-[-48px] mt-[10px] flex items-center justify-center sm:ml-0">
		<button @click="previousPage" :disabled="currentPage === 1">
			<img class="w-[10px]" src="/src/assets/button/button-back-arrow.webp" />
		</button>
		<span>{{ currentPage }} / {{ totalPages }}</span>
		<button @click="nextPage" :disabled="currentPage === totalPages">
			<img class="w-[10px] rotate-180" src="/src/assets/button/button-back-arrow.webp" />
		</button>
	</tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import DZTable from '../common/DZTable.vue';
import { errorHandler } from '../../utils/index.js';
import { OfferService } from '../../services/OfferService.js';
import { EnhancedOffer, OfferFromGetOffers } from '@drpg/core/returnTypes/Offer';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import OfferLine from './OfferLine.vue';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { ingredientNameList } from '@drpg/core/models/ingredient/IngredientNameList';

export default defineComponent({
	name: 'OfferHistory',
	props: {
		changeTab: { type: Function, required: true },
		tab: {
			type: Number,
			default: 3,
			required: true
		}
	},
	data() {
		return {
			now: Math.ceil(new Date().getTime() / 1000),
			offers: [] as EnhancedOffer[],
			filter: 'all',
			currentPage: 1,
			offersPerPage: 10,
			totalOffer: 0,
			totalPages: 0
		};
	},
	components: { DZButton, DZTable, DZDisclaimer, OfferLine },
	methods: {
		// Transform endDate to Date type and add item names
		formatOffers(offers: OfferFromGetOffers[]): EnhancedOffer[] {
			return offers
				.map(offer => ({
					...offer,
					endDate: new Date(offer.endDate),
					items: offer.items.map(item => ({
						...item,
						name: item.isIngredient ? ingredientNameList[item.itemId] : itemNameList[item.itemId]
					}))
				}))
				.sort((a, b) => b.endDate.getTime() - a.endDate.getTime()); // Sort by endDate (descending)
		},
		async fetchOffers() {
			// Fetch data
			try {
				this.offers = this.formatOffers(await OfferService.getList(this.filter, null, null, true, this.currentPage));
				this.currentPage = 1;
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				return;
			}
		},
		async changeFilter(event: Event) {
			this.filter = (event.target as HTMLSelectElement).value;
			await this.fetchOffers();
		},
		async previousPage() {
			if (this.currentPage > 1) {
				try {
					this.currentPage--;
					this.offers = this.formatOffers(await OfferService.getList(this.filter, null, null, true, this.currentPage));
				} catch (error) {
					errorHandler.handle(error, this.$toast);
					return;
				}
			}
		},
		async nextPage() {
			if (this.currentPage < this.totalPages) {
				try {
					this.currentPage++;
					this.offers = this.formatOffers(await OfferService.getList(this.filter, null, null, true, this.currentPage));
				} catch (error) {
					errorHandler.handle(error, this.$toast);
					return;
				}
			}
		},
		async totalOffers() {
			try {
				this.totalOffer = parseInt(await OfferService.getTotal());
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				return;
			}
		}
	},
	async mounted() {
		await this.totalOffers();
		await this.fetchOffers();
		this.totalPages = Math.ceil(this.totalOffer / this.offersPerPage);

		// Update time every second
		setInterval(() => {
			this.now = Math.ceil(new Date().getTime() / 1000);
		}, 1000);
	}
});
</script>

<style lang="scss" scoped>
select {
	background-color: #bc683c;
	border: none;
	color: #fce3bc;
	font-weight: bold;
}
button {
	background-color: transparent;
	margin: 0 10px;
	padding: 5px 10px;
	border: none;
	cursor: pointer;
	&:disabled {
		cursor: not-allowed;
	}
}
</style>
