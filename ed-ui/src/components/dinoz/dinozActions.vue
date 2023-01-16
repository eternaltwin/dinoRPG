<template>
	<div class="actions">
		<Resurrect :enabled="resurrect" @close="resurrect = false" />
		<div class="actions_top">
			<p>{{ $t('layout.action') }}</p>
		</div>
		<ul>
			<table class="action_button">
				<tbody>
					<Tippy
						tag="tr"
						theme="normal"
						v-for="action in dinozData.actions"
						:key="action.name"
						:id="action.imgName"
						@click="launch(action)"
					>
						<td class="icon">
							<img :src="getImgURL('icons', action.imgName)" :alt="action.imgName" />
						</td>
						<td v-if="action.name === 'shop'" class="label">
							{{ $t(`shop.item.${shopNameList[action.prop]}.name`) }}
						</td>
						<td v-else-if="action.name === 'npc'" class="label">
							{{ $t(`npc.name.${npcNameList[action.prop]}`) }}
						</td>
						<td v-else-if="action.name !== 'npc' && action.name !== 'shop'" class="label">
							{{ $t(`action.name.${action.name}`) }}
						</td>
						<template #content>
							<h1
								v-if="action.name === 'shop'"
								v-html="formatContent($t(`shop.item.${shopNameList[action.prop]}.name`))"
							/>
							<h1
								v-else-if="action.name === 'npc'"
								v-html="formatContent($t(`npc.name.${npcNameList[action.prop]}`))"
							/>
							<h1
								v-else-if="action.name !== 'npc' && action.name !== 'shop'"
								v-html="formatContent($t(`action.name.${action.name}`))"
							/>
							<p
								v-if="action.name === 'shop'"
								v-html="formatContent($t(`shop.item.${shopNameList[action.prop]}.description`))"
							/>
							<p v-else-if="action.name === 'npc'" v-html="formatContent($t(`npc.description`))" />
							<p
								v-else-if="action.name !== 'npc' && action.name !== 'shop'"
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
import { shopNameList, npcNameList } from '@/constants';
import { Action, Dinoz, FightResult } from '@/models';
import { sessionStore } from '@/store';
import EventBus from '@/events';
import Resurrect from '../modal/ResurrectModal.vue';
import { FightService } from '@/services';

export default defineComponent({
	name: 'DinozActions',
	data() {
		return {
			shopNameList: shopNameList,
			npcNameList: npcNameList,
			resurrect: false as boolean,
			sessionStore: sessionStore()
		};
	},
	components: {
		Resurrect
	},
	props: {
		// dinozActions: Object as PropType<Array<Action>>,
		dinozData: Object as PropType<Dinoz>
	},
	methods: {
		async launch(action: Action): Promise<void> {
			switch (action.name) {
				case 'levelup':
					this.$router.push({
						name: 'Leveling',
						params: { id: this.$route.params.id.toString() }
					});
					break;
				case 'shop':
					this.$router.push({
						name: 'ItemShopPage',
						params: { name: shopNameList[action.prop!] }
					});
					break;
				case 'npc':
					this.$router.push({
						name: 'NPC',
						params: { id: this.$route.params.id.toString(), npc: npcNameList[action.prop!] }
					});
					break;
				case 'fight':
					EventBus.emit('isLoading', true);
					// eslint-disable-next-line
					const fight: FightResult = await FightService.processFight(parseInt(this.$route.params.id.toString()));
					this.sessionStore.setFightResult(fight);
					this.$router.push({
						name: 'Fight',
						query: { dinozId: this.$route.params.id.toString() }
					});
					EventBus.emit('isLoading', false);
					break;
				case 'resurrect':
					this.resurrect = true;
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
	background: url('@/assets/background/banniere_left.webp') no-repeat,
		url('@/assets/background/banniere_right.webp') no-repeat, url('@/assets/background/banniere_middle.webp') repeat-x;
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
		width: 175px;
		tr:hover {
			td {
				&.icon {
					outline: 1px solid white;
				}
				&.label {
					background-color: #9a4029;
				}
			}
		}

		td {
			margin: 0;
			padding: 0 0 2px;
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
