import { createVNode, render, reactive, App } from 'vue';
import confirmDialog from '../components/utils/confirmDialog.vue';

export interface ConfirmOptions {
	message: string;
	header?: string;
	icon?: string;
	acceptLabel?: string;
	rejectLabel?: string;
}

interface ConfirmationState extends ConfirmOptions {
	visible: boolean;
	acceptCallback: (() => void) | null;
	rejectCallback: (() => void) | null;
}

const confirmationState: ConfirmationState = reactive({
	visible: false,
	message: '',
	header: '',
	icon: 'pi pi-exclamation-triangle',
	acceptLabel: 'Oui',
	rejectLabel: 'Non',
	acceptCallback: null,
	rejectCallback: null
});

const confirm = (options: ConfirmOptions): Promise<boolean> => {
	return new Promise((resolve: (value: boolean) => void, reject: (reason: boolean) => void) => {
		confirmationState.message = options.message;
		confirmationState.header = options.header ?? 'Confirmation';
		confirmationState.icon = options.icon ?? 'pi pi-exclamation-triangle';
		confirmationState.acceptLabel = options.acceptLabel ?? 'Oui';
		confirmationState.rejectLabel = options.rejectLabel ?? 'Non';

		confirmationState.acceptCallback = () => {
			closeDialog();
			resolve(true); // Résoudre la Promesse
		};
		confirmationState.rejectCallback = () => {
			closeDialog();
			reject(false); // Rejeter la Promesse
		};

		confirmationState.visible = true;
	});
};

const closeDialog = (): void => {
	confirmationState.visible = false;
	confirmationState.acceptCallback = null;
	confirmationState.rejectCallback = null;
};

const ConfirmPlugin = {
	install(app: App) {
		const container: HTMLDivElement = document.createElement('div');
		document.body.appendChild(container);

		const wrapper = {
			// On utilise la Composition API pour accéder à l'état réactif
			// Si vous n'avez pas accès à la Composition API dans le fichier de plugin,
			// l'objet de rendu est le moyen le plus sûr.
			render() {
				return createVNode(confirmDialog, {
					// Les props sont lues à partir de l'objet réactif à chaque fois
					visible: confirmationState.visible,
					message: confirmationState.message,
					header: confirmationState.header,
					icon: confirmationState.icon,
					acceptLabel: confirmationState.acceptLabel,
					rejectLabel: confirmationState.rejectLabel,
					onConfirm: confirmationState.acceptCallback,
					onReject: confirmationState.rejectCallback,
					'onUpdate:visible': closeDialog
				});
			}
		};

		render(createVNode(wrapper), container);

		app.config.globalProperties.$globalConfirm = confirm;

		app.provide('confirm', confirm);
	}
};

export default ConfirmPlugin;
