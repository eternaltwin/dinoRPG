<template>
	<TitleHeader :title="$t('pageTitle.ingredients')" />
	<div class="section">
		<div class="titlePage">{{ $t(`rightMenu.ingredients`) }}</div>
	</div>
	<div class="disclaimer">
		{{ $t('ingredients.disclaimer') }}
	</div>
	<table>
		<tbody>
			<tr>
				<th class="icon"></th>
				<th class="name">Ingrédient</th>
				<th class="stock">Stock</th>
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
				<td class="icon">
					<img :src="getImgURL('ingredients', ingredient.name)" :alt="ingredient.name" />
				</td>
				<td class="name">{{ $t(`ingredients.name.${ingredient.name}`) }}</td>
				<td class="stock" v-if="ingredient.quantity !== 0">{{ ingredient.quantity }}/{{ ingredient.maxQuantity }}</td>
				<td class="stock" v-else>--</td>

				<template #content>
					<h1 v-html="formatContent($t(`ingredients.name.${ingredient.name}`))" />
					<p v-html="formatContent($t(`ingredients.description.${ingredient.name}`))" />
				</template>
			</Tippy>
		</tbody>
	</table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IngredientFiche } from '@/models';
import { IngredientsService } from '@/services';
import TitleHeader from '@/components/utils/TitleHeader.vue';
import EventBus from '@/events';
import { errorHandler } from '@/utils';

export default defineComponent({
	name: 'Ingredients',
	components: {
		TitleHeader
	},
	data() {
		return {
			ingredientList: [] as Array<IngredientFiche>
		};
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		try {
			this.ingredientList = await IngredientsService.getAllIngredients();
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}
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
table {
	width: 100%;
	margin-top: 10px;
	margin-bottom: 5px;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;
	tr {
		display: table-row;
		cursor: help;
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
			background-image: url('@/assets/background/table_header.webp');
			background-position: left bottom;
			max-width: 222px;
			&.name {
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
				max-width: 200px;
			}
			&.icon {
				width: 32px;
			}
			&.stock {
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
				max-width: 15px;
			}
		}
		td {
			font-size: 16px;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			background-image: url('@/assets/background/table_cell.webp');
			background-position: -10px 0px;
			&.name {
				padding: 1px 5px;
				max-width: 222px;
			}
			&.stock {
				padding: 1px 5px;
				width: 52px;
			}
		}
		&.full td {
			background-image: url('@/assets/background/table_cell_hover.webp') !important;
			background-position: -10px 0px;
			color: #fffdba;
		}
		&.even td {
			background-image: url('@/assets/background/table_cell_even.webp');
			background-position: -10px 0px;
		}
	}
}
</style>
