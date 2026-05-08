import { useAlerts } from '../hooks/useFirebase';
import { formatRelative } from '../utils/csi';

const SEVERITY_CONFIG = {
  critical: { color: '#f05050', bg: 'rgba(240,80,80,0.08)', border: 'rgba(240,80,80,0.2)' },
  warning: { color: '#f5a623', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.2)' },
  info: { color: '#4da6ff', bg: 'rgba(77,166,255,0.08)', border: 'rgba(77,166,255,0.2)' },
};

export default function Alerts() {
  const alerts = useAlerts(100);

  return (
    <div className="page">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontFamily: "'Barlow Condensed'",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#e8edf2',
        }}>
          Alert History
        </h1>
        <p style={{
          fontFamily: "'IBM Plex Mono'",
          fontSize: 11,
          color: '#455060',
          marginTop: 4,
        }}>
          Last 100 events · newest first
        </p>
      </div>

      {alerts.length === 0 ? (
        <div style={{
          padding: '64px 24px',
          textAlign: 'center',
          fontFamily: "'IBM Plex Mono'",
          fontSize: 13,
          color: '#2a3540',
        }}>
          NO ALERTS · ALL SYSTEMS NOMINAL
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {alerts.map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
            return (
              <div key={alert.id} style={{
                display: 'grid',
                gridTemplateColumns: '100px 80px 1fr 100px',
                alignItems: 'center',
                gap: 16,
                padding: '10px 16px',
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: 6,
              }}>
                {/* Timestamp */}
                <div style={{
                  fontFamily: "'IBM Plex Mono'",
                  fontSize: 11,
                  color: '#6b7a8a',
                }}>
                  {formatRelative(alert.timestamp)}
                </div>

                {/* Node ID */}
                <div style={{
                  fontFamily: "'Barlow Condensed'",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#9aa5b4',
                }}>
                  {alert.nodeId}
                </div>

                {/* Message */}
                <div style={{
                  fontFamily: "'IBM Plex Mono'",
                  fontSize: 12,
                  color: cfg.color,
                }}>
                  [{alert.type}] {alert.message}
                </div>

                {/* Severity badge */}
                <div style={{
                  fontFamily: "'Barlow Condensed'",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: cfg.color,
                  textAlign: 'right',
                }}>
                  {alert.severity?.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
