<template>
	<div class="actions">
		<div class="actions_top">
			<p>{{ $t('layout.action') }}</p>
		</div>
		<ul>
			<table class="action_button">
				<tbody>
					<Tippy
						tag="tr"
						theme="normal"
						v-for="action in dinozActions"
						:key="action.name"
						:id="action.imgName"
						@click="launch(action)"
					>
						<td class="icon">
							<img :src="getImg('icons', '', action.imgName)" />
						</td>
						<td v-if="action.name === 'shop'" class="label">
							{{ $t(`shop.item.${shopNameList[action.prop]}.name`) }}
						</td>
						<td v-else class="label">
							{{ $t(`action.name.${action.name}`) }}
						</td>
						<template #content>
							<h1
								v-if="action.name === 'shop'"
								v-html="
									formatContent(
										$t(`shop.item.${shopNameList[action.prop]}.name`)
									)
								"
							/>
							<h1
								v-else
								v-html="formatContent($t(`action.name.${action.name}`))"
							/>
							<p
								v-if="action.name === 'shop'"
								v-html="
									formatContent(
										$t(`shop.item.${shopNameList[action.prop]}.description`)
									)
								"
							/>
							<p
								v-else
								v-html="formatContent($t(`action.description.${action.name}`))"
							/>
						</template>
					</Tippy>
				</tbody>
			</table>
		</ul>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { shopNameList } from '@/constants';
import { Action } from '@/models';

export default defineComponent({
	name: 'DinozActions',
	data() {
		return {
			shopNameList: shopNameList
		};
	},
	props: { dinozActions: Object as PropType<Array<Action>> },
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.webp`);
		},
		launch(action: Action): void {
			switch (action.name) {
				case 'shop':
					this.$router.push({
						name: 'ItemShopPage',
						params: { name: shopNameList[action.prop!] }
					});
					break;
				default:
					break;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.actions {
	background: url('~@/assets/background/banniere_left.webp') no-repeat,
		url('~@/assets/background/banniere_right.webp') no-repeat,
		url('~@/assets/background/banniere_middle.webp') repeat-x;
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
