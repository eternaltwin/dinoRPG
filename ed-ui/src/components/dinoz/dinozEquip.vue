<template>
	<div class="equip">
		<ul>
			<li v-for="(item, index) in itemList" :key="index">
				<a href="#" class="icon">
					<img :src="getImg($t(`item.imgName.${item}`))" :alt="item" />
				</a>
			</li>
		</ul>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'DinozEquip',
	props: {
		itemList: Array
	},
	methods: {
		getImg(imgName: string): string {
			return require(`@/assets/item/item_${imgName}.webp`);
		}
	}
});
</script>

<style lang="scss" scoped>
.equip {
	position: absolute;
	padding-left: 12px;
	margin-left: 420px;
	margin-top: 101px;
	font-size: 0pt;
	width: 100px;
	height: 138px;
	background: url('~@/assets/background/equipment_box.gif') no-repeat;

	ul {
		list-style: none;
		margin-left: 1px;
		text-align: left;
		margin-top: 4px;
	}

	li {
		display: inline;
		padding-right: 1px;
	}
}
</style>
