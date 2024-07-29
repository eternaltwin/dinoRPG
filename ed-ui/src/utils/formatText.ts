import { mixin } from '../mixin/mixin.js';

export const helpers = {
	computeImageHtml(key: string): string {
		switch (key) {
			case 'feu':
			case 'fire':
				return `<img src="${mixin.methods.getImgURL('elements', 'elem_fire')}" alt="feu">`;
			case 'bois':
			case 'wood':
				return `<img src="${mixin.methods.getImgURL('elements', 'elem_wood')}" alt="bois">`;
			case 'eau':
			case 'water':
				return `<img src="${mixin.methods.getImgURL('elements', 'elem_water')}" alt="eau">`;
			case 'foudre':
			case 'lightning':
				return `<img src="${mixin.methods.getImgURL('elements', 'elem_lightning')}" alt="foudre">`;
			case 'air':
				return `<img src="${mixin.methods.getImgURL('elements', 'elem_air')}" alt="air">`;
			case 'neutre':
			case 'void':
				return `<img src="${mixin.methods.getImgURL('elements', 'elem_void')}" alt="pmo">`;
			case 'right':
				return `<img src="${mixin.methods.getImgURL('icons', 'small_right')}" alt="pmo">`;
			case 'gold':
				return `<img src="${mixin.methods.getImgURL('icons', 'gold', true)}" alt="gold">`;
			case 'ticket':
				return `<img src="${mixin.methods.getImgURL('icons', 'ticket', true)}" alt="ticket">`;
			case 'chrono':
				return `<img src="${mixin.methods.getImgURL('design', 'small_chrono')}" alt="chrono">`;
			case 'attack':
				return `<img src="${mixin.methods.getImgURL('specialStats', 'counter')}" alt="attack">`;
			case 'defense':
				return `<img src="${mixin.methods.getImgURL('specialStats', 'armor')}" alt="defense">`;
			case 'hp':
				return `<img src="${mixin.methods.getImgURL('specialStats', 'hpRegen')}" alt="hp">`;
			case 'pv':
				return `<img src="${mixin.methods.getImgURL('icons', 'small_pv')}" alt="pv">`;
			case 'xp':
				return `<img src="${mixin.methods.getImgURL('icons', 'small_xp')}" alt="xp">`;
			default:
				throw Error(`Unexpected key for replaced image: ${key}`);
		}
	}
};

export function formatText(text: string): string {
	let formattedText = text;
	formattedText = formattedText.replace(/\*\*(.[^*]*)\*\*/g, '<strong>$1</strong>');
	formattedText = formattedText.replace(/\/\/(.[^*]*)\/\//g, '<em>$1</em>');
	formattedText = formattedText.replace(/_(.*)_/g, '<i>$1</i>');
	formattedText = formattedText.replace(/&&/g, '<br>');
	formattedText = formattedText.replace(/:feu:/g, helpers.computeImageHtml('feu'));
	formattedText = formattedText.replace(/:fire:/g, helpers.computeImageHtml('fire'));
	formattedText = formattedText.replace(/:bois:/g, helpers.computeImageHtml('bois'));
	formattedText = formattedText.replace(/:wood:/g, helpers.computeImageHtml('wood'));
	formattedText = formattedText.replace(/:eau:/g, helpers.computeImageHtml('eau'));
	formattedText = formattedText.replace(/:water:/g, helpers.computeImageHtml('water'));
	formattedText = formattedText.replace(/:foudre:/g, helpers.computeImageHtml('foudre'));
	formattedText = formattedText.replace(/:lightning:/g, helpers.computeImageHtml('lightning'));
	formattedText = formattedText.replace(/:air:/g, helpers.computeImageHtml('air'));
	formattedText = formattedText.replace(/:neutre:/g, helpers.computeImageHtml('neutre'));
	formattedText = formattedText.replace(/:void:/g, helpers.computeImageHtml('void'));
	formattedText = formattedText.replace(/:right:/g, helpers.computeImageHtml('right'));
	formattedText = formattedText.replace(/:gold:/g, helpers.computeImageHtml('gold'));
	formattedText = formattedText.replace(/:ticket:/g, helpers.computeImageHtml('ticket'));
	formattedText = formattedText.replace(/:chrono:/g, helpers.computeImageHtml('chrono'));
	formattedText = formattedText.replace(/:attack:/g, helpers.computeImageHtml('attack'));
	formattedText = formattedText.replace(/:defense:/g, helpers.computeImageHtml('defense'));
	formattedText = formattedText.replace(/:hp:/g, helpers.computeImageHtml('hp'));
	formattedText = formattedText.replace(/:pv:/g, helpers.computeImageHtml('pv'));
	formattedText = formattedText.replace(/:xp:/g, helpers.computeImageHtml('xp'));
	return formattedText;
}

export function formatNumber(num: number, separator: string): string {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}
