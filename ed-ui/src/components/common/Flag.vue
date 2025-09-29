<template>
	<img :src="getImgURL('design', `lang_${lang}`)" class="flag" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Flag',
	props: {
		lang: {
			type: String
		}
	}
});
</script>

<style scoped lang="scss"></style>
