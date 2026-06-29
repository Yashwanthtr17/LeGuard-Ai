import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const STORAGE_DIR = join(process.cwd(), '.scan-data');
const STORAGE_FILE = join(STORAGE_DIR, 'scans.json');

export interface Consequence {
  pageNumber: number;
  clause: string;
  category: 'statutory' | 'commercial' | 'semantic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  issue: string;
  explanation: string;
  plainEnglish: string;
  recommendation: string;
}

export interface HiddenThreat {
  pageNumber: number;
  threat: string;
  explanation: string;
  plainEnglish: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ScanResult {
  id: string;
  fileName: string;
  fileType: string;
  jurisdiction: string;
  detectedCountry: string;
  riskScore: number;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  summary: string;
  consequences: Consequence[];
  hiddenThreats: HiddenThreat[];
  questionsToAsk: string[];
  documentText: string;
  createdAt: string;
}

function loadStore(): Map<string, ScanResult> {
  try {
    if (existsSync(STORAGE_FILE)) {
      const raw = readFileSync(STORAGE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return new Map(Object.entries(data));
    }
  } catch {
    // ignore corrupt data
  }
  return new Map();
}

function persistStore(store: Map<string, ScanResult>): void {
  try {
    if (!existsSync(STORAGE_DIR)) {
      mkdirSync(STORAGE_DIR, { recursive: true });
    }
    const data = Object.fromEntries(store);
    writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to persist scan data:', err);
  }
}

const store = loadStore();

export function saveScan(id: string, result: ScanResult): void {
  store.set(id, result);
  persistStore(store);
}

export function getScan(id: string): ScanResult | undefined {
  return store.get(id);
}

export function deleteScan(id: string): boolean {
  const existed = store.has(id);
  store.delete(id);
  persistStore(store);
  return existed;
}

export function listScans(): ScanResult[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
