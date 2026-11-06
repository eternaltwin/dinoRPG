<template>
	<img v-if="src" :src="src" :width="size" :height="size" class="dinoz-icon" draggable="false" alt="" />
	<span v-else class="dinoz-icon placeholder" :style="{ width: `${size}px`, height: `${size}px` }" />
</template>

<script lang="ts">
const cache = new Map<string, string>();
const inFlight = new Map<string, Promise<string | null>>();

// Canvas the renderer needs to draw a whole dinoz at scale 1
const RENDER_WIDTH = 190;
const RENDER_HEIGHT = 165;

/** Crops a render to its opaque pixels, so that any race fills the icon. */
function trimToContent(source: string): Promise<string> {
	return new Promise(resolve => {
		const image = new Image();
		image.onerror = () => resolve(source);
		image.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;
			const context = canvas.getContext('2d', { willReadFrequently: true });
			if (!context) return resolve(source);
			context.drawImage(image, 0, 0);
			const { data, width, height } = context.getImageData(0, 0, image.width, image.height);
			let [left, top, right, bottom] = [width, height, -1, -1];
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					if (data[(y * width + x) * 4 + 3] === 0) continue;
					left = Math.min(left, x);
					right = Math.max(right, x);
					top = Math.min(top, y);
					bottom = Math.max(bottom, y);
				}
			}
			if (right < 0) return resolve(source);
			const trimmed = document.createElement('canvas');
			trimmed.width = right - left + 1;
			trimmed.height = bottom - top + 1;
			trimmed.getContext('2d')?.drawImage(canvas, -left, -top);
			resolve(trimmed.toDataURL());
		};
		image.src = source;
	});
}
</script>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { dino } from '@eternaltwin/dinorpg_animations';

const props = defineProps<{ display: string; size: number }>();
const src = ref<string | undefined>();

function renderImage(display: string): Promise<string | null> {
	let promise = inFlight.get(display);
	if (!promise) {
		promise = new Promise<string | null>(resolve => {
			try {
				const d = new dino({
					data: display,
					flip: false,
					damages: 0,
					dark: false,
					scale: 1,
					shadow: false,
					congel: false
				});
				d.toRawImage(
					value => {
						void trimToContent(value).then(trimmed => {
							cache.set(display, trimmed);
							resolve(trimmed);
						});
					},
					RENDER_WIDTH,
					RENDER_HEIGHT
				);
			} catch {
				resolve(null);
			}
		}).finally(() => inFlight.delete(display));
		inFlight.set(display, promise);
	}
	return promise;
}

async function render() {
	const display = props.display;
	const cached = cache.get(display);
	if (cached) {
		src.value = cached;
		return;
	}
	const value = await renderImage(display);
	// The piece may show another dinoz by now
	if (value && display === props.display) src.value = value;
}

onMounted(render);
watch(() => props.display, render);
</script>

<style lang="scss" scoped>
.dinoz-icon {
	display: block;
	object-fit: contain;
	max-width: 100%;
	max-height: 100%;
}
</style>
