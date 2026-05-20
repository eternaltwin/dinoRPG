<template>
	<TitleHeader :title="$t('pageTitle.cinemaEditor')" header="Edition :" :subHeader="activeScene.name" />

	<div ref="fightContainer" class="fight-container"></div>

	<div class="toolbar">
		<input ref="fileInput" type="file" accept="application/json,.json" hidden @change="importMovie" />
		<DZButton type="button" @click="fileInput?.click()">{{ $t('cinema.editor.import') }}</DZButton>
		<DZButton type="button" @click="exportMovie">{{ $t('cinema.editor.export') }}</DZButton>
	</div>

	<p v-if="error" class="error">{{ error }}</p>

	<DZDisclaimer :content="$t('cinema.editor.disclaimerScenes')" help round />
	<section class="panel">
		<div
			v-for="(scene, index) in movie.scenes"
			:key="scene.id"
			class="row"
			:class="{ active: index === movie.activeSceneIndex }"
		>
			<div class="row-title">{{ scene.name }}</div>
			<div class="row-actions">
				<DZButton size="small" :disabled="index === 0" @click="moveScene(index, -1)">↑</DZButton>
				<DZButton size="small" :disabled="index === movie.scenes.length - 1" @click="moveScene(index, 1)">↓</DZButton>
				<DZButton size="small" @click="selectScene(index)">{{ $t('cinema.editor.sceneEdit') }}</DZButton>
				<DZButton size="small" :disabled="movie.scenes.length <= 1" @click="deleteScene(index)">{{
					$t('cinema.editor.sceneDelete')
				}}</DZButton>
			</div>
		</div>
		<div class="row-actions">
			<DZButton type="button" @click="addScene">{{ $t('cinema.editor.sceneAdd') }}</DZButton>
			<DZButton type="button" @click="playMovie">{{ $t('cinema.editor.sceneWatchMovie') }}</DZButton>
		</div>
	</section>

	<DZDisclaimer :content="$t('cinema.editor.disclaimerOptions')" help round />
	<section class="panel form-grid">
		<label>
			<span>{{ $t('cinema.editor.name') }}</span>
			<DZInput v-model="activeScene.name" @input="ensureSceneName" />
		</label>

		<label>
			<span>{{ $t('cinema.editor.optionsPlace') }}</span>
			<DZSelect v-model="activeFight.bg" :options="BACKGROUND_OPTIONS" />
		</label>

		<label>
			<span>{{ $t('cinema.editor.optionsEndLeft') }}</span>
			<DZSelect v-model="activeFight.leftEnd" :options="END_OPTIONS" />
		</label>

		<label>
			<span>{{ $t('cinema.editor.optionsEndRight') }}</span>
			<DZSelect v-model="activeFight.rightEnd" :options="END_OPTIONS" />
		</label>

		<label>
			<span>{{ $t('cinema.editor.optionsCastle') }}</span>
			<DZInput v-model.number="activeFight.castleLife" type="number" min="0" max="300" @input="clampCastle" />
		</label>
		<div>
			<DZButton type="button" @click="renderFight">{{ $t('cinema.editor.optionsVisualize') }}</DZButton>
		</div>
	</section>

	<DZDisclaimer :content="$t('cinema.editor.disclaimerActions')" help round />
	<section class="panel">
		<div v-for="(event, index) in activeFight.history" :key="event.uid" class="event">
			<header>
				<strong>{{ labelFor(event) }}</strong>
				<div class="row-actions">
					<DZButton size="small" :disabled="index === 0" @click="moveEvent(index, -1)">↑</DZButton>
					<DZButton size="small" :disabled="index === activeFight.history.length - 1" @click="moveEvent(index, 1)"
						>↓</DZButton
					>
					<DZButton size="small" @click="duplicateEvent(index)">{{ $t('cinema.editor.actionsDuplicate') }}</DZButton>
					<DZButton size="small" @click="deleteEvent(index)">{{ $t('cinema.editor.actionsDelete') }}</DZButton>
				</div>
			</header>

			<div class="form-grid compact">
				<template v-if="event.action === 'Add' && event.fighter">
					<label v-if="event.fighter.dino"><span>Dinoz</span><DZInput v-model="event.fighter.gfx" /></label>
					<label v-else
						><span>{{ $t('cinema.editor.actionsMonster') }}</span
						><DZSelect v-model="event.fighter.gfx" :options="MONSTER_OPTIONS"
					/></label>
					<label
						><span>{{ $t('cinema.editor.name') }}</span
						><DZInput v-model="event.fighter.name"
					/></label>
					<label
						><span>{{ $t('cinema.editor.actionsCamp') }}</span
						><DZSelect v-model="event.fighter.side" :options="CAMP_OPTIONS"
					/></label>
					<label
						><span>{{ $t('cinema.editor.actionsEntrance') }}</span
						><DZSelect v-model="event.fighter.entrance" :options="ENTRANCE_OPTIONS"
					/></label>
					<label><span>X</span><DZInput v-model.number="event.fighter.x" type="number" /></label>
					<label><span>Y</span><DZInput v-model.number="event.fighter.y" type="number" /></label>
					<label
						><span>{{ $t('cinema.editor.actionsLife') }}</span
						><DZInput v-model.number="event.fighter.life" type="number"
					/></label>
				</template>

				<template v-else-if="event.action === 'Text'">
					<label
						><span>{{ $t('cinema.editor.actionsText') }}</span
						><DZInput v-model="event.message"
					/></label>
				</template>

				<template v-else-if="event.action === 'Talk' || event.action === 'Announce'">
					<FighterField v-model="event.fid" :fighters="fighterChoices" />
					<label
						><span>{{ $t('cinema.editor.actionsText') }}</span
						><DZInput v-model="event.message"
					/></label>
				</template>

				<template v-else-if="event.action === 'Goto' || event.action === 'Damages'">
					<FighterField v-model="event.fid" :fighters="fighterChoices" :label="$t('cinema.editor.actionsCharacter')" />
					<FighterField v-model="event.tid" :fighters="fighterChoices" :label="$t('cinema.editor.actionsTarget')" />
					<label v-if="event.action === 'Damages'"
						><span>{{ $t('cinema.editor.actionsDamage') }}</span
						><DZInput v-model.number="event.damages" type="number"
					/></label>
				</template>

				<template v-else-if="['Return', 'Escape', 'Dead', 'Flip'].includes(event.action)">
					<FighterField v-model="event.fid" :fighters="fighterChoices" />
				</template>

				<template v-else-if="event.action === 'Object'">
					<FighterField v-model="event.fid" :fighters="fighterChoices" />
					<label
						><span>{{ $t('cinema.editor.actionsObject') }}</span
						><DZSelect v-model="event.item" :options="ITEM_OPTIONS"
					/></label>
					<label
						><span>{{ $t('cinema.editor.name') }}</span
						><DZInput v-model="event.name"
					/></label>
				</template>

				<template v-else-if="event.action === 'Lost' || event.action === 'Regen'">
					<FighterField v-model="event.fid" :fighters="fighterChoices" />
					<label
						><span>{{ $t('cinema.editor.actionsAmount') }}</span
						><DZInput v-model.number="event.amount" type="number"
					/></label>
					<label
						><span>{{ $t('cinema.editor.actionsEffect') }}</span
						><DZSelect
							:model-value="event.lifeFx?.fx || 'None'"
							:options="LIFEFX_OPTIONS"
							@update:model-value="setLifeFx(event, $event)"
					/></label>
				</template>

				<template v-else-if="event.action === 'AttackCastle'">
					<FighterField v-model="event.fid" :fighters="fighterChoices" />
					<label
						><span>{{ $t('cinema.editor.actionsDamage') }}</span
						><DZInput v-model.number="event.damages" type="number"
					/></label>
				</template>

				<template v-else-if="event.action === 'MoveTo'">
					<FighterField v-model="event.fid" :fighters="fighterChoices" />
					<label><span>X</span><DZInput v-model.number="event.x" type="number" /></label>
					<label><span>Y</span><DZInput v-model.number="event.y" type="number" /></label>
				</template>

				<template v-else-if="event.action === 'SpawnToy'">
					<label
						><span>{{ $t('cinema.editor.actionsObject') }}</span
						><DZSelect v-model="event.toy" :options="TOY_OPTIONS"
					/></label>
					<label v-for="field in TOY_FIELDS" :key="field"
						><span>{{ field.toUpperCase() }}</span
						><DZInput v-model.number="event[field]" type="number"
					/></label>
				</template>

				<template v-else-if="event.action === 'DestroyToy'">
					<label
						><span>{{ $t('cinema.editor.actionsObject') }}</span
						><DZSelect v-model="event.toy" :options="TOY_OPTIONS"
					/></label>
				</template>

				<p v-else>Action non reconnue : {{ event.action }}</p>
			</div>
		</div>
	</section>
	<section class="panel">
		<div class="row-actions">
			<DZSelect v-model="selectedType" :options="ACTION_OPTIONS" />
			<DZButton type="button" @click="addEvent">{{ $t('cinema.editor.actionsAddAction') }}</DZButton>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { Fight } from '@eternaltwin/dinorpg_animations';
