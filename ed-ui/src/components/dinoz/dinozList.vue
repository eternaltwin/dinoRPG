<template>
	<ul>
		<li class="light" v-for="(dinoz, index) in dinozList" :key="index">
			<a @click="goToDinozPage(dinoz.dinozId)">
				<span class="icon">
					<span class="tinyBar">
						<span :style="getLifeBarWidth()"></span>
					</span>
				</span>
				<span class="name">{{ dinoz.name }}</span>
				<em> {{ $t(`place.${dinoz.place.name}`) }} </em>
			</a>
			<!--<SDinozSWF
			:display="dinoz.display"
			:flip="1"
			:width="40"
			:height="40"
			type="sdino"
		></SDinozSWF>-->
		</li>
	</ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Dinoz } from '@/models';
import store from '@/store';
// import SDinozSWF from '@/components/dinoz/dinozSWF.vue';

export default defineComponent({
	name: 'DinozList',
	data() {
		return {
			dinozList: [] as Array<Dinoz>
		};
	},
	/*components: {
		SDinozSWF
	},*/
	methods: {
		goToDinozPage(dinozId: string): void {
			this.$router.push({ name: 'DinozPage', params: { id: dinozId } });
		},
		getLifeBarWidth(): string {
			// TODO: calculer vie du dinoz (PV actuel / PV max * 36)
			return 'width : 36px';
		}
	},
	computed: {
		storeDinozList(): Array<Dinoz> {
			return store.getters.getDinozList;
		}
	},
	watch: {
		storeDinozList: function(dinozList: Array<Dinoz>) {
			this.dinozList = dinozList;
		}
	},
	mounted(): void {
		this.dinozList = store.getters.getDinozList;
	}
});
</script>
