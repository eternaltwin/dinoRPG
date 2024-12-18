<template>
	<Transition>
		<div class="modal-background">
			<div v-for="ingredient in rewardList.ingredients" :key="ingredient.ingredientId" class="ingredient-container">
				<Tippy
					theme="normal"
					tag="img"
					:src="getImgURL('ingredients', ingredient.name)"
					:alt="ingredient.name"
					class="ingredient-image"
				>
					<template #content>
						<h1 v-html="formatContent($t(`ingredients.name.${ingredient.name?.toLowerCase()}`))" />
						<p v-html="formatContent($t(`ingredients.description.${ingredient.name?.toLowerCase()}`))" />
					</template>
				</Tippy>
				<div :class="{ 'max-quantity-info': true, 'is-max': isMaxQuantity(ingredient.ingredientId).isMaxQuantity }">
					<span :style="isMaxQuantity(ingredient.ingredientId).isMaxQuantity ? 'color: red;' : 'color: white;'">
						{{ formatContent($t(`ingredients.name.${ingredient.name}`)) }}
						({{ isMaxQuantity(ingredient.ingredientId).quantity }})
					</span>
				</div>
			</div>
			<Tippy
				theme="normal"
				tag="img"
				v-for="item in rewardList.item"
				:key="item.id"
				:src="getImgURL('item', `item_${itemList[item.id].name.toLowerCase()}`)"
				:alt="item.name?.toLowerCase()"
			>
				<template #content>
					<h1 v-html="formatContent($t(`item.name.${itemList[item.id].name.toLowerCase()}`))" />
					<p
						v-html="
							formatContent($t(`item.description.${itemList[item.id].name.toLowerCase()}`, { quantity: item.price }))
						"
					/>
				</template>
			</Tippy>
			<a class="button" @click="$emit('close')">
				{{ $t('missions.continue') }}
			</a>
		</div>
	</Transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { GatherRewards } from '@drpg/core/models/gather/gatherRewards';
import { playerStore } from '../../store/index.js';
import { Item, itemList } from '@drpg/core/models/item/ItemList';

export default defineComponent({
	name: 'GatherRewardModal',
	props: {
		rewards: { type: Object as PropType<GatherRewards>, required: true },
		ingredientsAtMaxQuantity: {
			type: Array as PropType<{ ingredientId: number; quantity: number; isMaxQuantity: boolean }[]>,
			required: true
		},
		size: Number
	},
	data() {
		return {
			playerStore: playerStore(),
			rewardList: {} as GatherRewards,
			itemList: itemList
		};
	},
	mounted() {
		this.rewardList = this.rewards;
		for (const item of this.rewardList.item) {
			const goldId = [
				Item.GOLD100,
				Item.GOLD500,
				Item.GOLD1000,
				Item.GOLD2000,
				Item.GOLD2500,
				Item.GOLD3000,
				Item.GOLD5000,
				Item.GOLD10000,
				Item.GOLD20000
			];
			if (goldId.includes(item.id)) {
				this.playerStore.addMoney(item.price);
			}
		}
	},
	methods: {
		isMaxQuantity(ingredientId: number) {
			const ingredient = this.ingredientsAtMaxQuantity.find(ingre => ingre.ingredientId === ingredientId);
			if (ingredient) {
				return {
					isMaxQuantity: ingredient.isMaxQuantity,
					quantity: ingredient.quantity
				};
			}
			return { isMaxQuantity: false, quantity: 0 };
		}
	}
});
</script>

<style lang="scss" scoped>
.modal-background {
	position: absolute;
	width: v-bind(size);
	height: v-bind(size);
	background: transparentize(#09092d, 0.4);
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 999;
	transition: all 0.3s;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	img {
		margin-top: 15px;
	}
	.button {
		margin-top: 25px;
	}
}
.ingredient-container {
	display: flex;
	align-items: center;
	gap: 10px;
	width: 50%;
}
.max-quantity-info {
	margin-top: 15px;
	font-size: 14px;
	color: white;
}
.is-max {
	color: red;
}

.v-enter-active {
	transition:
		opacity 0.5s ease,
		bottom 0.5s ease;
	animation-delay: 0.35s;
}
.v-leave-active {
	transition:
		opacity 0.5s ease,
		bottom 0.5s ease;
}

.v-enter-from {
	bottom: 0;
	opacity: 0;
}
.v-leave-to {
	bottom: 0;
	opacity: 0;
}

.modal-close {
	min-width: 31px;
	cursor: pointer;
	position: absolute;
	text-align: center;
	right: 0;
	top: 0;
	padding: 5px;
	background-color: #fadcb0;
	color: transparentize(brown, 0.4);
	font-size: 0.85em;
	letter-spacing: 0.03em;
	text-decoration: none;
	font-variant: small-caps;
	transition: all 0.15s;

	&:hover,
	&:focus,
	&:active {
		color: black;
	}
}

@keyframes blowUpModal {
	0% {
		transform: scale(0);
	}
	100% {
		transform: scale(1);
	}
}
</style>