import TitleHeader from '../components/utils/TitleHeader.vue';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import DZButton from '../components/common/DZButton.vue';
import DZInput from '../components/common/DZInput.vue';
import DZSelect from '../components/common/DZSelect.vue';

type Fighter = {
	props: Array<string | number>;
	dino: boolean;
	life: number;
	name: string;
	side: boolean;
	scale: number;
	fid: number;
	gfx: string;
	entrance: string;
	x: number;
	y: number;
};

type FightEvent = {
	uid: number;
	action: string;
	fighter?: Fighter;
	fid?: number;
	tid?: number;
	message?: string;
	item?: string;
	name?: string;
	amount?: number;
	damages?: number;
	lifeFx?: { fx: string };
	x?: number;
	y?: number;
	z?: number;
	vx?: number;
	vy?: number;
	vz?: number;
	toy?: string;
	left?: string;
	right?: string;
	castle?: { life?: number };
	[key: string]: unknown;
};

type FightData = {
	bg: string;
	top: number;
	bottom: number;
	ground: string | number;
	castleLife: number;
	leftEnd: string;
	rightEnd: string;
	history: FightEvent[];
};

type Scene = { id: number; name: string; fight: FightData };
type Movie = { name: string; activeSceneIndex: number; scenes: Scene[] };
type Choice = { value: number; label: string };

