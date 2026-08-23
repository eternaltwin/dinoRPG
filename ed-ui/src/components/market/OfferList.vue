<template>
	<DZDisclaimer help content="market.disclaimer" />
	<div class="header df aic jcsb center">
		<DZButton @click="changeTab(2)">{{ $t('market.makeAnOffer') }}</DZButton>
		<Tippy theme="small" tag="div" class="treasury-notes dz-golden-box no-shadow">
			<span>{{ treasuryNotes }}</span>
			<img :src="getImgURL('icons', 'ticket', true)" :alt="$t('item.name.treasure_coupon')" />
			<template #content>
				{{ $t('market.yourTreasuryNotes') }}
			</template>
		</Tippy>
		<DZSelect
			id="offer-filter-select"
			v-model="filter"
			:options="[
				{ label: $t('market.all'), value: 'all' },
				{ label: $t('market.dinoz'), value: 'dinoz' },
				{ label: $t('market.items'), value: 'items' }
			]"
			@change="changeFilter"
		/>
	</div>
	<DZTable>
		<tr>
			<th class="dinoz-header">{{ $t('market.dinoz') }}</th>
			<th class="items-header">{{ $t('market.items') }}</th>
			<th>{{ $t('market.details') }}</th>
			<th class="bid-action-header"></th>
		</tr>
		<OfferLine
			v-for="offer in offers"
			:key="offer.id"
			:offer="offer"
			:now="now"
			:updateOffer="updateOffer"
			@bid="onBid"
		/>
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
import { itemList } from '@drpg/core/models/item/ItemList';
import { ingredientNameList } from '@drpg/core/models/ingredient/IngredientNameList';
import { InventoryService } from '../../services';
import { Item } from '@drpg/core/models/item/ItemList';
import { Tippy } from 'vue-tippy';
import DZSelect from '../common/DZSelect.vue';

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
			totalPages: 0,
			treasuryNotes: 0
		};
	},
	components: { DZButton, DZTable, DZDisclaimer, OfferLine, Tippy, DZSelect },
	methods: {
		// Transform endDate to Date type and add item names
		formatOffers(offers: OfferFromGetOffers[]): EnhancedOffer[] {
			return offers.map(offer => ({
				...offer,
				endDate: new Date(offer.endDate),
				items: offer.items.map(item => ({
					...item,
					name: (item.isIngredient ? ingredientNameList[item.itemId] : itemList[item.itemId]?.name) ?? ''
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
		async changeFilter() {
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
		},
		async onBid(payload: { offerId: number; bidValue: number }) {
			// Update treasury notes
			this.treasuryNotes -= payload.bidValue;
		}
	},
	async mounted() {
		await this.fetchOffers();

		// Get player's treasury notes
		const items = await InventoryService.getAllItemsData();
		const treasuryNoteItem = items.find(i => i.id === Item.TREASURE_COUPON);
		this.treasuryNotes = treasuryNoteItem ? treasuryNoteItem.quantity : 0;

		// Update time every second
		setInterval(() => {
			this.now = Math.ceil(new Date().getTime() / 1000);
		}, 1000);
	}
});
</script>

<style lang="scss" scoped>
.treasury-notes {
	color: #fce3bc;
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 2px 4px;
}
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
