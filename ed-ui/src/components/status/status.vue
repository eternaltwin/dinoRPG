<template>
	<div id="status">
		<table>
			<tbody>
				<tr v-for="(status, index) in statusList" :key="index">
					<td v-for="stat in status" :key="stat.name">
						<img :src="getImg(stat.name)" />
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Status } from '@/models';

export default defineComponent({
	name: 'Status',
	data() {
		return {
			statusList: [] as Array<Array<Status>>
		};
	},
	props: {
		status: Array
	},
	methods: {
		getImg(imgName: string): string {
			return require(`@/assets/status/${imgName}.png`);
		}
	},
	mounted(): void {
		let row: Array<Status> = [];
		const nbrColonnes = 11;
		const nbrLignes = this.status!.length / nbrColonnes + 1;
		for (let i = 0; i < nbrLignes; i++) {
			row = this.status!.splice(0, nbrColonnes) as Array<Status>;
			this.statusList.push(row);
		}
	}
});
</script>
