export const helpers = {
	computeImageHtml(key: string): string {
		switch (key) {
			case 'feu':
				return `<img src="${require('@/assets/elements/elem_0.webp')}" alt="feu">`;
			case 'bois':
				return `<img src="${require('@/assets/elements/elem_1.webp')}" alt="bois">`;
			case 'eau':
				return `<img src="${require('@/assets/elements/elem_2.webp')}" alt="eau">`;
			case 'foudre':
				return `<img src="${require('@/assets/elements/elem_3.webp')}" alt="foudre">`;
			case 'air':
				return `<img src="${require('@/assets/elements/elem_4.webp')}" alt="air">`;
			case 'neutre':
				return `<img src="${require('@/assets/elements/elem_5.webp')}" alt="pmo">`;
			default:
				throw Error(`Unexpected key for replaced image: ${key}`);
		}
	}
};

export function formatText(text: string): string {
	let formattedText = text;
	formattedText = formattedText.replaceAll(
		/\*\*(.[^*]*)\*\*/g,
		'<strong>$1</strong>'
	);
	formattedText = formattedText.replaceAll(/\/\/(.[^*]*)\/\//g, '<em>$1</em>');
	formattedText = formattedText.replaceAll(/&&/g, '<br>');
	formattedText = formattedText.replaceAll(
		/:feu:/g,
		helpers.computeImageHtml('feu')
	);
	formattedText = formattedText.replaceAll(
		/:bois:/g,
		helpers.computeImageHtml('bois')
	);
	formattedText = formattedText.replaceAll(
		/:eau:/g,
		helpers.computeImageHtml('eau')
	);
	formattedText = formattedText.replaceAll(
		/:foudre:/g,
		helpers.computeImageHtml('foudre')
	);
	formattedText = formattedText.replaceAll(
		/:air:/g,
		helpers.computeImageHtml('air')
	);
	formattedText = formattedText.replaceAll(
		/:neutre:/g,
		helpers.computeImageHtml('neutre')
	);
	return formattedText;
}
