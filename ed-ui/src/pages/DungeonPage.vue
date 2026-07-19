<template>
	<div class="dungeon-page">
		<div class="toolbar">
			<button @click="toggleDebug">Wall debug: {{ wallDebug ? 'ON' : 'OFF' }}</button>
			<span class="status">{{ status }}</span>
		</div>
		<div ref="stageEl" class="stage">
			<button v-show="stairIcon !== ''" class="stair-btn" title="Take these stairs" @click="takeStair">
				<img :src="stairIcon" alt="stairs" />
			</button>
		</div>
	</div>
</template>

<script lang="ts">
/**
 * DungeonPage — fog-of-war maze client.
 *
 * The maze layout lives encrypted on the backend and NEVER reaches the browser.
 * Entering a dungeon returns only the cells around the entrance; every arrow-key
 * step is validated server-side and returns only the newly revealed cells. The
 * maze can therefore only be solved by exploring it.
 *
 * Rendered with Pixi.js using the original DinoRPG dungeon tileset
 * (src/assets/dungeon); the dinoz is animated via @eternaltwin/dinorpg_animations.
 */
import { defineComponent } from 'vue';
import { DungeonService } from '../services/index.js';
import { ARROWS, KEY_SKIN_COUNT, SKINS } from '@drpg/core/models/dungeon/DungeonClient';
import type { Cell, RevealedCell, Skin, StartRunResult } from '@drpg/core/models/dungeon/DungeonClient';
import { assetUrl, loadDungeonAssets, pad2, skinAssetNames } from '../utils/dungeon/dungeonAssets.js';
import { MazeRenderer } from '../utils/dungeon/MazeRenderer.js';
import { DinozActor } from '../utils/dungeon/DinozActor.js';
import { sessionStore, useDinozStore } from '../store';
import { errorHandler } from '../utils';

// ── page state & control loop ─────────────────────────────────────────────────
// Kept at module scope on purpose: the renderer, actor and Pixi objects must
// stay out of Vue's reactivity (deep proxies wreck Pixi), and the page is
// mounted at most once at a time. All of it is reset in mounted/beforeUnmount.

let dungeonId = '';
let renderer: MazeRenderer | null = null;
let actor: DinozActor | null = null;
// The rest of the party (dinozStore leader/followers), conga-line style: each
// confirmed leader move sends follower i to the cell the leader held i+1 moves
// ago. `trail` is that history, newest first.
const followers: DinozActor[] = [];
const trail: Cell[] = [];
// Entities the server has revealed so far, keyed "l,x,y" — drives the stair button.
const icons = new Map<string, string>();
// Locked-door cells → key id, so door and key can share a flavor name.
const doorKeys = new Map<string, number>();
// Cells the server already revealed as walls — don't ask it again about those.
const walls = new Set<string>();
// Logical position = last server-confirmed cell. Moves are driven off this.
let cursor: Cell = { l: 0, x: 0, y: 0 };
// One in-flight move at a time; the server is the authority, not the keyboard.
let moving = false;
let rafId = 0;
// Show the stair button (top-right of the stage) only once the dinoz has settled
// on a revealed stair cell. The button, not the step, performs the traversal.
let stairShownFor: string | null = null;
// Drive movement from held keys ourselves (a per-frame loop) instead of the
// OS key-repeat, which inserts a ~500ms pause after the first press. One
// server round-trip at a time: the next step is requested only once the
// previous one is confirmed and walked.
const held: string[] = [];

const iconKey = (c: Cell): string => `${c.l},${c.x},${c.y}`;

function record(reveal: RevealedCell[]): void {
	for (const c of reveal) {
		// Re-sent cells can lose their icon (key picked up, monster beaten).
		if (c.icon) icons.set(`${c.l},${c.x},${c.y}`, c.icon);
		else icons.delete(`${c.l},${c.x},${c.y}`);
		if (c.key != null) doorKeys.set(`${c.l},${c.x},${c.y}`, c.key);
		if (!c.floor) walls.add(`${c.l},${c.x},${c.y}`);
	}
	renderer?.applyReveal(reveal);
}

function onKeyDown(e: KeyboardEvent): void {
	if (!ARROWS[e.key]) return;
	e.preventDefault();
	if (!held.includes(e.key)) held.push(e.key);
}
function onKeyUp(e: KeyboardEvent): void {
	const i = held.indexOf(e.key);
	if (i >= 0) held.splice(i, 1);
}

