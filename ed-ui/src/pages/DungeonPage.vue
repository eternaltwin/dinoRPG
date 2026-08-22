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
import { ARROWS, KEY_SKIN_COUNT, SKINS } from '@drpg/core/models/dungeon/DungeonClient';
import type { Cell, RevealedCell, Skin } from '@drpg/core/models/dungeon/DungeonClient';
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

// `origin` is the player's cell as of this reveal (View.hx posX/posY at
// updateFog() time, i.e. after the move already landed) — orients each
// reveal's fade-fx away from the player. See MazeRenderer#applyReveal.
function record(reveal: RevealedCell[], origin?: Cell): void {
	for (const c of reveal) {
		// Re-sent cells can lose their icon (key picked up, monster beaten).
		if (c.icon) icons.set(`${c.l},${c.x},${c.y}`, c.icon);
		else icons.delete(`${c.l},${c.x},${c.y}`);
		if (c.key != null) doorKeys.set(`${c.l},${c.x},${c.y}`, c.key);
		if (!c.floor) walls.add(`${c.l},${c.x},${c.y}`);
	}
	renderer?.applyReveal(reveal, origin);
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
		/** Ask the server for one step; on approval, walk the dinoz and fold in the reveal. */
		async tryMove(dx: number, dy: number, dl = 0): Promise<void> {
			const currentDinoz = useDinozStore().getDinoz(this.dinozId);
			if (!currentDinoz || !currentDinoz.fight) {
				return;
			}
			if (moving || !actor) return;
			// Known wall (already revealed): the server would just say no — skip the round-trip.
			if (dl === 0 && walls.has(`${cursor.l},${cursor.x + dx},${cursor.y + dy}`)) return;
			moving = true;
			try {
				const move = await DungeonService.moveDinoz(this.dungeonId, dx, dy, dl, currentDinoz.id);
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
						params: { dinozId: currentDinoz.id.toString() }
					});
				}
				// What the entered cell held BEFORE this step's re-reveal clears it —
				// that difference is the pickup/opening to announce.
				const entered = icons.get(iconKey(move.pos));
				record(move.reveal, move.pos);
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
		updateButton(): void {
			const currentDinoz = useDinozStore().getDinoz(this.dinozId);
			if (!currentDinoz) {
				return;
			}
			if (!actor || moving || actor.pending > 0) return this.hideButton();
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
			if (icon === 'stair_up') await this.tryMove(0, 0, 1);
			else if (icon === 'stair_down') await this.tryMove(0, 0, -1);
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
			this.updateButton();
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
