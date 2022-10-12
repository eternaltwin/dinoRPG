<template>
	<component :is="NPCToDisplay" :key="NPC" v-if="NPC !== undefined"></component>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';

export default defineComponent({
	name: "AnimatedNPC",
	props: {
		NPC: String
	},
	computed: {
		NPCToDisplay(): string {
			return defineAsyncComponent(() => import(`@/components/NPC/${this.NPC}.vue`))
		}
	}
});
</script>

<style lang="scss" scoped>
</style>