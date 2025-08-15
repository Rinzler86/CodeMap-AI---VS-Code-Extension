project name

vscode-codemap-ai (feel free to rename)

repository layout
    CODEMAPEXTENSION/
├─ package.json
├─ tsconfig.json
├─ README.md
├─ CHANGELOG.md
├─ .gitignore
├─ .codemapignore            # sample ignore file (like .gitignore)
├─ assets/
│  └─ icons.svg
├─ .vscode/
│  ├─ launch.json
│  └─ tasks.json
└─ src/
   ├─ extension.ts           # entry: wires listeners, scans, UI
   ├─ statusBar.ts           # "CodeMap: scanning/updated" indicator
   ├─ logger.ts              # OutputChannel wrapper
   ├─ config.ts              # user settings + defaults
   ├─ ui/
   │  └─ summaryWebview.ts   # pop-up summary panel after scans
   ├─ utils/
   │  ├─ fs.ts               # fs helpers, atomic writes
   │  ├─ git.ts              # git HEAD, changed files, hooks
   │  ├─ hash.ts             # sha256 or fast hash
   │  ├─ lsp.ts              # workspace/document symbols via VS Code APIs
   │  └─ ignore.ts           # merge .gitignore + .codemapignore globs
   ├─ triggers/
   │  ├─ saveTrigger.ts      # onDidSaveTextDocument (debounced)
   │  ├─ gitTrigger.ts       # listens to git changes / polls HEAD
   │  ├─ commandTrigger.ts   # manual rescan/validate/open summary
   │  └─ workspaceOpenTrigger.ts # initial scan on open
   ├─ index/
   │  ├─ indexStore.ts       # persistent per-file hashes + meta
   │  ├─ codemapEmitter.ts   # writes CODEMAP.md + shards
   │  ├─ shardWriter.ts      # splits large sections
   │  ├─ delta.ts            # diff/changed files → sections
   │  └─ schemas.ts          # TS interfaces + map schema
   ├─ scanners/
   │  ├─ scanner.ts          # IScanner interface
   │  ├─ genericScanner.ts   # file tree, symbols via LSP, fallbacks
   │  ├─ python/
   │  │  ├─ flaskScanner.ts
   │  │  ├─ djangoScanner.ts
   │  │  └─ fastapiScanner.ts
   │  ├─ js/
   │  │  ├─ expressScanner.ts
   │  │  ├─ reactScanner.ts
   │  │  ├─ nextScanner.ts
   │  │  └─ angularScanner.ts
   │  ├─ js-nest/
   │  │  └─ nestScanner.ts
   │  ├─ java/
   │  │  └─ springScanner.ts
   │  └─ db/
   │     ├─ sqlScanner.ts
   │     └─ ormScanner.ts    # sqlalchemy, django models, typeorm, prisma
   ├─ providers/
   │  └─ continueProvider.ts # optional: auto-inject CODEMAP into Continue
   └─ cli/
      └─ index.ts            # codemap-cli for CI/hooks

package.json (key contributions)

activation:

