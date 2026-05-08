import Sparkline from './Sparkline';

const SENSOR_CONFIG = {
  voltage: {
    label: 'VOLTAGE',
    unit: 'V',
    min: 180,
    max: 260,
    nominal: 230,
    warn: [200, 250],
    color: '#4da6ff',
    format: (v) => v.toFixed(1),
  },
  battery: {
    label: 'BATTERY',
    unit: 'V',
    min: 10,
    max: 15,
    nominal: 12.6,
    warn: [11, 14.5],
    color: '#6fcf6f',
    format: (v) => v.toFixed(2),
  },
  temperature: {
    label: 'TEMP',
    unit: '°C',
    min: 0,
    max: 60,
    nominal: 25,
    warn: [0, 45],
    color: '#f5a623',
    format: (v) => v.toFixed(1),
  },
  humidity: {
    label: 'HUMIDITY',
    unit: '%',
    min: 0,
    max: 100,
    nominal: 60,
    warn: [20, 85],
    color: '#2dd4a0',
    format: (v) => v.toFixed(1),
  },
  loadCurrent: {
    label: 'LOAD',
    unit: 'A',
    min: 0,
    max: 20,
    nominal: 7,
    warn: [0, 15],
    color: '#d884f5',
    format: (v) => v.toFixed(2),
  },
};

export default function SensorRow({ sensor, value, history = [] }) {
  const cfg = SENSOR_CONFIG[sensor];
  if (!cfg) return null;

  const isNull = value === null || value === undefined;
  const pct = isNull ? 0 : Math.max(0, Math.min(1, (value - cfg.min) / (cfg.max - cfg.min)));
  const isWarn = !isNull && (value < cfg.warn[0] || value > cfg.warn[1]);

  const color = isNull ? '#455060' : isWarn ? '#f05050' : cfg.color;
  const histValues = history.map((h) => h[sensor]).filter(v => v !== undefined && v !== null);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      {/* Label */}
      <div style={{
        fontFamily: "'Barlow Condensed'",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.12em',
        color: '#6b7a8a',
        width: 64,
        flexShrink: 0,
      }}>
        {cfg.label}
      </div>

      {/* Bar track */}
      <div style={{
        flex: 1,
        height: 4,
        background: '#1e252c',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${pct * 100}%`,
          background: color,
          borderRadius: 2,
          transition: 'width 0.6s ease, background 0.3s ease',
          boxShadow: isNull ? 'none' : `0 0 6px ${color}60`,
        }} />
        {/* Nominal marker */}
        <div style={{
          position: 'absolute',
          top: -1,
          height: 6,
          width: 1,
          background: '#455060',
          left: `${((cfg.nominal - cfg.min) / (cfg.max - cfg.min)) * 100}%`,
        }} />
      </div>

      {/* Sparkline */}
      <div style={{ flexShrink: 0 }}>
        <Sparkline data={histValues} color={color} width={72} height={24} />
      </div>

      {/* Value */}
      <div style={{
        fontFamily: "'IBM Plex Mono'",
        fontSize: 13,
        fontWeight: 500,
        color: isWarn ? '#f05050' : isNull ? '#455060' : '#e8edf2',
        width: 70,
        textAlign: 'right',
        flexShrink: 0,
        letterSpacing: '-0.01em',
        textShadow: isWarn ? '0 0 8px rgba(240,80,80,0.5)' : 'none',
      }}>
        {isNull ? '—' : `${cfg.format(value)} ${cfg.unit}`}
      </div>
    </div>
  );
}
