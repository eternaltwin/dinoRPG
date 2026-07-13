<script setup lang="ts">
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { ListClanSharedBuildsResponse } from '@drpg/core/returnTypes/DinozBuild';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import { DinozBuildService } from '../../services/DinozBuildService';
import { playerStore } from '../../store';
import { errorHandler } from '../../utils';
import DZSelect from '../common/DZSelect.vue';
import SkillTree from '../dinoz/SkillTree.vue';
import TitleHeader from '../utils/TitleHeader.vue';
import DZButton from '../common/DZButton.vue';

// Utils
const store = playerStore();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

// State
const buildId = ref<string>();
const builds = ref<ListClanSharedBuildsResponse>([]);

const build = computed(() => {
	if (!buildId.value) return undefined;
	return builds.value.find(b => b.id === buildId.value);
});

const copyBuild = async () => {
	if (!buildId.value) return;

	try {
		await DinozBuildService.copySharedBuild(buildId.value);
		toast.open({
			message: t(`toast.buildCopied`, { name: build.value?.name }),
			type: 'success'
		});
	} catch (error) {
		errorHandler.handle(error, toast);
		return;
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

	// Fetch clan builds
	try {
		builds.value = await DinozBuildService.listClanSharedBuilds();
	} catch (error) {
		errorHandler.handle(error, toast);
	}
});
</script>

<template>
	<TitleHeader :header="$t(builds.length ? 'clan.tabs.builds' : 'clanBuilds.noBuilds')" />
	<div class="container">
		<div class="actions df aic g8">
			<DZSelect
				v-if="builds.length"
				id="build-edit"
				:options="builds.map(build => ({ label: `[${build.player.name}] ${build.name}`, value: build.id }))"
				v-model="buildId"
			/>
			<DZButton v-if="buildId" @click="copyBuild">
				{{ $t('clanBuilds.copyBuild') }}
			</DZButton>
		</div>
		<div v-if="build">
			<SkillTree :type="ElementType.FIRE" :buildSkills="build?.skills" />
			<SkillTree :type="ElementType.WOOD" :buildSkills="build?.skills" />
			<SkillTree :type="ElementType.WATER" :buildSkills="build?.skills" />
			<SkillTree :type="ElementType.LIGHTNING" :buildSkills="build?.skills" />
			<SkillTree :type="ElementType.AIR" :buildSkills="build?.skills" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.container {
	padding: 8px;
}
</style>