const FighterField = defineComponent({
	props: {
		modelValue: Number,
		fighters: { type: Array<Choice>, required: true },
		label: { type: String, default: 'Personnage' }
	},
	emits: ['update:modelValue'],
	setup(props, { emit }) {
		return () =>
			h('label', { class: 'fighter-field' }, [
				h('span', props.label),
				h(DZSelect, {
					modelValue: props.modelValue ?? 0,
					options: props.fighters,
					'onUpdate:modelValue': (value: number | string) => {
						emit('update:modelValue', Number(value));
					}
				})
			]);
	}
});

const BACKGROUNDS = [
	's_cinema',
	's_univ',
	's_fleuve',
	's_frcbrt',
	's_port',
	's_jungle',
	's_desertEnt',
	's_graveyard',
	's_dome',
	'villa'
];
const MONSTERS = ['goupi', 'goupi2', 'goupi3', 'wolf', 'gvert', 'coq'];
const ITEMS = ['regen', 'fereg2', 'mantip', 'ccard', 'marais', 'tix', 'gold', 'burger', 'zippo'];
const TOYS = [
	'wcharm',
	'totem',
	'sylkey',
	'skull',
	'rasca',
	'potion',
	'pelle',
	'palmes',
	'nenuph',
	'medal4',
	'medal3',
	'matesc',
	'marais',
	'lantrn',
	'ice',
	'gshop',
	'gant',
	'fcharm',
	'cup3',
	'cup1',
	'book',
	'corail',
	'conts1',
	'ccard',
	'bouee',
	'bckpck',
	'basalt',
	'astone',
	'amulst',
	'wpure'
];
const ENTRANCES = ['Stand', 'Jump', 'Run', 'Grow', 'Fall', 'Ground'];
const TOY_FIELDS = ['x', 'y', 'z', 'vx', 'vy', 'vz'];
const ACTION_TYPES = [
	{ value: 'DinoAppears', label: 'Un Dinoz apparaît' },
	{ value: 'MonsterAppears', label: 'Un monstre apparaît' },
	{ value: 'TextAppears', label: 'Un texte apparaît' },
	{ value: 'CharacterTalks', label: 'Un personnage parle' },
	{ value: 'CharacterMovesTowardsAnother', label: 'Un personnage avance vers un autre' },
	{ value: 'CharacterReturns', label: 'Un personnage retourne à sa place' },
	{ value: 'CharacterRunsAway', label: "Un personnage s'enfuit" },
	{ value: 'CharacterDies', label: 'Un personnage meurt' },
	{ value: 'CharacterAnnounces', label: 'Un personnage fait une annonce' },
	{ value: 'CharacterUsesObject', label: 'Un personnage utilise un objet' },
	{ value: 'CharacterLosesHP', label: 'Un personnage perd des points de vie' },
	{ value: 'CharacterGainsHP', label: 'Un personnage gagne des points de vie' },
	{ value: 'CharacterAttacksAnother', label: 'Un personnage attaque un autre' },
	{ value: 'CharacterAttacksCastle', label: 'Un personnage attaque le château' },
	{ value: 'CharacterMovesToLocation', label: 'Un personnage se déplace' },
	{ value: 'CharacterTurnsAround', label: 'Un personnage se retourne' },
	{ value: 'ObjectAppears', label: 'Un objet apparaît' },
	{ value: 'ObjectDisappears', label: 'Un objet disparaît' }
];

