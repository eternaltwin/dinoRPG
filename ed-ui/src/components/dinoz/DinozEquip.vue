<template>
	<div class="equip">
		<template v-for="(item, index) in getInventory" :key="index">
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
import { defineComponent } from 'vue';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { errorHandler } from '../../utils';
import { InventoryService } from '../../services';
import { useDinozStore } from '../../store';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { DinozItems } from '@drpg/core/models/item/DinozItems';
import { useInventoryStore } from '../../store/useInventoryStore';

export default defineComponent({
	name: 'DinozEquip',
	computed: {
		itemNameList() {
			return itemNameList;
		},
		getInventory(): number[] {
			const dinoz: DinozFiche = useDinozStore().getCurrentDinoz;
			const placesToFill: number = dinoz.maxItems - dinoz.items.length;
			return dinoz.items.concat(new Array(placesToFill).fill(undefined));
		}
	},
	methods: {
		async unequip(itemId: number) {
			const dinozId = parseInt(this.$route.params.id as string);
			try {
				const items: Array<DinozItems> = await InventoryService.equipInventoryItem(dinozId, itemId, false);
				useDinozStore().setItems(
					dinozId,
					items.map(item => item.itemId)
				);
				await useInventoryStore().addItem(itemId, 1);
				useInventoryStore().sortItems();
			} catch (error) {
				errorHandler.handle(error, this.$toast);
				return;
			}
		}
	}
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
