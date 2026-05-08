import { useState } from 'react';
import CSIGauge from './CSIGauge';
import SensorRow from './SensorRow';
import { useTelemetry, useTelemetryHistory, useCSI } from '../hooks/useFirebase';
import { computeCSI, formatRelative } from '../utils/csi';

export default function NodeCard({ nodeId, deviceMeta, selected, onSelect }) {
  const { data: telemetry, loading } = useTelemetry(nodeId);
  const history = useTelemetryHistory(nodeId, 20);
  const firestoreCSI = useCSI(nodeId);
  const [expanded, setExpanded] = useState(false);

  // Compute CSI from live telemetry if Firebase CSI isn't available yet
  const localCSI = computeCSI(telemetry);
  const csiData = firestoreCSI || localCSI;
  const csiScore = csiData?.composite ?? null;

  const isOnline = telemetry && (Date.now() - (telemetry.timestamp || 0)) < 180000;
  const dotClass = loading ? 'dot dot-offline'
    : !isOnline ? 'dot dot-offline'
    : csiScore !== null && csiScore < 0.3 ? 'dot dot-error'
    : csiScore !== null && csiScore < 0.6 ? 'dot dot-warn'
    : 'dot dot-online';

  const statusText = loading ? 'LOADING'
    : !isOnline ? 'OFFLINE'
    : 'ONLINE';

  return (
    <div
      className="card"
      style={{
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        borderColor: selected ? 'rgba(245,166,35,0.4)' : undefined,
        boxShadow: selected ? '0 0 0 1px rgba(245,166,35,0.2), 0 4px 24px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.3)',
      }}
      onClick={() => onSelect?.(nodeId)}
    >
      {/* Header */}
      <div className="card-header">
        <div className="flex-center gap-8">
          <div className={dotClass} />
          <span style={{
            fontFamily: "'Barlow Condensed'",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#e8edf2',
          }}>
            {deviceMeta?.name || nodeId}
          </span>
        </div>
        <div className="flex-center gap-8">
          <span style={{
            fontFamily: "'IBM Plex Mono'",
            fontSize: 9,
            color: '#455060',
            letterSpacing: '0.06em',
          }}>
            {formatRelative(telemetry?.timestamp)}
          </span>
          <span style={{
            fontFamily: "'Barlow Condensed'",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: isOnline ? '#2dd4a0' : '#455060',
          }}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="card-body">
        {/* CSI Gauge — centred */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <CSIGauge
            score={csiScore}
            size={148}
            showSubs={expanded}
            csiData={csiData}
          />
        </div>

        {/* Location / type */}
        {deviceMeta && (
          <div style={{
            textAlign: 'center',
            fontFamily: "'Barlow Condensed'",
            fontSize: 11,
            fontWeight: 400,
            letterSpacing: '0.06em',
            color: '#455060',
            marginBottom: 14,
          }}>
            {deviceMeta.location} · {deviceMeta.type?.replace(/_/g, ' ').toUpperCase()}
          </div>
        )}

        {/* Sensor rows */}
        <div>
          {['voltage', 'battery', 'temperature', 'humidity', 'loadCurrent'].map(sensor => (
            <SensorRow
              key={sensor}
              sensor={sensor}
              value={telemetry?.[sensor] ?? null}
              history={history}
            />
          ))}
        </div>

        {/* Expand toggle for sub-scores */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '6px 0',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 4,
            color: '#6b7a8a',
            fontFamily: "'Barlow Condensed'",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { e.target.style.color = '#e8edf2'; e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          onMouseLeave={e => { e.target.style.color = '#6b7a8a'; e.target.style.borderColor = 'rgba(255,255,255,0.07)'; }}
        >
          {expanded ? '▲ Hide Sub-scores' : '▼ Show Sub-scores'}
        </button>
      </div>
    </div>
  );
}
