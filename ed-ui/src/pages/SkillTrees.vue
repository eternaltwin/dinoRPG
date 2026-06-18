<script setup lang="ts">
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import DZButton from '../components/common/DZButton.vue';
import DZCheckbox from '../components/common/DZCheckbox.vue';
import DZInput from '../components/common/DZInput.vue';
import SkillTree from '../components/dinoz/SkillTree.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { DinozService } from '../services';
import { DinozBuildService } from '../services/DinozBuildService';
import { playerStore } from '../store';
import DZSelect from '../components/common/DZSelect.vue';
import { GetOwnDinozBuildResponse } from '@drpg/core/returnTypes/DinozBuild';
import { errorHandler } from '../utils';

// Utils
const store = playerStore();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();
const route = useRoute();

// State
const dinoz = ref<DinozFiche | undefined>(undefined);
const buildMode = ref(false);
const ownBuilds = ref<GetOwnDinozBuildResponse>([]);
const buildId = ref<string>();
const buildName = ref('');
const shareableBuild = ref(false);
const buildSkills = ref<Record<ElementType, Skill[]>>({
	[ElementType.FIRE]: [],
	[ElementType.WOOD]: [],
	[ElementType.WATER]: [],
	[ElementType.LIGHTNING]: [],
	[ElementType.AIR]: [],
	[ElementType.VOID]: []
});

const allSelectedSkills = computed(() => Object.values(buildSkills.value).flat());

const init = async () => {
	if (route.params.id) {
		const dinozId = +route.params.id;
		if (isNaN(dinozId)) {
			toast.open({
				message: t(`toast.unknownDinoz`),
				type: 'error'
			});
			router.back();
			return;
		}
		dinoz.value = await DinozService.getDinozFiche(dinozId);
		if (dinoz.value.build) {
			buildSkills.value = {
				[ElementType.FIRE]: [],
				[ElementType.WOOD]: [],
				[ElementType.WATER]: [],
				[ElementType.LIGHTNING]: [],
				[ElementType.AIR]: [],
				[ElementType.VOID]: []
			};
			dinoz.value.build.skills.forEach(skill => {
				buildSkills.value[skillList[skill as Skill].element[0]].push(skill);
			});
		}
	} else {
		dinoz.value = undefined;
	}
};

const resetBuild = () => {
	buildId.value = undefined;
	buildName.value = '';
	shareableBuild.value = false;
	buildSkills.value = {
		[ElementType.FIRE]: [],
		[ElementType.WOOD]: [],
		[ElementType.WATER]: [],
		[ElementType.LIGHTNING]: [],
		[ElementType.AIR]: [],
		[ElementType.VOID]: []
	};

	if (dinoz.value && dinoz.value.build) {
		dinoz.value.build.skills.forEach(skill => {
			buildSkills.value[skillList[skill as Skill].element[0]].push(skill);
		});
	}
};

const selectBuildToEdit = async () => {
	if (!buildId.value) return;

	const build = ownBuilds.value.find(b => b.id === buildId.value);
	if (!build) return;

	buildName.value = build.name;
	shareableBuild.value = build.shareable;

	// Load skills into buildSkills
	const skillsByType: Record<ElementType, Skill[]> = {
		[ElementType.FIRE]: [],
		[ElementType.WOOD]: [],
		[ElementType.WATER]: [],
		[ElementType.LIGHTNING]: [],
		[ElementType.AIR]: [],
		[ElementType.VOID]: []
	};

	build.skills.forEach(skill => {
		skillsByType[skillList[skill as Skill].element[0]].push(skill);
	});

	buildSkills.value = skillsByType;
};

const saveBuild = async () => {
	if (!store.playerId || !buildName.value || !allSelectedSkills.value.length) return;

	try {
		if (buildId.value) {
			await DinozBuildService.updateBuild(
				buildId.value,
				allSelectedSkills.value,
				buildName.value,
				shareableBuild.value
			);

			// Update ownBuilds
			ownBuilds.value = ownBuilds.value.map(b =>
				b.id === buildId.value
					? {
							...b,
							name: buildName.value,
							skills: allSelectedSkills.value,
							shareable: shareableBuild.value
						}
					: b
			);
		} else {
			const newBuild = await DinozBuildService.createBuild(
				allSelectedSkills.value,
				buildName.value,
				shareableBuild.value
			);

			// Add to ownBuilds
			ownBuilds.value.push({
				id: newBuild.id,
				playerId: store.playerId,
				name: buildName.value,
				skills: allSelectedSkills.value,
				shareable: shareableBuild.value
			});
		}

		toast.open({
			message: t(`toast.buildSaved`, { name: buildName.value }),
			type: 'success'
		});

		// Reset build mode
		buildMode.value = false;
		resetBuild();
	} catch (error) {
		toast.open({
			message: t(`toast.buildSaveError`),
			type: 'error'
		});
	}
};

