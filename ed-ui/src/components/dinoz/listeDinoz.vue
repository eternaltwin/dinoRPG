<template>
	<div id="listeDinoz">
		<div v-for="(dinoz, index) in getDinozList" :key="index">
			<!-- Bouton temporaire, uniquement pour accéder à la fiche du dinoz -->
			<button @click="goToDinozPage(dinoz.dinozId)" >
				<SDinozSWF :display="dinoz.display" :flip="1" :width="40" :height="40" type="sdino"></SDinozSWF>
				{{ dinoz.name }}
				{{ $t('place.' + dinoz.place.name) }}
			</button>
		</div>
	</div>
</template>

<script>
import SDinozSWF from '@/components/dinoz/dinozSWF.vue';
import { mapGetters, mapActions } from 'vuex';

export default {
	name: 'listeDinoz',
	computed: {
		...mapGetters(['getDinozList'])
	},
	methods: {
		...mapActions(['addDinoz']),
		goToDinozPage(dinozId) {
			if (this.$router.currentRoute.params.id !== dinozId) {
				this.$router.push({ name: 'dinozFiche', params: { id: dinozId } });
				if (this.$router.currentRoute.name === 'dinozFiche') {
					this.$router.go();
				}
			}
		}
	},
	components: {
		SDinozSWF
	}
};
</script>

<style>

</style>