onStartupFinished, workspaceContains:**/*

commands:

codemap.fullRescan

codemap.openSummary

codemap.validate

configuration (user/workspace settings):

codemap.maxFileKB (default 800)

codemap.shardMaxKB (default 200)

codemap.debounceMs (default 750)

codemap.enableGitIntegration (default true)

codemap.respectGitignore (default true)

codemap.extraIgnoreGlobs (array)

codemap.emitRoutes / emitDatabase / emitSymbols (bools)

codemap.failCIIfStale (bool; CLI respects)

codemap.summaryOnOpen (bool)

menus:

Command Palette + Explorer context (“Open CodeMap Summary”)

tsconfig

target ES2022, module commonjs, strict true, moduleResolution node, outDir dist.

core behaviors
triggers

saveTrigger: on workspace.onDidSaveTextDocument → debounce → reindex changed file only.

gitTrigger:

if built-in Git API present, subscribe to repo state changes; else poll git rev-parse HEAD every ~4–6s when window focused.

detect changed files for incremental scan; on new HEAD: emit a ## CHANGES since <prev> section.

workspaceOpenTrigger: initial scan (with progress) then optional summary pop-up.

commandTrigger: manual rescan/validate/open summary.

indexing pipeline

collect candidates

walk workspace folders; apply ignore rules:

.gitignore (if enabled), .codemapignore, codemap.extraIgnoreGlobs, built-in excludes (node_modules, .venv, build, dist, .git, .idea, .vscode, target).

skip binary/oversized files (> maxFileKB).

per-file hash check

if unchanged hash → skip.

symbol extraction

primary: VS Code cmds

vscode.executeDocumentSymbolProvider

vscode.executeWorkspaceSymbolProvider (for full scans; chunk by prefix to avoid timeouts)

fallback regex heuristics by extension (see “regex kit” below).

framework detectors

run detectors that apply (based on package manifests, imports, decorators/annotations, folder conventions).

emit

write/update:

CODEMAP.md (project + directories + file index)

CODEMAP_routes.md (routes by framework)

CODEMAP_db.md (DB tables/models)

CODEMAP_symbols.md (flat exported symbol inventory)

shard any section above shardMaxKB.

store

update .vscode/.codemap/index.json (per-path: hash, lang, lastScan, detectors hit, summary).

map file spec (LLM-friendly, deterministic)
CODEMAP.md (root)
# CODEMAP v1
project: <name>   root: /   last_scan: 2025-08-15T14:31-04:00-0400   head: <git-sha>

## DIRECTORIES
- /backend — Flask API (auth, menu, orders)
- /frontend — React app (routing, cart, checkout)

## FILES (index)
### /backend/routes/main.py
hash: 9e..f2  lang: py  size: 12.4KB
summary: Flask routes for menu + orders
symbols: function get_menu(), function submit_order(order), class OrderValidator
refs: /backend/db/models.py (MenuItem, Order)

### /frontend/src/components/Menu.tsx
hash: 1a..77  lang: tsx  size: 8.1KB
summary: Menu list + variant picker
symbols: component Menu, hook useVariants()
refs: /frontend/src/state/cart.ts (addItem)

CODEMAP_routes.md
## ROUTES[flask]
- GET /api/menu  → main.get_menu   file: /backend/routes/main.py
- POST /api/orders  → main.submit_order  file: /backend/routes/main.py  emits: event order_created

## ROUTES[express]
- GET /api/menu     → menuRouter.getMenu     file: /server/routes/menu.ts
- POST /api/order   → orderRouter.create     file: /server/routes/order.ts

## ROUTES[django]
- GET /pets/        → pets.views.list        file: /pets/urls.py
- POST /pets/       → pets.views.create      file: /pets/urls.py

## ROUTES[spring]
- GET /api/items    → ItemController.list    file: /src/main/java/.../ItemController.java

CODEMAP_db.md
## DATABASE[sqlalchemy]
table menu_items(id*, name, base_price, category)
table orders(id*, total, status, created_at)
relation order_items(order_id→orders.id*, item_id→menu_items.id*)

## DATABASE[django]
model Pet(id*, name:str, age:int, adopted:bool)

## DATABASE[prisma]
model User(id Int @id, email String @unique, createdAt DateTime @default(now()))

CODEMAP_symbols.md
# SYMBOLS (exported)
- /backend/routes/main.py → get_menu, submit_order, OrderValidator
- /frontend/src/components/Menu.tsx → Menu, useVariants
- /server/routes/menu.ts → getMenu, mapMenuResponse
...

optional changes section (appended to root)
## CHANGES since 845ab3d
+ added /frontend/src/components/Cart.tsx (component Cart)
~ modified /backend/db/models.py (added class DiscountCode)
- removed /server/legacy/healthcheck.js

TypeScript interfaces (schemas.ts)
export interface FileEntry {
  path: string;           // /relative/path
  lang: string;           // py, ts, tsx, js, java, sql, etc.
  hash: string;
  bytes: number;
  summary?: string;       // single-line, rule-based
  symbols?: SymbolEntry[];
  refs?: string[];        // referenced paths (best-effort)
  detectors?: string[];   // e.g., ["flask","sqlalchemy"]
  truncated?: boolean;
}

export interface SymbolEntry {
  kind: "class"|"function"|"method"|"component"|"hook"|"type"|"variable"|"route"|"entity";
  name: string;
  detail?: string;        // signature-ish
}

export interface RouteEntry {
  framework: "flask"|"django"|"fastapi"|"express"|"next"|"angular"|"nest"|"spring";
  method: string;         // GET/POST/PUT/DELETE/ANY
  path: string;
  handler: string;        // dotted or file-local
  file: string;           // path
  notes?: string;         // emits: event X, middleware Y, etc.
}

export interface TableEntry {
  source: "sqlalchemy"|"django"|"typeorm"|"prisma"|"raw-sql";
  kind: "table"|"model"|"entity";
  name: string;
  columns: { name: string; type?: string; pk?: boolean }[];
  relations?: string[];   // best-effort FKs
}

export interface IndexStore {
  version: 1;
  head?: string;
  files: Record<string, { hash: string; lang: string; lastScan: number }>;
}

extension.ts (responsibilities)

create OutputChannel + StatusBarItem.

load config + indexStore.

register commands:

codemap.fullRescan → run full pipeline, then summary panel.

codemap.openSummary → open current summary webview (reads map).

codemap.validate → check staleness vs HEAD; show diagnostic.

wire triggers:

save debounce → incremental scan of changed doc.

git change → recompute delta; append ## CHANGES.

workspace open → initial scan (with progress); optional summary popup.

handle errors gracefully (log, non-blocking).

scanners
genericScanner.ts

builds FileEntry:

detect lang by extension.

LSP: executeDocumentSymbolProvider → flatten to SymbolEntry[].

summary: first non-comment top-level docstring or rule-based “best guess” (e.g., “Express router for X” if keywords present).

refs (best-effort): basic import/require/from tracking per lang.

python/flaskScanner.ts

enable if flask in imports or app/blueprints found.

regex kit (safe fallbacks):

route: @(?:\w+\.)?route\(\s*['"]([^'"]+)['"](?:.*methods\s*=\s*\[([^\]]+)\])?

blueprint route: @\w+\.route\( similarly

collect (method(s), path, handlerName, file) into RouteEntry.

python/djangoScanner.ts

enable if manage.py or django in deps.

parse urls.py for path|re_path patterns:

path\(['"]([^'"]+)['"]\s*,\s*([a-zA-Z0-9_\.]+) (view dotted path)

models: class (\w+)\(models\.Model\): then field lines (\w+)\s*=\s*models\.(\w+)

migrations: filenames + operation keywords (CreateModel, AddField, etc.)

python/fastapiScanner.ts

detect from fastapi import FastAPI or APIRouter.

route decorators: @app\.(get|post|put|delete)\(['"]([^'"]+)['"]

js/expressScanner.ts

detect express dep or require('express').

routes:

app\.(get|post|put|delete|patch|all)\(['"]([^'"]+)['"]

router\.(get|post|...)

try to capture chained middlewares by counting handler args.

js/reactScanner.ts

detect JSX/TSX & react dep.

components:

export (default )?function (\w+)

export const (\w+)\s*=\s*\( (function component)

class (\w+)\s+extends\s+React\.Component

hooks: export function use[A-Z]\w+

js/nextScanner.ts

detect next dep + app/ or pages/.

pages/routes:

app/**/page.(tsx|jsx) → route path

