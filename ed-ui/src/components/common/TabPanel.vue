<template>
	<div class="tabPanel">
		<ul class="tabs">
			<li :class="tabSelected === 1 ? 'active' : ''">
				<a href="#" @click="setTab(1)">{{ $t('tabs.map') }}</a>
			</li>
			<li :class="tabSelected === 2 ? 'active' : ''">
				<a href="#" @click="setTab(2)">{{ $t('tabs.inventory') }}</a>
			</li>
			<li :class="tabSelected === 3 ? 'active' : ''">
				<a href="#" @click="setTab(3)">{{ $t('tabs.details') }}</a>
			</li>
		</ul>
		<MapTab v-if="tabSelected === 1" />
		<InventoryTab v-if="tabSelected === 2" />
		<DetailsTab v-if="tabSelected === 3" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Item } from '@/models';
import InventoryTab from '@/components/common/InventoryTab.vue';
import DetailsTab from '@/components/common/DetailsTab.vue';
import MapTab from '@/components/common/MapTab.vue';

export default defineComponent({
	name: 'TabPanel',
	components: {
		InventoryTab,
		DetailsTab,
		MapTab
	},
	data() {
		return {
			allItemsData: {} as Array<Item>,
			tabSelected: 1 as number
		};
	},
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.webp`);
		},
		async setTab(value: number): Promise<void> {
			this.tabSelected = value;
		}
	}
});
</script>

<style lang="scss" scoped>
.tabPanel {
	float: left;
	left: 16px;
	top: -14px;
	position: relative;
	width: 315px;
	padding-bottom: 15px;
	color: white;
	background: url('~@/assets/background/banniere_left.png') no-repeat,
		url('~@/assets/background/banniere_right.png') no-repeat,
		url('~@/assets/background/banniere_middle.png') repeat-x;
	background-position-x: left, right;

	.tabs {
		margin-top: 15px;
		margin-left: 1px;
		width: 304px;
		background-image: none;
		text-shadow: 1px 1px 0px #9a4029;
		:hover {
			color: white;
		}

		li.active {
			margin-top: 1px;
			text-shadow: 1px 1px 0px #9a4029;
			a {
				background-color: #d69e68;
				line-height: 16pt;
				color: white;
				border-left-color: #ffe7aa;
				border-top-color: #ffe7aa;
				border-bottom: 1px solid #d69e68;
			}
		}
	}
}
</style>
