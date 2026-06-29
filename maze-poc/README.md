# DinoRPG — Maze POC

A standalone proof-of-concept that **generates a DinoRPG-style dungeon, encodes
it, decodes it, and renders it with Pixi.js**, then walks an animated dinoz from
the start to the exit. The dinoz sprite is produced by
[`@eternaltwin/dinorpg_animations`](https://www.npmjs.com/package/@eternaltwin/dinorpg_animations).

## What this ports

The data model and codec are ported from the Motion Twin
[WebGamesArchives](https://github.com/motion-twin/WebGamesArchives) DinoRPG sources:

| This module | Haxe source |
|-------------|-------------|
| `src/dungeon/types.ts` | `com/DungeonCodec.hx` typedefs + `com/DungeonData.hx` |
| `src/dungeon/DungeonCodec.ts` | `com/DungeonCodec.hx` (encode/decode, RLE table, bit packing) |
| `src/dungeon/BitCodec.ts` | re-implementation of `mt.BitCodec` |

### Two important caveats

1. **`mt.BitCodec` is not in the archive.** It was part of Motion Twin's
   proprietary `mt` library and was never open-sourced. `BitCodec.ts` is a
   self-consistent re-implementation: it round-trips with itself, but it is **not
   binary-compatible** with the historical server strings (the original
   bit-packing order and CRC polynomial are lost).

2. **The dungeon *generator* is not in the archive either.** `data/Dungeon.hx`
   only *parses* dungeon XML, and the real layouts were generated server-side and
   shipped as pre-encoded strings. `src/dungeon/DungeonGenerator.ts` is therefore
   an original generator that emits structures matching the ported data model
   (grid of rooms, a perfect maze of doors carved by recursive backtracking, plus
   loops, stairs between levels, a locked door + key, and chests).

So the faithful, archive-derived part is the **data model + codec**; the
**generator** and **renderer** are new code built on top of it.

## Layout

```
src/dungeon/   pure logic, no DOM/Pixi (Node-testable)
  BitCodec.ts        bit reader/writer + CRC
  types.ts           DungeonStruct / DungeonRoom / DungeonLevel / DungeonItem ...
  DungeonCodec.ts    encode() / decode()
  DungeonGenerator.ts generate() -> DungeonStruct
  pathfind.ts        multi-level BFS (used by the walk + the test)
src/render/    Pixi.js rendering
  MazeRenderer.ts    draws one level: walls, floors, doors, items, start/exit
  DinozActor.ts      sdino wrapper that walks a path, flips, and changes level
src/main.ts    wires generate -> encode -> decode -> render -> walk
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
3. `MazeRenderer` draws the current level; coloured markers show doors, items,
   start and exit (see the in-page legend).
4. `findPath()` computes a start→exit route across levels (stairs included), and
   `DinozActor` tweens the `sdino` along it, flipping to face its direction and
   asking the renderer to switch levels when it takes a staircase.
