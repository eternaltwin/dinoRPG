import MarkdownIt from 'markdown-it';
import { defineComponent, h } from 'vue';

// Same defaults as the former vue3-markdown-it component: no raw HTML unless asked, no linkify, no typographer.
const renderers = {
	text: new MarkdownIt({ html: false }),
	html: new MarkdownIt({ html: true })
};

const Markdown = defineComponent({
	name: 'Markdown',
	props: {
		source: { type: String, default: '' },
		html: { type: Boolean, default: false }
	},
	setup(props) {
		return () => h('div', { innerHTML: (props.html ? renderers.html : renderers.text).render(props.source ?? '') });
	}
});

export default Markdown;
