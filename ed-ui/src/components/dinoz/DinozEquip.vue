<template>
	<div class="equip">
		<template v-for="(item, index) in dinozStore.getCurrentDinozInventory" :key="index">
			<Tippy
				@click="unequip(item)"
				theme="normal"
				tag="img"
				v-if="item"
				:src="getImgURL('item', `item_${itemNameList[item]}`)"
				:alt="itemNameList[item]"
			>
				<template #content>
					<h1 v-html="formatContent($t(`item.name.${itemNameList[item]}`))" />
					<p v-html="formatContent($t(`item.description.${itemNameList[item]}`))" />
				</template>
			</Tippy>
			<Tippy theme="small" tag="img" v-else :src="getImgURL('item', `item_empty`)" alt="empty">
				<template #content>
					<p v-html="formatContent($t(`item.empty`))" />
				</template>
			</Tippy>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { errorHandler } from '../../utils/errorHandler.js';
import { InventoryService } from '../../services/InventoryService.js';
import EventBus from '../../events/index.js';
import { dinozStore } from '../../store/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { formatText } from '../../utils/formatText.js';

export default defineComponent({
	name: 'DinozEquip',
	data() {
		return {
			items: [] as (number | undefined)[],
			dinozStore: dinozStore()
		};
	},
	computed: {
		itemNameList() {
			return itemNameList;
		}
	},
	methods: {
		async unequip(itemId: number) {
			const dinozId = parseInt(this.$route.params.id as string);
			try {
				const items = await InventoryService.equipInventoryItem(dinozId, itemId, false);
				items.forEach((item, index) => (this.items[index] = item.itemId));
				this.dinozStore.setItems(
					dinozId,
					items.map(item => item.itemId)
				);
				EventBus.emit('refreshInventory', true);
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				return;
			}
		}
	},
});
</script>

<style lang="scss" scoped>
.equip {
	grid-area: equip;
	align-self: center;
	justify-self: center;
	width: 83px;
	height: 115px;
	background: url('../../assets/background/equipment_box.webp') no-repeat;
	display: flex;
	flex-wrap: wrap;
	row-gap: 3px;
	column-gap: 3px;
	padding-top: 23px;
	padding-left: 17px;
	align-items: self-start;
	align-content: flex-start;

	img {
		object-fit: contain;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: 100%;
		&:hover {
			outline: 1px solid white;
			cursor: pointer;
		}
	}
}
</style>
