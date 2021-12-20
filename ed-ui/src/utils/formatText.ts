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
	formattedText = formattedText.replace(
		/\*\*(.[^*]*)\*\*/g,
		'<strong>$1</strong>'
	);
	formattedText = formattedText.replace(/\/\/(.[^*]*)\/\//g, '<em>$1</em>');
	formattedText = formattedText.replace(/&&/g, '<br>');
	formattedText = formattedText.replace(
		/:feu:/g,
		helpers.computeImageHtml('feu')
	);
	formattedText = formattedText.replace(
		/:bois:/g,
		helpers.computeImageHtml('bois')
	);
	formattedText = formattedText.replace(
		/:eau:/g,
		helpers.computeImageHtml('eau')
	);
	formattedText = formattedText.replace(
		/:foudre:/g,
		helpers.computeImageHtml('foudre')
	);
	formattedText = formattedText.replace(
		/:air:/g,
		helpers.computeImageHtml('air')
	);
	formattedText = formattedText.replace(
		/:neutre:/g,
		helpers.computeImageHtml('neutre')
	);
	return formattedText;
}
