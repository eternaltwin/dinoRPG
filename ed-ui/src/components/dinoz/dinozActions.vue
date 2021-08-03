<template>
	<div class="actions" id="dinozActions">
		<ul>
			<table
				class="action"
				v-for="action in dinozData.actions"
				:key="action.name"
				:id="action.imgName"
			>
				<tbody>
					<tr>
						<td class="icon">
							<img :src="getImg('icons', '', action.imgName)" />
						</td>
						<td class="label">{{ $t(`action.${action.name}`) }}</td>
					</tr>
				</tbody>
			</table>
		</ul>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Dinoz } from '@/models';
import { DinozService } from '@/services';
import { errorHandler } from '@/utils';

export default defineComponent({
	name: 'DinozActions',
	data() {
		return {
			nameChoosen: undefined as boolean | undefined,
			dinozData: {} as Dinoz
		};
	},
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.png`);
		}
	},
	async mounted(): Promise<void> {
		try {
			const dinozId = this.$route.params.id as string;
			this.dinozData = await DinozService.getDinozFiche(dinozId);
		} catch (err) {
			errorHandler.handle(err);
			return Promise.reject(err);
		}

		this.nameChoosen = this.dinozData.name !== '?';
	}
});
</script>

<style lang="scss" scoped>
.actions {
	float: left;
	position: relative;
	width: 171px;
	padding-left: 20px;
	color: white;
	position: relative;
	flex-grow: 50%;
}
</style>
