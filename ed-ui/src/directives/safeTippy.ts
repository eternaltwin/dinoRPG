import type { DirectiveBinding, ObjectDirective } from 'vue';
import { directive } from 'vue-tippy';
import { sanitizeHtml } from '../utils/sanitizeHtml.js';

// vue-tippy declares a generic Directive, its implementation is an object directive
const tippyDirective = directive as ObjectDirective;

type TippyBinding = DirectiveBinding<string | { content?: unknown } | undefined>;

/** Sanitizes the tooltip content: tooltips render HTML (`allowHTML`) and some show player values. */
function sanitizeBinding(binding: TippyBinding): TippyBinding {
	const value = binding.value;
	if (typeof value === 'string') {
		return { ...binding, value: sanitizeHtml(value) };
	}
	if (value && typeof value.content === 'string') {
		return { ...binding, value: { ...value, content: sanitizeHtml(value.content) } };
	}
	return binding;
}

/** vue-tippy's `v-tippy` directive, with its content sanitized. */
export const safeTippy: ObjectDirective = {
	mounted(el, binding, vnode, prevVnode) {
		tippyDirective.mounted?.(el, sanitizeBinding(binding as TippyBinding), vnode, prevVnode);
	},
	updated(el, binding, vnode, prevVnode) {
		tippyDirective.updated?.(el, sanitizeBinding(binding as TippyBinding), vnode, prevVnode);
	},
	unmounted(el, binding, vnode, prevVnode) {
		tippyDirective.unmounted?.(el, binding, vnode, prevVnode);
	}
};
