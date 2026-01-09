/**
 * Parity Bridge Service
 * Provides HTTP API to invoke legacy PHP commands and capture snapshots
 */

import express from "express";
import { invokeLegacyCommand, getLegacyState } from "./invoke-legacy.js";
import { captureSnapshot, compareSnapshots } from "./capture-snapshot.js";
import { createConnection } from "./db.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3100;
const LEGACY_PHP_URL = process.env.LEGACY_PHP_URL || "http://legacy-php";

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get current legacy state
app.get("/state", async (req, res) => {
  try {
    const state = await getLegacyState();
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Execute a legacy command and capture before/after state
app.post("/execute", async (req, res) => {
  try {
    const { command, args, generalId, rngSeed } = req.body;

    if (!command || !generalId) {
      return res.status(400).json({ error: "command and generalId required" });
    }

    // Capture before state
    const beforeState = await captureSnapshot();

    // Execute legacy command
    const result = await invokeLegacyCommand({
      command,
      args: args || {},
      generalId,
      rngSeed,
    });

    // Capture after state
    const afterState = await captureSnapshot();

    // Calculate delta
    const delta = compareSnapshots(beforeState, afterState);

    res.json({
      success: true,
      input: { command, args, generalId, rngSeed },
      result,
      delta,
      beforeState,
      afterState,
      meta: {
        capturedAt: new Date().toISOString(),
        legacyUrl: LEGACY_PHP_URL,
      },
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Capture current state snapshot
app.get("/snapshot", async (req, res) => {
  try {
    const snapshot = await captureSnapshot();
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Reset database to fixture state
app.post("/reset", async (req, res) => {
  try {
    const { fixture } = req.body;
    const db = await createConnection();

    // Load fixture SQL if provided
    if (fixture) {
      // Execute fixture SQL
      await db.query(fixture);
    }

    await db.end();
    res.json({ success: true, message: "Database reset complete" });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Batch execute multiple commands
app.post("/batch", async (req, res) => {
  try {
    const { commands } = req.body;

    if (!Array.isArray(commands)) {
      return res.status(400).json({ error: "commands array required" });
    }

    const results = [];
    for (const cmd of commands) {
      const beforeState = await captureSnapshot();
      const result = await invokeLegacyCommand(cmd);
      const afterState = await captureSnapshot();
      const delta = compareSnapshots(beforeState, afterState);

      results.push({
        input: cmd,
        result,
        delta,
      });
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Parity Bridge running on port ${PORT}`);
  console.log(`Legacy PHP URL: ${LEGACY_PHP_URL}`);
});