const CAMP_OPTIONS = [
	{ value: true, label: 'Gauche' },
	{ value: false, label: 'Droite' }
];

const END_OPTIONS = [
	{ value: 'Stand', label: 'Rester sur place' },
	{ value: 'Run', label: "Traverser l'écran" },
	{ value: 'Escape', label: 'Repartir en arrière' }
];

const LIFEFX_OPTIONS = [
	{ value: 'None', label: 'Aucun' },
	{ value: 'Fire', label: 'Fire' },
	{ value: 'Poison', label: 'Poison' },
	{ value: 'Acid', label: 'Acid' },
	{ value: 'Heal', label: 'Heal' }
];

const BACKGROUND_OPTIONS = BACKGROUNDS.map(bg => ({
	value: bg,
	label: bg
}));

const MONSTER_OPTIONS = MONSTERS.map(monster => ({
	value: monster,
	label: monster
}));

const ITEM_OPTIONS = ITEMS.map(item => ({
	value: item,
	label: item
}));

const TOY_OPTIONS = TOYS.map(toy => ({
	value: toy,
	label: toy
}));

const ENTRANCE_OPTIONS = ENTRANCES.map(entrance => ({
	value: entrance,
	label: entrance
}));

const ACTION_OPTIONS = ACTION_TYPES.map(type => ({
	value: type.value,
	label: type.label
}));

const fightContainer = ref<HTMLDivElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedType = ref('DinoAppears');
const error = ref('');
let ids = 0;
let fightPlayer: Fight | null = null;