export default defineComponent({
	name: 'DungeonPage',
	data() {
		return {
			status: '',
			wallDebug: false,
			stairIcon: '' as string,
			sessionStore: sessionStore()
		};
	},
	methods: {
		/** Flavor name shared by a door and its key, seeded by dungeonId + key id. */
		doorName(keyId: number): string {
			// ponytail: djb2(dungeonId) offset + keyId keeps names distinct per dungeon
			// (up to the 20 in fr.json dungeon.doorNames — keep that length in sync).
			let h = 5381;
			for (const ch of dungeonId) h = (h * 33 + ch.charCodeAt(0)) | 0;
			return this.$t(`dungeon.doorNames.${(((h + keyId) % 20) + 20) % 20}`);
		},
		toggleDebug(): void {
			this.wallDebug = !this.wallDebug;
			renderer?.setDebug(this.wallDebug);
		},
		/** Ask the server for one step; on approval, walk the dinoz and fold in the reveal. */
		async tryMove(dx: number, dy: number, dl = 0): Promise<void> {
			const currentDinoz = useDinozStore().getCurrentDinoz;
			if (!currentDinoz) {
				return;
			}
			if (moving || !actor) return;
			// Known wall (already revealed): the server would just say no — skip the round-trip.
			if (dl === 0 && walls.has(`${cursor.l},${cursor.x + dx},${cursor.y + dy}`)) return;
			moving = true;
			try {
				const move = await DungeonService.moveDinoz(dungeonId, dx, dy, dl, currentDinoz.id);
				moving = false;
				if (!move.ok) {
					// A still-closed door refused us: no key for it yet.
					const at = `${cursor.l},${cursor.x + dx},${cursor.y + dy}`;
					const blocked = icons.get(at);
					if (dl === 0 && (blocked === 'door_v' || blocked === 'door_h'))
						renderer?.showMessage(this.$t('dungeon.msg.locked', { name: this.doorName(doorKeys.get(at) ?? 0) }));
					return; // wall / no stair: the server said no, nothing was revealed
				}
				if (move.fight) {
					this.sessionStore.setFightResult(move.fight);

					this.$router.push({
						name: 'Fight',
						params: { dinozId: this.$route.params.id.toString() }
					});
				}
				// What the entered cell held BEFORE this step's re-reveal clears it —
				// that difference is the pickup/opening to announce.
				const entered = icons.get(iconKey(move.pos));
				record(move.reveal);
				if (entered === 'door_v' || entered === 'door_h') {
					const name = this.doorName(doorKeys.get(iconKey(move.pos)) ?? 0);
					renderer?.showMessage(this.$t('dungeon.msg.opened', { name }), `item_${entered}_open`);
				} else if (entered?.startsWith('key_')) {
					const v = Number(entered.slice(4));
					renderer?.showMessage(
						this.$t('dungeon.msg.key', { name: this.doorName(v) }),
						`item_key_${pad2(((v - 1) % KEY_SKIN_COUNT) + 1)}`
					);
				}
				if (move.scenario) {
					renderer?.showMessage(this.$t(move.scenario.text), entered === 'scroll' ? 'item_scroll' : 'item_chest');
				}
				cursor = { ...move.pos };
				actor?.enqueue(cursor);
				trail.unshift({ ...cursor });
				if (trail.length > followers.length + 1) trail.pop();
				// The first enqueue each follower gets is its own cell — a walk-in-place
				// beat that staggers the line's start, as View.hx's delay = w*10 did.
				followers.forEach((f, i) => trail[i + 1] && f.enqueue({ ...trail[i + 1] }));
			} catch (err) {
				moving = false;
				errorHandler.handle(err, this.$toast);
			}
		},
		/**
		 * Leader idle: send each follower the whole remaining trail in one go so it
		 * walks a continuous path onto the leader's cell and stacks there. One
		 * dispatch per stop — feeding cell-by-cell would drain each follower to
		 * 'stand' between cells and eat the walk animation.
		 */
		catchUp(): void {
			if (followers.some(f => f.pending > 0)) return;
			const at = (c: Cell): boolean => c.l === cursor.l && c.x === cursor.x && c.y === cursor.y;
			if (trail.every(at)) return; // everyone is stacked
			followers.forEach((f, i) => {
				// Follower i sits at trail[i+1]; retrace trail[i]‥trail[0] (= the leader).
				let prev = f.cell;
				for (let j = Math.min(i, trail.length - 1); j >= 0; j--) {
					const t = trail[j];
					if (t.l === prev.l && t.x === prev.x && t.y === prev.y) continue;
					f.enqueue({ ...t });
					prev = t;
				}
			});
			for (let i = 0; i < trail.length; i++) trail[i] = { ...cursor };
		},
		updateStairButton(): void {
			if (!actor || moving || actor.pending > 0) return this.hideStair();
			const k = iconKey(actor.cell);
			const icon = icons.get(k);
			if (icon !== 'stair_up' && icon !== 'stair_down' && icon !== 'exit') return this.hideStair();
			if (k === stairShownFor) return;
			stairShownFor = k;
			this.stairIcon = assetUrl(icon === 'stair_up' ? 'interf_stair_up' : 'interf_stair_down');
		},
		hideStair(): void {
			if (stairShownFor === null) return;
			stairShownFor = null;
			this.stairIcon = '';
		},
		takeStair(): void {
			const icon = icons.get(iconKey(cursor));
			if (icon === 'stair_up') this.tryMove(0, 0, 1);
			else if (icon === 'stair_down' || icon === 'exit') this.tryMove(0, 0, -1);
		},
		/** Enter the dungeon: the server decrypts the layout; we get the reveals only. */
		async build(): Promise<void> {
			this.status = 'entering the dungeon…';
			let run: StartRunResult;
			const currentDinoz = useDinozStore().getCurrentDinoz;
			if (!currentDinoz) {
				return;
			}
			try {
				run = await DungeonService.enterDungeon(dungeonId, currentDinoz.id);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
			this.status = `run ${run.runId.slice(0, 8)}… — explore!`;

			icons.clear();
			doorKeys.clear();
			walls.clear();
			this.hideStair();

			const skins: Skin[] = SKINS.filter(s => s.name === run.skin);
			// Lazy-load only this run's tiles now that the server told us the skin.
			await loadDungeonAssets(skins.flatMap(skinAssetNames));
			// cell 45 → the dino renders at native resolution; 500×350 viewport scrolls.
			renderer = new MazeRenderer(
				this.$refs.stageEl as HTMLDivElement,
				{ width: run.width, height: run.height, levels: run.levels },
				{ cell: 45, skins, view: { w: 500, h: 350 } }
			);
			renderer.setDebug(this.wallDebug);

			record(run.reveal);
			actor = new DinozActor(renderer, {
				code: currentDinoz.display,
				speed: 5,
				onLevelChange: l => renderer?.showLevel(l)
			});
			actor.placeAt({ ...run.pos });
			actor.takeControl();
			cursor = { ...run.pos };
			trail.length = 0;
			trail.push({ ...run.pos });
			for (const d of useDinozStore()
				.getDinozParty(currentDinoz.id)
				.filter(p => p.id !== currentDinoz.id)) {
				const f = new DinozActor(renderer, { code: d.display, speed: 5, lead: false });
				f.placeAt({ ...run.pos });
				f.takeControl();
				followers.push(f);
			}
		}
	},
	async mounted() {
		dungeonId = this.$route.params.id as string;
		await this.build();

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);

		const frame = (): void => {
			// View.hx froze scroll & moves while winMsg was up — same rule here.
			if (actor && !moving && actor.pending === 0 && !renderer?.messageOpen) {
				if (held.length > 0) {
					const d = ARROWS[held[held.length - 1]];
					this.tryMove(d[0], d[1]);
				} else {
					this.catchUp();
				}
			}
			this.updateStairButton();
			rafId = requestAnimationFrame(frame);
		};
		rafId = requestAnimationFrame(frame);
	},
	beforeUnmount() {
		cancelAnimationFrame(rafId);
		window.removeEventListener('keydown', onKeyDown);
		window.removeEventListener('keyup', onKeyUp);
		actor?.destroy();
		for (const f of followers) f.destroy();
		followers.length = 0;
		trail.length = 0;
		renderer?.destroy();
		actor = null;
		renderer = null;
		icons.clear();
		doorKeys.clear();
		walls.clear();
		held.length = 0;
		moving = false;
		stairShownFor = null;
	}
});
</script>

<style scoped lang="scss">
.dungeon-page {
	padding: 12px;
}

.toolbar {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 12px;
	flex-wrap: wrap;

	button {
		background: #2b2f3a;
		color: #e6e6ea;
		border: 1px solid #3a3f4d;
		border-radius: 6px;
		padding: 7px 12px;
		font-size: 13px;
		cursor: pointer;

		&:hover {
			background: #353a47;
		}
	}
}

.status {
	color: #7e8395;
	font-size: 12px;
	font-family: monospace;
}

.stage {
	display: inline-block;
	position: relative;
	border: 1px solid #1b1e26;
	border-radius: 8px;
	overflow: hidden;
	line-height: 0;
}

.stair-btn {
	position: absolute;
	top: 8px;
	right: 8px;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 6px;
	background: rgba(20, 22, 30, 0.85);
	border: 1px solid #6b5fa8;
	border-radius: 8px;
	cursor: pointer;

	img {
		width: 32px;
		height: 32px;
		image-rendering: pixelated;
	}
}
</style>
