/**
 * EcoEdge — Phase 2: ESP32-S3 Edge Simulator (v1.1 — Client SDK)
 * ============================================================
 * Rewrites v1.0 to use the Firebase Client SDK instead of Admin SDK.
 * No service account or serviceAccountKey.json needed.
 * Uses the same VITE_FIREBASE_* keys as the frontend.
 *
 * Field names now match the frontend exactly:
 *   voltage_ac   → voltage
 *   battery_v    → battery
 *   current_load → loadCurrent
 *   temperature  → temperature  (unchanged)
 *   humidity     → humidity     (unchanged)
 *
 * Usage:
 *   node simulator.js
 *   node simulator.js --fault=OVERVOLTAGE
 *   node simulator.js --node=node_002 --fault=LOW_BATTERY
 *   node simulator.js --interval=5000    (5s for fast testing)
 *
 * Fault modes: NORMAL | OVERVOLTAGE | UNDERVOLTAGE | OVERTEMP | HIGH_LOAD | LOW_BATTERY
 */

require("dotenv").config();

const { initializeApp } = require("firebase/app");
const { getDatabase, ref, push, set, update } = require("firebase/database");
const { getAuth, signInAnonymously } = require("firebase/auth");
// ─── Firebase Init (Client SDK — no service account needed) ─────────────────

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       process.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ─── CLI Args ────────────────────────────────────────────────────────────────

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v];
  })
);

const NODE_ID       = args.node     || process.env.NODE_ID          || "node_001";
const FAULT_MODE    = (args.fault   || "NORMAL").toUpperCase();
const PUSH_INTERVAL = parseInt(args.interval || process.env.PUSH_INTERVAL_MS || "60000", 10);

// ─── Sensor Profiles ─────────────────────────────────────────────────────────

const VOLTAGE = {
  NORMAL:       { base: 230,  noise: 2   },
  OVERVOLTAGE:  { base: 258,  noise: 3   },
  UNDERVOLTAGE: { base: 175,  noise: 5   },
  DEFAULT:      { base: 230,  noise: 2   },
};

const BATTERY = {
  NORMAL:      { base: 13.1, noise: 0.1 },
  LOW_BATTERY: { base: 11.4, noise: 0.3 },
  DEFAULT:     { base: 13.1, noise: 0.1 },
};

const CURRENT = {
  NORMAL:    { base: 6.0,  noise: 1.0 },
  HIGH_LOAD: { base: 16.5, noise: 1.5 },
  DEFAULT:   { base: 6.0,  noise: 1.0 },
};

