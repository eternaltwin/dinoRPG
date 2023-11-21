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
						:src="
							getImgURL(item.isIngredient ? 'ingredients' : 'item', item.isIngredient ? item.name : 'item_' + item.name)
						"
					>
						<p v-html="$t(`${item.isIngredient ? 'ingredients' : 'item'}.name.${item.name}`)" />
						<template #content>
							<h1 v-html="formatContent($t(`${item.isIngredient ? 'ingredients' : 'item'}.name.${item.name}`))" />
							<p v-html="formatContent($t(`${item.isIngredient ? 'ingredients' : 'item'}.description.${item.name}`))" />
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
						<span v-if="isExpired()">{{ $t('market.auctionExpired') }}</span>
						<span v-else>{{
							simplifyDisplay($t('market.time', secondsToDhms(Math.ceil(offer.endDate.getTime() / 1000) - now)))
						}}</span>
						<template #content>
							{{ offer.endDate.toLocaleString() }}
						</template>
					</Tippy>
				</span>
			</p>
			<p v-if="offer.bids.length">
				<span>{{ $t('market.highestBid') }}:</span>
				<span>
					<span class="bid-value">{{ offer.bids[offer.bids.length - 1].value }}</span>
					<img :src="getImgURL('icons', 'ticket', true)" />
					<span>{{ $t('market.by') }}</span>
					<DZUser class="user" :user="offer.bids[offer.bids.length - 1].user" />
				</span>
			</p>
			<p v-else>
				<span>{{ $t('market.minimumPrice') }}:</span>
				<span>
					<span class="bid-value">{{ Math.ceil(offer.total / 1000) }}</span>
					<img :src="getImgURL('icons', 'ticket', true)" />
				</span>
			</p>
		</td>
		<td class="bid-action">
			<div v-if="!isExpired() && !ownOffer()">
				<DZInput type="number" :value="bidValue" @input="bidValue = +$event.target.value" />
				<DZButton size="small" @click="bid">
					{{ $t('market.bid') }}
					<img :src="getImgURL('icons', 'ticket', true)" />
				</DZButton>
			</div>
		</td>
	</tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { Tippy } from 'vue-tippy';
import DZUser from '../common/DZUser.vue';
import { errorHandler, secondsToDhms, simplifyDisplay } from '../../utils/index.js';
import { EnhancedOffer } from '@drpg/core/returnTypes/Offer';
import { goTo } from '../../utils/goTo.js';
import { OfferService } from '../../services/OfferService.js';
import { playerStore } from '../../store/index.js';
import DZInput from '../common/DZInput.vue';
import { getIngredientName } from '@drpg/core/utils/IngredientUtils';

export default defineComponent({
	name: 'OfferLine',
	props: {
		offer: {
			type: Object as () => EnhancedOffer,
			required: true
		},
		updateOffer: {
			type: Function,
			required: false
		},
		now: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			playerStore: playerStore(),
			itemNameList,
			secondsToDhms,
			simplifyDisplay,
			goTo,
			getIngredientName,
			bidValue: 0
		};
	},
	components: { DZButton, Tippy, DZUser, DZInput },
	methods: {
		isExpired() {
			return this.offer.endDate.getTime() / 1000 <= this.now;
		},
		ownOffer() {
			return this.offer.seller.id === this.playerStore.playerId;
		},
		async bid() {
			if (!this.bidValue) {
				return;
			}

			try {
				if (!this.updateOffer) return;

				await OfferService.bidOffer(this.offer.id, this.bidValue);

				// Update offer
				this.updateOffer({
					...this.offer,
					bids: [
						...this.offer.bids,
						{
							value: this.bidValue,
							user: {
								id: this.playerStore.playerId,
								name: this.playerStore.playerName
							}
						}
					]
				});

				// Reset bid value
				this.bidValue = 0;
			} catch (error) {
				errorHandler.handle(error);
				return;
			}
		}
	}
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

		& > span:last-child {
			text-align: right;
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

.bid-action {
	text-align: center;

	input {
		display: inline-block;
		margin-bottom: 5px;
	}

	:deep(a span) {
		display: flex;
		align-items: center;

		img {
			margin-left: 3px;
		}
	}
}
</style>
