<script setup lang="ts">
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { onMounted, ref } from 'vue';
import SkillTree from '../components/dinoz/SkillTree.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { DinozService } from '../services';

// State
const dinoz = ref<DinozFiche | undefined>(undefined);

// Lifecycle hooks
onMounted(async () => {
	dinoz.value = await DinozService.getDinozFiche(8);
});
</script>

<template>
	<TitleHeader :title="$t('pageTitle.skillTrees')" :header="$t(`skillTrees.title`)" />
	<!-- <SkillTree v-if="dinoz" :type="ElementType.AIR" :dinoz="dinoz" /> -->
	<SkillTree :type="ElementType.FIRE" />
	<SkillTree :type="ElementType.WOOD" />
	<SkillTree :type="ElementType.WATER" />
	<SkillTree :type="ElementType.LIGHTNING" />
	<SkillTree :type="ElementType.AIR" />
</template>

<style lang="scss" scoped></style>
