# Prisma Enums ES Module Wrapper

This folder contains a simple wrapper for using Prisma enums in browser/Vite environments.

## Problem

Prisma generates `index-browser.js` using CommonJS (`exports`), but Vite/Vue requires ES modules (`export`). Directly importing enums from `@drpg/prisma` causes errors like:

```
SyntaxError: The requested module does not provide an export named 'AdminRole'
```

## Solution

We auto-generate `enums.mjs` which extracts enum values from the Prisma-generated code and creates standalone ES module exports compatible with Vite.

### Usage in Vue/Frontend Code

Instead of:

```typescript
import { AdminRole } from '@drpg/prisma'; // ❌ Doesn't work in browser
```

Use:

```typescript
import { AdminRole } from '@drpg/prisma/enums'; // ✅ Works in browser/Vite
```

All Prisma enums are available:

```typescript
import { AdminRole, Lang, OfferStatus, LogType } from '@drpg/prisma/enums';
```

### Automatic Updates

**Fully automatic!** The `enums.mjs` file is auto-generated after running `prisma generate`.

**Workflow:**

1. Modify `ed-be/prisma/schema.prisma` (add/modify enums)
2. Run `yarn db:sync:dev` from ed-be folder
3. The `generate-enums-wrapper.js` script automatically runs and regenerates `enums.mjs` with all enum values
4. All new enums are immediately available in frontend code!

### How It Works

The `generate-enums-wrapper.js` script:

1. Reads the generated `index-browser.js` file
2. Extracts all enum definitions using regex patterns
3. Creates standalone ES module exports in `enums.mjs` with the actual enum values
4. No runtime dependency on the CommonJS module - pure ES modules

### Files

- `enums.mjs` - Auto-generated ES module with standalone enum exports (pure ES module, no CommonJS imports)
- `generate-enums-wrapper.js` - Script that extracts enums from `index-browser.js` and generates `enums.mjs`
- `package.json` - Configured with `exports` field to enable `/enums` import path

### Backend Usage

In backend code (ed-be), continue importing from the main package:

```typescript
import { AdminRole } from '@drpg/prisma'; // ✅ Works fine in Node.js
```
