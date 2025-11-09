/* eslint-disable no-useless-escape */
import sanitizeHtml from 'sanitize-html';
import { EmotesElementsIcons } from '../components/richTextEditor/emotes/EmotesElementsIcons';
import { EmotesStatusIcons } from '../components/richTextEditor/emotes/EmotesStatusIcons';
import { EmotesAchievementsIcons } from '../components/richTextEditor/emotes/EmotesAchievementsIcons';
import { EmotesTwinoidV1Icons } from '../components/richTextEditor/emotes/EmotesTwinoidV1Icons';
import { EmotesTwinoidV2Icons } from '../components/richTextEditor/emotes/EmotesTwinoidV2Icons';
import { EmotesTwinoidV3Icons } from '../components/richTextEditor/emotes/EmotesTwinoidV3Icons';

const emoteIconEnums = {
	...EmotesTwinoidV1Icons,
	...EmotesTwinoidV2Icons,
	...EmotesTwinoidV3Icons,
	...EmotesElementsIcons,
	...EmotesStatusIcons,
	...EmotesAchievementsIcons
};

function markdownSubstitution(substring: string, p1: string, p2: string, p3: string): string {
	return !p1 ? `<a href=\'${p3}\' title=\'${p3}\'>${p3}</a>` : `<a href=\'${p2}\' title=\'${p2}\'>${p1}</a>`;
}

function emoteSubstitution(substring: string, p1: string): string {
	if (p1 in emoteIconEnums) {
		return `<img src='${emoteIconEnums[p1]}' alt='${substring}' height="16">`;
	}
	return substring;
}

export function formatText(text: string | null): string {
	if (text === null) {
		return '';
	}

	text = text.replace(/(?:^> .*(?:\n|$))+/gm, block => {
		// Retirer le "> " au début de chaque ligne
		const content = block.replace(/^> ?/gm, '');
		return `<blockquote>${content}</blockquote>`;
	});

	let formattedText = sanitizeHtml(text, {
		allowedTags: ['strong', 'em', 'a', 'br', 'mark', 'blockquote'],
		allowedAttributes: {
			a: ['href']
		}
	});

	// Handle both markdown-style links (e.g. [DinoRPG](https://dinorpg.eternaltwin.org))
	// and direct links from the game (e.g. https://dinorpg.eternaltwin.org)
	const markdownLinkRegex =
		/\[([^\]]+)\]\(([^\)]+)\)|((https:\/\/)?(staging\.)?dinorpg\.eternaltwin\.org\/[^\s\)\"\'\< ]*)/g;

	formattedText = formattedText.replaceAll(markdownLinkRegex, markdownSubstitution);
	formattedText = formattedText.replace(/:([a-zA-Z0-9_]+):/g, emoteSubstitution);
	formattedText = formattedText.replaceAll(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
	formattedText = formattedText.replaceAll(/\*(.*?)\*/g, '<em>$1</em>');
	formattedText = formattedText.replaceAll(/~~(.*?)~~/g, '<s>$1</s>');
	formattedText = formattedText.replaceAll(/==(.+?)==/g, '<mark>$1</mark>');
	formattedText = formattedText.replaceAll(/\|\|(.+?)\|\|/g, '<span class="spoiler">$1</span>');
	formattedText = formattedText.replace(/(?<!http:|https:)\/\//g, '<br>');

	return formattedText;
}
