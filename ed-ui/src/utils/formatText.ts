import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { mixin } from '../mixin/mixin.js';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { statusList } from '../constants/status.js';

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
				return `<img src="${mixin.methods.getImgURL('elements', 'elem_void')}" alt="neutral">`;
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
			case 'hp_castle':
				return `<img src="${mixin.methods.getImgURL('icons', 'small_castle_heart')}" alt="castle hp">`;
			case 'pv':
				return `<img src="${mixin.methods.getImgURL('icons', 'small_pv')}" alt="pv">`;
			case 'xp':
				return `<img src="${mixin.methods.getImgURL('icons', 'small_xp')}" alt="xp">`;
			case 'irma':
				return `<img class="text-icon" src="${mixin.methods.getImgURL('item', 'item_irma')}" alt="irma">`;
			default: {
				if (key.startsWith('item_')) {
					const itemId = +key.substring(5) as Item;
					const item = itemList[itemId];
					if (!item) {
						console.error(`Item with key ${itemId} not found for replaced image.`);
						return `:${key}:`;
					}

					return `<img class="text-icon" src="${mixin.methods.getImgURL('item', `item_${item.name}`)}" alt="${item.name}">`;
				} else if (key.startsWith('status_')) {
					const statusId = +key.substring(7) as DinozStatusId;
					const statusIcon = statusList.imgName[statusId];

					if (!statusIcon) {
						console.error(`Status with key ${statusId} not found for replaced image.`);
						return `:${key}:`;
					}

					return `<img class="text-icon" src="${mixin.methods.getImgURL('status', `fx_${statusIcon}`)}" alt="status_${statusIcon}">`;
				}

				console.error(`Unexpected key for replaced image: ${key}`);
				return `:${key}:`;
			}
		}
	}
};

/**
 * Formats text with custom markup into HTML.
 * Note: This function only uses one regex pass per textual format to improve performance.
 */
export function formatText(text: string): string {
	// Combined pattern for all text formatting tokens:
	//                      **bold**         //italic//       _underline_   &&   :icon:
	const pattern = /(?:\*\*([^*]+)\*\*)|(?:\/\/([^/]+)\/\/)|(?:_([^_]+)_)|(&&)|:(\w+):/g;

	return text.replace(pattern, (match, boldContent, italicContent, emContent, lineBreak, iconKey) => {
		if (boldContent) return `<strong>${formatText(boldContent)}</strong>`;
		if (emContent) return `<em>${formatText(emContent)}</em>`;
		if (italicContent) return `<i>${formatText(italicContent)}</i>`;
		if (lineBreak) return '<br>';
		if (iconKey) {
			const validKeys = [
				'feu',
				'fire',
				'bois',
				'wood',
				'eau',
				'water',
				'foudre',
				'lightning',
				'air',
				'neutre',
				'void',
				'right',
				'gold',
				'ticket',
				'chrono',
				'attack',
				'defense',
				'hp',
				'hp_castle',
				'pv',
				'xp',
				'irma'
			];
			if (validKeys.includes(iconKey) || iconKey.startsWith('item_') || iconKey.startsWith('status_')) {
				return helpers.computeImageHtml(iconKey);
			}
		}
		return match; // fallback for unrecognized tokens
	});
}

export function formatNumber(num: number, separator: string): string {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}
