<template>
	<DZDisclaimer help content="market.disclaimer" />
	<div class="df jcsb center">
		<DZButton @click="changeTab(2)">{{ $t('market.makeAnOffer') }}</DZButton>
		<select :placeholder="$t('market.filter')" @change="changeFilter">
			<option value="all">{{ $t('market.all') }}</option>
			<option value="dinoz">{{ $t('market.dinoz') }}</option>
			<option value="items">{{ $t('market.items') }}</option>
		</select>
	</div>
	<DZTable>
		<tr>
			<th class="dinoz-header">{{ $t('market.dinoz') }}</th>
			<th class="items-header">{{ $t('market.items') }}</th>
			<th>{{ $t('market.details') }}</th>
			<th class="bid-action-header"></th>
		</tr>
		<OfferLine v-for="offer in offers" :key="offer.id" :offer="offer" :now="now" :updateOffer="updateOffer" />
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
	<DZDisclaimer help content="market.currency" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import DZTable from '../common/DZTable.vue';
import { errorHandler } from '../../utils/index.js';
import { OfferService } from '../../services/OfferService.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import OfferLine from './OfferLine.vue';
import { EnhancedOffer, OfferFromGetOffers } from '@drpg/core/returnTypes/Offer';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { ingredientNameList } from '@drpg/core/models/ingredient/IngredientNameList';

export default defineComponent({
	name: 'OfferList',
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
			totalPages: 0
		};
	},
	components: { DZButton, DZTable, DZDisclaimer, OfferLine },
	methods: {
		// Transform endDate to Date type and add item names
		formatOffers(offers: OfferFromGetOffers[]): EnhancedOffer[] {
			return offers.map(offer => ({
				...offer,
				endDate: new Date(offer.endDate),
				items: offer.items.map(item => ({
					...item,
					name: (item.isIngredient ? ingredientNameList[item.itemId] : itemNameList[item.itemId]) ?? ''
				}))
			}));
		},
		async fetchOffers() {
			// Fetch data
			try {
				const { offers, total } = await OfferService.getList(this.filter, null, null, false, this.currentPage);

				this.offers = this.formatOffers(offers);
				this.totalOffer = total;
				this.totalPages = Math.ceil(this.totalOffer / this.offersPerPage);
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				return;
			}
		},
		async changeFilter(event: Event) {
			this.filter = (event.target as HTMLSelectElement).value;
			this.currentPage = 1;
			await this.fetchOffers();
		},
		updateOffer(offer: EnhancedOffer) {
			this.offers = this.offers.map(o => (o.id === offer.id ? offer : o));
		},
		async previousPage() {
			if (this.currentPage > 1) {
				try {
					this.currentPage--;
					await this.fetchOffers();
				} catch (err) {
					errorHandler.handle(err, this.$toast);
				}
			}
		},
		async nextPage() {
			if (this.currentPage < this.totalPages) {
				try {
					this.currentPage++;
					await this.fetchOffers();
				} catch (err) {
					errorHandler.handle(err, this.$toast);
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
	//width: 187px;
}
.bid-action-header {
	width: 80px;
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
