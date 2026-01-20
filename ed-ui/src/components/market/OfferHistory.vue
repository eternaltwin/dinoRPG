<template>
	<DZDisclaimer help content="market.historyView.lastOffers" />
	<div class="df jcsb center">
		<DZButton @click="changeTab(2)">{{ $t('market.makeAnOffer') }}</DZButton>
		<DZSelect
			id="offer-history-filter-select"
			v-model="filter"
			:options="[
				{ label: $t('market.all'), value: 'all' },
				{ label: $t('market.dinoz'), value: 'dinoz' },
				{ label: $t('market.items'), value: 'items' },
				{ label: $t('market.historyView.yourOwnOffers'), value: 'own' },
				{ label: $t('market.historyView.yourOwnBids'), value: 'bids' }
			]"
			@change="changeFilter"
		/>
	</div>
	<DZTable>
		<tr>
			<th class="dinoz-header">{{ $t('market.dinoz') }}</th>
			<th class="items-header">{{ $t('market.items') }}</th>
			<th></th>
			<th></th>
		</tr>
		<OfferLine v-for="offer in offers" :key="offer.id" :offer="offer" :now="now" />
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
import { playerStore } from '../../store/index.js';
import DZSelect from '../common/DZSelect.vue';

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
			offersPerPage: 10,
			totalOffer: 0,
			totalPages: 0,
			playerStore: playerStore()
		};
	},
	components: { DZButton, DZTable, DZDisclaimer, OfferLine, DZSelect },
	methods: {
		// Transform endDate to Date type and add item names
		formatOffers(offers: OfferFromGetOffers[]): EnhancedOffer[] {
			return offers
				.map(offer => ({
					...offer,
					endDate: new Date(offer.endDate),
					items: offer.items.map(item => ({
						...item,
						name: (item.isIngredient ? ingredientNameList[item.itemId] : itemNameList[item.itemId]) ?? ''
					}))
				}))
				.sort((a, b) => b.endDate.getTime() - a.endDate.getTime()); // Sort by endDate (descending)
		},
		async fetchOffers() {
			// Fetch data
			try {
				const userId = this.playerStore.playerId;
				const { offers, total } = await OfferService.getList(
					this.filter,
					this.filter === 'own' ? userId : null,
					this.filter === 'bids' ? userId : null,
					true,
					this.currentPage
				);

				this.offers = this.formatOffers(offers);
				this.totalOffer = total;
				this.totalPages = Math.ceil(this.totalOffer / this.offersPerPage);
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				return;
			}
		},
		async changeFilter() {
			this.currentPage = 1;
			await this.fetchOffers();
		},
		async previousPage() {
			if (this.currentPage > 1) {
				try {
					this.currentPage--;
					await this.fetchOffers();
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
					await this.fetchOffers();
				} catch (error) {
					errorHandler.handle(error, this.$toast);
					return;
				}
			}
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
	width: 194px;
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