const nextId = () => ++ids;
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const clampCastleLife = (value: unknown) => Math.max(0, Math.min(300, Number.isNaN(Number(value)) ? 0 : Number(value)));

function defaultFight(): FightData {
	return {
		bg: 's_cinema',
		top: 120,
		bottom: 20,
		ground: 1,
		castleLife: 0,
		leftEnd: 'Stand',
		rightEnd: 'Escape',
		history: []
	};
}

function defaultScene(name = 'Scène 1'): Scene {
	return { id: nextId(), name, fight: defaultFight() };
}

const movie = ref<Movie>({ name: 'Film 1', activeSceneIndex: 0, scenes: [defaultScene()] });
const activeScene = computed(() => movie.value.scenes[movie.value.activeSceneIndex] || movie.value.scenes[0]);
const activeFight = computed(() => activeScene.value.fight);
const fighters = computed(() =>
	activeFight.value.history
		.filter(event => event.action === 'Add' && event.fighter)
		.map(event => event.fighter as Fighter)
);
const fighterChoices = computed<Choice[]>(() =>
	fighters.value.length
		? fighters.value.map(fighter => ({ value: fighter.fid, label: fighter.name || `Personnage ${fighter.fid}` }))
		: [{ value: 0, label: 'Personnage 0' }]
);

function staticFighter(fighter: Fighter) {
	if (!Array.isArray(fighter.props)) fighter.props = [];
	if (!fighter.props.includes('Static') && !fighter.props.includes(1)) fighter.props.push('Static');
}

function defaultFighter(dino: boolean): Fighter {
	const fid = Math.max(-1, ...fighters.value.map(fighter => fighter.fid)) + 1;
	return {
		props: ['Static'],
		dino,
		life: 100,
		name: `${dino ? 'Dinoz' : 'Monstre'} ${fid}`,
		side: dino,
		scale: 1,
		fid,
		gfx: dino ? '40550CDFF9596000' : 'goupi',
		entrance: 'Stand',
		x: dino ? 200 : 300,
		y: 200
	};
}

function normalizeFighter(value: unknown, fallbackFid: number): Fighter {
	const src = isObject(value) ? value : {};
	const fighter: Fighter = {
		props: Array.isArray(src.props)
			? src.props.filter(prop => typeof prop === 'string' || typeof prop === 'number')
			: ['Static'],
		dino: Boolean(src.dino ?? true),
		life: Number(src.life ?? 100),
		name: String(src.name || `Personnage ${fallbackFid}`),
		side: Boolean(src.side ?? false),
		scale: Number(src.scale ?? 1),
		fid: Number(src.fid ?? fallbackFid),
		gfx: String(src.gfx || '40550CDFF9596000'),
		entrance: String(src.entrance || 'Stand'),
		x: Number(src.x ?? 200),
		y: Number(src.y ?? 200)
	};
	staticFighter(fighter);
	return fighter;
}

function normalizeEvent(value: unknown, index: number): FightEvent {
	const src = isObject(value) ? value : {};
	const event: FightEvent = { ...src, uid: nextId(), action: String(src.action || 'Text') };
	if (event.action === 'Add') event.fighter = normalizeFighter(src.fighter, index);
	if (isObject(src.lifeFx) && typeof src.lifeFx.fx === 'string') event.lifeFx = { fx: src.lifeFx.fx };
	return event;
}

function normalizeFight(value: unknown): FightData {
	const src = isObject(value) ? value : {};
	const history = (Array.isArray(src.history) ? src.history : []).map(normalizeEvent);
	const finish = [...history].reverse().find(event => event.action === 'Finish');
	const castle = history.find(event => event.action === 'AddCastle');
	return {
		bg: String(src.bg || 's_cinema'),
		top: Number(src.top ?? 120),
		bottom: Number(src.bottom ?? 20),
		ground: typeof src.ground === 'string' || typeof src.ground === 'number' ? src.ground : 1,
		castleLife: clampCastleLife(castle?.castle?.life ?? src.castleLife ?? 0),
		leftEnd: String(finish?.left || src.leftEnd || 'Stand'),
		rightEnd: String(finish?.right || src.rightEnd || 'Escape'),
		history: history.filter(event => !['Display', 'Finish', 'AddCastle'].includes(event.action))
	};
}

