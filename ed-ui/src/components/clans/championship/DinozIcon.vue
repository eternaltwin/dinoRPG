<template>
	<img v-if="src" :src="src" :width="size" :height="size" class="dinoz-icon" draggable="false" alt="" />
	<span v-else class="dinoz-icon placeholder" :style="{ width: `${size}px`, height: `${size}px` }" />
</template>

<script lang="ts">
const cache = new Map<string, string>();
const inFlight = new Map<string, Promise<string | null>>();
</script>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { dino } from '@eternaltwin/dinorpg_animations';

const props = defineProps<{ display: string; size: number }>();
const src = ref<string | undefined>();

function renderImage(key: string): Promise<string | null> {
	let promise = inFlight.get(key);
	if (!promise) {
		promise = new Promise<string | null>(resolve => {
			try {
				const d = new dino({
					data: props.display,
					flip: false,
					damages: 0,
					dark: false,
					scale: 1,
					shadow: false,
					congel: false
				});
				d.toRawImage(
					value => {
						cache.set(key, value);
						resolve(value);
					},
					props.size,
					props.size
				);
			} catch {
				resolve(null);
			}
		}).finally(() => inFlight.delete(key));
		inFlight.set(key, promise);
	}
	return promise;
}

async function render() {
	const key = `${props.display}|${props.size}`;
	const cached = cache.get(key);
	if (cached) {
		src.value = cached;
		return;
	}
	const value = await renderImage(key);
	if (value && key === `${props.display}|${props.size}`) src.value = value;
}

onMounted(render);
watch(() => [props.display, props.size], render);
</script>

<style lang="scss" scoped>
.dinoz-icon {
	display: block;
	object-fit: contain;
	max-width: 100%;
	max-height: 100%;
}
</style>
