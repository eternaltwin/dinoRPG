<template>
	<div id="centerContent" class="newsSection">
		<div class="section">
			<div id="titleActualiteDinoland">
				<p>{{ $t(`news.actualites`) }}</p>
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
