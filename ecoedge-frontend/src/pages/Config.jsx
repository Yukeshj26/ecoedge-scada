export default function Config() {
  const thresholds = [
    { sensor: 'VOLTAGE', min: '200 V', max: '250 V', nominal: '230 V', warn: '±20 V from nominal' },
    { sensor: 'BATTERY', min: '10.5 V', max: '14.5 V', nominal: '12.6 V', warn: 'Below 11 V or above 14.5 V' },
    { sensor: 'TEMPERATURE', min: '0 °C', max: '45 °C', nominal: '25 °C', warn: 'Above 40 °C' },
    { sensor: 'HUMIDITY', min: '20 %', max: '85 %', nominal: '60 %', warn: 'Above 80 %' },
    { sensor: 'LOAD CURRENT', min: '0 A', max: '15 A', nominal: '7 A', warn: 'Above 12 A' },
  ];

  const csiWeights = [
    { dimension: 'TECHNICAL', weight: '50%', components: 'Voltage (55%) + Battery (45%)' },
    { dimension: 'ENVIRONMENTAL', weight: '30%', components: 'Temperature (60%) + Humidity (40%)' },
    { dimension: 'ECONOMIC', weight: '20%', components: 'Load utilisation (optimal = 80% rated)' },
  ];

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "'Barlow Condensed'",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#e8edf2',
        }}>
          System Configuration
        </h1>
        <p style={{
          fontFamily: "'IBM Plex Mono'",
          fontSize: 11,
          color: '#455060',
          marginTop: 4,
        }}>
          Phase 3 — read-only · Phase 4 will add Firebase Config editor
        </p>
      </div>

      {/* CSI Formula */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9aa5b4' }}>
            CSI FORMULA · v1.0 (EDGE)
          </span>
          <span className="badge badge-info">PHASE 4: FULL ENGINE</span>
        </div>
        <div className="card-body">
          <div style={{
            fontFamily: "'IBM Plex Mono'",
            fontSize: 12,
            color: '#2dd4a0',
            background: '#0a0c0e',
            padding: '12px 16px',
            borderRadius: 6,
            border: '1px solid rgba(45,212,160,0.15)',
            lineHeight: 2,
            marginBottom: 16,
          }}>
            CSI = 0.50 × Technical + 0.30 × Environmental + 0.20 × Economic
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['DIMENSION', 'WEIGHT', 'COMPONENTS'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '6px 12px',
                    fontFamily: "'Barlow Condensed'",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    color: '#455060',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csiWeights.map((row) => (
                <tr key={row.dimension} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 12px', fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#f5a623' }}>{row.dimension}</td>
                  <td style={{ padding: '8px 12px', fontFamily: "'IBM Plex Mono'", fontSize: 13, color: '#e8edf2' }}>{row.weight}</td>
                  <td style={{ padding: '8px 12px', fontFamily: "'IBM Plex Mono'", fontSize: 11, color: '#6b7a8a' }}>{row.components}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensor thresholds */}
      <div className="card">
        <div className="card-header">
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9aa5b4' }}>
            SENSOR THRESHOLDS
          </span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#0d1014' }}>
                {['SENSOR', 'MIN', 'MAX', 'NOMINAL', 'WARN CONDITION'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '8px 16px',
                    fontFamily: "'Barlow Condensed'",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    color: '#455060',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thresholds.map((row) => (
                <tr key={row.sensor} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 16px', fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#9aa5b4' }}>{row.sensor}</td>
                  <td style={{ padding: '10px 16px', fontFamily: "'IBM Plex Mono'", fontSize: 12, color: '#4da6ff' }}>{row.min}</td>
                  <td style={{ padding: '10px 16px', fontFamily: "'IBM Plex Mono'", fontSize: 12, color: '#f05050' }}>{row.max}</td>
                  <td style={{ padding: '10px 16px', fontFamily: "'IBM Plex Mono'", fontSize: 12, color: '#2dd4a0' }}>{row.nominal}</td>
                  <td style={{ padding: '10px 16px', fontFamily: "'IBM Plex Mono'", fontSize: 11, color: '#6b7a8a' }}>{row.warn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
