<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<DZDisclaimer help content="market.sellView.disclaimer" />
	<h4>{{ $t('market.sellView.prepareYourOffer') }}</h4>
	<table>
		<tbody>
			<tr>
				<td>{{ $t('market.dinoz') }}</td>
				<td>
					<div class="flex items-center">
						<input type="checkbox" :checked="sellDinoz" id="sell-dinoz" @change="toggleSellDinoz" />
						<label v-if="dinoz" for="sell-dinoz">
							{{ $t('market.sellView.sellYourDinoz') }}
							{{ dinoz.name }}
						</label>
						<DZHelp title="TODO" content="TODO" />
					</div>
				</td>
			</tr>
			<tr>
				<td>{{ $t('market.sellView.itemsAndIngredients') }}</td>
				<td>
					<div class="flex flex-wrap">
						<div v-for="ingredient in ingredients" :key="ingredient.name" class="item">
							<Tippy
								tag="img"
								theme="normal"
								:src="getImgURL('ingredients', ingredient.name)"
								:alt="$t(`ingredients.name.${ingredient.name}`)"
							>
								<p v-html="$t(`ingredients.name.${ingredient.name}`)" />
								<template #content>
									<h1 v-html="formatContent($t(`ingredients.name.${ingredient.name}`))" />
									<p v-html="formatContent($t(`ingredients.description.${ingredient.name}`))" />
								</template>
							</Tippy>
							<div class="count">{{ selectedItems[ingredient.name]?.count || '' }}</div>
							<div class="change-count">
								<Tippy
									tag="img"
									theme="small"
									:src="getImgURL('icons', 'up', true)"
									@click="changeItemCount('ingredient', ingredient, 1)"
								>
									<template #content>
										{{ $t('market.sellView.add') }}
									</template>
								</Tippy>
								<Tippy
									tag="img"
									theme="small"
									:src="getImgURL('icons', 'down', true)"
									@click="changeItemCount('ingredient', ingredient, -1)"
								>
									<template #content>
										{{ $t('market.sellView.remove') }}
									</template>
								</Tippy>
							</div>
						</div>
						<div v-for="item in items" :key="item.name" class="item">
							<Tippy
								tag="img"
								theme="normal"
								:src="getImgURL('item', `item_${item.name}`)"
								:alt="$t(`item.name.${item.name}`)"
							>
								<p v-html="$t(`item.name.${item.name}`)" />
								<template #content>
									<h1 v-html="formatContent($t(`item.name.${item.name}`))" />
									<p v-html="formatContent($t(`item.description.${item.name}`))" />
								</template>
							</Tippy>
							<div class="count">{{ selectedItems[item.name]?.count || '' }}</div>
							<div class="change-count">
								<Tippy
									tag="img"
									theme="small"
									:src="getImgURL('icons', 'up', true)"
									@click="changeItemCount('item', item, 1)"
								>
									<template #content>
										{{ $t('market.sellView.add') }}
									</template>
								</Tippy>
								<Tippy
									tag="img"
									theme="small"
									:src="getImgURL('icons', 'down', true)"
									@click="changeItemCount('item', item, -1)"
								>
									<template #content>
										{{ $t('market.sellView.remove') }}
									</template>
								</Tippy>
							</div>
						</div>
					</div>
				</td>
			</tr>
			<tr>
				<td>{{ $t('market.sellView.offerMinimalValue') }}</td>
				<td>
					<DZDisclaimer
						help
						content="market.sellView.minimalValueDisclaimer"
						:params="{ minValue: MARKET_MIN_VALUE }"
					/>
					<div class="total">
						<DZInput type="number" :value="totalValue" @input="totalValue = +$event.target.value" />
					</div>
				</td>
			</tr>
			<tr>
				<td class="empty" />
				<td>
					<DZButton @click="createOffer">{{ $t('market.sellView.create') }}</DZButton>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import { IngredientFiche } from '@drpg/core/models/ingredient/IngredientFiche';
import { ItemFiche } from '@drpg/core/models/item/ItemFiche';
import { IngredientsService } from '../../services/IngredientsService.js';
import { InventoryService } from '../../services/InventoryService.js';
import { errorHandler } from '../../utils/index.js';
import { dinozStore, playerStore } from '../../store/index.js';
import { goTo } from '../../utils/goTo.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { Tippy } from 'vue-tippy';
import DZHelp from '../common/DZHelp.vue';
import { MARKET_MIN_VALUE, MARKET_MAX_ITEMS } from '@drpg/core/constants';
import { OfferService } from '../../services/OfferService.js';
import DZInput from '../common/DZInput.vue';
import { formatText } from '../../utils/formatText.js';
import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { itemList } from '@drpg/core/models/item/ItemList';

