<template>
	<DZDisclaimer help content="market.disclaimer" />
	<div class="df jcsb">
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
			<th></th>
			<th></th>
		</tr>

		<OfferLine v-for="offer in offers" :key="offer.id" :offer="offer" :now="now" />
	</DZTable>
	<DZDisclaimer help content="market.currency" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import DZTable from '../common/DZTable.vue';
import { errorHandler } from '../../utils/index.js';
import { OfferService } from '../../services/OfferService.js';
import { Offer } from '@drpg/core/returnTypes/Offer';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import OfferLine from './OfferLine.vue';

export default defineComponent({
	name: 'OfferList',
	props: {
		changeTab: { type: Function, required: true }
	},
	data() {
		return {
			now: Math.ceil(new Date().getTime() / 1000),
			offers: [] as (Omit<Offer, 'endDate'> & { endDate: Date })[],
			filter: 'all'
		};
	},
	components: { DZButton, DZTable, DZDisclaimer, OfferLine },
	methods: {
		// Transform endDate to Date type
		formatOffers(offers: Offer[]): (Omit<Offer, 'endDate'> & { endDate: Date })[] {
			return offers.map(offer => ({
				...offer,
				endDate: new Date(offer.endDate)
			}));
		},
		async fetchOffers() {
			// Fetch data
			try {
				this.offers = this.formatOffers(await OfferService.getList(this.filter));
			} catch (error) {
				errorHandler.handle(error);
				return;
			}
		},
		async changeFilter(event: Event) {
			this.filter = (event.target as HTMLSelectElement).value;

			await this.fetchOffers();
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
.dinoz-header {
	width: 50px;
}

.items-header {
	width: 187px;
}
</style>
