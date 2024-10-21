<template>
	<TitleHeader :title="$t('pageTitle.ingredients')" />
	<div class="section ml-[-25px] mt-[-20px] sm:ml-0 sm:mt-0">
		<div class="titlePage">{{ $t(`rightMenu.ingredients`) }}</div>
	</div>
	<DZDisclaimer help :content="$t('ingredients.disclaimer')" class="ml-[-50px] sm:ml-[-20px] sm:mr-[20px] md:mx-0" />
	<table class="ml-[-50px] sm:ml-[-20px] sm:mr-[20px] md:mx-0">
		<tbody>
			<tr>
				<th class="w-[32px]"></th>
				<th class="px-1 pb-2">{{ $t('ingredients.tname') }}</th>
				<th class="px-1 pb-2">{{ $t('ingredients.tstock') }}</th>
				<th v-if="isClan" class="px-1 pb-2"></th>
			</tr>

			<Tippy
				theme="normal"
				tag="tr"
				v-for="(ingredient, index) in ingredientList"
				:key="ingredient.name"
				:class="{
					full: ingredient.quantity >= ingredient.maxQuantity,
					even: (index + 1) % 2 == 0
				}"
			>
				<td class="w-[32px]">
					<img :src="getImgURL('ingredients', ingredient.name)" :alt="ingredient.name" />
				</td>
				<td class="px-5 py-0.5">{{ $t(`ingredients.name.${ingredient.name}`) }}</td>
				<td class="w-[60px] px-2.5 py-0.5" v-if="ingredient.quantity !== 0">
					{{ ingredient.quantity }}/{{ ingredient.maxQuantity }}
				</td>
				<td v-if="isClan" class="w-[60px] px-2.5 py-0.5">
					<DZInput
						type="number"
						:value="giveAway[index].quantity"
						@input="giveAway[index].quantity = +$event.target.value"
						:max="ingredient.quantity"
						min="0"
					/>
				</td>
				<td class="w-[60px] px-2.5 py-0.5" v-else>--</td>

				<template #content>
					<h1 v-html="formatContent($t(`ingredients.name.${ingredient.name}`))" />
					<p v-html="formatContent($t(`ingredients.description.${ingredient.name}`))" />
				</template>
			</Tippy>
		</tbody>
	</table>
	<DZButton v-if="isClan" @click="giveToClan()">{{ $t(`clan.ingredients.giveAway`) }}</DZButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IngredientFiche } from '@drpg/core/models/ingredient/IngredientFiche';
import { ClanService, IngredientsService } from '../services/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import EventBus from '../events/index.js';
import { errorHandler } from '../utils/index.js';
import { playerStore } from '../store/index.js';
import DZInput from '../components/common/DZInput.vue';
import DZButton from '../components/common/DZButton.vue';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';

export default defineComponent({
	name: 'Ingredients',
	components: {
		DZButton,
		DZInput,
		TitleHeader,
		DZDisclaimer
	},
	data() {
		return {
			ingredientList: [] as Array<IngredientFiche>,
			playerStore: playerStore(),
			bidValue: 0,
			giveAway: [] as Array<IngredientFiche>
		};
	},
	async mounted(): Promise<void> {
		await this.load();
	},
	methods: {
		async load() {
			EventBus.emit('isLoading', true);
			try {
				const unsortedIngredients = await IngredientsService.getAllIngredients();
				this.ingredientList = this.sortIngredientsById(unsortedIngredients);
				this.giveAway = this.ingredientList.map(ingredient => {
					return { ...ingredient, quantity: 0 };
				});
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		sortIngredientsById(ingredients: Array<IngredientFiche>): Array<IngredientFiche> {
			return ingredients.sort((a, b) => a.ingredientId - b.ingredientId);
		},
		async giveToClan() {
			const gold = this.giveAway
				.filter(a => (a.quantity ?? 0) > 0)
				.reduce(
					(acc, cur) =>
						acc +
						(Object.values(ingredientList).find(a => a.ingredientId === cur.ingredientId)?.price ?? 0) *
							(cur.quantity ?? 0),
					0
				);
			const res = confirm(this.$t(`ingredients.giveAway.confirm`, { gold: gold }));
			if (res) {
				try {
					await ClanService.giveIngredient(
						this.playerStore.getClanId!,
						this.giveAway
							.filter(a => a.quantity && a.quantity > 0)
							.map(i => {
								return { itemId: i.ingredientId, quantity: i.quantity! };
							})
					);
				} catch (err) {
					errorHandler.handle(err, this.$toast, this.$t);
					return;
				}
				await this.load();
			}
		}
	},
	computed: {
		isClan(): boolean {
			if (this.playerStore.getClanId) {
				return true;
			} else {
				return false;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
table {
	min-width: 100%;
	margin-top: 10px;
	margin-bottom: 5px;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;
	tr {
		display: table-row;
		cursor: help;
		width: 100%;
		th {
			font-size: 8pt;
			text-shadow: 1px 1px 0px #356847;
			height: 41px;
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
		}
		td {
			font-size: 16px;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			background-image: url('../assets/background/table_cell.webp');
			background-position: -10px 0px;
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
</style>
