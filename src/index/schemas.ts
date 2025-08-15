// TypeScript interfaces for CodeMap AI
export interface FileEntry {
  path: string;
  lang: string;
  hash: string;
  bytes: number;
  summary?: string;
  symbols?: SymbolEntry[];
  refs?: string[];
  detectors?: string[];
  truncated?: boolean;
  deepAnalysis?: any; // Deep analysis results with detailed symbols, routes, schemas, etc.
}

export interface SymbolEntry {
  kind: "class"|"function"|"method"|"component"|"hook"|"type"|"variable"|"route"|"entity";
  name: string;
  detail?: string;
}

export interface RouteEntry {
  framework: "flask"|"django"|"fastapi"|"express"|"next"|"angular"|"nest"|"spring";
  method: string;
  path: string;
  handler: string;
  file: string;
  notes?: string;
}

export interface TableEntry {
  source: "sqlalchemy"|"django"|"typeorm"|"prisma"|"raw-sql";
  kind: "table"|"model"|"entity";
  name: string;
  columns: { name: string; type?: string; pk?: boolean }[];
  relations?: string[];
}

export interface IndexStore {
  version: 1;
  head?: string;
  files: Record<string, { hash: string; lang: string; lastScan: number }>;
}