pages/**/*.tsx? → legacy routes

API routes app/**/route.ts pages/api/**.

js/angularScanner.ts

detect angular.json.

@NgModule, @Component, RouterModule.forRoot|forChild([...]) route array.

js-nest/nestScanner.ts

detect @nestjs/* deps.

@Controller('path') + @Get/Post/...('sub') → routes.

@Module for module graph.

java/springScanner.ts

detect pom.xml or build.gradle with spring-boot-starter.

controllers:

@RestController / @Controller

@RequestMapping("..."), @GetMapping("..."), etc.

entities:

@Entity → class name + fields

repos:

interface X extends JpaRepository<...>.

db/sqlScanner.ts

look for CREATE TABLE blocks:

CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\);

parse columns: (\w+)\s+([A-Z]+[\w\(\)]*) (best-effort)

db/ormScanner.ts

sqlalchemy: class X(Base): __tablename__ = 'x'; fields Column(...)

django models: see djangoScanner

typeorm: @Entity() class X; @Column()

prisma: model X { ... }

codemapEmitter.ts (rules)

strictly ordered sections: PROJECT → DIRECTORIES → FILES → (optional) ROUTES → DATABASE → SYMBOLS → CHANGES.

keep one-line summaries; avoid prose.

anchor per file: ### /path/file.ext

shard: write CODEMAP_routes.md / CODEMAP_db.md / CODEMAP_symbols.md when sizes exceed shardMaxKB.

atomic write: write to temp, rename.

statusBar.ts

left text: CodeMap: scanning… | updated (Δ n) | idle

tooltip: last scan time, files indexed, symbols count.

click → codemap.openSummary.

summaryWebview.ts

basic HTML view: counts, recent changes, top routes, db tables.

buttons: “Open CODEMAP.md”, “Full Rescan”, “Validate”.

cli/index.ts (codemap-cli)

scan --changed (uses git diff to limit)

validate --head HEAD (exit 1 if map stale vs HEAD)

print-head (debug)

expose binary via bin in package.json.

sample .git/hooks/post-commit:

#!/usr/bin/env bash
npx codemap-cli scan --changed || true

providers/continueProvider.ts (optional)

minimal Continue context provider that:

reads latest CODEMAP.md plus shards

injects them as pinned context at top of prompts

config flag codemap.continue.enable to toggle.

config defaults (config.ts)
export const DEFAULTS = {
  maxFileKB: 800,
  shardMaxKB: 200,
  debounceMs: 750,
  enableGitIntegration: true,
  respectGitignore: true,
  emitRoutes: true,
  emitDatabase: true,
  emitSymbols: true,
  failCIIfStale: false,
  summaryOnOpen: true,
};

regex kit (fallbacks; keep conservative)

Flask

@(?:\w+\.)?route\(\s*['"]([^'"]+)['"]

methods\s*=\s*\[([^\]]+)\]

Django urls

path\(\s*['"]([^'"]+)['"]\s*,\s*([\w\.]+)

re_path\(\s*r?['"]([^'"]+)['"]\s*,\s*([\w\.]+)

FastAPI

@app\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]

Express

(app|router)\.(get|post|put|delete|patch|all)\(\s*['"]([^'"]+)['"]

React components

export\s+(default\s+)?function\s+([A-Z]\w+)

export\s+const\s+([A-Z]\w+)\s*=\s*\(

class\s+([A-Z]\w+)\s+extends\s+React\.Component

Angular routes

RouterModule\.(forRoot|forChild)\(\s*\[([\s\S]*?)\]\s*\)

Nest

@Controller\(\s*['"]([^'"]*)['"]?\s*\)

@(Get|Post|Put|Delete|Patch)\(\s*['"]?([^'"]*)['"]?\s*\)

Spring

@RequestMapping\(\s*["']([^"']+)["']

@(Get|Post|Put|Delete|Patch)Mapping\(\s*["']([^"']+)["']

@Entity\b

SQL

CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\);

SQLAlchemy fields

(\w+)\s*=\s*Column\(([\s\S]*?)\)

Prisma

model\s+(\w+)\s*\{([\s\S]*?)\}

(Use LSP first; regex only fills gaps.)

performance rules

coalesce multiple saves within debounceMs.

limit symbol collection per file to first ~150 entries; mark truncated: true.

never parse > maxFileKB files (but keep in FILES index with “skipped: too large”).

ignore dirs: node_modules, .git, .vscode, .idea, dist, build, target, .venv, __pycache__.

README (what users see)

what it does (maintains CODEMAP*.md for AI assistants).

supported stacks (Flask/Django/FastAPI, Express/Next/React/Angular/Nest, Spring Boot; SQL & common ORMs).

how to use in Copilot/Cody/Continue:

“include #CODEMAP.md in your prompt” and reference anchors like ### /backend/routes/main.py.

settings reference.

CI/CLI usage.

privacy note (no code leaves machine).

opinions / best practices (for Claude to honor)

LSP first, regex last. Faster, more accurate across languages.

Deterministic headings and short summaries beat flowery text for retrieval.

Routes + DB deserve dedicated shards; this answers 80% of “does it exist / where?” queries instantly.

Atomic writes for map files to avoid half-written results.

Fail CI if stale (optional) to keep maps honest in teams.

acceptance checklist (MVP)

initial full scan under 10s on ~2k files (excluding vendor).

incremental save → update map within ~1s.

git commit triggers ## CHANGES section.

maps shard when any file > 200KB.

Copilot/Cody can answer: “where is submit_order?”, “do we have a route for /api/menu?”, “which model has variants?”.