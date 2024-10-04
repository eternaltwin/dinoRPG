<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<DZDisclaimer help :content="$t('clan.ingredients.help', { value: treasureValue })" />
	<div class="wrapper">
		<Tippy theme="normal" tag="div" v-for="ingredient in treasure" :key="ingredient.name" class="container">
			<img :src="getImgURL('ingredients', ingredient.name)" :alt="ingredient.name" />
			<p>x {{ ingredient.quantity }}</p>
			<template #content>
				<h1 v-html="formatContent($t(`ingredients.name.${ingredient.name}`))" />
				<p v-html="formatContent($t(`ingredients.description.${ingredient.name}`))" />
				<h2 v-html="formatContent($t(`clan.ingredients.price`, { price: ingredient.price }))" />
			</template>
		</Tippy>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ClanService } from '../../services/ClanService.js';
import { playerStore } from '../../store/index.js';
import { errorHandler, utils } from '../../utils/index.js';
import DZDisclaimer from '../common/DZDisclaimer.vue';
import { IngredientFiche } from '@drpg/core/models/ingredient/IngredientFiche';
import { ingredientList } from '@drpg/core/models/ingredient/ingredientList';

export default defineComponent({
	name: 'ClanTreasure',
	components: { DZDisclaimer },
	data() {
		return {
			treasure: [] as Pick<IngredientFiche, 'name' | 'quantity' | 'price'>[],
			playerStore: playerStore()
		};
	},
	computed: {
		treasureValue(): string {
			return utils.beautifulNumber(
				this.treasure.reduce((acc, cur) => acc + cur.price * (cur.quantity ?? 0), 0).toString()
			);
		}
	},
	methods: {
		async load() {
			const clanId = this.playerStore.getClanId;
			if (!clanId) {
				this.$toast.open({ message: this.$t('toast.error'), type: 'error' });
				return;
			}
			try {
				const treasure = await ClanService.getClanTreasure(clanId);
				treasure.forEach(t => {
					const ingredient = Object.values(ingredientList).find(i => i.ingredientId === t.itemId);
					if (!ingredient) {
						this.$toast.open({ message: this.$t('toast.error'), type: 'error' });
						return;
					}
					this.treasure.push({ name: ingredient.name, quantity: t.quantity, price: ingredient.price });
				});
			} catch (e) {
				errorHandler.handle(e, this.$toast, this.$t);
			}
		}
	},
	async created() {
		await this.load();
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	display: flex;
	//justify-content: space-between;
	gap: 5px;
	flex-wrap: wrap;
	margin: 10px;
}
.container {
	display: flex;
	gap: 7px;
	flex-wrap: wrap;
	align-items: center;
	background-color: #bc683c;
	border-radius: 80% 30px 30px 80%;
	color: white;
	width: 100px;
	p:first-letter {
		font-weight: normal;
		font-size: 75%;
		color: #fce3bc;
	}
}
</style>
