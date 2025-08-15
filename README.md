// README for CodeMap AI extension
# CodeMap AI

A VS Code extension that automatically scans your project and generates structured CODEMAP files designed specifically for AI assistants like GitHub Copilot, Cody, and Continue.

## What it does

CodeMap AI maintains up-to-date `CODEMAP.md` files that give AI assistants instant context about your project structure, files, symbols, routes, and database schemas. No more explaining your codebase every time!

## Features

- **Automatic scanning** on workspace open, file save, and git commits
- **Smart symbol extraction** using VS Code's Language Server Protocol (LSP)
- **Framework detection** for Flask, Django, FastAPI, Express, React, Next.js, Angular, Nest, Spring Boot
- **Route mapping** for API endpoints across frameworks
- **Database schema detection** for SQLAlchemy, Django models, TypeORM, Prisma
- **Incremental updates** - only rescans changed files
- **Status bar notifications** showing scan progress
- **Summary popup** after scans complete

## Supported Frameworks

### Python
- Flask (routes, blueprints)
- Django (URLs, models, migrations)
- FastAPI (routes, dependencies)

### JavaScript/TypeScript
- Express.js (routes, middleware)
- React (components, hooks)
- Next.js (pages, API routes)
- Angular (components, routes, modules)
- Nest.js (controllers, modules)

### Java
- Spring Boot (controllers, entities, repositories)

### Databases
- SQL (CREATE TABLE statements)
- SQLAlchemy (models, relationships)
- Django ORM (models)
- TypeORM (entities)
- Prisma (schemas)

## Usage with AI Assistants

### GitHub Copilot
Add this to your prompts:
\`\`\`
@workspace Include #CODEMAP.md for project context
\`\`\`

### Continue/Cody
Reference specific files:
\`\`\`
See ### /backend/routes/auth.py in CODEMAP.md for authentication routes
\`\`\`

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `codemap.maxFileKB` | 800 | Max file size to scan (KB) |
| `codemap.shardMaxKB` | 200 | Max shard size before splitting (KB) |
| `codemap.debounceMs` | 750 | Debounce time for file saves (ms) |
| `codemap.enableGitIntegration` | true | Enable git change detection |
| `codemap.respectGitignore` | true | Respect .gitignore rules |
| `codemap.summaryOnOpen` | true | Show summary popup on workspace open |

## Commands

- `CodeMap: Full Rescan` - Rescan entire workspace
- `CodeMap: Open Summary` - Show summary popup
- `CodeMap: Validate Map` - Check if map is up to date

## Output Files

- `CODEMAP.md` - Main project map
- `CODEMAP_routes.md` - API routes (if large)
- `CODEMAP_db.md` - Database schemas (if large)  
- `CODEMAP_symbols.md` - Symbol inventory (if large)

## Privacy

All scanning happens locally. No code leaves your machine.

## License

MIT