const deleteBuild = async () => {
	if (!buildId.value) return;

	try {
		await DinozBuildService.deleteBuild(buildId.value);

		// Remove from ownBuilds
		ownBuilds.value = ownBuilds.value.filter(b => b.id !== buildId.value);

		toast.open({
			message: t(`toast.buildDeleted`, { name: buildName.value }),
			type: 'success'
		});

		if (dinoz.value?.build?.id === buildId.value) {
			dinoz.value = {
				...dinoz.value,
				build: undefined
			};
		}

		// Reset build mode
		buildMode.value = false;
		resetBuild();
	} catch (error) {
		errorHandler.handle(error, toast);
	}
};

// Lifecycle hooks
onMounted(async () => {
	// Redirect to last page if no PAC
	if (!store.playerOptions.hasPAC) {
		toast.open({
			message: t(`toast.noPAC`),
			type: 'error'
		});
		router.back();
		return;
	}

	await init();

	// Fetch own builds
	try {
		ownBuilds.value = await DinozBuildService.getOwn();
	} catch (error) {
		errorHandler.handle(error, toast);
	}
});

// Watch for changes in the route params
watch(
	() => route.params.id,
	async (newId, oldId) => {
		if (newId !== oldId) {
			await init();
		}
	}
);

// Watch for exiting build mode to reset build data
watch(buildMode, newValue => {
	if (!newValue) {
		resetBuild();
	}
});
</script>

<template>
	<TitleHeader :title="$t('pageTitle.skillTrees')" :header="$t(`skillTrees.title`)" />
	<div class="dz-golden-box builds">
		<DZCheckbox id="buildMode" v-model="buildMode" class="build-mode-checkbox">
			{{ $t('skillTrees.manageBuilds') }}
		</DZCheckbox>
		<div v-if="buildMode" class="build-form">
			<DZSelect
				v-if="ownBuilds.length"
				id="build-edit"
				:options="ownBuilds.map(build => ({ label: build.name, value: build.id }))"
				:placeholder="$t('skillTrees.buildToEdit')"
				v-model="buildId"
				@change="selectBuildToEdit"
			/>
			<DZInput :placeholder="$t('skillTrees.buildName')" v-model="buildName" class="build-name-input" />
			<DZCheckbox id="shareableBuild" v-model="shareableBuild" class="build-mode-checkbox">
				{{ $t('skillTrees.shareable') }}
			</DZCheckbox>
			<div class="df g8">
				<DZButton @click="saveBuild" :off="!buildName || !allSelectedSkills.length">
					{{ $t('skillTrees.save') }}
				</DZButton>
				<DZButton v-if="buildId" @click="deleteBuild">
					<img :src="getImgURL('icons', 'small_delete')" alt="delete" />
					{{ $t('skillTrees.delete') }}
				</DZButton>
			</div>
		</div>
	</div>
	<SkillTree
		:type="ElementType.FIRE"
		:dinoz="dinoz"
		:selectable="buildMode"
		v-model:buildSkills="buildSkills[ElementType.FIRE]"
	/>
	<SkillTree
		:type="ElementType.WOOD"
		:dinoz="dinoz"
		:selectable="buildMode"
		v-model:buildSkills="buildSkills[ElementType.WOOD]"
	/>
	<SkillTree
		:type="ElementType.WATER"
		:dinoz="dinoz"
		:selectable="buildMode"
		v-model:buildSkills="buildSkills[ElementType.WATER]"
	/>
	<SkillTree
		:type="ElementType.LIGHTNING"
		:dinoz="dinoz"
		:selectable="buildMode"
		v-model:buildSkills="buildSkills[ElementType.LIGHTNING]"
	/>
	<SkillTree
		:type="ElementType.AIR"
		:dinoz="dinoz"
		:selectable="buildMode"
		v-model:buildSkills="buildSkills[ElementType.AIR]"
	/>
</template>

<style lang="scss" scoped>
.builds {
	padding: 8px;
	line-height: 0;
}

.build-form {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 8px;
	margin-top: 8px;
}
</style>
