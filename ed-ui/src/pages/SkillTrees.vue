<script setup lang="ts">
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { getCurrentInstance, onMounted, ref, watch } from 'vue';
import SkillTree from '../components/dinoz/SkillTree.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { DinozService } from '../services';
import { playerStore } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { formatText } from '..//utils/formatText';
import DZCheckbox from '../components/common/DZCheckbox.vue';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import DZInput from '../components/common/DZInput.vue';
import DZButton from '../components/common/DZButton.vue';
import { DinozBuildService } from '../services/DinozBuildService';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';

// State
const dinoz = ref<DinozFiche | undefined>(undefined);
const store = playerStore();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();
const instance = getCurrentInstance();
const route = useRoute();
const buildMode = ref(false);
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

const init = async () => {
	if (route.params.id) {
		const dinozId = +route.params.id;
		if (isNaN(dinozId)) {
			instance?.proxy?.$toast.open({
				message: formatText(instance?.proxy?.$t(`toast.unknownDinoz`)),
				type: 'error'
			});
			router.back();
			return;
		}
		dinoz.value = await DinozService.getDinozFiche(dinozId);
	} else {
		dinoz.value = undefined;
	}
};

const saveBuild = async () => {
	const allSelectedSkills = Object.values(buildSkills.value).flat();

	try {
		await DinozBuildService.createBuild(allSelectedSkills, buildName.value, shareableBuild.value);
		toast.open({
			message: formatText(t(`toast.buildSaved`)),
			type: 'success'
		});
		// Reset build mode
		buildMode.value = false;
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
	} catch (error) {
		toast.open({
			message: formatText(t(`toast.buildSaveError`)),
			type: 'error'
		});
	}
};

// Lifecycle hooks
onMounted(async () => {
	// Redirect to last page if no PAC
	if (!store.playerOptions.hasPAC) {
		instance?.proxy?.$toast.open({
			message: formatText(instance?.proxy?.$t(`toast.noPAC`)),
			type: 'error'
		});
		router.back();
		return;
	}

	await init();
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
</script>

<template>
	<TitleHeader :title="$t('pageTitle.skillTrees')" :header="$t(`skillTrees.title`)" />
	<DZCheckbox id="buildMode" v-model="buildMode" class="build-mode-checkbox">
		{{ $t('skillTrees.buildMode') }}
	</DZCheckbox>
	<div v-if="buildMode" class="build-form">
		<DZInput :placeholder="$t('skillTrees.buildName')" v-model="buildName" class="build-name-input" />
		<DZCheckbox id="shareableBuild" v-model="shareableBuild" class="build-mode-checkbox">
			{{ $t('skillTrees.shareable') }}
		</DZCheckbox>
		<DZButton @click="saveBuild">{{ $t('skillTrees.save') }}</DZButton>
	</div>
	<SkillTree
		:type="ElementType.FIRE"
		:dinoz="dinoz"
		:selectable="buildMode"
		v-model:modelValue="buildSkills[ElementType.FIRE]"
	/>
	<SkillTree
		:type="ElementType.WOOD"
		:dinoz="dinoz"
		:selectable="buildMode"
		v-model:modelValue="buildSkills[ElementType.WOOD]"
	/>
	<SkillTree
		:type="ElementType.WATER"
		:dinoz="dinoz"
		:selectable="buildMode"
		v-model:modelValue="buildSkills[ElementType.WATER]"
	/>
	<SkillTree
		:type="ElementType.LIGHTNING"
		:dinoz="dinoz"
		:selectable="buildMode"
		v-model:modelValue="buildSkills[ElementType.LIGHTNING]"
	/>
	<SkillTree
		:type="ElementType.AIR"
		:dinoz="dinoz"
		:selectable="buildMode"
		v-model:modelValue="buildSkills[ElementType.AIR]"
	/>
</template>

<style lang="scss" scoped>
.build-mode-checkbox {
	margin-left: 8px;
	color: #bc683c;
}

.build-form {
	display: flex;
	align-items: center;
	gap: 8px;
	margin: 8px;
}
</style>
