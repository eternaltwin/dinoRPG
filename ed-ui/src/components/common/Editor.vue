<template>
	<Ckeditor v-model="data" :editor="ClassicEditor" :config="config" />
</template>

<script setup>
import { Ckeditor } from '@ckeditor/ckeditor5-vue';
import {
	BlockQuote,
	Bold,
	ClassicEditor,
	CodeBlock,
	Essentials,
	Heading,
	Image,
	Italic,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	Table
} from 'ckeditor5';
import { computed, ref, watch } from 'vue';

import 'ckeditor5/ckeditor5.css';

// Props and emits for v-model
const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const data = ref('');

// Watch for changes in the editor content and emit updates
watch(data, newValue => {
	emit('update:modelValue', newValue);
});

// Sync initial value from parent
watch(
	() => props.modelValue,
	newValue => {
		data.value = newValue;
	}
);

const config = computed(() => {
	return {
		licenseKey: 'GPL',
		plugins: [
			Essentials,
			Paragraph,
			Bold,
			Italic,
			Heading,
			Link,
			List,
			Table,
			BlockQuote,
			Image,
			MediaEmbed,
			CodeBlock
		],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'|',
			'bulletedList',
			'numberedList',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		]
	};
});

// Expose methods to parent components
defineExpose({
	setContent(content) {
		data.value = content;
	},
	getContent() {
		return data.value;
	}
});
</script>
