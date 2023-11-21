<template>
	<div v-if="ownOffer">
		<h4>{{ $t('market.transactionView.yourOngoingOffer') }}</h4>
		<table>
			<tr>
				<td>{{ $t('market.transactionView.bid') }}</td>
				<td>
					<p v-if="ownOffer.bids.length" class="bid">
						<span>{{ ownOffer.bids[0].value }}</span>
						<img :src="getImgURL('icons', 'ticket', true)" />
						<span>{{ $t('market.by') }}</span>
						<DZUser :user="ownOffer.bids[0].user" class="user" />
					</p>
					<p v-else>{{ $t('market.transactionView.noBidYet') }}</p>
					<DZButton @click="cancelOffer">{{ $t('market.transactionView.cancel') }}</DZButton>
				</td>
			</tr>
			<tr>
				<td>{{ $t('market.timeLeft') }}</td>
				<td>
					<span class="time">
						<img :src="getImgURL('design', 'small_chrono')" :alt="$t('market.timeLeft')" />
						<Tippy theme="small">
							{{ $t('market.time', secondsToDhms(Math.ceil(ownOffer.endDate.getTime() / 1000) - now)) }}
							<template #content>
								{{ ownOffer.endDate.toLocaleString() }}
							</template>
						</Tippy>
					</span>
				</td>
			</tr>
		</table>
		<DZTable>
			<OfferLine :offer="ownOffer" :now="now" />
		</DZTable>
	</div>
	<DZDisclaimer v-else help content="market.transactionView.noOnGoingOffer" />
	<div v-if="offers.length">
		<h4>{{ $t('market.transactionView.yourActiveBids') }}</h4>
		<DZTable>
			<OfferLine v-for="offer in offers" :key="offer.id" :offer="offer" :now="now" :updateOffer="updateOffer" />
		</DZTable>
	</div>
	<DZDisclaimer v-else help content="market.transactionView.noActiveBid" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import DZTable from '../common/DZTable.vue';
import { EnhancedOffer, OfferFromGetOffers } from '@drpg/core/returnTypes/Offer';
import { OfferService } from '../../services/OfferService.js';
import { errorHandler, secondsToDhms } from '../../utils/index.js';
import { playerStore } from '../../store/index.js';
import EventBus from '../../events/index.js';
import { goTo } from '../../utils/goTo.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import DZUser from '../common/DZUser.vue';
import OfferLine from './OfferLine.vue';
import { getIngredientName } from '@drpg/core/utils/IngredientUtils';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';

export default defineComponent({
	name: 'OfferList',
	data() {
		return {
			playerStore: playerStore(),
			secondsToDhms,
			goTo,
			now: Math.ceil(new Date().getTime() / 1000),
			ownOffer: null as EnhancedOffer | null,
			offers: [] as EnhancedOffer[]
		};
	},
	components: { DZButton, DZTable, DZDisclaimer, DZUser, OfferLine },
	methods: {
		// Transform endDate to Date type and add item names
		formatOffers(offers: OfferFromGetOffers[]): EnhancedOffer[] {
			return offers.map(offer => ({
				...offer,
				endDate: new Date(offer.endDate),
				items: offer.items.map(item => ({
					...item,
					name: item.isIngredient ? getIngredientName(item.itemId) : itemNameList[item.itemId]
				}))
			}));
		},
		async fetchOffers() {
			const userId = this.playerStore.playerId;

			if (!userId) {
				EventBus.emit('toast', { type: 'error', message: 'missingUser' });
				goTo(this.$router, 'MainPage');
				return;
			}

			// Fetch data
			try {
				this.offers = this.formatOffers(await OfferService.getList('all', null, userId));
				[this.ownOffer] = this.formatOffers(await OfferService.getList('all', userId));
			} catch (error) {
				errorHandler.handle(error);
				return;
			}
		},
		cancelOffer() {
			if (!this.ownOffer) {
				return;
			}

			try {
				OfferService.cancelOffer(this.ownOffer.id);
				this.ownOffer = null;
				EventBus.emit('toast', { type: 'success', message: 'market.offerCancelled' });
			} catch (error) {
				errorHandler.handle(error);
				return;
			}
		},
		updateOffer(offer: EnhancedOffer) {
			this.offers = this.offers.map(o => (o.id === offer.id ? offer : o));
		}
	},
	async mounted() {
		await this.fetchOffers();

		console.log(this.offers);

		// Update time every second
		setInterval(() => {
			this.now = Math.ceil(new Date().getTime() / 1000);
		}, 1000);
	}
});
</script>

<style lang="scss" scoped>
h4 {
	background-color: #bc683c;
	color: #ffee92;
	font-variant: small-caps;
	padding: 2px 4px;
	font-weight: normal;
}

table {
	width: 100%;
	table-layout: fixed;

	td {
		font-size: 9pt;
		padding: 2px 4px;

		&:first-child {
			background-color: #ecbd84;
			color: #f8efa4;
			border-radius: 8px;
			padding: 4px 8px;
			text-align: center;
			width: 230px;
			vertical-align: middle;
		}

		.bid {
			display: flex;
			align-items: center;
			margin-bottom: 5px;

			img {
				margin-right: 5px;
				margin-left: 5px;
			}

			.user {
				margin-left: 5px;
			}
		}

		.time {
			display: inline-flex;
			align-items: center;
			color: white;
			background-color: #bc683c;
			margin-top: 3px;
			margin-bottom: 3px;
			padding-right: 4px;
			border-radius: 7px;

			img {
				margin-right: 5px;
			}
		}
	}
}

:deep(.dinoz) {
	width: 50px;
}

:deep(.items-td) {
	width: 187px;
}

:deep(.bid-action) {
	width: 80px;
}
</style>