function normalizeMovie(value: unknown): Movie {
	const src = isObject(value) ? value : {};
	const sceneValues = Array.isArray(src.scenes) ? src.scenes : [src];
	const scenes = sceneValues.map((scene, index) => {
		const sceneSrc = isObject(scene) ? scene : {};
		return {
			id: nextId(),
			name: String(sceneSrc.name || `Scène ${index + 1}`),
			fight: normalizeFight(sceneSrc.fight || sceneSrc)
		};
	});
	return {
		name: String(src.name || 'Film importé'),
		activeSceneIndex: 0,
		scenes: scenes.length ? scenes : [defaultScene()]
	};
}

async function importMovie(event: Event) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	try {
		error.value = '';
		movie.value = normalizeMovie(JSON.parse(await file.text()) as unknown);
		await renderFight();
	} catch (err) {
		console.error(err);
		error.value = 'Le fichier JSON du film est invalide.';
	} finally {
		input.value = '';
	}
}

function playableFight(fight: FightData): FightData {
	const prepared = clone(fight);
	prepared.castleLife = clampCastleLife(prepared.castleLife);
	prepared.history = prepared.history.filter(event => !['Display', 'Finish', 'AddCastle'].includes(event.action));
	prepared.history.forEach(event => {
		if (event.action === 'Add' && event.fighter) staticFighter(event.fighter);
	});
	prepared.history.unshift({ uid: nextId(), action: 'Display' });
	if (prepared.castleLife > 0)
		prepared.history.splice(1, 0, {
			uid: nextId(),
			action: 'AddCastle',
			castle: {
				life: prepared.castleLife,
				maxLife: 300,
				enclos: false,
				ground: 0,
				armor: 0,
				repair: 0,
				color: 0,
				invisible: false
			}
		});
	prepared.history.push({
		uid: nextId(),
		action: 'Finish',
		left: prepared.leftEnd || 'Stand',
		right: prepared.rightEnd || 'Escape'
	});
	return prepared;
}

