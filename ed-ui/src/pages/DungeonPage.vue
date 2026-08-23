<template>
	<DZDisclaimer
		round
		help
		:content="$t('dungeon.disclaimer', { dinoz: currentDinoz?.name, dungeonName: $t(`dungeon.name.${dungeonId}`) })"
	/>
	<div class="dungeon-page">
		<div ref="stageEl" class="stage">
			<div class="dpad">
				<button v-if="!needIrma" class="btn up" title="Move up" @click="tryMove(0, -1)">
					<img :src="arrowIcon" alt="up" />
				</button>
				<button v-if="!needIrma" class="btn left" title="Move left" @click="tryMove(-1, 0)">
					<img :src="arrowIcon" alt="left" />
				</button>
				<button v-if="!needIrma" class="btn right" title="Move right" @click="tryMove(1, 0)">
					<img :src="arrowIcon" alt="right" />
				</button>
				<button v-if="!needIrma" class="btn down" title="Move down" @click="tryMove(0, 1)">
					<img :src="arrowIcon" alt="down" />
				</button>
				<button v-if="needIrma || buttonIcon !== ''" class="btn center" title="action" @click="action()">
					<img :src="getImgURL('dungeon', `interf_${actionImg}`, true)" :alt="actionImg" />
				</button>
			</div>
			<span class="floor">{{ $t(`dungeon.floor`, { floor: currentLevel }) }}</span>
		</div>
		<div class="toolbar">
			<button @click="toggleDebug">Wall debug: {{ wallDebug ? 'ON' : 'OFF' }}</button>
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
import { DinozService, DungeonService } from '../services/index.js';
import { ARROWS, KEY_SKIN_COUNT, MAX_STEPS, SKINS } from '@drpg/core/models/dungeon/DungeonClient';
import type { Cell, MoveResult, MoveStep, RevealedCell, Skin } from '@drpg/core/models/dungeon/DungeonClient';
import { assetUrl, loadDungeonAssets, pad2, skinAssetNames } from '../utils/dungeon/dungeonAssets.js';
import { MazeRenderer } from '../utils/dungeon/MazeRenderer.js';
import { DinozActor } from '../utils/dungeon/DinozActor.js';
import { sessionStore, useDinozStore } from '../store';
import { errorHandler } from '../utils';
import { ItemEffect } from '@drpg/core/models/enums/ItemEffect';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';

// ── page state & control loop ─────────────────────────────────────────────────
// Kept at module scope on purpose: the renderer, actor and Pixi objects must
// stay out of Vue's reactivity (deep proxies wreck Pixi), and the page is
// mounted at most once at a time. All of it is reset in mounted/beforeUnmount.

/** djb2 of the dungeon id — seeds anything that must stay stable across refreshes. */
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
// The mirror of `walls`: cells revealed as walkable. Because the server reveals the
// whole 3×3 block around every cell entered, all four neighbours of the dinoz are
// always in here — which is what lets a plain step be predicted instead of awaited.
const floors = new Set<string>();
// Logical position, predicted: `cursor` runs ahead of `confirmed` by `pending.length`
// steps. Moves are driven off this so input never waits on the network.
let cursor: Cell = { l: 0, x: 0, y: 0 };
// Last server-confirmed cell — what we snap back to if a prediction was ever wrong.
let confirmed: Cell = { l: 0, x: 0, y: 0 };
// Steps taken locally but not yet acknowledged. One request in flight at a time;
// whatever piles up behind it ships as the next batch, so a dash is ~1 request.
const pending: MoveStep[] = [];
let inflight = false;
// A step whose outcome we could not predict (stair, fight, pickup) is in flight.
// Nothing may be predicted on top of it: its result can change the level under us.
let blocking = false;
let rafId = 0;
// Show the stair button (top-right of the stage) only once the dinoz has settled
// on a revealed stair cell. The button, not the step, performs the traversal.
let stairShownFor: string | null = null;
/** Cells walked per second — the actor's tween speed, and the movement cadence. */
const WALK_SPEED = 5;
/**
 * How long a key must stay down before the frame loop starts repeating it. A tap
 * is one press, one cell; only a genuine hold walks on. Set to exactly one cell's
 * walk so the repeat picks up as the first cell lands and a hold stays seamless.
 * ponytail: raise it if a deliberate slow press still reads as two cells.
 */
const REPEAT_DELAY = 1000 / WALK_SPEED;
// Drive movement from held keys ourselves (a per-frame loop) instead of the
// OS key-repeat, which inserts a ~500ms pause after the first press.
const held: string[] = [];
// When the currently held key went down — the frame loop repeats only past REPEAT_DELAY.
let heldSince = 0;
// Set in mounted()/cleared in beforeUnmount so the module-scope key handlers
// below (stable refs, needed for add/removeEventListener) can reach tryMove.
let triggerMove: ((dx: number, dy: number) => void) | null = null;

