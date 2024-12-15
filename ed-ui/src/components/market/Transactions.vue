<template>
	<template v-if="myExpiredOffers">
		<h4>{{ $t('market.transactionView.myExpiredOffers') }}</h4>
		<table>
			<tr>
				<td>{{ $t('market.transactionView.bid') }}</td>
				<td>
					<DZButton @click="reclaimOffer(myExpiredOffers.id)">{{ $t('market.transactionView.claimExpired') }}</DZButton>
				</td>
			</tr>
		</table>
		<DZTable>
			<OfferLine :offer="myExpiredOffers" :now="now" />
		</DZTable>
	</template>
	<DZDisclaimer v-else help content="market.transactionView.noWonOffer" />
	<template v-if="wonOffers.length">
		<h4>{{ $t('market.transactionView.yourWonOffer') }}</h4>
		<template v-for="offer in wonOffers" :key="offer.id">
			<table>
				<tr>
					<td>{{ $t('market.transactionView.bid') }}</td>
					<td>
						<p v-if="offer.bids.length" class="bid">
							<span>{{ offer.bids[0].value }}</span>
							<img :src="getImgURL('icons', 'ticket', true)" />
							<span>{{ $t('market.by') }}</span>
							<DZUser :user="offer.bids[0].user" />
						</p>
						<p v-else>{{ $t('market.transactionView.noBidYet') }}</p>
						<DZButton @click="reclaimOffer(offer.id)">{{ $t('market.transactionView.claim') }}</DZButton>
					</td>
				</tr>
			</table>
			<DZTable>
				<OfferLine :offer="offer" :now="now" />
			</DZTable>
		</template>
	</template>
	<DZDisclaimer v-else help content="market.transactionView.noWonOffer" />
	<template v-if="ownOffer">
		<h4>{{ $t('market.transactionView.yourOngoingOffer') }}</h4>
		<table>
			<tr>
				<td>{{ $t('market.transactionView.bid') }}</td>
				<td>
					<p v-if="ownOffer.bids.length" class="bid">
						<span>{{ ownOffer.bids[0].value }}</span>
						<img :src="getImgURL('icons', 'ticket', true)" />
						<span>{{ $t('market.by') }}</span>
						<DZUser :user="ownOffer.bids[0].user" />
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
	</template>
	<DZDisclaimer v-else help content="market.transactionView.noOnGoingOffer" />
	<template v-if="offers.length">
		<h4>{{ $t('market.transactionView.yourActiveBids') }}</h4>
		<DZTable>
			<tr>
				<th class="dinoz-header">{{ $t('market.dinoz') }}</th>
				<th class="items-header">{{ $t('market.items') }}</th>
				<th>{{ $t('market.details') }}</th>
				<th class="bid-action-header"></th>
			</tr>
			<OfferLine v-for="offer in offers" :key="offer.id" :offer="offer" :now="now" :updateOffer="updateOffer" />
		</DZTable>
	</template>
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
import { goTo } from '../../utils/goTo.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import DZUser from '../common/DZUser.vue';
import OfferLine from './OfferLine.vue';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { ingredientNameList } from '@drpg/core/models/ingredient/IngredientNameList';
import { formatText } from '../../utils/formatText.js';

export default defineComponent({
	name: 'OfferList',
	data() {
		return {
			playerStore: playerStore(),
			secondsToDhms,
			goTo,
			now: Math.ceil(new Date().getTime() / 1000),
			ownOffer: null as EnhancedOffer | null,
			myExpiredOffers: null as EnhancedOffer | null,
			offers: [] as EnhancedOffer[],
			wonOffers: [] as EnhancedOffer[]
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
					name: item.isIngredient ? ingredientNameList[item.itemId] : itemNameList[item.itemId]
				}))
			}));
		},
		async fetchOffers() {
			const userId = this.playerStore.playerId;

			if (!userId) {
				this.$toast.open({ message: formatText(this.$t(`toast.missingUser`)), type: 'error' });
				goTo(this.$router, 'MainPage');
				return;
			}

			// Fetch data
			try {
				this.offers = this.formatOffers(await OfferService.getList('all', null, userId));
				[this.ownOffer] = this.formatOffers(await OfferService.getList('all', userId));
				this.wonOffers = this.formatOffers(await OfferService.getList('all', null, userId, true, 1, true));
				[this.myExpiredOffers] = this.formatOffers(await OfferService.getList('all', userId, null, true, 1, true));
			} catch (error) {
				errorHandler.handle(error, this.$toast);
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
				this.$toast.open({
					message: formatText(this.$t(`toast.market.offerCancelled`)),
					type: 'success'
				});
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				return;
			}
		},
		async reclaimOffer(offerId: number) {
			try {
				await OfferService.claimOffer(offerId);
				await this.fetchOffers();
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				return;
			}
			this.$toast.open({
				message: formatText(this.$t(`toast.market.offerClaimed`)),
				type: 'success'
			});
		},
		updateOffer(offer: EnhancedOffer) {
			this.offers = this.offers.map(o => (o.id === offer.id ? offer : o));
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
h4 {
	background-color: #bc683c;
	color: #ffee92;
	font-variant: small-caps;
	padding: 2px 4px;
	font-weight: normal;
}

table {
	width: 95%;
	table-layout: fixed;
	align-self: center;

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