export default defineComponent({
	name: 'OfferList',
	props: {
		changeTab: { type: Function, required: true }
	},
	data() {
		return {
			playerStore: playerStore(),
			dinozStore: dinozStore(),
			MARKET_MIN_VALUE,
			dinoz: null as DinozFiche | null,
			ingredients: [] as IngredientFiche[],
			items: [] as ItemFiche[],
			sellDinoz: false,
			selectedItems: {} as Record<string, { type: 'ingredient' | 'item'; count: number }>,
			totalValue: 0
		};
	},
	components: { DZButton, DZDisclaimer, Tippy, DZHelp, DZInput },
	methods: {
		toggleSellDinoz() {
			this.sellDinoz = !this.sellDinoz;

			// Update total value
			this.totalValue = this.getTotalValue();
		},
		changeItemCount(type: 'ingredient' | 'item', item: ItemFiche | IngredientFiche, value: number) {
			const name = item.name || '';
			if (!this.selectedItems[name]) {
				this.selectedItems[name] = { type, count: 0 };
			}
			const currentCount = this.selectedItems[name].count;
			const newCount = currentCount + value;

			// Prevent negative values
			if (newCount < 0) {
				return;
			}

			// Prevent too many items
			if (item.quantity && newCount > item.quantity) {
				this.$toast.open({
					message: formatText(this.$t(`toast.market.notEnoughItems`)),
					type: 'error'
				});
				return;
			}

			// Limit to 5 different items
			const positiveItems = Object.entries(this.selectedItems).filter(([, count]) => count.count > 0);
			if (positiveItems.length >= 5) {
				if (value === 1 && positiveItems.every(([n]) => n !== name)) {
					this.$toast.open({
						message: formatText(this.$t(`toast.market.tooManyItems`, { items: MARKET_MAX_ITEMS })),
						type: 'error'
					});
					return;
				}
			}

			console.log(this.selectedItems);
			this.selectedItems[name].count = newCount;

			// Update total value
			this.totalValue = this.getTotalValue();
		},
		getTotalValue(): number {
			// Dinoz
			let dinoz = 0;
			if (this.sellDinoz && this.dinoz) {
				dinoz = Math.ceil(this.dinoz.race.price * this.dinoz.level ** 0.5);
			}

			// Items
			const items = Object.entries(this.selectedItems).reduce((total, [name, count]) => {
				if (count.type === 'ingredient') {
					const ingredient = this.ingredients.find(ingredient => ingredient.name === name);
					if (!ingredient) {
						return total;
					}
					return total + ingredient.price * count.count;
				} else {
					const item = this.items.find(item => item.name === name);
					if (!item) {
						return total;
					}
					return total + item.price * count.count;
				}
			}, 0);

			return dinoz + items;
		},
		async createOffer() {
			const calculatedValue = this.getTotalValue();
			const manualValue = this.totalValue;

			if (manualValue < calculatedValue) {
				this.$toast.open({
					message: formatText(this.$t(`toast.market.minimalValueError`)),
					type: 'error'
				});
				return;
			}

			if (calculatedValue < MARKET_MIN_VALUE) {
				this.$toast.open({
					message: formatText(this.$t(`toast.market.minimalValueError`)),
					type: 'error'
				});
				return;
			}

			const ingredients = Object.entries(this.selectedItems)
				.filter(([, count]) => count.type === 'ingredient' && count.count > 0)
				.map(([name, count]) => ({ name, count: count.count }));

			const items = Object.entries(this.selectedItems)
				.filter(([, count]) => count.type === 'item' && count.count > 0)
				.map(([name, count]) => ({ name, count: count.count }));

			try {
				await OfferService.createOffer(manualValue, ingredients, items, this.sellDinoz ? this.dinoz?.id : undefined);
				this.$toast.open({
					message: formatText(this.$t(`toast.market.offerCreated`)),
					type: 'success'
				});
				this.changeTab(0);
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				return;
			}
		}
	},
	async mounted(): Promise<void> {
		try {
			const currentDinozId = this.playerStore.playerOptions.currentDinozId;

			// Check if we have a dinoz selected
			if (!currentDinozId) {
				this.$toast.open({ message: formatText(this.$t(`toast.selectADinozAtMarketFirst`)), type: 'error' });
				goTo(this.$router, 'MainPage');
				return;
			}

			// Check if the dinoz exists
			const currentDinoz = this.dinozStore.getDinoz(currentDinozId);
			if (!currentDinoz) {
				this.$toast.open({ message: formatText(this.$t(`toast.unknownDinoz`)), type: 'error' });
				goTo(this.$router, 'MainPage');
				return;
			}

			this.dinoz = currentDinoz;

			// Fetch ingredients
			const ingredients = await IngredientsService.getAllIngredients();
			this.ingredients = ingredients.map(i => {
				return {
					...ingredientList[i.name.toUpperCase()],
					quantity: i.quantity
				};
			});

			// Fetch items
			const items = await InventoryService.getAllItemsData();

			// Limit to items that can be sold
			this.items = items
				.map(i => {
					return {
						...itemList[i.id],
						quantity: i.quantity
					};
				})
				.filter(item => item.price && item.sellable);
		} catch (error) {
			errorHandler.handle(error, this.$toast);
			return;
		}
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

			&.empty {
				background-color: transparent;
			}
		}

		input[type='checkbox'] {
			margin-right: 5px;
		}

		label {
			cursor: pointer;
			user-select: none;
		}

		.item {
			display: flex;
			margin-right: 10px;

			& > img {
				background-color: #bc683c;
				padding: 1px;
			}

			.count {
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: #bc683c;
				padding: 1px;
				color: #ffee92;
				box-sizing: border-box;
				height: 34px;
				width: 34px;
				outline: 1px solid #ebd18b;
				outline-offset: -2px;
				margin-left: -1px;
				user-select: none;
			}

			.change-count {
				display: flex;
				flex-direction: column;
				justify-content: center;

				img {
					cursor: pointer;
					user-select: none;

					&:hover {
						outline: 1px solid white;
						outline-offset: -1px;
					}
				}
			}
		}
	}
}
</style>
