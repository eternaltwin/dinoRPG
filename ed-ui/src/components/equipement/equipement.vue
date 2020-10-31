<template>
	<div id="dinozFiche">
		<table>
			<tbody>
				<tr v-for="(object, index) in objectsList" :key="index">
					<td v-for="obj in object" :key="obj.name">
						<img :src="getImg(obj.name)">
						<p>{{ $t('object.name.' + obj.name) }}</p>
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
		};
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
		for (var i = 0; i < nbrLignes; i++) {
			row = this.objects.splice(0, this.nbrColonnes);
			this.objectsList.push(row);
		}
	},
	methods: {
		getImg (imgName) {
			var images = require.context('@/assets/object/', false, /\.png$/);
			return images('./' + imgName + '.png');
		},
		displayDescription (description) {
			console.log(description);
		}
	}
};
</script>

<style>
</style>
