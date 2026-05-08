import { csiLabel } from '../utils/csi';

/**
 * CSIGauge — radial arc gauge, the centrepiece of each node card.
 * score: 0.0 – 1.0 (Master score, optional if csiData is provided)
 * size: px (default 160)
 * csiData: object containing technical, environmental, economic sub-scores
 */
export default function CSIGauge({ score, size = 160, showSubs = false, csiData = null }) {
  
  // ── PHASE 4 ARMOR: Fallback calculation if the master score drops out ──
  // If score is null/undefined, calculate it dynamically from the sub-scores
  const safeScore = score ?? (csiData ? (
    (csiData.technical ?? 0) * 0.50 +
    (csiData.environmental ?? 0) * 0.30 +
    (csiData.economic ?? 0) * 0.20
  ) : null);

  const { label, color } = csiLabel(safeScore);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const strokeW = size * 0.065;

  // Arc spans 220° (from 160° to 380° = -200° to 20° in SVG)
  const startAngle = 160;
  const endAngle = 380;
  const arcSpan = endAngle - startAngle;

  function polar(angle, radius) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function arcPath(fromAngle, toAngle, inset = 0) {
    const rr = r - inset;
    const from = polar(fromAngle, rr);
    const to = polar(toAngle, rr);
    const large = toAngle - fromAngle > 180 ? 1 : 0;
    return `M ${from.x} ${from.y} A ${rr} ${rr} 0 ${large} 1 ${to.x} ${to.y}`;
  }

  const fillAngle = safeScore !== null && safeScore !== undefined
    ? startAngle + arcSpan * Math.max(0, Math.min(1, safeScore))
    : startAngle;

  // Tick marks at 0, 25, 50, 75, 100%
  const ticks = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size * 0.82} viewBox={`0 0 ${size} ${size * 0.82}`}>
        {/* Track */}
        <path
          d={arcPath(startAngle, endAngle)}
          fill="none"
          stroke="#1e252c"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />

        {/* Colored fill arc */}
        {safeScore !== null && safeScore !== undefined && safeScore > 0 && (
          <path
            d={arcPath(startAngle, fillAngle)}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 ${size * 0.03}px ${color})` }}
          />
        )}

        {/* Tick marks */}
        {ticks.map((t, i) => {
          const angle = startAngle + arcSpan * t;
          const inner = polar(angle, r - strokeW * 0.6);
          const outer = polar(angle, r + strokeW * 0.1);
          return (
            <line
              key={i}
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke="#2a3540"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Score text */}
        <text
          x={cx}
          y={cy + size * 0.04}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'IBM Plex Mono', monospace"
          fontWeight="600"
          fontSize={size * 0.22}
          fill={safeScore !== null && safeScore !== undefined ? color : '#455060'}
        >
          {safeScore !== null && safeScore !== undefined ? (safeScore * 100).toFixed(0) : '—'}
        </text>

        {/* Label below score */}
        <text
          x={cx}
          y={cy + size * 0.24}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Barlow Condensed', sans-serif"
          fontWeight="500"
          fontSize={size * 0.09}
          letterSpacing="0.1em"
          fill={safeScore !== null ? color : '#455060'}
          opacity={0.85}
        >
          {label}
        </text>

        {/* Min/max labels */}
        <text x={polar(startAngle, r).x - 4} y={polar(startAngle, r).y + 4}
          textAnchor="end" fontFamily="'IBM Plex Mono', monospace"
          fontSize={size * 0.075} fill="#455060">0</text>
        <text x={polar(endAngle, r).x + 4} y={polar(endAngle, r).y + 4}
          textAnchor="start" fontFamily="'IBM Plex Mono', monospace"
          fontSize={size * 0.075} fill="#455060">100</text>
      </svg>

      {/* Sub-scores */}
      {showSubs && csiData && (
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[
            { key: 'technical', label: 'TECH' },
            { key: 'environmental', label: 'ENV' },
            { key: 'economic', label: 'ECON' },
          ].map(({ key, label }) => {
            const v = csiData[key] ?? null;
            const { color } = csiLabel(v);
            return (
              <div key={key} style={{
                background: '#111418',
                borderRadius: 4,
                padding: '6px 8px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed'",
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#6b7a8a',
                  marginBottom: 2
                }}>{label}</div>
                <div style={{
                  fontFamily: "'IBM Plex Mono'",
                  fontSize: 15,
                  fontWeight: 600,
                  color: v !== null ? color : '#455060',
                }}>
                  {v !== null ? (v * 100).toFixed(0) : '—'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}