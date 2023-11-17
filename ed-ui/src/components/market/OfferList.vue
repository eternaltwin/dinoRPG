<template>
	<div class="disclaimer" v-html="formatContent($t('market.disclaimer'))" />
	<div class="df jcsb">
		<DZButton>{{ $t('market.makeAnOffer') }}</DZButton>
		<select :placeholder="$t('market.filter')">
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
						<img :src="getImgURL('icons', 'small_gold')" />
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
	<div class="disclaimer" v-html="formatContent($t('market.currency'))" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import DZTable from '../common/DZTable.vue';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { Tippy } from 'vue-tippy';
import DZUser from '../common/DZUser.vue';
import { secondsToDhms } from '../../utils/index.js';

export default defineComponent({
	name: 'OfferList',
	data() {
		return {
			itemNameList,
			secondsToDhms,
			now: Math.ceil(new Date().getTime() / 1000),
			offers: [
				{
					id: 'test',
					seller: {
						id: 1,
						name: 'test'
					},
					endDate: new Date('2023-12-12'),
					dinoz: null,
					items: [
						{ id: 59, quantity: 5 },
						{ id: 24, quantity: 2 },
						{ id: 13, quantity: 1 }
					],
					bid: {
						user: {
							id: 2,
							name: 'test2'
						},
						value: 100
					}
				},
				{
					id: 'test',
					seller: {
						id: 1,
						name: 'test'
					},
					endDate: new Date('2023-12-24'),
					dinoz: {
						name: 'test'
					},
					items: [
						{ id: 22, quantity: 4 },
						{ id: 17, quantity: 4 },
						{ id: 13, quantity: 3 },
						{ id: 78, quantity: 1 },
						{ id: 60, quantity: 1 }
					],
					bid: null
				}
			]
		};
	},
	components: { DZButton, DZTable, Tippy, DZUser },
	mounted(): void {
		setInterval(() => {
			this.now = Math.ceil(new Date().getTime() / 1000);
		}, 1000);
	}
});
</script>

<style lang="scss" scoped>
.disclaimer {
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px 5px 5px 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;
}

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
