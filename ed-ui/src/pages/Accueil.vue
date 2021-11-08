<template>
	<div id="centerContent" class="newsSection">
		<div class="section">
			<div class="titlePage">
				<h3>{{ $t(`news.actualites`) }}</h3>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Accueil'
});
</script>

<style lang="scss" scoped></style>
