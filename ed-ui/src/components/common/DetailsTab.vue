<template>
	<div class="details">
		<table>
			<tbody>
				<tr>
					<th class="name">{{ $t('details.th.comp') }}</th>
					<th class="type">{{ $t('details.th.type') }}</th>
					<th class="state" v-if="hasAmulst()">
						{{ $t('details.th.active') }}
					</th>
				</tr>
				<tr
					v-for="skill in dinozSkill"
					:key="skill.skillId"
					:class="skill.state === false ? 'disabled' : ''"
				>
					<td class="name">
						<Tippy theme="normal">
							<img
								v-for="(element, index) in skill.element"
								:key="index"
								:src="getImg('elements', 'elem_', element)"
							/>
							<p>{{ $t(`skill.name.${skillNameList[skill.skillId]}`) }}</p>
							<template #content>
								<h1
									v-html="
										formatContent(
											$t(`skill.name.${skillNameList[skill.skillId]}`)
										)
									"
								/>
								<p
									v-html="
										formatContent(
											$t(`skill.description.${skillNameList[skill.skillId]}`)
										)
									"
								/>
								<h3
									v-html="formatContent($t(`skill.energy.${skill.energy}`))"
								/>
							</template>
						</Tippy>
					</td>
					<td class="type">
						<Tippy theme="normal">
							{{ skill.type }}
							<template #content>
								<h1
									v-html="formatContent($t(`details.type.name.${skill.type}`))"
								/>
								<p
									v-html="
										formatContent($t(`details.type.description.${skill.type}`))
									"
								/>
							</template>
						</Tippy>
					</td>
					<template v-if="hasAmulst()">
						<td class="state">
							<img
								:src="getImg('icons', 'small_skill_', skill.state)"
								v-if="skill.activatable"
								@click="changeState(skill)"
								v-tippy="{
									content: formatContent($t(`details.activate.${skill.state}`)),
									theme: 'small'
								}"
							/>
							<img
								v-else
								src="@/assets/icons/small_skill_inactive.webp"
								v-tippy="{
									content: formatContent($t(`details.activate.locked`)),
									theme: 'small'
								}"
							/>
						</td>
					</template>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts" scoped>
import { defineComponent, PropType } from 'vue';
import { statusList, skillNameList } from '@/constants';
import { Dinoz, Skill } from '@/models';
import { DinozService } from '@/services';
import { errorHandler } from '@/utils';
import EventBus from '@/events';

export default defineComponent({
	name: 'DetailsTab',
	props: { dinozData: Object as PropType<Dinoz> },
	data() {
		return {
			dinozSkill: [] as Array<Skill>,
			skillNameList: skillNameList
		};
	},
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.webp`);
		},
		async changeState(skill: Skill): Promise<void> {
			const dinozId = this.$route.params.id as string;
			EventBus.emit('isLoading', true);
			try {
				await DinozService.setSkillState(dinozId, skill.skillId, !skill.state);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}

			skill.state = !skill.state;
		},
		hasAmulst(): boolean {
			return this.dinozData!.statusList.includes(statusList.id.amulst);
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		try {
			const dinozId = this.$route.params.id as string;
			this.dinozSkill = await DinozService.getDinozSkill(dinozId);
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.details {
	margin: 5px;
	table {
		width: 100%;
		margin-top: 10px;
		margin-bottom: 5px;
		margin-bottom: 10px;
		border: 2px solid #bc683c;
		background-color: #ecbd84;
		border-collapse: separate;
		border-spacing: 1px;
		tr {
			display: table-row;
			th {
				font-size: 8pt;
				letter-spacing: 0pt;
				text-shadow: 1px 1px 0px #356847;
				padding-left: 4px;
				padding-right: 4px;
				padding-bottom: 8px;
				height: 41px;
				vertical-align: bottom;
				color: #fffdba;
				text-transform: uppercase;
				font-weight: bold;
				letter-spacing: 1pt;
				text-align: left;
				white-space: nowrap;
				border: 1px solid #356847;
				background-color: #c64e36;
				background-image: url('~@/assets/background/table_header.gif');
				background-position: left bottom;
				max-width: 222px;
				&.name {
					width: 200px;
				}
				&.type {
					max-width: 15px;
				}
				&.state {
					max-width: 15px;
				}
			}
			td {
				font-size: 9pt;
				padding-right: 5px;
				padding-top: 1px;
				padding-bottom: 1px;
				color: #710;
				background-color: #f3ca92;
				border: 1px solid #c88f44;
				&.name {
					background-image: url('~@/assets/background/table_cell.gif');
					background-position: 0px 0px;
					padding-left: 15px;
					max-width: 222px;
					p {
						padding-top: 4px;
					}
					img {
						float: left;
						position: relative;
						margin-right: 5px;
						vertical-align: bottom;
					}
				}
				&.type {
					font-weight: bold;
					text-align: center;
					color: #bc683c;
					background-image: url('~@/assets/background/table_cell.gif');
					background-position: -10px 0px;
					max-width: 4px;
				}
				&.state {
					vertical-align: top;
					max-width: 40px;
					img {
						float: left;
						position: relative;
						left: 17px;
						top: 5px;
						cursor: help;
					}
					background-image: url('~@/assets/background/table_cell.gif');
					background-position: -10px 0px;
				}
			}
		}
		.disabled {
			td {
				opacity: 0.4;
				zoom: 1;
				&.state {
					background-color: red;
					background-image: none;
					opacity: 1;
				}
			}
		}
	}
}
</style>
