<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div class="tabPanel">
		<ul class="tabs">
			<li :class="tabSelected === 1 ? 'active' : ''">
				<a href="#" @click="sessionStore.setTab(1)">{{ $t('tabs.map') }}</a>
			</li>
			<li :class="tabSelected === 2 ? 'active' : ''">
				<a href="#" @click="sessionStore.setTab(2)">{{ $t('tabs.inventory') }}</a>
			</li>
			<li :class="tabSelected === 3 ? 'active' : ''">
				<a href="#" @click="sessionStore.setTab(3)">{{ $t('tabs.details') }}</a>
			</li>
		</ul>
		<MapTab v-if="tabSelected === 1" :dinozData="dinozData" />
		<InventoryTab v-if="tabSelected === 2" />
		<DetailsTab v-if="tabSelected === 3" :dinozData="dinozData" />
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { sessionStore } from '../../store/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import InventoryTab from '../../components/common/InventoryTab.vue';
import DetailsTab from '../../components/common/DetailsTab.vue';
import MapTab from '../../components/common/MapTab.vue';

export default defineComponent({
	name: 'TabPanel',
	props: { dinozData: Object as PropType<DinozFiche> },
	components: {
		InventoryTab,
		DetailsTab,
		MapTab
	},
	data() {
		return {
			sessionStore: sessionStore()
		};
	},
	computed: {
		tabSelected(): number {
			return this.sessionStore.getTab;
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
	background:
		url('../../assets/background/banniere_left.webp') no-repeat,
		url('../../assets/background/banniere_right.webp') no-repeat,
		url('../../assets/background/banniere_middle.webp') repeat-x;
	background-position-x: left;
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
