<template>
	<div id="dinozFiche">
		<table>
			<tbody>
				<tr v-for="object in objectsList">
					<td v-for="obj in object">
						<img :src="getImg(obj.imgName)" @mouseover="displayDescription(obj.description)">
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
				objectsList: [],
				nbrColonnes: 0
			}
		},
		props: {
			type: String,
			objects: Array
		},
		created () {
			// Définition du nombre de colonnes (nombre différent entre la fiche du dinoz (2) et les marchands (4))
			if (this.type === 'dinoz') {
				this.nbrColonnes = 2;
			} else {
				this.nbrColonnes = 4;
			}

			// On refait une liste d'objets en fonction du nombre de colonnes
			var row = [];
			var nbrLignes = parseInt(this.objects.length / this.nbrColonnes) + 1;
			for (var i = 0; i < nbrLignes; i ++) {
				row = this.objects.splice(0, this.nbrColonnes);
				this.objectsList.push(row);
			}
		},
		methods: {
			getImg (imgName) {
				var images = require.context('@/assets/objets/', false, /\.png$/);
			    return images('./' + imgName + '.png');
			},
			displayDescription (description) {
				console.log(description);
			}
		}
	}
</script>

<style>

</style>
