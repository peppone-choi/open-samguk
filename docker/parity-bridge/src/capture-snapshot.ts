/**
 * Snapshot Capture and Comparison
 * Captures database state and computes deltas between snapshots
 */

import { createConnection } from "./db.js";

export interface EntitySnapshot {
  id: number | string;
  data: Record<string, unknown>;
}

export interface TableSnapshot {
  tableName: string;
  rows: EntitySnapshot[];
  rowCount: number;
}

export interface WorldSnapshot {
  generals: TableSnapshot;
  nations: TableSnapshot;
  cities: TableSnapshot;
  diplomacy: TableSnapshot;
  troops: TableSnapshot;
  messages: TableSnapshot;
  auctions: TableSnapshot;
  generalTurns: TableSnapshot;
  nationTurns: TableSnapshot;
  gameEnv: Record<string, unknown>;
  capturedAt: string;
}

export interface SnapshotDelta {
  added: Record<string, EntitySnapshot[]>;
  modified: Record<
    string,
    Array<{ id: number | string; changes: Record<string, { old: unknown; new: unknown }> }>
  >;
  deleted: Record<string, Array<number | string>>;
}

/**
 * Capture a complete snapshot of the game state
 */
export async function captureSnapshot(): Promise<WorldSnapshot> {
  const db = await createConnection();

  try {
    const generals = await captureTable(db, "general", "no");
    const nations = await captureTable(db, "nation", "nation");
    const cities = await captureTable(db, "city", "city");
    const diplomacy = await captureTable(db, "diplomacy", "no");
    const troops = await captureTable(db, "troop", "troop_leader");
    const messages = await captureTable(db, "message", "id", "ORDER BY id DESC LIMIT 1000");
    const auctions = await captureTable(db, "ng_auction", "id");
    const generalTurns = await captureTable(db, "general_turn", "id");
    const nationTurns = await captureTable(db, "nation_turn", "id");

    // Capture game environment from storage
    const [envRows] = (await db.query(
      "SELECT `key`, value FROM storage WHERE namespace = 'game_env'"
    )) as any;

    const gameEnv: Record<string, unknown> = {};
    for (const row of envRows || []) {
      try {
        gameEnv[row.key] = JSON.parse(row.value);
      } catch {
        gameEnv[row.key] = row.value;
      }
    }

    return {
      generals,
      nations,
      cities,
      diplomacy,
      troops,
      messages,
      auctions,
      generalTurns,
      nationTurns,
      gameEnv,
      capturedAt: new Date().toISOString(),
    };
  } finally {
    await db.end();
  }
}

async function captureTable(
  db: any,
  tableName: string,
  idColumn: string,
  orderClause = ""
): Promise<TableSnapshot> {
  const [rows] = (await db.query(
    `SELECT * FROM ${tableName} ${orderClause || `ORDER BY ${idColumn}`}`
  )) as any;

  const entityRows: EntitySnapshot[] = (rows || []).map((row: any) => ({
    id: row[idColumn],
    data: normalizeRow(row),
  }));

  return {
    tableName,
    rows: entityRows,
    rowCount: entityRows.length,
  };
}

/**
 * Normalize a database row for consistent comparison
 * - Convert dates to ISO strings
 * - Parse JSON columns
 * - Sort object keys
 */
function normalizeRow(row: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  const sortedKeys = Object.keys(row).sort();
  for (const key of sortedKeys) {
    let value = row[key];

    // Convert Date to ISO string
    if (value instanceof Date) {
      value = value.toISOString();
    }

    // Parse JSON strings
    if (typeof value === "string" && (value.startsWith("{") || value.startsWith("["))) {
      try {
        value = JSON.parse(value);
      } catch {
        // Keep as string if not valid JSON
      }
    }

    // Recursively normalize objects
    if (value && typeof value === "object" && !Array.isArray(value)) {
      value = normalizeRow(value as Record<string, unknown>);
    }

    normalized[key] = value;
  }

  return normalized;
}

/**
 * Compare two snapshots and compute the delta
 */
export function compareSnapshots(before: WorldSnapshot, after: WorldSnapshot): SnapshotDelta {
  const delta: SnapshotDelta = {
    added: {},
    modified: {},
    deleted: {},
  };

  const tables = [
    "generals",
    "nations",
    "cities",
    "diplomacy",
    "troops",
    "messages",
    "auctions",
    "generalTurns",
    "nationTurns",
  ] as const;

  for (const tableName of tables) {
    const beforeTable = before[tableName];
    const afterTable = after[tableName];

    const { added, modified, deleted } = compareTableSnapshots(beforeTable, afterTable);

    if (added.length > 0) delta.added[tableName] = added;
    if (modified.length > 0) delta.modified[tableName] = modified;
    if (deleted.length > 0) delta.deleted[tableName] = deleted;
  }

  return delta;
}

function compareTableSnapshots(
  before: TableSnapshot,
  after: TableSnapshot
): {
  added: EntitySnapshot[];
  modified: Array<{ id: number | string; changes: Record<string, { old: unknown; new: unknown }> }>;
  deleted: Array<number | string>;
} {
  const beforeMap = new Map(before.rows.map((r) => [String(r.id), r]));
  const afterMap = new Map(after.rows.map((r) => [String(r.id), r]));

  const added: EntitySnapshot[] = [];
  const modified: Array<{
    id: number | string;
    changes: Record<string, { old: unknown; new: unknown }>;
  }> = [];
  const deleted: Array<number | string> = [];

  // Find added and modified
  for (const [id, afterEntity] of afterMap) {
    const beforeEntity = beforeMap.get(id);

    if (!beforeEntity) {
      added.push(afterEntity);
    } else {
      const changes = compareEntities(beforeEntity.data, afterEntity.data);
      if (Object.keys(changes).length > 0) {
        modified.push({ id: afterEntity.id, changes });
      }
    }
  }

  // Find deleted
  for (const [id, beforeEntity] of beforeMap) {
    if (!afterMap.has(id)) {
      deleted.push(beforeEntity.id);
    }
  }

  return { added, modified, deleted };
}

function compareEntities(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> {
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const oldVal = before[key];
    const newVal = after[key];

    if (!deepEqual(oldVal, newVal)) {
      changes[key] = { old: oldVal, new: newVal };
    }
  }

  return changes;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;

  if (typeof a === "object") {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, idx) => deepEqual(val, b[idx]));
    }

    if (!Array.isArray(a) && !Array.isArray(b)) {
      const aObj = a as Record<string, unknown>;
      const bObj = b as Record<string, unknown>;
      const keys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);
      return [...keys].every((key) => deepEqual(aObj[key], bObj[key]));
    }
  }

  return false;
}

/**
 * Serialize a snapshot to JSON with deterministic ordering
 */
export function serializeSnapshot(snapshot: WorldSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Save a snapshot to a file
 */
export async function saveSnapshot(snapshot: WorldSnapshot, filepath: string): Promise<void> {
  const fs = await import("fs/promises");
  await fs.writeFile(filepath, serializeSnapshot(snapshot), "utf-8");
}

/**
 * Load a snapshot from a file
 */
export async function loadSnapshot(filepath: string): Promise<WorldSnapshot> {
  const fs = await import("fs/promises");
  const content = await fs.readFile(filepath, "utf-8");
  return JSON.parse(content);
}
