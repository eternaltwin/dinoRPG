<template>
	<div id="equipement">
		<table>
			<tbody>
				<tr v-for="(object, index) in objectsList" :key="index">
					<td v-for="obj in object" :key="obj.id">
						<img :src="getImg(obj.object.name)" />
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Objet } from '@/models';

export default defineComponent({
	name: 'Equipement',
	data() {
		return {
			objectsList: [] as Array<Array<Objet>>
		};
	},
	props: {
		type: String,
		objects: Array
	},
	methods: {
		getImg(imgName: string): string {
			return require(`@/assets/object/${imgName}.png`);
		}
	},
	mounted(): void {
		// Définition du nombre de colonnes (nombre différent entre la fiche du dinoz (2) et les marchands (4))
		const nbrColonnes: number = this.type === 'dinoz' ? 2 : 4;

		// On refait une liste d'objets en fonction du nombre de colonnes
		let row: Array<Objet> = [];
		const nbrLignes: number = this.objects!.length / nbrColonnes + 1;
		for (let i = 0; i < nbrLignes; i++) {
			row = this.objects!.splice(0, nbrColonnes) as Array<Objet>;
			this.objectsList.push(row);
		}
	}
});
</script>
