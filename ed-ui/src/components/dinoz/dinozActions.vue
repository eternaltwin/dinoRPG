<template>
	<div class="actions">
		<div class="actions_top">
			<p>{{ $t('layout.action') }}</p>
		</div>
		<ul>
			<!-- FIXME: button is for demo only -->
			<table class="action_button">
				<tbody>
					<tr @click="randomMove(dinozData.dinozId)">
						<td class="icon">
							<img :src="getImg('icons', '', 'act_boutique')" />
						</td>
						<td class="label">Voyager</td>
					</tr>
				</tbody>
			</table>
		</ul>
		<ul>
			<table
				class="action_button"
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
import store from '@/store';

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
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.webp`);
		},
		async randomMove(dinoz: string): Promise<void> {
			// FIXME: This methods should be rework to select the place to move.
			try {
				// Get new random placeId
				let randoma = await DinozService.alphaMove(dinoz);
				const dinozList: Array<Dinoz> = store.getters.getDinozList;
				const dinozToUpdate = dinozList.find(
					dinoz => dinoz.dinozId == this.dinozData!.dinozId
				)!;
				let finalPlace: number = +randoma;
				dinozToUpdate.placeId = finalPlace;
				store.commit('setDinozList', dinozList);
			} catch (err) {
				errorHandler.handle(err);
				return Promise.reject(err);
			}
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
	background: url('~@/assets/background/banniere_left.png') no-repeat,
		url('~@/assets/background/banniere_right.png') no-repeat,
		url('~@/assets/background/banniere_middle.png') repeat-x;
	background-position-x: left, right;
	float: left;
	left: 12px;
	top: -14px;
	position: relative;
	width: 185px;
	min-height: 90px;
	color: white;
	position: relative;
	flex-grow: 50%;
	.actions_top {
		width: 185px;
		height: 28px;
		p {
			color: white;
			padding-left: 2px;
			font-size: 7.5pt;
			position: absolute;
			top: -1.5px;
			text-shadow: 0.5px 0 1px grey;
			text-transform: uppercase;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			font-weight: bold;
		}
	}
	.action_button {
		position: relative;
		left: 5px;
		border-collapse: collapse;
		border-spacing: 0px;
		margin-bottom: 2px;
		width: 100%;

		td {
			margin: 0px;
			padding: 0px;
			text-align: left;
			cursor: pointer;

			&.label {
				padding-left: 4px;
				padding-right: 4px;
				font-weight: bold;
				color: white;
				font-size: 11pt;
				font-variant: small-caps;
				line-height: 10.5pt;
				border-top-right-radius: 7px;
				border-bottom-right-radius: 7px;
			}

			&.icon {
				width: 32px;
				font-size: 0pt;
				line-height: 0pt;
			}
		}
	}
}
</style>
