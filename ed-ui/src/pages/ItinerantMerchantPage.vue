<template>
	<div class="shop">
		<TitleHeader :title="$t('pageTitle.itinerant')" />
		<div class="section">
			<div
				class="titlePage"
				style="undefined"
				width="520"
				height="27"
				v-html="formatContent($t(`shop.ingredient.${itinerantShopNameList[itinerantId]}.name`))"
			/>
		</div>
		<div class="shopDesc">
			<div class="contain">
				<div class="art art_shop">
					<img
						:src="getImgURL('shop', 'shop_itinerant')"
						:alt="formatContent($t(`shop.ingredient.${itinerantShopNameList[itinerantId]}.name`))"
					/>
				</div>
				<p v-html="formatContent($t(`shop.ingredient.${itinerantShopNameList[itinerantId]}.description`))" />
			</div>
		</div>
		<div class="list">
			<div v-if="currentDay === 0" class="sundayMessage">
				<p v-html="formatContent($t(`shop.ingredient.${itinerantShopNameList[itinerantId]}.dimanche`))" />
			</div>
			<table v-if="currentDay !== 0">
				<tbody>
					<tr>
						<th class="icon"></th>
						<th class="name">{{ $t('ingredients.tname') }}</th>
						<th class="stock">{{ $t('ingredients.tstock') }}</th>
						<th class="quantity">{{ $t('ingredients.tquantity') }}</th>
					</tr>
					<Tippy
						theme="normal"
						v-for="(ingredient, index) in ingredientList"
						:id="ingredientNameList[ingredient.ingredientId]"
						:key="ingredient.ingredientId"
						:class="{
							full: ingredient.quantity >= ingredient.maxQuantity,
							even: (index + 1) % 2 == 0
						}"
						tag="tr"
					>
						<td class="icon">
							<img
								:src="getImgURL('ingredients', `${ingredientNameList[ingredient.ingredientId]}`)"
								:alt="ingredientNameList[ingredient.ingredientId]"
							/>
						</td>
						<td
							class="name"
							v-html="formatContent($t(`ingredients.name.${ingredientNameList[ingredient.ingredientId]}`))"
						/>
						<td class="stock" v-if="ingredient.quantity !== 0">
							{{ ingredient.quantity }}/{{ ingredient.maxQuantity }}
						</td>
						<td class="stock" v-else>--</td>
						<td class="quantity">
							<input
								class="input"
								type="number"
								v-model="inputValues[ingredient.ingredientId]"
								@input="checkInputValidity()"
							/>
						</td>

						<template #content>
							<h1 v-html="formatContent($t(`ingredients.name.${ingredientNameList[ingredient.ingredientId]}`))" />
							<p v-html="formatContent($t(`ingredients.description.${ingredientNameList[ingredient.ingredientId]}`))" />
							<p>
								{{ ingredient.price }}
								<img :src="getImgURL('icons', 'small_gold')" alt="gold" />
							</p>
						</template>
					</Tippy>
				</tbody>
			</table>
		</div>
		<div v-if="currentDay !== 0" class="sell">
			<Tippy theme="small" tag="a" class="button disabled" v-if="!isInputFilled">
				<template #content>
					<div v-html="formatContent($t('tooltip.shop.invalidQuantity'))" />
				</template>
				{{ $t(`shop.item.sell`) }}
			</Tippy>
			<a
				class="button"
				v-html="formatContent($t('shop.item.sell'))"
				@click="sellIngredientPopinConfirmChoice(ingredient?.ingredientId, inputValues[ingredient?.ingredientId])"
				v-else
			/>
		</div>
	</div>
</template>

<script lang="ts" scoped>
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { itinerantShopNameList } from '../constants/index.js';
import { ingredientNameList } from '@drpg/core/models/ingredient/IngredientNameList';
import { playerStore } from '../store/index.js';
import EventBus from '../events/index.js';
import { errorHandler } from '../utils/index.js';
import { IngredientFiche } from '@drpg/core/models/ingredient/IngredientFiche';
import { IngredientShopService } from '../services/IngredientsService';
import dayjs from 'dayjs';

