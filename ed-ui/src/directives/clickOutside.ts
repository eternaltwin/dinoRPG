import { DirectiveBinding } from 'vue';

interface ClickOutsideElement extends HTMLElement {
	clickOutsideEvent?: (event: MouseEvent) => void;
}

const clickOutside = {
	mounted(el: ClickOutsideElement, binding: DirectiveBinding) {
		// Ajout de la vérification si binding.value est une fonction
		el.clickOutsideEvent = function (event: MouseEvent) {
			if (!(el === event.target || el.contains(event.target as Node))) {
				if (typeof binding.value === 'function') {
					// Si c'est une fonction, on l'exécute
					binding.value(event);
				} else {
					console.error('v-click-outside requires a function as a value');
				}
			}
		};
		document.addEventListener('click', el.clickOutsideEvent);
	},
	unmounted(el: ClickOutsideElement) {
		document.removeEventListener('click', el.clickOutsideEvent as EventListener);
	}
};

export default clickOutside;
