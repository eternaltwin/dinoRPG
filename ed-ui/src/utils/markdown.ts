import MarkdownModule from 'vue3-markdown-it';

// vue3-markdown-it is a CommonJS bundle that only exports `default`. Since Vite 8, a default import of such a
// bundle from a `"type": "module"` package yields the whole exports object (Node semantics), so unwrap it.
const Markdown = (MarkdownModule as unknown as { default?: typeof MarkdownModule }).default ?? MarkdownModule;

export default Markdown;
