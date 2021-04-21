<template>
	<div id="dinozList">
		<div v-for="(dinoz, index) in dinozList" :key="index">
			<!-- Bouton temporaire, uniquement pour accéder à la fiche du dinoz -->
			<button @click="goToDinozPage(dinoz.dinozId)">
				<SDinozSWF
					:display="dinoz.display"
					:flip="1"
					:width="40"
					:height="40"
					type="sdino"
				></SDinozSWF>
				{{ dinoz.name }}
				{{ $t('place.' + dinoz.place.name) }}
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Dinoz } from '@/models';
import store from '@/store';
import SDinozSWF from '@/components/dinoz/dinozSWF.vue';

export default defineComponent({
	name: 'DinozList',
	data() {
		return {
			dinozList: [] as Array<Dinoz>
		};
	},
	components: {
		SDinozSWF
	},
	methods: {
		goToDinozPage(dinozId: string): void {
			this.$router.push({ name: 'DinozPage', params: { id: dinozId } });
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
