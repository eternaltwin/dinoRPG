export const helpers = {
	computeImageHtml(key: string): string {
		switch (key) {
			case 'feu':
				return `<img src="${require('@/assets/elements/elem_fire.webp')}" alt="feu">`;
			case 'bois':
				return `<img src="${require('@/assets/elements/elem_wood.webp')}" alt="bois">`;
			case 'eau':
				return `<img src="${require('@/assets/elements/elem_water.webp')}" alt="eau">`;
			case 'foudre':
				return `<img src="${require('@/assets/elements/elem_light.webp')}" alt="foudre">`;
			case 'air':
				return `<img src="${require('@/assets/elements/elem_air.webp')}" alt="air">`;
			case 'neutre':
				return `<img src="${require('@/assets/elements/elem_void.webp')}" alt="pmo">`;
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