const iconKey = (c: Cell): string => `${c.l},${c.x},${c.y}`;

// `origin` is the player's cell as of this reveal (View.hx posX/posY at
// updateFog() time, i.e. after the move already landed) — orients each
// reveal's fade-fx away from the player. See MazeRenderer#applyReveal.
function record(reveal: RevealedCell[], origin?: Cell): void {
	for (const c of reveal) {
		// Re-sent cells can lose their icon (key picked up, monster beaten).
		if (c.icon) icons.set(`${c.l},${c.x},${c.y}`, c.icon);
		else icons.delete(`${c.l},${c.x},${c.y}`);
		if (c.key != null) doorKeys.set(`${c.l},${c.x},${c.y}`, c.key);
		if (c.floor) {
			floors.add(`${c.l},${c.x},${c.y}`);
		} else {
			walls.add(`${c.l},${c.x},${c.y}`);
			floors.delete(`${c.l},${c.x},${c.y}`);
		}
	}
	renderer?.applyReveal(reveal, origin);
}

/**
 * Icons that are inert to *walk onto*: entering the cell has no server-side effect,
 * so the step's outcome is a foregone conclusion and can be predicted. A stair is in
 * here because walking onto one does nothing — only the action button's dl move
 * traverses it. Everything absent (monster, closed door, key_<n>, gold, scroll,
 * chest) triggers a fight, a key check, an RNG roll or a one-shot grant, and must be
 * left to the server.
 */
const INERT = new Set(['start', 'exit', 'heal', 'stair_up', 'stair_down', 'door_v_open', 'door_h_open']);

/** Can we move onto this cell without asking? Only if it is known floor and inert. */
function predictable(k: string): boolean {
	if (!floors.has(k)) return false; // unknown or wall
	const icon = icons.get(k);
	return !icon || INERT.has(icon);
}

function onKeyDown(e: KeyboardEvent): void {
	const d = ARROWS[e.key];
	if (!d) return;
	e.preventDefault();
	if (held.includes(e.key)) return;
	held.push(e.key);
	// A fresh press (including a change of direction) restarts the repeat delay,
	// so this keydown's step is the only one until the key is genuinely held.
	heldSince = performance.now();
	// A message box blocks movement until dismissed (renderer.showMessage's
	// contract — normally a click); let the key that would've moved us
	// dismiss it instead, same as the frame loop's poll already respects.
	if (renderer?.messageOpen) {
		renderer.closeMessage();
		return;
	}
	// Fire the first step immediately (like the click handler) instead of
	// waiting for the next rAF tick — a quick tap's keydown+keyup can both
	// land inside the same frame gap, so the poll below would never see it.
	triggerMove?.(d[0], d[1]);
}
function onKeyUp(e: KeyboardEvent): void {
	const i = held.indexOf(e.key);
	if (i >= 0) held.splice(i, 1);
}

