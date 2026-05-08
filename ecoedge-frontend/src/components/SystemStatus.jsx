import { useDevices, useCSI } from '../hooks/useFirebase';
import { csiLabel } from '../utils/csi';

function FleetCSISummary() {
  const { devices } = useDevices();
  const nodeIds = Object.keys(devices);

  // We can't call hooks in a loop; this component is intentionally simple
  // Real implementation uses a useFleetCSI hook aggregating all nodes.
  return null;
}

export function StatPill({ label, value, unit = '', color = '#9aa5b4', glow = false }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 16px',
      borderRight: '1px solid rgba(255,255,255,0.07)',
    }}>
      <span style={{
        fontFamily: "'Barlow Condensed'",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#455060',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'IBM Plex Mono'",
        fontSize: 14,
        fontWeight: 600,
        color: color,
        textShadow: glow ? `0 0 12px ${color}80` : 'none',
        letterSpacing: '-0.01em',
      }}>
        {value}<span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2, color: '#6b7a8a' }}>{unit}</span>
      </span>
    </div>
  );
}

export default function SystemStatus({ nodes = [], telemetryMap = {} }) {
  const online = nodes.filter(id => {
    const t = telemetryMap[id];
    return t && (Date.now() - (t.timestamp || 0)) < 180000;
  }).length;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: 40,
      background: '#0d1014',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      paddingLeft: 16,
      gap: 0,
      overflowX: 'auto',
    }}>
      {/* System ID */}
      <div style={{
        fontFamily: "'IBM Plex Mono'",
        fontSize: 10,
        color: '#2dd4a0',
        paddingRight: 16,
        borderRight: '1px solid rgba(255,255,255,0.07)',
        letterSpacing: '0.06em',
        flexShrink: 0,
      }}>
        ECOEDGE·SCADA·v1.0
      </div>

      <StatPill label="NODES" value={`${online}/${nodes.length}`} color={online === nodes.length ? '#2dd4a0' : '#f5a623'} glow />
      <StatPill label="SYSTEM" value={online > 0 ? 'NOMINAL' : 'DEGRADED'} color={online > 0 ? '#2dd4a0' : '#f05050'} glow />
      <StatPill label="PROTOCOL" value="RTDB·WSS" />
      <StatPill label="INTERVAL" value="60" unit="s" />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Clock */}
      <div style={{
        fontFamily: "'IBM Plex Mono'",
        fontSize: 11,
        color: '#455060',
        paddingRight: 20,
        letterSpacing: '0.06em',
        flexShrink: 0,
      }}>
        {dateStr} · {timeStr}
      </div>
    </div>
  );
}