export default defineComponent({
	name: 'ItinerantMerchantPage',
	components: {
		TitleHeader
	},
	data() {
		return {
			playerStore: playerStore(),
			itinerantShopNameList: itinerantShopNameList,
			ingredientNameList: ingredientNameList,
			ingredientList: [] as Array<IngredientFiche>,
			currentDay: dayjs().day(),
			inputValues: {}
		};
	},
	computed: {
		itinerantId(): number {
			const itinerantName = this.itinerantShopNameList[this.currentDay];
			const itinerantIndex = itinerantShopNameList.indexOf(itinerantName);
			return itinerantIndex;
		},
		isInputFilled(): boolean {
			for (const key in this.inputValues) {
				if (Object.prototype.hasOwnProperty.call(this.inputValues, key) && this.inputValues[key] !== 0) {
					return true;
				}
			}
			return false;
		}
	},
	methods: {
		checkInputValidity(): boolean {
			for (const key in this.inputValues) {
				if (Object.prototype.hasOwnProperty.call(this.inputValues, key)) {
					const quantity = parseInt(this.inputValues[key]);
					if (isNaN(quantity) || quantity <= 0) {
						return false;
					}
					const ingredient = this.ingredientList.find(ingredient => ingredient.ingredientId === parseInt(key));
					if (!ingredient || quantity > ingredient.quantity) {
						return false;
					}
				}
			}
			return true;
		},
		async sellIngredient(ingredientId: number, quantity: number): Promise<void> {
			try {
				await IngredientShopService.sellIngredient(this.itinerantId, ingredientId, quantity);
				EventBus.emit('isLoading', false);
				const updatedIngredient = this.ingredientList.find(ingredient => ingredient.ingredientId === ingredientId);
				if (updatedIngredient) {
					updatedIngredient.quantity -= quantity;
				}
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
			const ingredient = this.ingredientList.find(ingredient => ingredient.ingredientId === ingredientId);
			if (ingredient) {
				const newMoney = this.playerStore.getMoney! + ingredient.price! * quantity;
				this.playerStore.setMoney(newMoney);
			}
		},
		async sellIngredientPopinConfirmChoice(): Promise<void> {
			const res: boolean = confirm(this.$t('popup.confirm'));
			if (res) {
				try {
					EventBus.emit('isLoading', true);
					let ingredientId: number | undefined;
					let quantity: number | undefined;
					for (const key in this.inputValues) {
						if (Object.prototype.hasOwnProperty.call(this.inputValues, key) && this.inputValues[key] !== 0) {
							ingredientId = parseInt(key);
							quantity = parseInt(this.inputValues[key]);
							break;
						}
					}
					if (ingredientId !== undefined && quantity !== undefined) {
						await this.sellIngredient(ingredientId, quantity);
					}
				} catch (err) {
					errorHandler.handle(err);
					return;
				}
			}
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		try {
			this.ingredientList = await IngredientShopService.getIngredientsFromIngredientsShop(this.itinerantId);
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}
	},
	watch: {
		'$route.params.name': async function () {
			if (this.itinerantId < 0) {
				return;
			}
			EventBus.emit('isLoading', true);
			try {
				this.ingredientList = await IngredientShopService.getIngredientsFromIngredientsShop(this.itinerantId);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.shop {
	.section {
		height: 45px;
		margin-left: -15px;
		margin-bottom: 20px;
		background-image: url('../assets/design/title_h1.webp');
		background-position: left bottom;
		background-repeat: no-repeat;
	}
	.shopDesc {
		margin: auto;
		margin-bottom: 8px;
		width: 520px;
		height: 200px;
		padding: 5px;
		font-style: italic;
		color: #ffee92;
		font-size: 10pt;
		background-image: url('../assets/background/desc_shop.webp');
		background-repeat: no-repeat;
		.contain {
			margin-top: 10px;
			padding: 15px;
		}
		.art {
			width: 160px;
			height: 120px;
			margin-right: 10px;
			margin-bottom: 10px;
			border: none;
			outline: none;
			float: left;
			position: relative;
			font-size: 0pt;
			line-height: 0pt;
			background-position: top left;
			background-repeat: no-repeat;
		}
		p {
			margin: 0px;
		}
	}
	.list {
		.sundayMessage {
			margin: 20px auto;
			width: 80%;
			padding: 10px;
			border: 4px solid #9a4029;
			border-radius: 5px;
			text-align: center;
			color: #9a4029;
		}
		table {
			width: 100%;
			margin-top: 40px;
			margin-bottom: 15px;
			background-color: #ecbd84;
			border-collapse: separate;
			border-spacing: 1px;
			tr {
				display: table-row;
				cursor: help;
				th {
					font-size: 8pt;
					text-shadow: 1px 1px 0px #356847;
					height: 42px;
					vertical-align: bottom;
					color: #fffdba;
					text-transform: uppercase;
					font-weight: bold;
					letter-spacing: 1pt;
					text-align: left;
					white-space: nowrap;
					border: 1px solid #356847;
					background-color: #c64e36;
					background-image: url('../assets/background/table_header.webp');
					background-position: left bottom;
					&.icon {
						width: 32px;
					}
					&.name {
						padding-left: 4px;
						padding-right: 4px;
						padding-bottom: 8px;
						max-width: 120px;
					}
					&.stock {
						padding-left: 4px;
						padding-right: 4px;
						padding-bottom: 8px;
						max-width: 15px;
					}
					&.quantity {
						padding-left: 4px;
						padding-bottom: 8px;
						padding-right: 4px;
						max-width: 50px;
					}
				}
				td {
					font-size: 16px;
					font-family: 'Trebuchet MS', Arial, sans-serif;
					color: #710;
					background-color: #f3ca92;
					border: 1px solid #c88f44;
					background-image: url('../assets/background/table_cell.webp');
					background-position: -10px 0px;
					&.name {
						padding: 1px 5px;
						width: 330px;
					}
					&.stock {
						padding: 1px 5px;
						width: 52px;
					}
					&.quantity {
						padding: 1px 12px;
						width: 40px;
						.input {
							width: 40px;
						}
					}
				}
				&.full td {
					background-image: url('../assets/background/table_cell_hover.webp') !important;
					background-position: -10px 0px;
					color: #fffdba;
				}
				&.even td {
					background-image: url('../assets/background/table_cell_even.webp');
					background-position: -10px 0px;
				}
			}
		}
	}
	.sell {
		display: flex;
		justify-content: center;
		margin-top: 20px;
		.disabled {
			opacity: 0.3;
		}
	}
}
</style>
