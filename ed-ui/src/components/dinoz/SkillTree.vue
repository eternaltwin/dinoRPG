<script setup lang="ts">
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { SkillTreeType } from '@drpg/core/models/enums/SkillTreeType';
import { onMounted, Ref, ref, watch } from 'vue';
import SkillTooltip from './SkillTooltip.vue';
import { playerStore } from '../../store/playerStore';
import { StorePlayer } from '@drpg/core/models/store/StorePlayer';

type DisplayedSkill = SkillDetails & {
	rowspan: number;
	discovered: boolean;
	learned: boolean;
};

type Tree = DisplayedSkill[][];

const buildTree = (
	store: StorePlayer,
	tree: Tree,
	row: number,
	column: number,
	parents: DisplayedSkill[],
	maxLevel: Ref<number>,
	dinoz?: Pick<DinozFiche, 'skills'>
) => {
	const skill = parents[parents.length - 1];

	const children = Object.values(skillList).filter(
		s => !s.isSphereSkill && s.unlockedFrom?.length === 1 && s.unlockedFrom?.includes(skill.id)
	);

	let rowspan = 0;
	children.forEach((child, index) => {
		let targetRow = row + index;

		while (tree[targetRow]?.length > column + 1) {
			// If the row is already occupied, move down
			targetRow++;
		}

		if (!tree[targetRow]) {
			// If the row doesn't exist, create it
			tree[targetRow] = [];
		}

		const childSkill: DisplayedSkill = {
			...child,
			rowspan: 1,
			discovered: store.discoveredSkills.includes(child.id),
			learned: dinoz?.skills.some(s => s.skillId === child.id) || false
		};

		// Add skill to the tree
		tree[targetRow][column + 1] = childSkill;

		if (maxLevel.value < column + 2) {
			maxLevel.value = column + 2; // Update max level if needed
		}

		// Recursively build the tree for the child skill
		if (childSkill.discovered) {
			buildTree(store, tree, targetRow, column + 1, [...parents, childSkill], maxLevel, dinoz);
		}

		rowspan += childSkill.rowspan;
	});

	// Update rowspan for the parent skill
	if (rowspan > 1) {
		skill.rowspan = rowspan;
	}
};

// Props
const props = withDefaults(
	defineProps<{
		dinoz?: Pick<DinozFiche, 'skills'>;
		type: ElementType;
		treeType?: SkillTreeType;
	}>(),
	{
		treeType: SkillTreeType.VANILLA
	}
);

// State
const tree = ref<Tree>([]);
const maxLevel = ref(1);
const store = playerStore();

const init = () => {
	tree.value = [];
	maxLevel.value = 1;

	const baseSkills = Object.values(skillList).filter(
		skill =>
			skill.tree === props.treeType &&
			!skill.isSphereSkill &&
			skill.element.some(el => el === props.type) &&
			!skill.unlockedFrom?.length
	);

	baseSkills.forEach(skill => {
		const displayedSkill: DisplayedSkill = {
			...skill,
			rowspan: 1,
			discovered: store.discoveredSkills.includes(skill.id),
			learned: props.dinoz?.skills.some(s => s.skillId === skill.id) || false
		};

		tree.value.push([displayedSkill]);

		if (displayedSkill.discovered) {
			buildTree(store, tree.value, tree.value.length - 1, 0, [displayedSkill], maxLevel, props.dinoz);
		}
	});

	// Filter empty cells
	tree.value = tree.value.map(row => row.filter(skill => skill));
};

// Hooks
onMounted(init);

watch(props, init, { deep: true });
</script>

<template>
	<div :class="`skill-tree-wrapper element-${props.type}`">
		<p class="element">
			<img
				:src="getImgURL('elements', `elem_${ElementType[props.type].toLowerCase()}`)"
				:alt="ElementType[props.type]"
			/>
		</p>
		<table>
			<thead>
				<tr>
					<th v-for="i in maxLevel" :key="i" :colspan="1">
						{{ $t('skillTrees.level', { level: i }) }}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(row, rowIndex) in tree" :key="rowIndex">
					<td
						v-for="skill in row"
						:key="skill.id"
						:rowspan="skill.rowspan || 1"
						:class="{ learned: skill.learned, base: !skill.unlockedFrom?.length }"
					>
						<SkillTooltip v-if="skill.discovered" :skill="skill.id">
							{{ $t(`skill.name.${skill.name}`) }}
						</SkillTooltip>
						<Tippy theme="normal" v-else>
							???
							<template #content>
								<h1 v-html="$t('skill.unknown')" />
								<p v-html="$t('skill.unknownDesc')" />
							</template>
						</Tippy>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style lang="scss" scoped>
.skill-tree-wrapper {
	overflow-x: auto;
	margin: 8px;
	padding: 10px;
	padding-top: 0;

	&.element-1 {
		background-color: #d83a2f;
	}

	&.element-2 {
		background-color: #af7d5d;
	}

	&.element-3 {
		background-color: #4ea0e2;

		.element {
			color: white;
		}
	}

	&.element-4 {
		background-color: #faf24e;
	}

	&.element-5 {
		background-color: #a9d7e8;
	}

	.element {
		font-variant: small-caps;
		font-weight: bold;
		font-size: 8pt;
		color: #fbdca5;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2px;

		img {
			width: 16px;
		}
	}

	table {
		width: 100%;
		border-collapse: collapse;
		background-color: #e0b785;
		border: 3px solid #793f1f;

		tr {
			background-color: #e0b785;

			th {
				border: 3px solid #793f1f;
				background-color: #793f1f;
				text-align: center;
				color: #e0b785;
				font-variant: small-caps;
				font-weight: bold;
				font-size: 8pt;
				padding: 2px;
			}

			td {
				border: 3px solid #793f1f;
				text-align: center;
				color: #793f1f;
				font-variant: small-caps;
				font-weight: bold;
				font-size: 8pt;
				padding: 2px;

				&.learned {
					background-color: #d39f63;
				}

				&:not(.base) {
					position: relative;

					&::before {
						content: '';
						position: absolute;
						left: -5px;
						top: 50%;
						transform: translateY(-50%);
						width: 8px;
						border-top: 3px solid #793f1f;
					}
				}
			}
		}
	}
}
</style>
