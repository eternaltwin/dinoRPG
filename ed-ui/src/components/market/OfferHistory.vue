<template>
	<DZDisclaimer help content="market.historyView.lastOffers" />
	<div class="df jcsb">
		<DZButton @click="changeTab(2)">{{ $t('market.makeAnOffer') }}</DZButton>
		<select :placeholder="$t('market.filter')" @change="changeFilter">
			<option value="all">{{ $t('market.all') }}</option>
			<option value="dinoz">{{ $t('market.dinoz') }}</option>
			<option value="items">{{ $t('market.items') }}</option>
			<option value="own">{{ $t('market.historyView.yourBids') }}</option>
		</select>
	</div>
	<DZTable>
		<tr>
			<th class="dinoz-header">{{ $t('market.dinoz') }}</th>
			<th class="items-header">{{ $t('market.items') }}</th>
			<th></th>
			<th></th>
		</tr>
		<OfferLine v-for="offer in paginatedOffers" :key="offer.id" :offer="offer" :now="now" />
	</DZTable>
	<tr class="pagination-controls">
		<button @click="previousPage" :disabled="currentPage === 1">
			<img class="left" src="/src/assets/button/button-back-arrow.webp" />
		</button>
		<span>{{ currentPage }} / {{ totalPages }}</span>
		<button @click="nextPage" :disabled="currentPage === totalPages">
			<img class="right" src="/src/assets/button/button-back-arrow.webp" />
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
		changeTab: { type: Function, required: true }
	},
	data() {
		return {
			now: Math.ceil(new Date().getTime() / 1000),
			offers: [] as EnhancedOffer[],
			filter: 'all',
			currentPage: 1,
			offersPerPage: 10
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
				this.offers = this.formatOffers(await OfferService.getList(this.filter, null, null, true));
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
		previousPage() {
			if (this.currentPage > 1) {
				this.currentPage--;
			}
		},
		nextPage() {
			if (this.currentPage < this.totalPages) {
				this.currentPage++;
			}
		}
	},
	computed: {
		paginatedOffers() {
			const start = (this.currentPage - 1) * this.offersPerPage;
			const end = start + this.offersPerPage;
			return this.offers.slice(start, end);
		},
		totalPages() {
			return Math.ceil(this.offers.length / this.offersPerPage);
		}
	},
	async mounted() {
		await this.fetchOffers();

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
.dinoz-header {
	width: 50px;
}
.items-header {
	width: 187px;
}
.pagination-controls {
	margin-top: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
	button {
		background-color: transparent;
		margin: 0 10px;
		padding: 5px 10px;
		border: none;
		cursor: pointer;
		&:disabled {
			cursor: not-allowed;
		}
		.left,
		.right {
			height: auto;
			width: 10px;
		}
		.right {
			transform: rotate(180deg);
		}
	}
}
</style>