export default defineComponent({
	name: 'DungeonPage',
	components: { DZDisclaimer },
	props: {
		dinozId: { type: Number, required: true }
	},
	data() {
		return {
			wallDebug: false,
			buttonIcon: '' as string,
			arrowIcon: assetUrl('interf_arrow'),
			sessionStore: sessionStore(),
			currentLevel: 0
		};
	},
	computed: {
		actionImg(): string {
			if (this.needIrma) {
				return 'irma';
			} else {
				const icon = icons.get(iconKey(cursor));
				return icon ?? '';
			}
		},
		needIrma(): boolean {
			return !(useDinozStore().getDinoz(this.dinozId)?.fight ?? false);
		},
		currentDinoz() {
			return useDinozStore().getDinoz(this.dinozId);
		},
		dungeonId(): string {
			return this.$route.params.id as string;
		}
	},
	methods: {
		dungeonHash(): number {
			let h = 5381;
			for (const ch of this.dungeonId) h = (h * 33 + ch.charCodeAt(0)) | 0;
			return h;
		},
		/** Flavor name shared by a door and its key, seeded by dungeonId + key id. */
		doorName(keyId: number): string {
			// ponytail: djb2(dungeonId) offset + keyId picks a prefix and a sufix
			// (9 and 10 entries in fr.json dungeon.doorNames_prefix/_sufix — keep
			// those lengths in sync) and glues them into one flavor name.
			const seed = this.dungeonHash() + keyId;
			const doorName = this.$t(`dungeon.doorNames`, {
				prefix: this.$t(`dungeon.doorNames_prefix.${((seed % 9) + 9) % 9}`),
				sufix: this.$t(`dungeon.doorNames_sufix.${((seed % 10) + 10) % 10}`)
			});
			return doorName;
		},
		toggleDebug(): void {
			this.wallDebug = !this.wallDebug;
			renderer?.setDebug(this.wallDebug);
		},
		/**
		 * Take one step. A plain step onto known floor is walked immediately and
		 * confirmed in the background — the server reveals the whole 3×3 block around
		 * every cell entered, so the dinoz's neighbours are always already known and
		 * the answer is never in doubt. Anything with a server-side effect (fight,
		 * locked door, pickup, stair) still waits for the real answer.
		 */
		tryMove(dx: number, dy: number, dl = 0): void {
			const currentDinoz = useDinozStore().getDinoz(this.dinozId);
			if (!currentDinoz || !currentDinoz.fight || !actor) {
				return;
			}
			const at = `${cursor.l},${cursor.x + dx},${cursor.y + dy}`;
			// Known wall (already revealed): the server would just say no — skip the round-trip.
			if (dl === 0 && walls.has(at)) return;
			if (dl === 0 && !blocking && predictable(at)) {
				this.advance({ l: cursor.l, x: cursor.x + dx, y: cursor.y + dy });
				pending.push({ dx, dy, dl });
				this.flush();
				return;
			}
			// Event cell or stair: the server decides. Let the queue drain first so its
			// cursor is where we think it is, then send this step on its own. The frame
			// loop re-offers the step until it goes through.
			if (inflight || pending.length > 0) return;
			blocking = true;
			pending.push({ dx, dy, dl });
			this.flush();
		},
		/** Walk the dinoz onto `cell` and drag the follower conga line along behind it. */
		advance(cell: Cell): void {
			cursor = { ...cell };
			actor?.enqueue(cursor);
			trail.unshift({ ...cursor });
			if (trail.length > followers.length + 1) trail.pop();
			// The first enqueue each follower gets is its own cell — a walk-in-place
			// beat that staggers the line's start, as View.hx's delay = w*10 did.
			followers.forEach((f, i) => trail[i + 1] && f.enqueue({ ...trail[i + 1] }));
		},
		/**
		 * Ship the queued steps. One request in flight: everything the player walks
		 * while it's out coalesces into the next batch, so a long dash costs one
		 * round-trip rather than one per cell.
		 */
		async flush(): Promise<void> {
			const currentDinoz = useDinozStore().getDinoz(this.dinozId);
			if (inflight || pending.length === 0 || !currentDinoz) return;
			inflight = true;
			const batch = pending.splice(0, MAX_STEPS);
			try {
				this.applyResult(await DungeonService.moveDinoz(this.dungeonId, batch, currentDinoz.id), batch);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				this.snapBack(confirmed);
			} finally {
				inflight = false;
				blocking = false;
				if (pending.length > 0) this.flush();
			}
		},
		/** Fold a confirmed batch back in: reveals, messages, then reconcile our guess. */
		applyResult(move: MoveResult, batch: MoveStep[]): void {
			const currentDinoz = useDinozStore().getDinoz(this.dinozId);
			if (move.fight && currentDinoz) {
				this.sessionStore.setFightResult(move.fight);
				this.$router.push({
					name: 'Fight',
					params: { dinozId: currentDinoz.id.toString() }
				});
			}
			// What the entered cell held BEFORE this step's re-reveal clears it —
			// that difference is the pickup/opening to announce.
			const entered = icons.get(iconKey(move.pos));
			record(move.reveal, move.pos);
			if (move.applied > 0) {
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
				if (move.gold) {
					renderer?.showMessage(this.$t('dungeon.msg.gold', { value: move.gold }), 'item_gold');
				}
			}
			confirmed = { ...move.pos };
			if (!move.ok) {
				// The step after the last applied one was refused — a still-closed door
				// (no key yet) or, if we ever mispredicted, a wall.
				const step = batch[move.applied];
				if (step && step.dl === 0) {
					const at = `${move.pos.l},${move.pos.x + step.dx},${move.pos.y + step.dy}`;
					const blocked = icons.get(at);
					if (blocked === 'door_v' || blocked === 'door_h')
						renderer?.showMessage(this.$t('dungeon.msg.locked', { name: this.doorName(doorKeys.get(at) ?? 0) }));
				}
				this.snapBack(move.pos);
			} else if (move.applied < batch.length) {
				// Stopped early on an event cell. Our cursor is still valid — put the
				// tail back at the head of the queue and carry on.
				pending.unshift(...batch.slice(move.applied));
			} else if (move.applied > 0) {
				// Confirmed as predicted: walk the party onto the cell the server named.
				// A blocking step (stair, event cell) was never walked locally, so it
				// only moves the dinoz now.
				if (iconKey(cursor) !== iconKey(move.pos) && pending.length === 0) this.advance(move.pos);
			}
		},
		/** The server is the authority: drop our guesses and re-seat the party on its cell. */
		snapBack(pos: Cell): void {
			pending.length = 0;
			cursor = { ...pos };
			// placeAt re-seats the sprite; takeControl resets its queued path.
			actor?.placeAt({ ...pos });
			actor?.takeControl();
			trail.length = 0;
			trail.push({ ...pos });
			followers.forEach(f => {
				f.placeAt({ ...pos });
				f.takeControl();
			});
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
		updateButton(): void {
			const currentDinoz = useDinozStore().getDinoz(this.dinozId);
			if (!currentDinoz) {
				return;
			}
			// Only once the server has confirmed the cell under the dinoz — the button
			// acts on it, so a predicted-but-unacknowledged position must not arm it.
			if (!actor || inflight || pending.length > 0 || actor.pending > 0) return this.hideButton();
			const k = iconKey(actor.cell);
			const icon = icons.get(k);
			if (!icon) return this.hideButton();
			if (k === stairShownFor) return;
			stairShownFor = k;
			if (icon === 'stair_down' || icon === 'stair_up' || icon === 'start' || icon === 'exit') {
				this.buttonIcon = icon;
			} else {
				this.buttonIcon = '';
			}
		},
		hideButton(): void {
			if (stairShownFor === null) return;
			stairShownFor = null;
			this.buttonIcon = '';
		},
		async action(): Promise<void> {
			const currentDinoz = useDinozStore().getDinoz(this.dinozId);
			if (!currentDinoz) {
				return;
			}
			if (this.needIrma) {
				if (currentDinoz.fight) {
					return;
				}
				try {
					const toast = await DinozService.useIrma(currentDinoz.id);
					if (toast.category === ItemEffect.ACTION && toast.value > 0) {
						const message = this.$t(`toast.${toast.category}`, { value: toast.value }, toast.value);
						this.$toast.open({
							message: message,
							type: 'info'
						});
					}
					await useDinozStore().refreshDinozFiche(currentDinoz.id);
				} catch (e) {
					errorHandler.handle(e, this.$toast);
				}
			}
			const icon = icons.get(iconKey(cursor));
			if (icon === 'stair_up') this.tryMove(0, 0, 1);
			else if (icon === 'stair_down') this.tryMove(0, 0, -1);
			else if (icon === 'start' || icon === 'exit') {
				try {
					await DungeonService.exitDungeon(this.dungeonId, currentDinoz.id);
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
				await useDinozStore().refreshDinozFiche(currentDinoz.id);
				this.$router.push({
					name: 'DinozPage',
					params: { id: currentDinoz.id.toString() }
				});
			}
		},
		/** Build the maze from the run DinozActions already fetched via DungeonService.enterDungeon(). */
		async build(): Promise<void> {
			const currentDinoz = useDinozStore().getDinoz(this.dinozId);
			// enterDungeon() runs in DinozActions.launch() before routing here, so a throw
			// (e.g. team already in a dungeon) is caught there and never reaches this page.
			const run = this.sessionStore.getDungeonRun;
			if (!currentDinoz || !run) {
				this.$router.go(-1);
				return;
			}
			this.sessionStore.setDungeonRun(undefined);
			this.currentLevel = -run.pos.l - 1;
			useDinozStore().setCurrentDinozId(this.dinozId);

			icons.clear();
			doorKeys.clear();
			walls.clear();
			floors.clear();
			pending.length = 0;
			inflight = false;
			blocking = false;
			this.hideButton();

			const skins: Skin[] = SKINS.filter(s => s.name === run.skin);
			// Lazy-load only this run's tiles now that the server told us the skin.
			await loadDungeonAssets(skins.flatMap(skinAssetNames));
			// cell 45 → the dino renders at native resolution; 500×350 viewport scrolls.
			renderer = new MazeRenderer(
				this.$refs.stageEl as HTMLDivElement,
				{ width: run.width, height: run.height, levels: run.levels },
				{ cell: 45, skins, view: { w: 500, h: 350 }, noiseSeed: this.dungeonHash() }
			);
			renderer.setDebug(this.wallDebug);
			if (run.run.message) {
				renderer.showMessage(this.$t(run.run.message));
			}

			record(run.reveal, run.pos);
			// applyReveal() only flags the level dirty and lets the ticker redraw
			// it next frame (batches multiple reveals into one showLevel() call) —
			// force that first paint now instead of waiting on a tick. showLevel()
			// itself only rebuilds the scene graph, though: PixiJS's cacheAsBitmap
			// bake (and the actual pixel render) is deferred to the next real
			// render() pass regardless, so force that too, or the canvas just sits
			// on its last frame (plain fog) until something else happens to render.
			renderer.showLevel(renderer.currentLevel);
			try {
				renderer.app.render();
			} catch (err) {
				console.error('DungeonPage: initial render failed', err);
			}
			actor = new DinozActor(renderer, {
				code: currentDinoz.display,
				speed: WALK_SPEED,
				onLevelChange: l => renderer?.showLevel(l)
			});
			actor.placeAt({ ...run.pos });
			actor.takeControl();
			cursor = { ...run.pos };
			confirmed = { ...run.pos };
			trail.length = 0;
			trail.push({ ...run.pos });
			for (const d of useDinozStore()
				.getDinozParty(currentDinoz.id)
				.filter(p => p.id !== currentDinoz.id)) {
				const f = new DinozActor(renderer, { code: d.display, speed: WALK_SPEED, lead: false });
				f.placeAt({ ...run.pos });
				f.takeControl();
				followers.push(f);
			}
		}
	},
	async mounted() {
		await this.build();

		triggerMove = (dx, dy) => this.tryMove(dx, dy);
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);

		const frame = (): void => {
			// View.hx froze scroll & moves while winMsg was up — same rule here.
			if (actor && !renderer?.messageOpen) {
				// Auto-repeat a *held* key: the keydown already fired its own step, so
				// this only takes over once the key has outlived REPEAT_DELAY — one tap
				// is one cell. Past that, feed the next step while the current one is
				// down to its last queued segment, so the walk never drains to 'stand'
				// between cells. The cadence is the animation, not the network: a
				// predicted step is walked now and confirmed later.
				if (held.length > 0 && performance.now() - heldSince >= REPEAT_DELAY && actor.pending <= 1) {
					const d = ARROWS[held[held.length - 1]];
					this.tryMove(d[0], d[1]);
				} else if (held.length === 0 && actor.pending === 0 && !inflight && pending.length === 0) {
					this.catchUp();
				}
			}
			this.updateButton();
			rafId = requestAnimationFrame(frame);
		};
		rafId = requestAnimationFrame(frame);
	},
	beforeUnmount() {
		cancelAnimationFrame(rafId);
		triggerMove = null;
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
		floors.clear();
		held.length = 0;
		heldSince = 0;
		pending.length = 0;
		inflight = false;
		blocking = false;
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

.stage {
	display: inline-block;
	position: relative;
	border: 1px solid #1b1e26;
	border-radius: 8px;
	overflow: hidden;
	line-height: 0;
}

// View.hx: arrows attached at (5,5) — top-left of the stage
.dpad {
	position: absolute;
	top: 8px;
	left: 8px;
	z-index: 1;
	width: 92px;
	height: 92px;

	.btn {
		position: absolute;
		top: auto;
		right: auto;
		background: transparent;
		border: none;

		&:hover {
			background: transparent;
			filter: drop-shadow(0 0 2px #ffec4f) drop-shadow(0 0 6px #fff44f) drop-shadow(0 0 12px rgba(255, 244, 79, 0.6));
			border: none;
		}
	}

	// interf_arrow.png points right; rotate it per direction instead of shipping 4 assets
	.up {
		top: 0;
		left: 26px;
		img {
			transform: rotate(-90deg);
		}
	}
	.down {
		top: 52px;
		left: 26px;
		img {
			transform: rotate(90deg);
		}
	}
	.left {
		top: 26px;
		left: 0;
		img {
			transform: rotate(180deg);
		}
	}
	.right {
		top: 26px;
		left: 52px;
	}
	.center {
		top: 26px;
		left: 26px;
		img {
			width: 22px;
			height: auto;
		}
	}
}

.floor {
	position: absolute;
	bottom: 12px;
	left: 8px;
}

.btn {
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
	width: 40px;
	height: 40px;
	// View.hx: arrows.filters = [ new GlowFilter(0x0, 0.5, 10, 10, 1, 2) ]
	filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.5));

	// View.hx: onRollOver -> gotoAndStop(2); no hover-frame asset here, so highlight instead
	&:hover {
		background: rgba(35, 30, 55, 0.9);
		border-color: #8f7fd6;
	}

	img {
		image-rendering: pixelated;
	}
}
</style>
