/**
 * EcoEdge — Multi-Node Runner
 * ============================
 * Spawns multiple simulator instances to simulate a full microgrid
 * with several nodes, each optionally running a different fault mode.
 *
 * Edit the NODES array below to configure your simulation.
 *
 * Usage:
 *   node run-nodes.js
 */

require("dotenv").config();
const { spawn } = require("child_process");
const path      = require("path");

// ─── Configure your simulated nodes here ─────────────────────────────────────
const NODES = [
  { nodeId: "node_001", fault: "NORMAL",       interval: 60000 },
  { nodeId: "node_002", fault: "OVERVOLTAGE",  interval: 60000 },
  { nodeId: "node_003", fault: "LOW_BATTERY",  interval: 60000 },
  // Add more nodes as needed:
  // { nodeId: "node_004", fault: "OVERTEMP",   interval: 60000 },
  // { nodeId: "node_005", fault: "HIGH_LOAD",  interval: 60000 },
];

// ─── Colour-coded prefix per node ────────────────────────────────────────────
const COLORS = ["\x1b[36m", "\x1b[33m", "\x1b[35m", "\x1b[32m", "\x1b[34m"];
const RESET  = "\x1b[0m";

NODES.forEach(({ nodeId, fault, interval }, i) => {
  const color = COLORS[i % COLORS.length];
  const label = `[${nodeId}]`;

  const child = spawn("node", [
    path.join(__dirname, "simulator.js"),
    `--node=${nodeId}`,
    `--fault=${fault}`,
    `--interval=${interval}`,
  ], { env: process.env });

  child.stdout.on("data", (d) =>
    process.stdout.write(`${color}${label}${RESET} ${d}`)
  );
  child.stderr.on("data", (d) =>
    process.stderr.write(`${color}${label}${RESET} ERR: ${d}`)
  );
  child.on("close", (code) =>
    console.log(`${color}${label}${RESET} exited with code ${code}`)
  );
});

console.log(`\n🌐 EcoEdge multi-node runner started — ${NODES.length} nodes active\n`);
