/**
 * EcoEdge CSI — Community Sustainability Index
 * Mirrors the edge formula in simulator.js so the UI can recompute
 * scores without a round-trip. Phase 4 will expand this with
 * economic weighting and historical trend analysis.
 */

// Thresholds (must match simulator.js)
const THRESHOLDS = {
  voltage: { min: 200, max: 250, ideal: 230 },
  battery: { min: 10.5, max: 14.5, ideal: 12.6 },
  temperature: { max: 45 },
  humidity: { max: 85 },
  loadCurrent: { max: 15 },
};

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function linearScore(value, min, max) {
  if (value < min || value > max) return 0;
  const mid = (min + max) / 2;
  const dev = Math.abs(value - mid) / ((max - min) / 2);
  return clamp(1 - dev, 0, 1);
}

export function computeCSI(telemetry) {
  if (!telemetry) return null;

  const { voltage = 230, battery = 12.6, temperature = 25, humidity = 60, loadCurrent = 5 } = telemetry;
  const t = THRESHOLDS;

  // Technical sub-score: voltage stability + battery health
  const voltageScore = linearScore(voltage, t.voltage.min, t.voltage.max);
  const batteryScore = linearScore(battery, t.battery.min, t.battery.max);
  const technical = (voltageScore * 0.55 + batteryScore * 0.45);

  // Environmental sub-score: temperature + humidity
  const tempScore = clamp(1 - Math.max(0, temperature - 30) / (t.temperature.max - 30), 0, 1);
  const humidScore = clamp(1 - Math.max(0, humidity - 60) / (t.humidity.max - 60), 0, 1);
  const environmental = (tempScore * 0.6 + humidScore * 0.4);

  // Economic sub-score: load utilisation (healthy = moderate load)
  const loadRatio = loadCurrent / t.loadCurrent.max;
  const economic = loadRatio < 0.8
    ? clamp(loadRatio / 0.8, 0, 1)
    : clamp(1 - (loadRatio - 0.8) / 0.2, 0, 1);

  const composite = technical * 0.50 + environmental * 0.30 + economic * 0.20;

  return {
    composite: parseFloat(composite.toFixed(3)),
    technical: parseFloat(technical.toFixed(3)),
    environmental: parseFloat(environmental.toFixed(3)),
    economic: parseFloat(economic.toFixed(3)),
  };
}

export function csiLabel(score) {
  if (score === null || score === undefined) return { label: 'NO DATA', color: '#888780' };
  if (score >= 0.85) return { label: 'OPTIMAL', color: '#1D9E75' };
  if (score >= 0.70) return { label: 'GOOD', color: '#639922' };
  if (score >= 0.50) return { label: 'DEGRADED', color: '#BA7517' };
  if (score >= 0.30) return { label: 'CRITICAL', color: '#D85A30' };
  return { label: 'FAILURE', color: '#E24B4A' };
}

export function formatTimestamp(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatRelative(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  if (diff < 10000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}
