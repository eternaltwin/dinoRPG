<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<tr>
		<td
			v-if="offer.dinoz"
			theme="normal"
			:data-dinoz-level="offer.dinoz?.level || 0"
			:class="{
				dinoz: true,
				'has-dinoz': !!offer.dinoz
			}"
		>
			<DinozMini :display="offer.dinoz.display" class="mb-[-10px]" />
			<DZButton size="small" @click="details = !details">
				{{ $t('market.detail') }}
			</DZButton>
		</td>
		<td v-else />
		<td class="items-td">
			<div class="items">
				<div v-for="item in offer.items" :key="item.itemId">
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
					<img :src="getImgURL('item', 'item_empty')" alt="empty" />
					<span>&nbsp;</span>
				</div>
			</div>
		</td>
		<td class="bid">
			<p>
				<span>{{ $t('market.seller') }}:</span>
				<DZUser :user="offer.seller" />
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
					<DZUser :user="offer.bids[offer.bids.length - 1].user" />
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
		<td v-if="tab === 0" class="bid-action">
			<div v-if="!isExpired() && !ownOffer()">
				<DZInput type="number" :value="bidValue" @input="bidValue = +$event.target.value" />
				<DZButton size="small" @click="bid">
					{{ $t('market.bid') }}
					<img :src="getImgURL('icons', 'ticket', true)" />
				</DZButton>
			</div>
		</td>
	</tr>
	<tr v-if="details" class="dinoz-details">
		<td>
			<h2 v-html="offer.dinoz.name" />
			<p class="race">{{ $t(`race.name.${getRace(offer.dinoz).name}`) }}</p>
		</td>
		<td>
			<ul class="stats">
				<li v-for="element in Object.values<AssaultElement>(AssaultElement)" :key="element">
					<img :src="getImgURL('elements', `elem_${element}`)" :alt="element" />
					<span>{{ getElementStat(element) }}</span>
				</li>
			</ul>
		</td>
		<td>
			<ul class="skills">
				<li v-for="skill in offer.dinoz.skills" :key="skill.skillId">
					<img
						v-for="element in skillList[skill.skillId].element"
						:key="element"
						:src="getImgURL('elements', `elem_${ElementNames[element]}`)"
						:alt="ElementNames[element]"
					/>
					<span>{{ $t(`skill.name.${skillList[skill.skillId].name}`) }}</span>
				</li>
			</ul>
		</td>
		<td>
			<template v-for="status in offer.dinoz.status.map(s => s.statusId)" :key="status">
				<Tippy theme="normal" v-if="statusList.displayed[status]">
					<img :src="getImgURL('status', `fx_${statusList.imgName[status]}`)" :alt="statusList.imgName[status]" />
					<template #content>
						<h1 v-html="formatContent($t(`status.name.${status}`))"></h1>
						<p v-html="formatContent($t(`status.description.${status}`))"></p>
					</template>
				</Tippy>
			</template>
		</td>
	</tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import DZUser from '../common/DZUser.vue';
import { errorHandler, secondsToDhms, simplifyDisplay } from '../../utils/index.js';
import { EnhancedOffer } from '@drpg/core/returnTypes/Offer';
import { OfferService } from '../../services/OfferService.js';
import { playerStore } from '../../store/index.js';
import DZInput from '../common/DZInput.vue';
import { getRace } from '@drpg/core/utils/DinozUtils';
import { statusList } from '../../constants/index.js';
import { AssaultElement } from '@drpg/core/utils/getAssaultStat';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { ElementNames } from '@drpg/core/models/enums/ElementType';
import DinozMini from '../dinoz/DinozMini.vue';
import { ingredientNameList } from '@drpg/core/models/ingredient/IngredientNameList';

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
		},
		tab: {
			type: Number,
			default: 0,
			required: true
		}
	},
	data() {
		return {
			playerStore: playerStore(),
			itemNameList,
			secondsToDhms,
			simplifyDisplay,
			ingredientNameList,
			getRace,
			AssaultElement,
			statusList,
			skillList,
			ElementNames,
			bidValue: 0,
			details: false
		};
	},
	components: { DinozMini, DZButton, DZUser, DZInput },
	methods: {
		isExpired() {
			return this.offer.endDate.getTime() / 1000 <= this.now;
		},
		ownOffer() {
			return this.offer.seller.id === this.playerStore.playerId;
		},
		getElementStat(element: AssaultElement) {
			if (!this.offer.dinoz) return;
			switch (element) {
				case AssaultElement.FIRE:
					return this.offer.dinoz.nbrUpFire;
				case AssaultElement.WATER:
					return this.offer.dinoz.nbrUpWater;
				case AssaultElement.WOOD:
					return this.offer.dinoz.nbrUpWood;
				case AssaultElement.AIR:
					return this.offer.dinoz.nbrUpAir;
				case AssaultElement.LIGHTNING:
					return this.offer.dinoz.nbrUpLightning;
				default:
					return 0;
			}
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

				// Increment bidValue
				this.bidValue++;
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				return;
			}
		}
	},
	mounted() {
		this.bidValue = Math.max(
			Math.ceil(this.offer.total / 1000),
			this.offer.bids.length > 0 ? this.offer.bids[this.offer.bids.length - 1].value : 0
		);
	}
});
</script>

<style lang="scss" scoped>
.details {
	display: none;
}
.dinoz {
	position: relative;
	&.has-dinoz {
		&:before {
			content: attr(data-dinoz-level);
			display: block;
			position: absolute;
			top: 0px;
			left: -2px;
			border: 1px solid #ffee92;
			background-color: #c2381a;
			color: #ffee92;
			padding: 2px 4px;
		}
	}
}
.dinoz-details {
	.race {
		font-variant: small-caps;
	}
	.status {
		list-style-type: none;
		margin-left: 12px;
		li {
			display: inline-block;
			&:not(:last-child) {
				margin-right: 1px;
			}
		}
	}
	.stats {
		list-style-type: none;
		margin-left: 4px;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		li {
			position: relative;
			display: inline-flex;
			align-items: center;
			justify-content: space-around;
			min-width: 42px;
			font-size: 10pt;
			font-weight: bold;
			color: white;
			letter-spacing: -0.2pt;
			z-index: 2;
			padding-right: 4px;
			&:not(:last-child) {
				margin-right: 2px;
			}
			&::before {
				content: '';
				position: absolute;
				width: 80%;
				height: 13px;
				background-color: #90452c;
				left: 20%;
				top: 5px;
				border-radius: 10px;
				z-index: -1;
			}
			& > img {
				width: 22px;
			}
			span {
				margin-left: 2px;
			}
		}
	}
	.skills {
		list-style-type: none;
		margin-left: 12px;
		height: 150px;
		overflow: scroll;
		li {
			font-size: 9pt;
			img {
				margin-right: 2px;
			}
			span {
				color: #710;
			}
		}
	}
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
