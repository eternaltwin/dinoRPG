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

		<tr v-for="offer in offers" :key="offer.id">
			<td class="dinoz">
				<div v-if="offer.dinoz">🦖</div>
			</td>
			<td>
				<div class="items">
					<div v-for="item in offer.items" :key="item.id">
						<Tippy
							tag="img"
							theme="normal"
							:src="getImgURL('item', 'item_' + itemNameList[item.id])"
							:alt="$t(`item.name.${itemNameList[item.id]}`)"
						>
							<p v-html="$t(`item.name.${itemNameList[item.id]}`)" />
							<template #content>
								<h1 v-html="formatContent($t(`item.name.${itemNameList[item.id]}`))" />
								<p v-html="formatContent($t(`item.description.${itemNameList[item.id]}`))" />
							</template>
						</Tippy>
						<span v-if="item.quantity > 1">x {{ item.quantity }}</span>
						<span v-else>&nbsp;</span>
					</div>
					<!-- Fill with empty items if less than 5 -->
					<div v-for="i in 5 - offer.items.length" :key="i">
						<img :src="getImgURL('item', 'item_empty')" :alt="$t('market.empty')" />
						<span>&nbsp;</span>
					</div>
				</div>
			</td>
			<td class="bid">
				<p>
					<span>{{ $t('market.seller') }}:</span>
					<DZUser class="user" :user="offer.seller" />
				</p>
				<p>
					<span>{{ $t('market.timeLeft') }}:</span>
					<span class="time">
						<img :src="getImgURL('design', 'small_chrono')" :alt="$t('market.timeLeft')" />
						<Tippy theme="small">
							{{ $t('market.time', secondsToDhms(Math.ceil(offer.endDate.getTime() / 1000) - now)) }}
							<template #content>
								{{ offer.endDate.toLocaleString() }}
							</template>
						</Tippy>
					</span>
				</p>
				<p v-if="offer.bid">
					<span>{{ $t('market.highestBid') }}:</span>
					<span>
						<span class="bid-value">{{ offer.bid.value }}</span>
						<img :src="getImgURL('icons', 'gold', 'true')" />
						<span>{{ $t('market.by') }}</span>
						<DZUser class="user" :user="offer.bid.user" />
					</span>
				</p>
			</td>
			<td class="see-more">
				<DZButton size="small">{{ $t('market.details') }}</DZButton>
			</td>
		</tr>
	</DZTable>
	<DZDisclaimer help content="market.currency" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import DZTable from '../common/DZTable.vue';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { Tippy } from 'vue-tippy';
import DZUser from '../common/DZUser.vue';
import { errorHandler, secondsToDhms } from '../../utils/index.js';
import { OfferService } from '../../services/OfferService.js';
import { Offer } from '@drpg/core/returnTypes/Offer';
import { goTo } from '../../utils/goTo.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';

export default defineComponent({
	name: 'OfferList',
	props: {
		changeTab: { type: Function, required: true }
	},
	data() {
		return {
			itemNameList,
			secondsToDhms,
			goTo,
			now: Math.ceil(new Date().getTime() / 1000),
			offers: [] as (Omit<Offer, 'endDate'> & { endDate: Date })[],
			filter: 'all'
		};
	},
	components: { DZButton, DZTable, Tippy, DZUser, DZDisclaimer },
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

.items {
	display: flex;
	align-items: center;

	& > div {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #bc683c;
		margin: 1px;
		padding: 1px;

		img {
			border: 1px solid #6e3d23;
		}

		span {
			color: #ffee92;
			font-size: 7pt;
		}
	}
}

.bid {
	color: #52646b;

	p {
		display: flex;
		align-items: center;
		justify-content: space-between;

		&:first-letter {
			font-size: inherit;
		}

		.user {
			margin-left: 5px;
		}

		.bid-value {
			font-weight: bold;

			& + img {
				margin-left: 3px;
				margin-right: 3px;
			}
		}
	}

	.time {
		display: flex;
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
</style>