const CLIMATE = {
  NORMAL:   { tempBase: 32, tempNoise: 2,   humBase: 55, humNoise: 5 },
  OVERTEMP: { tempBase: 48, tempNoise: 1.5, humBase: 70, humNoise: 3 },
  DEFAULT:  { tempBase: 32, tempNoise: 2,   humBase: 55, humNoise: 5 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function gaussianNoise(mean, stdDev) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z  = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return parseFloat((mean + z * stdDev).toFixed(3));
}

function round(n, places = 2) {
  return parseFloat(n.toFixed(places));
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// ─── Sensor Readers ───────────────────────────────────────────────────────────

function readVoltage() {
  const p = VOLTAGE[FAULT_MODE] || VOLTAGE.DEFAULT;
  return round(clamp(gaussianNoise(p.base, p.noise), 100, 280));
}

function readBattery() {
  const p = BATTERY[FAULT_MODE] || BATTERY.DEFAULT;
  return round(clamp(gaussianNoise(p.base, p.noise), 10.0, 15.0));
}

function readLoadCurrent() {
  const p = CURRENT[FAULT_MODE] || CURRENT.DEFAULT;
  return round(clamp(gaussianNoise(p.base, p.noise), 0.0, 25.0));
}

function readClimate() {
  const p = CLIMATE[FAULT_MODE] || CLIMATE.DEFAULT;
  return {
    temperature: round(clamp(gaussianNoise(p.tempBase, p.tempNoise), -10, 85), 1),
    humidity:    round(clamp(gaussianNoise(p.humBase,  p.humNoise),    0, 100), 1),
  };
}

// ─── CSI Calculation ─────────────────────────────────────────────────────────

function computeCSI({ voltage, battery, loadCurrent, temperature, humidity }) {
  const voltageScore = voltage >= 210 && voltage <= 250 ? 1.0
                     : voltage < 210  ? clamp((voltage - 100) / 110, 0, 1)
                     : clamp((280 - voltage) / 30, 0, 1);
  const batteryScore  = clamp((battery - 10.0) / 5.0, 0, 1);
  const technical     = round(voltageScore * 0.6 + batteryScore * 0.4, 3);

  const tempScore = clamp(1 - Math.max(0, temperature - 40) / 20, 0, 1);
  const humScore  = humidity >= 30 && humidity <= 70 ? 1.0
                  : humidity < 30 ? clamp(humidity / 30, 0, 1)
                  : clamp((100 - humidity) / 30, 0, 1);
  const environmental = round(tempScore * 0.7 + humScore * 0.3, 3);

  const economic = round(clamp(1 - Math.max(0, loadCurrent - 10) / 10, 0, 1), 3);

  const score = round(technical * 0.50 + environmental * 0.20 + economic * 0.30, 3);

  const label = score >= 0.85 ? "healthy"
              : score >= 0.65 ? "stable"
              : score >= 0.40 ? "warning"
              : "critical";

  return { score, technical, environmental, economic, label };
}

// ─── Alert Detection ──────────────────────────────────────────────────────────

function detectAlerts({ voltage, battery, loadCurrent, temperature }) {
  const alerts = [];
  if (voltage > 250)
    alerts.push({ type: "OVERVOLTAGE",  severity: "critical", message: `AC voltage ${voltage}V exceeds 250V limit` });
  if (voltage < 180)
    alerts.push({ type: "UNDERVOLTAGE", severity: "critical", message: `AC voltage ${voltage}V below 180V minimum` });
  if (temperature > 45)
    alerts.push({ type: "OVERTEMP",     severity: "critical", message: `Temperature ${temperature}°C exceeds 45°C limit` });
  if (loadCurrent > 15)
    alerts.push({ type: "HIGH_LOAD",    severity: "warning",  message: `Load current ${loadCurrent}A exceeds 15A limit` });
  if (battery < 11.8)
    alerts.push({ type: "LOW_BATTERY",  severity: "warning",  message: `Battery ${battery}V — charge needed` });
  return alerts;
}

// ─── Trend Tracking ───────────────────────────────────────────────────────────

let previousCSIScore = null;

function computeTrend(current) {
  if (previousCSIScore === null) return "stable";
  const delta = current - previousCSIScore;
  if (delta > 0.02)  return "rising";
  if (delta < -0.02) return "falling";
  return "stable";
}

// ─── Main Push Cycle ─────────────────────────────────────────────────────────

async function pushTelemetry() {
  const timestamp = Date.now();
  const climate   = readClimate();

  // Field names match frontend exactly
  const sensors = {
    voltage:     readVoltage(),
    battery:     readBattery(),
    loadCurrent: readLoadCurrent(),
    temperature: climate.temperature,
    humidity:    climate.humidity,
  };

  const csi    = computeCSI(sensors);
  const trend  = computeTrend(csi.score);
  previousCSIScore = csi.score;

  const alerts = detectAlerts(sensors);

  // Telemetry record
  const telemetryRecord = { ...sensors, timestamp };

  // CSI snapshot
  const csiSnapshot = {
    composite:     csi.score,
    technical:     csi.technical,
    environmental: csi.environmental,
    economic:      csi.economic,
    label:         csi.label,
    trend,
    updatedAt:     timestamp,
  };

  // ── Write to Firebase (Client SDK) ────────────────────────────────────────
  const writes = [];

  // Telemetry: push to append-log
  writes.push(push(ref(db, `telemetry/${NODE_ID}`), telemetryRecord));

  // CSI: overwrite live snapshot
  writes.push(set(ref(db, `csi/${NODE_ID}`), csiSnapshot));

  // Device heartbeat
  writes.push(update(ref(db, `devices/${NODE_ID}`), {
    status:   "online",
    lastSeen: timestamp,
  }));

  // Alerts
  for (const alert of alerts) {
    writes.push(push(ref(db, `alerts/${NODE_ID}`), {
      ...alert,
      acknowledged: false,
      timestamp,
    }));
  }

  await Promise.all(writes);

  // ── Console output ────────────────────────────────────────────────────────
  const alertStr = alerts.length > 0
    ? `⚠  ALERTS: ${alerts.map((a) => a.type).join(", ")}`
    : "✅ No alerts";

  console.log(
    `[${new Date(timestamp).toISOString()}] Node: ${NODE_ID} | Mode: ${FAULT_MODE}\n` +
    `  Sensors → VAC: ${sensors.voltage}V | Bat: ${sensors.battery}V | ` +
               `Load: ${sensors.loadCurrent}A | Temp: ${sensors.temperature}°C | ` +
               `Hum: ${sensors.humidity}%\n` +
    `  CSI → ${csi.score} (${csi.label}) | Trend: ${trend}\n` +
    `  ${alertStr}\n`
  );
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

async function boot() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   EcoEdge ESP32-S3 Edge Simulator v1.1   ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`  Node ID      : ${NODE_ID}`);
  console.log(`  Fault Mode   : ${FAULT_MODE}`);
  console.log(`  Push Interval: ${PUSH_INTERVAL / 1000}s`);
  console.log(`  Firebase URL : ${process.env.VITE_FIREBASE_DATABASE_URL}`);
  console.log(`  SDK          : Client (no service account needed)`);
  console.log("──────────────────────────────────────────\n");
try {
    // 1. Initialize Auth
    const auth = getAuth(app);
    
    // 2. Log in anonymously to satisfy the "auth != null" rule
    console.log("  Authenticating with Firebase...");
    const userCredential = await signInAnonymously(auth);
    console.log(`  Auth Success! UID: ${userCredential.user.uid}\n`);

    // 3. Now run your normal boot sequence
    await update(ref(db, `devices/${NODE_ID}`), {
      name:     `EcoEdge Node ${NODE_ID.replace("_", " ").toUpperCase()}`,
      location: `Microgrid Site ${NODE_ID.slice(-1).toUpperCase()}`,
      type:     "solar_hybrid",
      firmware: "v1.1.0-sim",
      status:   "online",
      lastSeen: Date.now(),
    });

    await pushTelemetry();
    setInterval(pushTelemetry, PUSH_INTERVAL);

  } catch (error) {
    console.error("Authentication or Boot Error:", error);
    process.exit(1);
  }
}

boot().catch((err) => {
  console.error("Fatal boot error:", err);
  process.exit(1);
});
