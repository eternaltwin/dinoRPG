<template>
	<DZDisclaimer help content="market.disclaimer" class="ml-[-48px] sm:ml-0" />
	<div class="flex justify-around sm:justify-between">
		<DZButton @click="changeTab(2)">{{ $t('market.makeAnOffer') }}</DZButton>
		<select :placeholder="$t('market.filter')" @change="changeFilter">
			<option value="all">{{ $t('market.all') }}</option>
			<option value="dinoz">{{ $t('market.dinoz') }}</option>
			<option value="items">{{ $t('market.items') }}</option>
		</select>
	</div>
	<DZTable class="ml-[-50px] sm:ml-0">
		<tr>
			<th class="w-[50px]">{{ $t('market.dinoz') }}</th>
			<th class="w-[187px]">{{ $t('market.items') }}</th>
			<th>{{ $t('market.details') }}</th>
			<th class="w-[80px]"></th>
		</tr>
		<OfferLine
			v-for="offer in paginatedOffers"
			:key="offer.id"
			:offer="offer"
			:now="now"
			:updateOffer="updateOffer"
			:tab="tab"
		/>
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
	<DZDisclaimer help content="market.currency" class="ml-[-48px] sm:ml-0" />
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
		changeTab: { type: Function, required: true },
		tab: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			now: Math.ceil(new Date().getTime() / 1000),
			offers: [] as OfferFromGetOffers[],
			filter: 'all',
			currentPage: 1,
			offersPerPage: 10
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
					name: item.isIngredient ? ingredientNameList[item.itemId] : itemNameList[item.itemId]
				}))
			}));
		},
		async fetchOffers() {
			// Fetch data
			try {
				this.offers = this.formatOffers(await OfferService.getList(this.filter));
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
		updateOffer(offer: OfferFromGetOffers) {
			this.offers = this.offers.map(o => (o.id === offer.id ? offer : o));
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
