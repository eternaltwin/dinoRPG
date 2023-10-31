import { parse } from 'node-html-parser';
import { ErrorFormator } from './errorFormator.js';
import { skillNameResolution } from '../constants/import/skillResolution.js';
import { sendDiscord } from './discord.js';
import { ImportedDinoz, ImportedDinozSkill, ImportedPlayer } from '../entity/index.js';

export function accentsTidy(s: string): string {
	let r = s.toLowerCase();
	r = r.replace(new RegExp(/\s/g), '');
	r = r.replace(new RegExp(/[àáâãäå]/g), 'a');
	r = r.replace(new RegExp(/æ/g), 'ae');
	r = r.replace(new RegExp(/ç/g), 'c');
	r = r.replace(new RegExp(/[èéêë]/g), 'e');
	r = r.replace(new RegExp(/[ìíîï]/g), 'i');
	r = r.replace(new RegExp(/ñ/g), 'n');
	r = r.replace(new RegExp(/[òóôõö]/g), 'o');
	r = r.replace(new RegExp(/œ/g), 'oe');
	r = r.replace(new RegExp(/[ùúûü]/g), 'u');
	r = r.replace(new RegExp(/[ýÿ]/g), 'y');
	r = r.replace(new RegExp(/\W/g), '');
	return r;
}

export async function parseShop(page: string, player: ImportedPlayer): Promise<Array<ImportedDinoz>> {
	const root = parse(page);
	const nbDinoz = root.querySelectorAll('.sheet').length - 6;
	let dinoArray = [];
	for (let i = 0; i < nbDinoz; i++) {
		const dino = new ImportedDinoz();
		dino.player = player;
		const dinozDetails = root.getElementById(`details_${i}`);
		const dinozBasic = root.querySelectorAll('.infos')[i];
		const displayRegex = dinozBasic
			.querySelector('a')
			?.getAttribute('href')
			?.match(/\/shop\/demon\?buy=.*;chk=(.*);sk=.*/);
		if (!displayRegex) {
			throw new ErrorFormator(500, `There is an error in the display of the dinoz ${i} from the demon shop`);
		}
		const nameRegex = dinozBasic.querySelector('.race')?.firstChild.text.match(/\r\n\t\t\t\t\t\r\n\t\t\t\t\t\t(.*),.*/);
		if (!nameRegex) {
			throw new ErrorFormator(500, `There is an error in the name of the dinoz ${i} from the demon shop`);
		}
		const levelRegex = dinozBasic.querySelector('strong')?.firstChild.text.match(/.*(\d+)/);
		if (!levelRegex) {
			throw new ErrorFormator(500, `There is an error in the level of the dinoz ${i} from the demon shop`);
		}
		const fireRegex = dinozDetails.querySelector('.elements')?.childNodes[1].childNodes[2].text.match(/(\d+)/);
		const woodRegex = dinozDetails.querySelector('.elements')?.childNodes[3].childNodes[2].text.match(/(\d+)/);
		const waterRegex = dinozDetails.querySelector('.elements')?.childNodes[5].childNodes[2].text.match(/(\d+)/);
		const lightningRegex = dinozDetails.querySelector('.elements')?.childNodes[7].childNodes[2].text.match(/(\d+)/);
		const airRegex = dinozDetails.querySelector('.elements')?.childNodes[9].childNodes[2].text.match(/(\d+)/);
		if (!fireRegex || !woodRegex || !waterRegex || !lightningRegex || !airRegex) {
			throw new ErrorFormator(500, `There is an error in the elements of the dinoz ${i} from the demon shop`);
		}
		dino.display = displayRegex[1];
		dino.name = nameRegex[1];
		dino.level = parseInt(levelRegex[1]);
		dino.nbrUpFire = parseInt(fireRegex[1]);
		dino.nbrUpWood = parseInt(woodRegex[1]);
		dino.nbrUpWater = parseInt(waterRegex[1]);
		dino.nbrUpLightning = parseInt(lightningRegex[1]);
		dino.nbrUpAir = parseInt(airRegex[1]);
		dino.isSacrificed = true;
		dino.importedId = 0;
		dino.life = 0;
		dino.maxLife = 100;
		dino.experience = 0;
		dino.isFrozen = false;

		const rawSkillArray = dinozDetails.toString().split('<tr>');
		let skillArray = [];
		for (let i = 3; i < rawSkillArray.length - 1; i++) {
			let skillRegex = rawSkillArray[i].match(
				/<span onmouseover="mt.js.Tip.show\(this,'&lt;div class=\\'header\\'&gt;&lt;div class=\\'footer\\'&gt;&lt;h1&gt;(.*)&lt;\/h1&gt;/
			);
			let skill = skillRegex![1].replaceAll('\\', '')!.toLowerCase();
			const skillId = Object.entries(skillNameResolution).find(name =>
				name[1].some(el => accentsTidy(el) === accentsTidy(skill))
			);
			if (!skillId) {
				await sendDiscord(`Error in skill \`${skill}\` while scraping demon shop.`);
				break;
			}
			let newSkill = new ImportedDinozSkill();
			newSkill.dinoz = dino;
			newSkill.skillId = parseInt(skillId[0]);
			skillArray.push(newSkill);
		}
		dino.skills = skillArray;
		dinoArray.push(dino);
	}
	return dinoArray;
}
