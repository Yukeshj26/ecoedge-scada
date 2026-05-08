import { useAlerts } from '../hooks/useFirebase';
import { formatRelative } from '../utils/csi';

const SEVERITY_CONFIG = {
  critical: { badge: 'badge-error', icon: '⬤' },
  warning: { badge: 'badge-warn', icon: '▲' },
  info: { badge: 'badge-info', icon: '◆' },
};

export default function AlertFeed({ maxItems = 25 }) {
  const alerts = useAlerts(maxItems);

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <span style={{
          fontFamily: "'Barlow Condensed'",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#9aa5b4',
        }}>
          ALERT FEED
        </span>
        {alerts.length > 0 && (
          <span className="badge badge-error">{alerts.length}</span>
        )}
      </div>

      <div style={{ overflowY: 'auto', maxHeight: 480 }}>
        {alerts.length === 0 ? (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            fontFamily: "'IBM Plex Mono'",
            fontSize: 12,
            color: '#455060',
          }}>
            No active alerts
          </div>
        ) : (
          alerts.map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
            return (
              <div key={alert.id} style={{
                padding: '10px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}>
                {/* Left: severity indicator */}
                <div style={{
                  marginTop: 2,
                  fontSize: 8,
                  color: alert.severity === 'critical' ? '#f05050'
                    : alert.severity === 'warning' ? '#f5a623' : '#4da6ff',
                  flexShrink: 0,
                }}>
                  {cfg.icon}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex-between" style={{ marginBottom: 3 }}>
                    <span style={{
                      fontFamily: "'Barlow Condensed'",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#9aa5b4',
                    }}>
                      {alert.nodeId}
                    </span>
                    <span className={`badge ${cfg.badge}`}>{alert.type}</span>
                  </div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono'",
                    fontSize: 11,
                    color: '#6b7a8a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: 3,
                  }}>
                    {alert.message}
                  </div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono'",
                    fontSize: 10,
                    color: '#455060',
                  }}>
                    {formatRelative(alert.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
