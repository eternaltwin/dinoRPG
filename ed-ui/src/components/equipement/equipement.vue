<template>
	<div id="dinozFiche">
		<table>
			<tbody>
				<tr v-for="object in objectsList">
					<td v-for="obj in object">
						<img :src="getImg(obj.imgName)">
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	export default {
		data () {
			return {
				objectsList: []
			}
		},
		created () {
			var row = [];
			var nbrLignes = parseInt(this.objects.length / this.nbrColonnes) + 1;
			for (var i = 0; i < nbrLignes; i ++) {
				row = this.objects.splice(0, this.nbrColonnes);
				this.objectsList.push(row);
			}
		},
		methods: {
			getImg (imgName) {
				var images = require.context('@/assets/', false, /\.png$/);
			    return images('./' + imgName + '.png');
			}
		},
		props: {
			nbrColonnes: Number,
			objects: Array
		}
	}
</script>

<style>

</style>
