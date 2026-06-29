# DinoRPG — Maze POC

A standalone proof-of-concept that **generates a DinoRPG-style dungeon, encodes
it, decodes it, and renders it with Pixi.js**, then walks an animated dinoz from
the start to the exit. The dinoz sprite is produced by
[`@eternaltwin/dinorpg_animations`](https://www.npmjs.com/package/@eternaltwin/dinorpg_animations).

## What this ports

The data model and codec are ported from the Motion Twin
[WebGamesArchives](https://github.com/motion-twin/WebGamesArchives) DinoRPG sources:

| This module                   | Haxe source                                                   |
| ----------------------------- | ------------------------------------------------------------- |
| `src/dungeon/types.ts`        | `com/DungeonCodec.hx` typedefs + `com/DungeonData.hx`         |
| `src/dungeon/DungeonCodec.ts` | `com/DungeonCodec.hx` (encode/decode, RLE table, bit packing) |
| `src/dungeon/BitCodec.ts`     | re-implementation of `mt.BitCodec`                            |
| `src/render/skins.ts`         | skin/fog table from `gfx/dungeon/View.hx`                     |
| `public/dungeon/gfx/*`        | tileset PNGs copied from `gfx/dungeon/gfx/`                   |

The renderer follows the original `gfx/dungeon/View.hx`: 40px cells, walkable
cells get a ground tile, and wall edges are composited from front (N) / back (S)
/ side (W/E, mirrored) / corner (diagonal, mirrored) pieces of the level's
**skin**, over the skin's fog colour. Items, doors and stairs use the real
`item_` / `interf_` sprites. Each level is assigned a different skin.

### Caveats

1. **`mt.BitCodec` is not in the archive.** It was part of Motion Twin's
   proprietary `mt` library and was never open-sourced. `BitCodec.ts` is a
   self-consistent re-implementation: it round-trips with itself, but it is **not
   binary-compatible** with the historical server strings (the original
   bit-packing order and CRC polynomial are lost).

2. **The generator here is original.** The real server-side generator _does_
   exist in the archive under `gfx/dungeon/gen/` (`Generator.hx`, `Rooms.hx`,
   `Noise.hx`, …) but is not ported yet; `src/dungeon/DungeonGenerator.ts` is an
   independent generator that emits structures matching the ported data model
   (grid of rooms, a perfect maze of doors carved by recursive backtracking, plus
   loops, stairs between levels, a locked door + key, and chests). Porting the
   archive's `gen/` is a natural next step.

So the faithful, archive-derived parts are the **data model + codec** and the
**tileset / skin rendering**; the **generator** is new code built on top.

## Layout

```
src/dungeon/   pure logic, no DOM/Pixi (Node-testable)
  BitCodec.ts        bit reader/writer + CRC
  types.ts           DungeonStruct / DungeonRoom / DungeonLevel / DungeonItem ...
  DungeonCodec.ts    encode() / decode()
  DungeonGenerator.ts generate() -> DungeonStruct
  pathfind.ts        multi-level BFS (used by the walk + the test)
src/render/    Pixi.js rendering
  skins.ts           skin table (wall/ground themes + fog) + asset-name lists
  assets.ts          preloads + caches the tileset textures
  MazeRenderer.ts    draws one level from the tileset: ground, walls, items, ...
  DinozActor.ts      sdino wrapper that walks a path, flips, and changes level
src/main.ts    wires generate -> encode -> decode -> render -> walk
public/dungeon/gfx/  201 tileset PNGs from the archive
test/          pure-logic round-trip + solvability tests
```

## Run

From the monorepo root, install once so the workspace is linked:

```sh
yarn install
```

Then, in `maze-poc/`:

```sh
yarn dev      # Vite dev server (open the printed URL)
yarn test     # pure-logic codec/generator tests (no browser)
yarn build    # type-check + production bundle
```

## How the pieces connect

1. `DungeonGenerator.generate({ seed })` builds a `DungeonStruct`.
2. `DungeonCodec.encode()` serialises it; `decode()` reads it back and checks the
   CRC. The app renders the **decoded** struct, proving the round-trip.
3. `MazeRenderer` draws the current level from the tileset (ground + wall edges
   for the level's skin), with item / door / stair sprites; start and exit are
   marked with coloured rings (see the in-page legend).
4. `findPath()` computes a start→exit route across levels (stairs included), and
   `DinozActor` tweens the `sdino` along it, flipping to face its direction and
   asking the renderer to switch levels when it takes a staircase.
