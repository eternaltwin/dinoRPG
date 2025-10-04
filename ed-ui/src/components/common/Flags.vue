<template>
	<Flag v-for="lang of langs" :key="lang" :lang="lang" class="flag" />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Flag from './Flag.vue';

export default defineComponent({
	name: 'Flags',
	components: { Flag },
	props: {
		langs: {
			type: Array<string>
		}
	}
});
</script>

<style scoped lang="scss">
.flag {
	margin-right: 4px;
	&:last-child {
		margin-right: 0;
	}
}
</style>