function exportMovie() {
	const playable = {
		...movie.value,
		activeSceneIndex: 0,
		scenes: movie.value.scenes.map(scene => ({ ...scene, fight: playableFight(scene.fight) }))
	};
	const link = document.createElement('a');
	const url = URL.createObjectURL(new Blob([JSON.stringify(playable, null, 2)], { type: 'application/json' }));
	link.href = url;
	link.download = `${movie.value.name || 'film'}.json`.replace(/[\\/:*?"<>|]/g, '_');
	link.click();
	URL.revokeObjectURL(url);
}

async function renderFight() {
	await nextTick();
	if (!fightContainer.value) return;
	try {
		error.value = '';
		fightPlayer?.destroy?.();
		fightContainer.value.innerHTML = '';
		fightPlayer = new Fight(playableFight(activeFight.value) as never);
		const display = fightPlayer.getDisplay();
		display.style.maxWidth = '100%';
		fightContainer.value.appendChild(display);
	} catch (err) {
		console.error(err);
		error.value = 'Impossible de visualiser cette scène.';
	}
}

async function playMovie() {
	for (let index = 0; index < movie.value.scenes.length; index += 1) {
		movie.value.activeSceneIndex = index;
		await renderFight();
		await new Promise<void>(resolve => {
			if (!fightPlayer) resolve();
			else fightPlayer.onFightEnd = () => resolve();
		});
	}
}

function selectScene(index: number) {
	movie.value.activeSceneIndex = index;
	renderFight();
}
function addScene() {
	movie.value.scenes.push(defaultScene(`Scène ${movie.value.scenes.length + 1}`));
	movie.value.activeSceneIndex = movie.value.scenes.length - 1;
}
function deleteScene(index: number) {
	if (movie.value.scenes.length <= 1) return;
	movie.value.scenes.splice(index, 1);
	if (movie.value.activeSceneIndex >= movie.value.scenes.length)
		movie.value.activeSceneIndex = movie.value.scenes.length - 1;
}
function moveScene(index: number, direction: -1 | 1) {
	moveInArray(movie.value.scenes, index, direction);
	if (movie.value.activeSceneIndex === index) movie.value.activeSceneIndex = index + direction;
}
function moveEvent(index: number, direction: -1 | 1) {
	moveInArray(activeFight.value.history, index, direction);
}
function moveInArray<T>(items: T[], index: number, direction: -1 | 1) {
	const target = index + direction;
	if (target < 0 || target >= items.length) return;
	const [item] = items.splice(index, 1);
	items.splice(target, 0, item);
}
function ensureSceneName() {
	if (!activeScene.value.name) activeScene.value.name = `Scène ${movie.value.activeSceneIndex + 1}`;
}
function clampCastle() {
	activeFight.value.castleLife = clampCastleLife(activeFight.value.castleLife);
}
function setLifeFx(event: FightEvent, value: string) {
	event.lifeFx = value === 'None' ? undefined : { fx: value };
}
function presentToysBefore(index: number) {
	const toys = new Set<string>();
	activeFight.value.history.slice(0, index).forEach(event => {
		if (event.action === 'SpawnToy' && event.toy) toys.add(event.toy);
		if (event.action === 'DestroyToy' && event.toy) toys.delete(event.toy);
	});
	return [...toys].length ? [...toys] : TOYS;
}

function labelFor(event: FightEvent) {
	if (event.action === 'Add') return event.fighter?.dino ? 'Un Dinoz apparaît' : 'Un monstre apparaît';
	const labels: Record<string, string> = {
		Text: 'Un texte apparaît',
		Talk: 'Un personnage parle',
		Goto: 'Un personnage avance vers un autre',
		Return: 'Un personnage retourne à sa place',
		Escape: "Un personnage s'enfuit",
		Dead: 'Un personnage meurt',
		Announce: 'Un personnage fait une annonce',
		Object: 'Un personnage utilise un objet',
		Lost: 'Un personnage perd des points de vie',
		Regen: 'Un personnage gagne des points de vie',
		Damages: 'Un personnage attaque un autre',
		AttackCastle: 'Un personnage attaque le château',
		MoveTo: 'Un personnage se déplace',
		Flip: 'Un personnage se retourne',
		SpawnToy: 'Un objet apparaît',
		DestroyToy: 'Un objet disparaît'
	};
	return labels[event.action] || event.action;
}

function newEvent(type: string): FightEvent {
	const uid = nextId();
	const first = fighters.value[0]?.fid ?? 0;
	const second = fighters.value[1]?.fid ?? first;
	const events: Record<string, FightEvent> = {
		DinoAppears: { uid, action: 'Add', fighter: defaultFighter(true) },
		MonsterAppears: { uid, action: 'Add', fighter: defaultFighter(false) },
		TextAppears: { uid, action: 'Text', message: 'Le narrateur parle.' },
		CharacterTalks: { uid, action: 'Talk', fid: first, message: 'Un personnage parle.' },
		CharacterMovesTowardsAnother: { uid, action: 'Goto', fid: first, tid: second },
		CharacterReturns: { uid, action: 'Return', fid: first },
		CharacterRunsAway: { uid, action: 'Escape', fid: first },
		CharacterDies: { uid, action: 'Dead', fid: first },
		CharacterAnnounces: { uid, action: 'Announce', fid: first, message: 'Annonce !' },
		CharacterUsesObject: { uid, action: 'Object', fid: first, item: 'regen', name: "Nom de l'objet" },
		CharacterLosesHP: { uid, action: 'Lost', fid: first, amount: 10, lifeFx: { fx: 'Fire' } },
		CharacterGainsHP: { uid, action: 'Regen', fid: first, amount: 10, lifeFx: { fx: 'Heal' } },
		CharacterAttacksAnother: { uid, action: 'Damages', fid: first, tid: second, damages: 10 },
		CharacterAttacksCastle: { uid, action: 'AttackCastle', fid: first, damages: 10 },
		CharacterMovesToLocation: { uid, action: 'MoveTo', fid: first, x: 200, y: 200 },
		CharacterTurnsAround: { uid, action: 'Flip', fid: first },
		ObjectAppears: { uid, action: 'SpawnToy', toy: 'lantrn', x: 200, y: 200, z: 1, vx: 0, vy: 0, vz: 0 },
		ObjectDisappears: {
			uid,
			action: 'DestroyToy',
			toy: presentToysBefore(activeFight.value.history.length)[0] || 'lantrn'
		}
	};
	return events[type] || events.TextAppears;
}

function addEvent() {
	activeFight.value.history.push(newEvent(selectedType.value));
}
function deleteEvent(index: number) {
	activeFight.value.history.splice(index, 1);
}
function duplicateEvent(index: number) {
	const copy = clone(activeFight.value.history[index]);
	copy.uid = nextId();
	if (copy.action === 'Add' && copy.fighter) {
		copy.fighter.fid = Math.max(-1, ...fighters.value.map(fighter => fighter.fid)) + 1;
		copy.fighter.name = `${copy.fighter.name} Copie`;
	}
	activeFight.value.history.splice(index + 1, 0, copy);
}

onMounted(renderFight);
onBeforeUnmount(() => fightPlayer?.destroy?.());
</script>

<style scoped lang="scss">
.fight-container {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 300px;
	overflow: hidden;
}
.toolbar,
.row,
.event header,
.row-actions {
	display: flex;
	gap: 8px;
	align-items: center;
	flex-wrap: wrap;
}
.toolbar {
	justify-content: center;
	margin: 10px 0;
}
.panel {
	margin: 10px 16px;
	padding: 10px;
	background: #f3ca92;
	border: 1px solid #fcf9d1;
	outline: 2px solid #e4aa69;
}
h2 {
	margin: 0 0 10px;
}
.row,
.event {
	margin-bottom: 8px;
	padding: 8px;
	border-radius: 10px;
	background: rgba(231, 173, 79, 0.65);
}
.row.active {
	background: rgba(231, 173, 79, 0.95);
}
.row-title {
	flex: 1;
	text-align: left;
	padding-left: 8px;
	font-weight: bold;
	background: transparent;
	border: 0;
	color: #7b3600;
}
.form-grid {
	display: grid;
	gap: 8px;
}
.form-grid label {
	display: grid;
	grid-template-columns: 130px minmax(160px, 1fr);
	gap: 8px;
	align-items: center;
}
.form-grid span {
	padding: 5px 8px;
	border-radius: 8px;
	background: rgba(231, 173, 79, 0.65);
	color: #fff;
	font-weight: bold;
	text-align: center;
}
.form-grid :deep(.fighter-field) {
	display: grid;
	grid-template-columns: 130px minmax(160px, 1fr);
	gap: 8px;
	align-items: center;
}
.form-grid :deep(.fighter-field > span) {
	padding: 5px 8px;
	border-radius: 8px;
	background: rgba(231, 173, 79, 0.65);
	color: #fff;
	font-weight: bold;
	text-align: center;
}
.compact {
	margin-top: 8px;
}
.event header {
	justify-content: space-between;
	margin-bottom: 8px;
	color: #7b3600;
}
.error {
	color: #b00020;
	text-align: center;
}
</style>
