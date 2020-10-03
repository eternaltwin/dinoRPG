<template>
  <div id="listeDinoz">
   	<div v-for="dinoz in dinozList" :key="dinoz.name">
   		{{ dinoz.name }}
   	</div>
  </div>
</template>

<script>
import DinozService from '@/services/DinozService'; 

	export default {
		name: 'listeDinoz',
		data () {
			return {
				dinozList: []
			}
		},
		mounted() {
			var idPlayer = parseInt(this.$session.get('idPlayer'));
			DinozService.getDinozPlayer(idPlayer).then(res => {
				this.dinozList = res.data;
				}
			);
		}
		
	}
</script>

<style>

</style>
