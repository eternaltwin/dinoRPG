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

		<OfferLine v-for="offer in offers" :key="offer.id" :offer="offer" :now="now" />
	</DZTable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import DZTable from '../common/DZTable.vue';
import { errorHandler } from '../../utils/index.js';
import { OfferService } from '../../services/OfferService.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import OfferLine from './OfferLine.vue';
import { OfferFromGetOffers } from '@drpg/core/returnTypes/Offer';

export default defineComponent({
	name: 'OfferHistory',
	props: {
		changeTab: { type: Function, required: true }
	},
	data() {
		return {
			now: Math.ceil(new Date().getTime() / 1000),
			offers: [] as OfferFromGetOffers[],
			filter: 'all'
		};
	},
	components: { DZButton, DZTable, DZDisclaimer, OfferLine },
	methods: {
		async fetchOffers() {
			// Fetch data
			try {
				this.offers = await OfferService.getList(this.filter, null, null, true);
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
