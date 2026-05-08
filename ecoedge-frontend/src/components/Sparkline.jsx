/**
 * Sparkline — tiny SVG line chart for sensor history.
 * data: array of numbers
 * color: stroke color
 * width / height: px
 */
export default function Sparkline({ data = [], color = '#f5a623', width = 120, height = 36, filled = false }) {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height}>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2}
          stroke="#1e252c" strokeWidth="1" strokeDasharray="4 4" />
      </svg>
    );
  }

  const pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y];
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const fillPath = filled
    ? `${linePath} L ${points[points.length - 1][0]} ${height} L ${points[0][0]} ${height} Z`
    : null;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {filled && (
        <path d={fillPath} fill={color} opacity={0.12} />
      )}
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last value dot */}
      <circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r={2.5}
        fill={color}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  );
}
