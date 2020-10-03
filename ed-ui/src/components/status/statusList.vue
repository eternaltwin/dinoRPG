<template>
	<div id="status">
		<table>
			<tbody>
				<tr v-for="status in statusList">
					<td v-for="stat in status">
						<img :src="getImg(stat.name)" />
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
import PopinDescription from '@/components/popin/description.vue';

	export default {
		data () {
			return {
				statusList: []
			}
		},
		props: {
			status: Array
		},
		created () {
			var row = [];
			var nbrColonnes = 11;
			var nbrLignes = parseInt(this.status.length / nbrColonnes) + 1;
			for (var i = 0; i < nbrLignes; i ++) {
				row = this.status.splice(0, nbrColonnes);
				this.statusList.push(row);
			}
		},
		methods: {
			getImg (imgName) {
				var images = require.context('@/assets/status/', false, /\.png$/);
			    return images('./' + imgName + '.png');
			}
		},
		components: {
			PopinDescription
		}
	}
	
</script>

<style>
</style>
