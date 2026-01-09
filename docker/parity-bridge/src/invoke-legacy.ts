/**
 * Legacy PHP Command Invocation
 * Executes commands against the legacy PHP system via HTTP
 */

import { createConnection } from "./db.js";

const LEGACY_PHP_URL = process.env.LEGACY_PHP_URL || "http://legacy-php";

export interface LegacyCommandInput {
  command: string;
  args: Record<string, unknown>;
  generalId: number;
  rngSeed?: string;
}

export interface LegacyCommandResult {
  success: boolean;
  result?: unknown;
  logs?: string[];
  error?: string;
  executionTime: number;
}

/**
 * Invoke a legacy PHP command via the API
 */
export async function invokeLegacyCommand(input: LegacyCommandInput): Promise<LegacyCommandResult> {
  const startTime = Date.now();

  try {
    // Inject RNG seed if provided (via database override)
    if (input.rngSeed) {
      await injectRngSeed(input.rngSeed);
    }

    // Call legacy PHP API endpoint
    const response = await fetch(`${LEGACY_PHP_URL}/api.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Parity-Test": "true",
      },
      body: JSON.stringify({
        path: `Command/${input.command}`,
        generalId: input.generalId,
        ...input.args,
      }),
    });

    const data = await response.json();
    const executionTime = Date.now() - startTime;

    return {
      success: response.ok,
      result: data,
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Inject RNG seed into the legacy system for deterministic testing
 */
async function injectRngSeed(seed: string): Promise<void> {
  const db = await createConnection();

  try {
    // Set the RNG seed in the storage table (legacy uses KVStorage)
    await db.query(
      `INSERT INTO storage (namespace, \`key\`, value) 
       VALUES ('parity_test', 'rng_seed', ?)
       ON DUPLICATE KEY UPDATE value = ?`,
      [JSON.stringify(seed), JSON.stringify(seed)]
    );
  } finally {
    await db.end();
  }
}

/**
 * Get the current state from the legacy system
 */
export async function getLegacyState(): Promise<Record<string, unknown>> {
  const db = await createConnection();

  try {
    // Fetch all relevant tables
    const [generals] = await db.query("SELECT * FROM general ORDER BY no");
    const [nations] = await db.query("SELECT * FROM nation ORDER BY nation");
    const [cities] = await db.query("SELECT * FROM city ORDER BY city");
    const [diplomacy] = await db.query("SELECT * FROM diplomacy ORDER BY no");
    const [troops] = await db.query("SELECT * FROM troop ORDER BY troop_leader");
    const [messages] = await db.query("SELECT * FROM message ORDER BY id DESC LIMIT 100");
    const [auctions] = await db.query("SELECT * FROM ng_auction ORDER BY id");
    const [storage] = await db.query("SELECT * FROM storage");

    return {
      generals,
      nations,
      cities,
      diplomacy,
      troops,
      messages,
      auctions,
      storage,
      capturedAt: new Date().toISOString(),
    };
  } finally {
    await db.end();
  }
}

/**
 * Execute raw SQL on the legacy database (for fixtures)
 */
export async function executeLegacySql(sql: string): Promise<void> {
  const db = await createConnection();
  try {
    await db.query(sql);
  } finally {
    await db.end();
  }
}
