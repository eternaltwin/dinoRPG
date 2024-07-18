<template>
	<div class="equip">
		<ul>
			<li v-for="item in items" :key="item">
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
			</li>
		</ul>
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

export default defineComponent({
	name: 'DinozEquip',
	props: {
		dinozData: Object as PropType<DinozFiche>
	},
	data() {
		return {
			items: undefined as undefined | Array<number>,
			dinozStore: dinozStore()
		};
	},
	computed: {
		itemNameList() {
			return itemNameList;
		}
	},
	methods: {
		async unequip(item: number) {
			if (!this.dinozData) {
				this.$toast.open({
					message: this.$t(`toast.dinozDataMissing`),
					type: 'error'
				});
				return;
			}

			EventBus.emit('isLoading', true);
			const dinozId = parseInt(this.$route.params.id as string);
			try {
				const backPack = await InventoryService.equipInventoryItem(dinozId, item, false);
				this.items = new Array(this.dinozData.maxItems);
				backPack.forEach((item, index) => (this.items![index] = item.itemId));

				EventBus.emit('refreshInventory', {
					event: 'unequip',
					item
				});
				EventBus.emit('isLoading', false);
			} catch (error) {
				errorHandler.handle(error, this.$toast, this.$t);
				return;
			}
		}
	},
	mounted() {
		if (!this.dinozData) {
			this.$toast.open({
				message: this.$t(`toast.dinozDataMissing`),
				type: 'error'
			});
			return;
		}
		this.items = new Array(this.dinozData.maxItems);
		this.dinozData.items?.forEach((item, index) => (this.items![index] = item));

		EventBus.on('equipItem', e => {
			if (!this.dinozData) {
				this.$toast.open({ message: this.$t(`toast.dinozDataMissing`), type: 'error' });
				return;
			}

			this.items = new Array(this.dinozData.maxItems);
			e.forEach((item, index) => (this.items![index] = item.itemId));
		});
	},
	unmounted() {
		EventBus.off('equipItem');
	}
});
</script>

<style lang="scss" scoped>
.equip {
	position: absolute;
	margin-left: 420px;
	margin-top: 101px;
	font-size: 0pt;
	width: 100px;
	height: 138px;
	background: url('../../assets/background/equipment_box.webp') no-repeat;

	ul {
		list-style: none;
		margin-left: 17px;
		text-align: left;
		margin-top: 23px;
	}

	li {
		display: inline-block;
		padding-right: 3px;
		padding-bottom: 3px;
		img {
			position: relative;
			&:hover {
				outline: 1px solid white;
				cursor: pointer;
			}
		}
	}
}
</style>
