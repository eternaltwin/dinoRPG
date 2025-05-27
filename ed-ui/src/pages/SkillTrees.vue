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

// State
const dinoz = ref<DinozFiche | undefined>(undefined);
const store = playerStore();
const router = useRouter();
const instance = getCurrentInstance();
const route = useRoute();

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
	<SkillTree :type="ElementType.FIRE" :dinoz="dinoz" />
	<SkillTree :type="ElementType.WOOD" :dinoz="dinoz" />
	<SkillTree :type="ElementType.WATER" :dinoz="dinoz" />
	<SkillTree :type="ElementType.LIGHTNING" :dinoz="dinoz" />
	<SkillTree :type="ElementType.AIR" :dinoz="dinoz" />
</template>

<style lang="scss" scoped></style>
