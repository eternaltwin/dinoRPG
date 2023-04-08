import { mixin } from '../mixin/mixin.js';

export const helpers = {
	computeImageHtml(key: string): string {
		switch (key) {
			case 'feu':
				return `<img src="${mixin.methods.getImgURL('elements', 'elem_fire')}" alt="feu">`;
			case 'bois':
				return `<img src="${mixin.methods.getImgURL('elements', 'elem_wood')}" alt="bois">`;
			case 'eau':
				return `<img src="${mixin.methods.getImgURL('elements', 'elem_water')}" alt="eau">`;
			case 'foudre':
				return `<img src="${mixin.methods.getImgURL('elements', 'elem_lightning')}" alt="foudre">`;
			case 'air':
				return `<img src="${mixin.methods.getImgURL('elements', 'elem_air')}" alt="air">`;
			case 'neutre':
				return `<img src="${mixin.methods.getImgURL('elements', 'elem_void')}" alt="pmo">`;
			case 'right':
				return `<img src="${mixin.methods.getImgURL('icons', 'small_right')}" alt="pmo">`;
			case 'gold':
				return `<img src="${mixin.methods.getImgURL('icons', 'small_gold')}" alt="gold">`;
			default:
				throw Error(`Unexpected key for replaced image: ${key}`);
		}
	}
};

export function formatText(text: string): string {
	let formattedText = text;
	formattedText = formattedText.replace(/\*\*(.[^*]*)\*\*/g, '<strong>$1</strong>');
	formattedText = formattedText.replace(/\/\/(.[^*]*)\/\//g, '<em>$1</em>');
	formattedText = formattedText.replace(/&&/g, '<br>');
	formattedText = formattedText.replace(/:feu:/g, helpers.computeImageHtml('feu'));
	formattedText = formattedText.replace(/:bois:/g, helpers.computeImageHtml('bois'));
	formattedText = formattedText.replace(/:eau:/g, helpers.computeImageHtml('eau'));
	formattedText = formattedText.replace(/:foudre:/g, helpers.computeImageHtml('foudre'));
	formattedText = formattedText.replace(/:air:/g, helpers.computeImageHtml('air'));
	formattedText = formattedText.replace(/:neutre:/g, helpers.computeImageHtml('neutre'));
	formattedText = formattedText.replace(/:right:/g, helpers.computeImageHtml('right'));
	formattedText = formattedText.replace(/:gold:/g, helpers.computeImageHtml('gold'));
	return formattedText;
}
