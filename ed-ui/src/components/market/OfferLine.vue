<template>
	<tr>
		<td class="dinoz">
			<div v-if="offer.dinoz">🦖</div>
		</td>
		<td class="items-td">
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
			<p v-if="offer.bids.length">
				<span>{{ $t('market.highestBid') }}:</span>
				<span>
					<span class="bid-value">{{ offer.bids[0].value }}</span>
					<img :src="getImgURL('icons', 'gold', 'true')" />
					<span>{{ $t('market.by') }}</span>
					<DZUser class="user" :user="offer.bids[0].user" />
				</span>
			</p>
		</td>
		<td class="details">
			<DZButton size="small">{{ $t('market.details') }}</DZButton>
		</td>
	</tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { Tippy } from 'vue-tippy';
import DZUser from '../common/DZUser.vue';
import { secondsToDhms } from '../../utils/index.js';
import { Offer } from '@drpg/core/returnTypes/Offer';
import { goTo } from '../../utils/goTo.js';

export default defineComponent({
	name: 'OfferLine',
	props: {
		offer: {
			type: Object as () => Omit<Offer, 'endDate'> & { endDate: Date },
			required: true
		},
		now: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			itemNameList,
			secondsToDhms,
			goTo,
			offers: [] as (Omit<Offer, 'endDate'> & { endDate: Date })[],
			filter: 'all'
		};
	},
	components: { DZButton, Tippy, DZUser },
	methods: {}
});
</script>

<style lang="scss" scoped>
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
